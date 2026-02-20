# 🤖 Telegram Bot Setup - Complete Guide

Set up your Second Brain Telegram bot in 10 minutes. **100% FREE!**

## Why Telegram?

- ✅ **Completely Free** - No costs ever
- ✅ **Easy Setup** - Just 5 steps
- ✅ **Works Everywhere** - No phone number needed
- ✅ **Rich Features** - Commands, buttons, inline menus
- ✅ **Private** - Only you can access your bot

## 📋 Step-by-Step Setup

### Step 1: Create Your Bot (2 minutes)

1. **Open Telegram** on your phone or computer
2. **Search for** `@BotFather` (official bot)
3. **Send** `/newbot`
4. **Choose a name**: "My Second Brain" (display name)
5. **Choose a username**: Must end in "bot", e.g., `my_second_brain_bot`

You'll receive:
```
Done! Congratulations on your new bot.
Token: 123456789:ABCdefGHIjklMNOpqrsTUVwxyz
```

**Save this token!** You'll need it.

### Step 2: Get Your Chat ID (1 minute)

1. **Send a message** to your new bot (anything, like "hello")
2. **Open this URL** in your browser:
   ```
   https://api.telegram.org/bot<YOUR_TOKEN>/getUpdates
   ```
   Replace `<YOUR_TOKEN>` with your actual token

3. **Find your chat ID** in the response:
   ```json
   {
     "chat": {
       "id": 123456789,  ← This is your chat ID
       "username": "yourusername"
     }
   }
   ```

**Save this chat ID!**

### Step 3: Configure Environment Variables (1 minute)

Add to your `.env.local`:

```env
# Telegram Bot Configuration
TELEGRAM_BOT_TOKEN=123456789:ABCdefGHIjklMNOpqrsTUVwxyz
TELEGRAM_ALLOWED_CHAT_IDS=123456789
```

**Security Note**: `TELEGRAM_ALLOWED_CHAT_IDS` ensures only you can use the bot. You can add multiple IDs separated by commas:
```env
TELEGRAM_ALLOWED_CHAT_IDS=123456789,987654321
```

### Step 4: Deploy the Webhook (3 minutes)

#### Option A: Local Development

1. **Start your server**:
   ```bash
   npm run dev
   ```

2. **Use ngrok** to expose localhost:
   ```bash
   ngrok http 3000
   ```

3. **Set the webhook**:
   ```bash
   curl -X POST "https://api.telegram.org/bot<YOUR_TOKEN>/setWebhook" \
     -d "url=https://your-ngrok-url.ngrok.io/api/telegram/webhook"
   ```

#### Option B: Production (Vercel)

1. **Deploy to Vercel** (see DEPLOYMENT_GUIDE.md)

2. **Set the webhook** (replace with your domain):
   ```bash
   curl -X POST "https://api.telegram.org/bot<YOUR_TOKEN>/setWebhook" \
     -d "url=https://your-domain.vercel.app/api/telegram/webhook"
   ```

3. **Verify webhook**:
   ```bash
   curl "https://api.telegram.org/bot<YOUR_TOKEN>/getWebhookInfo"
   ```

   Should show:
   ```json
   {
     "url": "https://your-domain.vercel.app/api/telegram/webhook",
     "has_custom_certificate": false,
     "pending_update_count": 0
   }
   ```

### Step 5: Test Your Bot! (1 minute)

1. **Open Telegram** and find your bot
2. **Send** `/start`
3. **You should see**:
   ```
   🧠 Welcome to Second Brain!

   Send me any URL with tags and folders:
   https://article.com #coding @curriculum

   Commands:
   /help - Show this message
   /list - Recent items
   ...
   ```

4. **Try saving content**:
   ```
   https://example.com/article #coding @curriculum
   ```

5. **Bot responds**:
   ```
   ✅ Added to your Second Brain! 🧠

   📄 How to Learn React
   🏷️ Tags: #coding
   📁 Folder: curriculum
   🌐 Source: example.com
   ```

**Success!** Your bot is working! 🎉

---

## 💬 Using Your Bot

### Basic Usage

**Save a URL:**
```
https://article.com
```

**With tags:**
```
https://article.com #coding #tutorial
```

**With folder:**
```
https://article.com @curriculum
```

**Multi-word folder:**
```
https://article.com @"reading list"
```

**Everything together:**
```
https://article.com #ai #research @"phd research"
```

**Manual entry:**
```
Book: Atomic Habits by James Clear #productivity @reading-list
```

### Bot Commands

| Command | Description | Example |
|---------|-------------|---------|
| `/start` | Welcome message | `/start` |
| `/help` | Show usage guide | `/help` |
| `/list` | Show recent 5 items | `/list` |
| `/folders` | List all folders | `/folders` |
| `/tags` | List all tags | `/tags` |
| `/stats` | Show statistics | `/stats` |

### Examples

**Check recent saves:**
```
/list
```
Response:
```
📚 Recent items:

1. How to Learn React
   🔗 https://tutorial.com
   
2. Deep Learning Paper
   🔗 https://arxiv.org/paper
   
...
```

**View your folders:**
```
/folders
```
Response:
```
📁 Your folders:

• curriculum
• journal
• reading list
• work projects
```

**Check stats:**
```
/stats
```
Response:
```
📊 Your Statistics:

📚 Total Items: 47
📖 To Read: 23
⏳ In Progress: 8
✅ Completed: 16

Keep learning! 🚀
```

---

## 🎨 Advanced Features

### Rich Responses

The bot provides rich, formatted responses:
- ✅ Success confirmations
- 🏷️ Tag highlights
- 📁 Folder indicators
- 🌐 Source domains
- ✨ New tag/folder notifications

### Auto-Creation

