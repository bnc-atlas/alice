# 🧠 Second Brain - Your Personal Knowledge Hub

A modern, beautiful content management system for tracking articles, videos, books, podcasts, and more. Built with Next.js 14, Supabase, and Tailwind CSS.

![Second Brain Dashboard](https://via.placeholder.com/1200x600/0f172a/a78bfa?text=Second+Brain+Dashboard)

## ✨ Features

### 📚 Content Management
- **Multi-format Support**: Track articles, videos, books, podcasts, tweets, and more
- **Smart Metadata Extraction**: Automatically fetches titles, descriptions, and thumbnails from URLs
- **Progress Tracking**: Mark items as to-read, in-progress, completed, or archived
- **Reading Progress**: Track percentage completion for long-form content
- **Ratings & Notes**: Rate content and add personal notes

### 🗂️ Organization
- **Folders**: Organize content into custom folders with colors
- **Tags**: Add multiple tags to each item for flexible categorization
- **Advanced Filtering**: Filter by status, folder, tags, and content type
- **Smart Search**: Full-text search across titles, descriptions, and authors

### 📱 SMS Integration
- **Telegram Bot** (RECOMMENDED): 100% free, works worldwide, rich features
- **Text-to-Save**: Add content by messaging your bot or texting URLs
- **Smart Parsing**: Automatically detects tags (#coding) and folders (@work)
- **Auto-Creation**: New tags and folders are created automatically
- **Manual Entry**: Add books and other content without URLs
- **Multi-word Support**: Use `@"folder name"` for multi-word folders
- **Bot Commands**: `/list`, `/folders`, `/tags`, `/stats` and more
- **Instant Confirmation**: Get confirmations when content is added

### 🎨 Modern UI/UX
- **Dark Theme**: Sleek, modern dark interface inspired by contemporary design
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **Grid & List Views**: Switch between grid and list layouts
- **Smooth Animations**: Framer Motion animations for delightful interactions
- **Glass Morphism**: Beautiful glassmorphic effects and gradients

### 📊 Analytics
- **Stats Overview**: See your content stats at a glance
- **Reading Habits**: Track reading sessions and time spent
- **Content Insights**: Understand your consumption patterns

## 🚀 Quick Start

### Prerequisites
- Node.js 18.18+ and npm 9+
- Supabase account
- (Optional) Telegram for bot integration

**Note**: This project uses the latest stable versions of Next.js 15 and React 19. See [PACKAGE_UPDATES.md](./PACKAGE_UPDATES.md) if you encounter any issues.

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd second-brain
npm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Run the SQL schema:
   ```bash
   # Copy the contents of supabase-schema.sql
   # Paste into Supabase SQL Editor and run
   ```
3. (Optional) Run default setup for starter folders/tags:
   ```bash
   # Copy contents of supabase-default-setup.sql
   # Paste into Supabase SQL Editor and run
   ```
   This auto-creates folders: "Journal", "Curriculum", "Work", "Reading List", "Watch Later"
4. Get your project credentials:
   - Go to Settings → API
   - Copy `Project URL` and `anon public` key

### 3. Configure Environment

```bash
cp .env.example .env.local
```

Edit `.env.local` with your credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📖 Usage Guide

### Adding Content via Web Interface

1. Click the "Add Content" button
2. **Option 1**: Paste a URL and click "Auto-Fill Details"
   - The app will fetch metadata automatically
3. **Option 2**: Click "Manual Entry" to add without a URL
4. Fill in details, select folder, add tags
5. Click "Add to Brain"

### Adding Content via SMS

See [SMS_INTEGRATION_GUIDE.md](./SMS_INTEGRATION_GUIDE.md) for detailed setup and [SMS_EXAMPLES.md](./SMS_EXAMPLES.md) for real-world usage.

**Quick examples** (tags and folders are auto-created if they don't exist):
```
# Simple URL
https://example.com/article

# With tags (auto-creates new tags)
https://example.com/article #coding #tutorial

# With folder (auto-creates new folder)
https://example.com/article @curriculum

# Multi-word folders (use quotes)
https://example.com/article @"reading list"

# Everything together
https://example.com/article #ai #research @"phd research"

# Manual book entry
Book: Atomic Habits by James Clear #productivity @reading-list
```

**Auto-Creation Features**:
- **New tags**: Just use `#new-tag` and it's created automatically
- **New folders**: Use `@new-folder` or `@"new folder"` - created on the fly
- **Consistent colors**: Same tag/folder name always gets the same color
- **Smart formatting**: Hyphens in tags become spaces (`#deep-learning` → "deep learning")

### Organizing Content

**Folders:**
- Create folders from the sidebar
- Assign colors to folders for visual organization
- Move items between folders with drag-and-drop (coming soon)

**Tags:**
- Add multiple tags to any item
- Click tags in sidebar to filter
- Tags auto-complete as you type

**Status Management:**
- **To Read**: Default status for new items
- **In Progress**: Currently reading/watching
- **Completed**: Finished items
- **Archived**: Old or less relevant content

### Search and Filter

- Use the search bar to find content across all fields
- Filter by status using the dropdown
- Click folders or tags in the sidebar to filter
- Combine filters for precise results

## 🎨 Customization

### Theme Colors

Edit `app/globals.css` to customize the color scheme:

```css
:root {
  --primary: 250 100% 70%; /* Purple */
  --background: 222 47% 4%; /* Dark */
  /* ... more variables */
}
```

### Adding Content Types

To add new content types:

1. Update the enum in `supabase-schema.sql`
2. Add the type to `lib/supabase.ts`
3. Add an icon in components

## 📱 SMS Integration Setup

### Twilio Setup

1. Create account at [twilio.com](https://www.twilio.com)
2. Get a phone number
3. Configure webhook:
   - URL: `https://your-domain.com/api/sms/webhook`
   - Method: POST
4. Add credentials to `.env.local`

### User Phone Linking

Users must link their phone number:

1. Go to Settings
2. Enter phone number
3. Verify with SMS code
4. Start texting content!

## 🏗️ Project Structure

```
second-brain/
├── app/
│   ├── api/
│   │   ├── metadata/        # URL metadata extraction
│   │   └── sms/             # SMS webhook handler
│   ├── globals.css          # Global styles
│   ├── layout.tsx           # Root layout
│   └── page.tsx            # Main dashboard
├── components/
│   ├── AddContentDialog.tsx # Add content modal
│   ├── ContentCard.tsx      # Content item display
│   ├── Sidebar.tsx          # Navigation sidebar
│   └── StatsOverview.tsx    # Statistics display
├── lib/
│   └── supabase.ts          # Supabase client & types
├── supabase-schema.sql      # Database schema
└── package.json
```

## 🔒 Security

- Row Level Security (RLS) enabled on all tables
- User authentication via Supabase Auth
- Phone number verification for SMS
- API routes protected with authentication
- Webhook signature validation for Twilio

## 🚢 Deployment

### Deploy to Vercel

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy!

### Update Webhook URL

After deployment, update your Twilio webhook URL to:
```
https://your-vercel-domain.com/api/sms/webhook
```

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Database**: Supabase (PostgreSQL)
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Type Safety**: TypeScript
- **SMS**: Twilio (optional)
- **Deployment**: Vercel

## 📊 Database Schema

See `supabase-schema.sql` for the complete schema.

Main tables:
- `content_items`: Core content storage
- `folders`: Content organization
- `tags`: Tagging system
- `content_tags`: Many-to-many relationship
- `sms_inbox`: SMS message log
- `reading_sessions`: Activity tracking

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

MIT License - feel free to use this project for personal or commercial purposes.

## 🙏 Acknowledgments

- Inspired by Goodreads, Pocket, and Notion
- UI design influenced by modern dark theme aesthetics
- Built with love for knowledge management enthusiasts

## 📧 Support

For issues, questions, or suggestions:
- Open an issue on GitHub
- Email: support@secondbrain.app (example)

---

**Happy organizing! 🧠✨**
