import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!
const ALLOWED_CHAT_IDS = process.env.TELEGRAM_ALLOWED_CHAT_IDS?.split(',') || []

// Store pending messages waiting for their counterpart
const pendingMessages = new Map<string, { 
  type: 'url' | 'tags'; 
  data: {
    text?: string
    message_id: number
  }; 
  timestamp: number; 
  chatId: string 
}>()

// Process a complete message set (URL + tags/folders)
async function processCompleteMessageSet(chatId: string, urlMessage: {
  text?: string
  message_id: number
}, tagsMessage: {
  text?: string
  message_id: number
}) {
  try {
    const telegramUserUUID = '00000000-0000-0000-0000-000000000000'
    
    // Parse URL message
    const urlParts = urlMessage.text?.split(' ') || []
    const url = urlParts[0]
    const urlTags = urlParts.filter((p: string) => p.startsWith('#')).map((p: string) => p.slice(1))
    const urlFolder = urlParts.find((p: string) => p.startsWith('@'))?.slice(1)
    const urlDescriptionIndex = urlParts.findIndex((p: string) => p.startsWith('*'))
    const urlDescription = urlDescriptionIndex !== -1 ? urlParts.slice(urlDescriptionIndex + 1).join(' ') : ''
    
    // Parse tags message
    const tagsParts = tagsMessage.text?.split(' ') || []
    const tags = tagsParts.filter((p: string) => p.startsWith('#')).map((p: string) => p.slice(1))
    const folder = tagsParts.find((p: string) => p.startsWith('@'))?.slice(1)
    const descriptionIndex = tagsParts.findIndex((p: string) => p.startsWith('*'))
    const description = descriptionIndex !== -1 ? tagsParts.slice(descriptionIndex + 1).join(' ') : ''
    
    // Combine tags and folders from both messages
    const allTags = [...new Set([...urlTags, ...tags])]
    const finalFolder = folder || urlFolder
    const finalDescription = description || urlDescription
    
    console.log('Processing complete set:', { url, allTags, finalFolder, finalDescription })

    // Fetch actual title from URL
    let title = 'New Content'
    try {
      const response = await fetch(url)
      const html = await response.text()
      const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i)
      if (titleMatch) {
        title = titleMatch[1].trim()
      }
    } catch (error) {
      console.error('Error fetching title:', error)
    }

    // Ensure folder exists (or create it)
    let folderId: string | null = null
    if (finalFolder) {
      const { data: existingFolder, error: folderError } = await supabase
        .from('folders')
        .select('id')
        .eq('user_id', telegramUserUUID)
        .eq('name', finalFolder)
        .maybeSingle()

      if (folderError) {
        console.error('Error checking folder:', folderError)
      }

      if (!existingFolder) {
        const { data: newFolder, error: createFolderError } = await supabase
          .from('folders')
          .insert({
            user_id: telegramUserUUID,
            name: finalFolder,
          })
          .select('id')
          .single()

        if (createFolderError) {
          console.error('Error creating folder:', createFolderError)
        } else {
          folderId = newFolder.id
        }
      } else {
        folderId = existingFolder.id
      }
    }

    // Ensure tags exist (or create them)
    const tagIds: string[] = []
    for (const tagName of allTags) {
      const { data: existingTag, error: tagError } = await supabase
        .from('tags')
        .select('id')
        .eq('user_id', telegramUserUUID)
        .eq('name', tagName)
        .maybeSingle()

      if (tagError) {
        console.error('Error checking tag:', tagError)
        continue
      }

      if (!existingTag) {
        const { data: newTag, error: createTagError } = await supabase
          .from('tags')
          .insert({
            user_id: telegramUserUUID,
            name: tagName,
          })
          .select('id')
          .single()

        if (createTagError) {
          console.error('Error creating tag:', createTagError)
          continue
        }

        tagIds.push(newTag.id)
      } else {
        tagIds.push(existingTag.id)
      }
    }

    // Create content item
    const { data: content, error: contentError } = await supabase
      .from('content_items')
      .insert({
        user_id: telegramUserUUID,
        title,
        url,
        content_type: 'article',
        status: 'to_read',
        progress_percentage: 0,
        folder_id: folderId,
      })
      .select('id, url, title')
      .single()

    if (contentError || !content) {
      console.error('Error creating content:', contentError)
      await sendTelegramMessage(chatId, '❌ Failed to add content. Please try again.')
      return
    }

    // Link tags to content
    for (const tagId of tagIds) {
      const { error: linkError } = await supabase
        .from('content_tags')
        .insert({
          content_id: content.id,
          tag_id: tagId,
        })

      if (linkError) {
        console.error('Error linking tag:', linkError)
      }
    }

    let responseMsg = `✅ Added to your Second Brain! 🧠\n\n`
    responseMsg += `📄 ${title}\n`

    if (allTags.length > 0) {
      responseMsg += `🏷️ Tags: ${allTags.map((t: string) => '#' + t).join(', ')}\n`
    }

    if (finalFolder) {
      responseMsg += `📁 Folder: ${finalFolder}\n`
    }

    await sendTelegramMessage(chatId, responseMsg)
  } catch (error) {
    console.error('Error processing complete message set:', error)
    await sendTelegramMessage(chatId, '❌ Failed to process message. Please try again.')
  }
}

