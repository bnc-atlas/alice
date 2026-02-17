# 🚀 Deployment Guide

This guide walks you through deploying your Second Brain application to production.

## Prerequisites

- GitHub account
- Vercel account (free tier works!)
- Supabase account (free tier works!)
- (Optional) Custom domain
- (Optional) Twilio account for SMS

## Step-by-Step Deployment

### 1. Set Up Supabase

1. **Create Project**
   - Go to [supabase.com](https://supabase.com)
   - Click "New Project"
   - Choose organization and region
   - Set database password (save it!)

2. **Run Database Schema**
   - Go to SQL Editor in Supabase dashboard
   - Copy contents of `supabase-schema.sql`
   - Paste and click "Run"
   - Verify tables are created in Table Editor

3. **Enable Authentication**
   - Go to Authentication → Settings
   - Enable Email provider
   - Configure email templates (optional)
   - Set up OAuth providers (optional: Google, GitHub)

4. **Get API Credentials**
   - Go to Settings → API
   - Copy these values:
     - Project URL (`NEXT_PUBLIC_SUPABASE_URL`)
     - `anon public` key (`NEXT_PUBLIC_SUPABASE_ANON_KEY`)
     - `service_role` key (`SUPABASE_SERVICE_ROLE_KEY`)

### 2. Prepare Your Code

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/yourusername/second-brain.git
   git push -u origin main
   ```

2. **Verify `.gitignore`**
   ```
   node_modules
   .next
   .env.local
   .vercel
   ```

### 3. Deploy to Vercel

1. **Import Project**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Select "second-brain" repository

2. **Configure Environment Variables**
   Click "Environment Variables" and add:
   
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
   ```

3. **Deploy**
   - Click "Deploy"
   - Wait for build to complete
   - Your app is live! 🎉

### 4. Configure Custom Domain (Optional)

1. **Add Domain in Vercel**
   - Go to your project settings
   - Click "Domains"
   - Add your custom domain
   - Follow DNS configuration instructions

2. **Update Environment Variables**
   ```
   NEXT_PUBLIC_APP_URL=https://yourdomain.com
   ```

3. **Update Supabase Settings**
   - Go to Authentication → URL Configuration
   - Add your domain to "Site URL"
   - Add to "Redirect URLs"

### 5. Set Up SMS Integration (Optional)

1. **Configure Twilio**
   - Create account at [twilio.com](https://www.twilio.com)
   - Get phone number
   - Get Account SID and Auth Token

2. **Add to Vercel Environment Variables**
   ```
   TWILIO_ACCOUNT_SID=your_account_sid
   TWILIO_AUTH_TOKEN=your_auth_token
   TWILIO_PHONE_NUMBER=your_twilio_number
   ```

3. **Configure Webhook**
   - Go to Twilio Console → Phone Numbers
   - Select your number
   - Under Messaging:
     - Webhook URL: `https://your-domain.com/api/sms/webhook`
     - Method: POST
   - Save

4. **Redeploy**
   ```bash
   git add .
   git commit -m "Add Twilio configuration"
   git push
   ```

### 6. Post-Deployment Checklist

- [ ] Test user registration and login
- [ ] Try adding content via web interface
- [ ] Test SMS integration (if enabled)
- [ ] Check metadata extraction works
- [ ] Verify folders and tags creation
- [ ] Test search and filters
- [ ] Check mobile responsiveness
- [ ] Review error logs in Vercel
- [ ] Set up monitoring (optional)

## Database Backups

### Automated Backups (Recommended)

Supabase Pro includes daily backups. For free tier:

1. **Manual Backups**
   ```bash
   # Install Supabase CLI
   npm install -g supabase
   
   # Link to your project
   supabase link --project-ref your-project-ref
   
   # Create backup
   supabase db dump -f backup.sql
   ```

2. **Schedule Backups**
   Create a GitHub Action to automate:
   
   ```yaml
   name: Database Backup
   on:
     schedule:
       - cron: '0 0 * * 0' # Weekly
   jobs:
     backup:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v2
         - name: Backup Database
           run: |
             # Backup script here
   ```

## Monitoring and Analytics

### 1. Vercel Analytics

Enable in Vercel dashboard:
- Go to your project
- Click "Analytics" tab
- Enable Web Analytics

### 2. Error Tracking (Optional)

Add Sentry:

```bash
npm install @sentry/nextjs
```

Configure in `next.config.js`:
```javascript
const { withSentryConfig } = require('@sentry/nextjs');

module.exports = withSentryConfig(
  nextConfig,
  { silent: true }
);
```

### 3. Usage Monitoring

Monitor in Supabase Dashboard:
- Database → Reports
- View queries, connections, storage

## Performance Optimization

### 1. Enable Caching

Add to `next.config.js`:
```javascript
module.exports = {
  // ... existing config
  experimental: {
    optimizeCss: true,
  },
  images: {
    domains: ['your-domain.com'],
    formats: ['image/avif', 'image/webp'],
  },
}
```

### 2. Database Indexing

Already included in schema, but verify:
```sql
-- Check indexes
SELECT * FROM pg_indexes 
WHERE tablename IN ('content_items', 'tags', 'folders');
```

### 3. CDN for Images

Use Vercel's Image Optimization or Cloudinary:
```javascript
import Image from 'next/image'

<Image 
  src={thumbnailUrl} 
  width={400} 
  height={300}
  alt={title}
/>
```

## Security Hardening

### 1. Rate Limiting

Add to API routes:
```typescript
import rateLimit from 'express-rate-limit'

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
```

### 2. Environment Variables

Never commit:
- API keys
- Database passwords
- Service role keys
- Webhook secrets

### 3. Content Security Policy

Add to `next.config.js`:
```javascript
async headers() {
  return [
    {
      source: '/(.*)',
      headers: [
        {
          key: 'Content-Security-Policy',
          value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline';"
        }
      ]
    }
  ]
}
```

## Scaling Considerations

### When to Upgrade

**Free tier limits:**
- Vercel: 100GB bandwidth/month
- Supabase: 500MB database, 1GB file storage
- Twilio: Pay per message

**Upgrade when:**
- Database > 400MB
- 1000+ active users
- 10,000+ content items
- Heavy API usage

### Scaling Options

1. **Database**: Upgrade Supabase plan
2. **Compute**: Vercel Pro for more bandwidth
3. **Storage**: Use S3 for file storage
4. **Search**: Add Algolia for better search

## Troubleshooting

### Build Fails

1. Check build logs in Vercel
2. Verify all dependencies in `package.json`
3. Test build locally: `npm run build`
4. Check TypeScript errors

### Database Connection Issues

1. Verify environment variables
2. Check Supabase project status
3. Review RLS policies
4. Check database logs

### SMS Not Working

1. Verify Twilio webhook URL
2. Check Twilio logs
3. Verify phone number format
4. Check webhook authentication

## Maintenance

### Weekly
- [ ] Review error logs
- [ ] Check database size
- [ ] Monitor API usage

### Monthly
- [ ] Update dependencies
- [ ] Review and optimize queries
- [ ] Check security updates
- [ ] Review user feedback

### Quarterly
- [ ] Database backup
- [ ] Performance review
- [ ] Security audit
- [ ] Feature planning

## Getting Help

- **Vercel**: [vercel.com/support](https://vercel.com/support)
- **Supabase**: [supabase.com/docs](https://supabase.com/docs)
- **GitHub Issues**: Create issues in your repository
- **Discord**: Join Next.js and Supabase communities

---

**Your Second Brain is now live! 🎉**