Just like SMS, the Telegram bot:
- Creates new tags automatically
- Creates new folders automatically
- Uses consistent colors
- Normalizes names

### Smart Parsing

The bot understands:
- URLs anywhere in message
- Multiple tags
- Quoted folder names
- Manual entries (books, articles)

---

## 🔒 Security

### Best Practices

1. **Never share your bot token** - It's like a password
2. **Use TELEGRAM_ALLOWED_CHAT_IDS** - Restricts access to your chat ID
3. **Keep token in .env.local** - Never commit to git
4. **Regenerate if exposed** - Talk to @BotFather

### Access Control

The webhook checks:
1. Is the chat ID in the allowed list?
2. If not, reject and log the attempt
3. Notify you of unauthorized access attempts

### For Teams

To share your Second Brain with team members:

1. **Get their chat IDs** (they message bot, you check logs)
2. **Add to env variable**:
   ```env
   TELEGRAM_ALLOWED_CHAT_IDS=your_id,teammate1_id,teammate2_id
   ```
3. **Link their Telegram to user accounts** (modify `getUserIdFromChatId` function)

---

## 🛠️ Troubleshooting

### Bot doesn't respond

**Check webhook status:**
```bash
curl "https://api.telegram.org/bot<YOUR_TOKEN>/getWebhookInfo"
```

**Common issues:**
- Webhook URL is wrong
- Server not accessible (check Vercel logs)
- Token is incorrect

**Solution:**
```bash
# Delete webhook
curl -X POST "https://api.telegram.org/bot<YOUR_TOKEN>/deleteWebhook"

# Set again
curl -X POST "https://api.telegram.org/bot<YOUR_TOKEN>/setWebhook" \
  -d "url=https://your-correct-url.com/api/telegram/webhook"
```

### "Not authorized" message

**Issue**: Your chat ID isn't in the allowed list

**Solution:**
1. Check server logs for your chat ID
2. Add to `.env.local`:
   ```env
   TELEGRAM_ALLOWED_CHAT_IDS=your_actual_chat_id
   ```
3. Redeploy if on Vercel

### Content not saving

**Check:**
1. Environment variables are set correctly
2. Supabase connection works
3. Check Vercel/server logs for errors
4. Test API endpoint directly

### Metadata not fetching

**Issue**: Some sites block scraping

**Solution**: Content still saves, just without thumbnail/description
- You can edit in web app later
- Or use manual format: `Article: Title [URL]`

---

## 🚀 Next Steps

### Customize Your Bot

**Edit responses** in `app/api/telegram/webhook/route.ts`:
```typescript
// Change success message
responseMsg = `🎉 Saved! Your collection grows...`

// Add custom commands
case '/mycommand':
  await sendTelegramMessage(chatId, 'Custom response!')
  break
```

### Add Bot Features

**Inline buttons:**
```typescript
await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
  method: 'POST',
  body: JSON.stringify({
    chat_id: chatId,
    text: 'Choose action:',
    reply_markup: {
      inline_keyboard: [[
        { text: '✅ Mark Complete', callback_data: 'complete_123' },
        { text: '📝 Add Note', callback_data: 'note_123' }
      ]]
    }
  })
})
```

**Image support:**
```typescript
// User sends image with caption
if (message.photo) {
  const caption = message.caption
  const fileId = message.photo[message.photo.length - 1].file_id
  // Save to your Second Brain with thumbnail
}
```

### Bot Profile

**Customize in @BotFather:**
- `/setdescription` - Bot description
- `/setabouttext` - About text
- `/setuserpic` - Profile picture
- `/setcommands` - Command list

**Example commands list:**
```
start - Welcome message
help - Usage guide
list - Recent items
folders - Your folders
tags - Your tags
stats - Statistics
```

---

## 📊 Comparison: Telegram vs SMS

| Feature | Telegram | SMS (Twilio) |
|---------|----------|--------------|
| Cost | **Free** | ~$0.01/msg |
| Setup | 10 min | 10 min |
| Commands | ✅ Yes | ❌ No |
| Rich formatting | ✅ Yes | ❌ No |
| Buttons | ✅ Yes | ❌ No |
| Images | ✅ Yes | ❌ No |
| Phone needed | ❌ No | ✅ Yes |
| International | ✅ Free | 💰 Varies |

**Verdict**: Telegram is better for most use cases!

---

## 🎯 Real-World Workflow

### Morning Routine
```
☕ Reading morning news
📱 Find interesting article
🤖 Forward to bot: URL #news @quick-reads
✅ Saved! Continue reading
```

### During Work
```
💼 Find useful documentation
🤖 Message bot: URL #reference @work
📊 Quick /stats check
✅ 5 new items today!
```

### Evening Review
```
🌙 Open Second Brain web app
📚 Review saved items from bot
📖 Start reading saved articles
✅ Mark as in-progress
```

**The bot becomes your knowledge capture assistant!** 🧠✨

---

## 🎯 Quick Reference

| What you type | What happens |
|---------------|--------------|
| `URL` | Saves with auto-detected metadata |
| `URL #tag` | Adds tag (creates if new) |
| `URL @folder` | Adds to folder (creates if new) |
| `URL #tag @folder` | Adds tag AND folder |
| `#multi-word-tag` | Creates hyphenated tag as "multi word tag" |
| `@"multi word"` | Creates multi-word folder |

## 💡 Pro Tips

1. **Pin your bot** to top of Telegram for quick access
2. **Use /list** regularly to review what you've saved
3. **Create consistent tags** for better organization
4. **Use /stats** for motivation (gamify your learning!)
5. **Forward messages** from channels directly to bot
6. **Edit messages** if you make mistakes (bot handles edits)

---

**Your Telegram bot is ready! Start building your Second Brain! 🚀**