// Process a URL message that arrives without tags (after timeout)
async function processStandaloneUrlMessage(chatId: string, message: {
  text?: string
  message_id: number
}) {
  try {
    const text = message.text || ''
    const parts = text.split(' ')
    const url = parts[0]
    const tags = parts.filter((p: string) => p.startsWith('#')).map((p: string) => p.slice(1))
    const folder = parts.find((p: string) => p.startsWith('@'))?.slice(1)
    const descriptionIndex = parts.findIndex((p: string) => p.startsWith('*'))
    const finalDescription = descriptionIndex !== -1 ? parts.slice(descriptionIndex + 1).join(' ') : ''

    const telegramUserUUID = '00000000-0000-0000-0000-000000000000'

    // Fetch actual title from URL
    let title = 'New Content'
    try {
      const response = await fetch(url)
      const html = await response.text()
      const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i)
      if (titleMatch) {
        title = titleMatch[1].trim()
      }
    } catch (error) {
      console.error('Error fetching title:', error)
    }

    // Ensure folder exists (or create it)
    let folderId: string | null = null
    if (folder) {
      const { data: existingFolder, error: folderError } = await supabase
        .from('folders')
        .select('id')
        .eq('user_id', telegramUserUUID)
        .eq('name', folder)
        .maybeSingle()

      if (folderError) {
        console.error('Error checking folder:', folderError)
      }

      if (!existingFolder) {
        const { data: newFolder, error: createFolderError } = await supabase
          .from('folders')
          .insert({
            user_id: telegramUserUUID,
            name: folder,
          })
          .select('id')
          .single()

        if (createFolderError) {
          console.error('Error creating folder:', createFolderError)
        } else {
          folderId = newFolder.id
        }
      } else {
        folderId = existingFolder.id
      }
    }

    // Ensure tags exist (or create them)
    const tagIds: string[] = []
    for (const tagName of tags) {
      const { data: existingTag, error: tagError } = await supabase
        .from('tags')
        .select('id')
        .eq('user_id', telegramUserUUID)
        .eq('name', tagName)
        .maybeSingle()

      if (tagError) {
        console.error('Error checking tag:', tagError)
        continue
      }

      if (!existingTag) {
        const { data: newTag, error: createTagError } = await supabase
          .from('tags')
          .insert({
            user_id: telegramUserUUID,
            name: tagName,
          })
          .select('id')
          .single()

        if (createTagError) {
          console.error('Error creating tag:', createTagError)
          continue
        }

        tagIds.push(newTag.id)
      } else {
        tagIds.push(existingTag.id)
      }
    }

    // Create content item
    const { data: content, error: contentError } = await supabase
      .from('content_items')
      .insert({
        user_id: telegramUserUUID,
        title,
        url,
        content_type: 'article',
        status: 'to_read',
        progress_percentage: 0,
        folder_id: folderId,
      })
      .select('id, url, title')
      .single()

    if (contentError || !content) {
      console.error('Error creating content:', contentError)
      await sendTelegramMessage(chatId, '❌ Failed to add content. Please try again.')
      return
    }

    // Link tags to content
    for (const tagId of tagIds) {
      const { error: linkError } = await supabase
        .from('content_tags')
        .insert({
          content_id: content.id,
          tag_id: tagId,
        })

      if (linkError) {
        console.error('Error linking tag:', linkError)
      }
    }

    let responseMsg = `✅ Added to your Second Brain! 🧠\n\n`
    responseMsg += `📄 ${title}\n`

    if (tags.length > 0) {
      responseMsg += `🏷️ Tags: ${tags.map((t: string) => '#' + t).join(', ')}\n`
    }

    if (folder) {
      responseMsg += `📁 Folder: ${folder}\n`
    }

    await sendTelegramMessage(chatId, responseMsg)
  } catch (error) {
    console.error('Error processing standalone URL message:', error)
    await sendTelegramMessage(chatId, '❌ Failed to process message. Please try again.')
  }
}

