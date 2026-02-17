# ⚡ Quick Start Guide - Second Brain

Get your Second Brain up and running in 10 minutes!

## 🎯 What You're Building

A beautiful, modern content management system to track and organize:
- 📰 Articles you want to read
- 🎥 Videos to watch
- 📚 Books on your reading list
- 🎙️ Podcasts to listen to
- And anything else!

## 🚀 5-Minute Setup

### Step 1: Install Dependencies (2 min)

```bash
cd second-brain
npm install
```

### Step 2: Set Up Supabase (3 min)

1. Go to [supabase.com](https://supabase.com) and create a free account
2. Click "New Project"
3. Name it "second-brain" and wait for it to initialize
4. Go to **SQL Editor** (left sidebar)
5. Copy the entire contents of `supabase-schema.sql`
6. Paste into SQL Editor and click **Run**
7. (Optional but recommended) Copy contents of `supabase-default-setup.sql`
8. Paste and click **Run** - this creates starter folders like "Journal", "Curriculum", etc.

### Step 3: Configure Environment (1 min)

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. In Supabase, go to **Settings → API**
3. Copy these values into `.env.local`:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Step 4: Start the App (30 sec)

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) 🎉

## ✨ First Steps

1. **Add Your First Item**
   - Click "Add Content" button
   - Paste any URL (try: `https://news.ycombinator.com`)
   - Click "Auto-Fill Details"
   - Click "Add to Brain"

2. **Create a Folder**
   - If you ran the default setup, you'll already have folders!
   - Try "Journal" for personal thoughts
   - Use "Curriculum" for learning materials
   - Or click "+ New Folder" to create your own

3. **Add Some Tags**
   - Click "+ New Tag" in sidebar
   - Try: "coding", "productivity", "learning"

4. **Explore Views**
   - Switch between Grid and List views
   - Try the search bar
   - Filter by status

## 📱 Optional: SMS Integration

Want to save content by texting yourself? See [SMS_INTEGRATION_GUIDE.md](./SMS_INTEGRATION_GUIDE.md)

## 🌐 Optional: Browser Extension

Save pages with one click! See [BROWSER_EXTENSION_GUIDE.md](./BROWSER_EXTENSION_GUIDE.md)

## 🚢 Ready to Deploy?

See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for deploying to Vercel (free!)

## 📚 Full Documentation

- [README.md](./README.md) - Complete documentation
- [SMS_INTEGRATION_GUIDE.md](./SMS_INTEGRATION_GUIDE.md) - Set up text messaging
- [BROWSER_EXTENSION_GUIDE.md](./BROWSER_EXTENSION_GUIDE.md) - Build the extension
- [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) - Deploy to production

## 🆘 Troubleshooting

### "Cannot connect to Supabase"
- Check your `.env.local` has the correct values
- Verify your Supabase project is running
- Make sure you ran the SQL schema

### "Page not found" errors
- Restart the dev server: `npm run dev`
- Clear `.next` folder: `rm -rf .next`

### Nothing shows up in the UI
- Check browser console for errors
- Verify the database schema was created
- Try adding content manually first

## 💡 Tips

1. **Start Small**: Add just a few items to get familiar
2. **Use Tags**: They're more flexible than folders
3. **Try SMS**: It's the fastest way to capture content
4. **Review Weekly**: Set time to go through your saved items
5. **Rate Content**: Help yourself remember what was valuable

## 🎨 Customize It!

Want to change the theme? Edit `app/globals.css`:

```css
:root {
  --primary: 250 100% 70%; /* Change this for different colors! */
}
```

## 🤝 Need Help?

- Read the full [README.md](./README.md)
- Check the console for errors
- Review Supabase logs in your dashboard
- Make sure all dependencies installed correctly

---

**You're all set! Start building your Second Brain! 🧠✨**
