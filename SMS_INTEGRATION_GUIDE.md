# SMS Integration Guide

This guide explains how to set up SMS integration to add content to your Second Brain via text message.

## Overview

The system can receive content via SMS using Twilio. When you text a URL or content to your phone number, it will be automatically added to your Second Brain.

## Setup Steps

### 1. Create Twilio Account
1. Sign up at https://www.twilio.com
2. Get a phone number
3. Note your Account SID and Auth Token

### 2. Configure Webhook

Add these environment variables to your `.env.local`:
```
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=your_twilio_number
```

### 3. Set up Webhook URL

In Twilio console:
1. Go to Phone Numbers → Your Number
2. Under Messaging, set Webhook to: `https://your-domain.com/api/sms/webhook`
3. Method: POST

## SMS Commands

Send text messages in these formats. **New folders and tags are created automatically!**

### 📌 Simple URL
```
https://example.com/article
```
Auto-detects content type and fetches metadata.

### 🏷️ URL with Tags (auto-creates tags if new)
```
https://example.com/article #coding #tutorial
https://example.com/article #deep-learning #ai
```
Tags support hyphens for multi-word tags.

### 📁 URL with Folder (auto-creates folder if new)
```
# Single word folders
https://example.com/article @journal
https://example.com/article @work

# Hyphenated folders
https://example.com/article @reading-list
https://example.com/article @quick-reads

# Multi-word folders (use quotes)
https://example.com/article @"deep work"
https://example.com/article @"self improvement"
```

### 🎯 URL with Both Tags and Folder
```
https://example.com/article #coding #tutorial @curriculum
https://example.com/article #productivity #learning @"personal development"
```

### ✏️ Manual Entry (without URL)
```
Book: Atomic Habits by James Clear #productivity @reading-list
Article: Great piece on AI #ai #must-read @research
Video: How to code #tutorial #coding @curriculum
```

## Examples

```
# Tech article to curriculum folder
https://example.com/10-tips-for-productivity #productivity #tech @curriculum

# YouTube video with multiple tags
https://youtube.com/watch?v=abc123 #tutorial #coding #webdev @"learning resources"

# Book for reading list
Book: Deep Work by Cal Newport #productivity #focus @"reading list"

# Research paper with specific tags
https://arxiv.org/paper #ai #research #deep-learning @research

# Quick article to journal
https://medium.com/article #reflection #personal @journal

# Multi-word folder example
https://article.com #business #strategy @"work projects"

# Simple save to default folder
https://news.ycombinator.com/article @quick-reads
```

## Response Messages

- ✅ Success: "Added to your Second Brain! 🧠
🏷️ Tags: #coding, #tutorial
📁 Folder: curriculum"
- ❌ Error: "Failed to add content. Please try again."
- ℹ️ Help: Reply "help" for command syntax

## Auto-Creation of Folders and Tags

**The system automatically creates new folders and tags!**

### How It Works:
1. You text: `https://article.com #new-tag @new-folder`
2. System checks if `#new-tag` exists
3. If not, creates it with a color (based on tag name)
4. Same for `@new-folder`
5. Saves your content with the new tag and folder

### Tag Naming:
- **Single word**: `#coding` → creates tag "coding"
- **Hyphenated**: `#deep-learning` → creates tag "deep learning"
- **Case**: Always lowercase for consistency

### Folder Naming:
- **Single word**: `@journal` → creates folder "journal"
- **Hyphenated**: `@reading-list` → creates folder "reading list"
- **Multi-word**: `@"deep work"` → creates folder "deep work"
- **Case**: Preserves your capitalization

### Colors:
Each new tag/folder gets a unique color based on its name, so the same tag/folder always has the same color across your system.

## Implementation

The webhook endpoint is already created at `/app/api/sms/webhook/route.ts`.
It processes incoming messages and creates content items automatically.

## Advanced Features

### Scheduled Digests
Get a daily/weekly summary of content you've saved via SMS.

### Quick Actions
- Reply with "done" to mark last item as completed
- Reply with "progress 50" to update progress
- Reply with "rate 5" to rate last item

### Smart Detection
- Automatically detects YouTube, Spotify, Medium, etc.
- Extracts metadata (title, author, thumbnail)
- Categorizes content type

## Security

- Webhook validates Twilio signature
- User authentication via phone number matching
- Rate limiting to prevent spam

## Troubleshooting

**Message not received?**
- Check Twilio logs in dashboard
- Verify webhook URL is accessible
- Check HTTPS is enabled

**Metadata not extracting?**
- Some sites block scraping
- Fallback to manual title entry
- Check URL is accessible

**Wrong content type detected?**
- Add explicit type: "video: [URL]"
- Or: "article: [URL]", "book: [title]"