// Check for pending counterpart and process if found
async function checkAndProcessPending(chatId: string, currentMessage: {
  text?: string
  message_id: number
}, currentType: 'url' | 'tags') {
  const pendingKey = `${chatId}_${currentType === 'url' ? 'tags' : 'url'}`
  const pending = pendingMessages.get(pendingKey)
  
  if (pending && (Date.now() - pending.timestamp < 15000)) { // 15 seconds
    console.log(`Found pending counterpart for ${currentType} message`)
    pendingMessages.delete(pendingKey)
    
    if (currentType === 'url') {
      await processCompleteMessageSet(chatId, currentMessage, pending.data)
    } else {
      await processCompleteMessageSet(chatId, pending.data, currentMessage)
    }
    return true
  }
  return false
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Handle both message and edited_message
    const message = body.message || body.edited_message
    if (!message) {
      return NextResponse.json({ ok: true })
    }

    const chatId = message.chat.id.toString()
    const text = message.text
    if (!text) {
      return NextResponse.json({ ok: true })
    }

    console.log("MY ID IN .ENV:", process.env.TELEGRAM_ALLOWED_CHAT_IDS)
    console.log("INCOMING ID:", chatId)
    console.log("DO THEY MATCH?", ALLOWED_CHAT_IDS.includes(chatId))

    // First-time: log and ignore if no allowed IDs configured
    if (ALLOWED_CHAT_IDS.length === 0) {
      console.log(`New chat ID detected: ${chatId}`)
      console.log(`Add this to your .env.local: TELEGRAM_ALLOWED_CHAT_IDS=${chatId}`)
      return NextResponse.json({ ok: true })
    }

    if (!ALLOWED_CHAT_IDS.includes(chatId)) {
      console.log(`Unauthorized chat ID: ${chatId}`)
      return NextResponse.json({ ok: true })
    }

    // === COMMANDS ===
    if (text === '/start') {
      await sendTelegramMessage(chatId,
`🧠 Welcome to Second Brain!

Send me any URL with tags and folders:
https://article.com #coding @curriculum

📊 Commands:
/stats - Your statistics
/list - Recent content
/help - Show help`
      )
    } else if (text.startsWith('http')) {
      // URL message - check for pending tags or store for later
      if (await checkAndProcessPending(chatId, message, 'url')) {
        return NextResponse.json({ ok: true })
      }
      
      // Store this URL message and wait for tags
      console.log('Storing URL message, waiting for tags...')
      pendingMessages.set(`${chatId}_url`, {
        type: 'url',
        data: message,
        timestamp: Date.now(),
        chatId
      })
      
      // Set a timeout to process this URL alone if no tags arrive
      setTimeout(() => {
        const pending = pendingMessages.get(`${chatId}_url`)
        if (pending && (Date.now() - pending.timestamp >= 15000)) {
          console.log('Timeout: processing URL message alone')
          pendingMessages.delete(`${chatId}_url`)
          // Process as standalone URL message
          processStandaloneUrlMessage(chatId, message)
        }
      }, 15000)
      
      return NextResponse.json({ ok: true })
      
    } else if (text.includes('#') || text.includes('@')) {
      // Tags/folders message - check for pending URL or store for later
      if (await checkAndProcessPending(chatId, message, 'tags')) {
        return NextResponse.json({ ok: true })
      }
      
      // Store this tags message and wait for URL
      console.log('Storing tags message, waiting for URL...')
      pendingMessages.set(`${chatId}_tags`, {
        type: 'tags',
        data: message,
        timestamp: Date.now(),
        chatId
      })
      
      // Set a timeout to process this tags message alone if no URL arrives
      setTimeout(() => {
        const pending = pendingMessages.get(`${chatId}_tags`)
        if (pending && (Date.now() - pending.timestamp >= 15000)) {
          console.log('Timeout: no URL found for tags message')
          pendingMessages.delete(`${chatId}_tags`)
          sendTelegramMessage(chatId, '❓ I could not find a recent URL from you. Please send the article link first, then your #tags/@folder.')
        }
      }, 15000)
      
      return NextResponse.json({ ok: true })
    } else {
      await sendTelegramMessage(chatId,
        `❓ I didn't understand that. Try /help for commands.`
      )
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Telegram webhook error:', error)
    return NextResponse.json({ ok: false, error: 'Internal server error' }, { status: 500 })
  }
}

async function sendTelegramMessage(chatId: string, text: string) {
  const res = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML' }),
  })

  if (!res.ok) {
    console.error('Failed to send message:', await res.text());
  }
}