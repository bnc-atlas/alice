import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Use service role for server-side
)

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const from = formData.get('From') as string
    const body = formData.get('Body') as string

    if (!from || !body) {
      return new NextResponse('Missing required fields', { status: 400 })
    }

    // Find user by phone number
    const { data: user } = await supabase
      .from('sms_inbox')
      .select('user_id')
      .eq('phone_number', from)
      .limit(1)
      .single()

    if (!user) {
      return twilioResponse('Phone number not registered. Please link your number in settings.')
    }

    const userId = user.user_id

    // Log incoming message
    const { data: smsLog } = await supabase
      .from('sms_inbox')
      .insert({
        user_id: userId,
        phone_number: from,
        message_body: body,
        processed: false,
      })
      .select()
      .single()

    // Parse message
    const parsed = parseMessage(body)

    if (parsed.command === 'help') {
      return twilioResponse(`📱 Second Brain SMS Commands:
      
📌 Basic:
• https://example.com
• https://example.com #coding @work

📁 Folders (creates if new):
• @journal - single word
• @reading-list - hyphenated
• @"deep work" - multi-word (use quotes)

🏷️ Tags (creates if new):
• #productivity #learning #ai

✏️ Manual Entry:
• Book: Title by Author #fiction @library
• Article: Great piece @favorites

💡 Examples:
• https://article.com #tech @curriculum
• Book: Atomic Habits by James Clear #habits @"self improvement"
• https://youtube.com/watch?v=abc #tutorial #coding @learning

Reply "help" anytime for this guide!`)
    }

    // Create content item
    let metadata: Record<string, unknown> = {}
    
    if (parsed.url) {
      // Fetch metadata from URL
      try {
        const metaResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/metadata`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: parsed.url }),
        })
        metadata = await metaResponse.json()
      } catch (error) {
        console.error('Failed to fetch metadata:', error)
      }
    }

    const contentData = {
      user_id: userId,
      title: parsed.title || metadata.title || parsed.url || 'Untitled',
      url: parsed.url,
      content_type: parsed.contentType || detectContentType(parsed.url || ''),
      description: metadata.description,
      thumbnail_url: metadata.image,
      domain: metadata.domain,
      author: metadata.author,
      status: 'to_read',
      progress_percentage: 0,
      added_via: 'sms',
    }

    const { data: content, error: contentError } = await supabase
      .from('content_items')
      .insert(contentData)
      .select()
      .single()

    if (contentError) throw contentError

    // Add tags (creates new tags automatically)
    if (parsed.tags.length > 0) {
      for (const tagName of parsed.tags) {
        // Normalize tag name: lowercase, replace hyphens with spaces for display
        const normalizedTag = tagName.toLowerCase().replace(/-/g, ' ')
        
        // Get or create tag
        let { data: tag } = await supabase
          .from('tags')
          .select('id')
          .eq('user_id', userId)
          .eq('name', normalizedTag)
          .single()

        if (!tag) {
          const { data: newTag } = await supabase
            .from('tags')
            .insert({ 
              user_id: userId, 
              name: normalizedTag, 
              color: getColorForName(normalizedTag) 
            })
            .select()
            .single()
          tag = newTag
        }

        if (tag) {
          await supabase
            .from('content_tags')
            .insert({ content_id: content.id, tag_id: tag.id })
        }
      }
    }

    // Add to folder (creates new folder automatically)
    if (parsed.folder) {
      const normalizedFolder = parsed.folder.trim()
      
      let { data: folder } = await supabase
        .from('folders')
        .select('id')
        .eq('user_id', userId)
        .ilike('name', normalizedFolder)
        .single()

      if (!folder) {
        const { data: newFolder } = await supabase
          .from('folders')
          .insert({ 
            user_id: userId, 
            name: normalizedFolder, 
            color: getColorForName(normalizedFolder),
            icon: '📁'
          })
          .select()
          .single()
        folder = newFolder
      }

      if (folder) {
        await supabase
          .from('content_items')
          .update({ folder_id: folder.id })
          .eq('id', content.id)
      }
    }

    // Mark SMS as processed
    await supabase
      .from('sms_inbox')
      .update({ processed: true, content_id: content.id, processed_at: new Date().toISOString() })
      .eq('id', smsLog.id)

    // Build response message
    let responseMsg = `✅ Added to your Second Brain! 🧠`
    
    if (parsed.tags.length > 0) {
      responseMsg += `\n🏷️ Tags: ${parsed.tags.map(t => '#' + t.replace(/-/g, ' ')).join(', ')}`
    }
    
    if (parsed.folder) {
      responseMsg += `\n📁 Folder: ${parsed.folder}`
    }
    
    return twilioResponse(responseMsg)

  } catch (error) {
    console.error('SMS webhook error:', error)
    return twilioResponse('❌ Failed to add content. Please try again or check the app.')
  }
}

function parseMessage(body: string): {
  url?: string
  title?: string
  contentType?: string
  tags: string[]
  folder?: string
  command?: string
  author?: string
} {
  const result: {
    tags: string[]
    url?: string
    title?: string
    description?: string
    folder?: string
    author?: string
    command?: string
    contentType?: string
  } = {
    tags: [],
  }

  // Check for help command
  if (body.toLowerCase().trim() === 'help') {
    result.command = 'help'
    return result
  }

  // Extract URL (handles multiple URL formats)
  const urlMatch = body.match(/(https?:\/\/[^\s]+)/i)
  if (urlMatch) {
    result.url = urlMatch[1]
  }

  // Extract tags (#hashtag or #multi-word-tag)
  // Supports: #coding, #deep-learning, #self_improvement
  const tagMatches = body.matchAll(/#([\w-]+)/g)
  for (const match of tagMatches) {
    result.tags.push(match[1].toLowerCase())
  }

  // Extract folder (@folder-name or @"multi word folder")
  // Supports: @work, @reading-list, @"deep work"
  const quotedFolderMatch = body.match(/@"([^"]+)"/i)
  const simpleFolderMatch = body.match(/@([\w-]+)/i)
  
  if (quotedFolderMatch) {
    result.folder = quotedFolderMatch[1].trim()
  } else if (simpleFolderMatch) {
    result.folder = simpleFolderMatch[1].replace(/-/g, ' ')
  }

  // Extract manual entry (Type: Title by Author)
  if (!result.url) {
    const manualMatch = body.match(/^(book|article|video|podcast):\s*(.+?)(?:\s+by\s+(.+?))?(?:\s+#|\s+@|$)/i)
    if (manualMatch) {
      result.contentType = manualMatch[1].toLowerCase()
      result.title = manualMatch[2].trim()
      if (manualMatch[3]) {
        result.author = manualMatch[3].trim()
      }
    } else {
      // Just use the whole message as title (removing tags and folder)
      result.title = body
        .replace(/#[\w-]+/g, '')
        .replace(/@"[^"]+"/g, '')
        .replace(/@[\w-]+/g, '')
        .trim()
    }
  }

  return result
}

function detectContentType(url: string): string {
  if (url.includes('youtube.com') || url.includes('youtu.be') || url.includes('vimeo.com')) {
    return 'video'
  }
  if (url.includes('spotify.com') || url.includes('podcast')) {
    return 'podcast'
  }
  if (url.includes('amazon.com/dp') || url.includes('goodreads.com')) {
    return 'book'
  }
  return 'article'
}

// Get a unique color for new tags/folders based on name hash
function getColorForName(name: string): string {
  const colors = [
    '#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', 
    '#10b981', '#06b6d4', '#ef4444', '#f97316',
    '#84cc16', '#14b8a6', '#3b82f6', '#a855f7',
  ]
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = ((hash << 5) - hash) + name.charCodeAt(i)
    hash = hash & hash
  }
  return colors[Math.abs(hash) % colors.length]
}

function twilioResponse(message: string): NextResponse {
  const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>${message}</Message>
</Response>`
  
  return new NextResponse(twiml, {
    headers: {
      'Content-Type': 'text/xml',
    },
  })
}
