# 🔧 Package Updates & Troubleshooting

## ✅ Fixed Security Issues

The updated `package.json` addresses all security vulnerabilities and deprecation warnings.

## 📦 What Changed

### Security Fixes
- ✅ **Next.js**: `14.0.4` → `15.1.6` (fixes critical DoS vulnerabilities)
- ✅ **React**: `18.2.0` → `19.0.0` (latest stable)
- ✅ **ESLint**: `8.57.1` → `9.17.0` (security updates)

### Deprecated Packages Replaced
- ❌ `@supabase/auth-helpers-nextjs` (deprecated)
- ✅ `@supabase/ssr` (new recommended package)

### Updated Dependencies
- All Radix UI components updated to latest
- Framer Motion, Lucide React, and other libraries updated
- TypeScript and build tools updated

## 🚀 Clean Installation

### Step 1: Remove Old Packages

```bash
# Remove node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Or on Windows:
# rmdir /s node_modules
# del package-lock.json
```

### Step 2: Install Fresh

```bash
npm install
```

You should see:
```
✅ No warnings about deprecated packages
✅ No critical vulnerabilities
✅ Clean audit
```

### Step 3: Verify Installation

```bash
npm run dev
```

Should start without errors at `http://localhost:3000`

## 🐛 Troubleshooting

### Issue: "Module not found: @supabase/auth-helpers-nextjs"

**Solution**: The codebase now uses `@supabase/ssr` instead.

Make sure you have the updated files:
- `lib/supabase.ts` (uses `@supabase/ssr`)
- `package.json` (lists `@supabase/ssr`)

### Issue: React 19 Type Errors

**Symptoms**:
```
Type error: 'ReactNode' is not assignable...
```

**Solution**: Update TypeScript types:
```bash
npm install --save-dev @types/react@^19.0.1 @types/react-dom@^19.0.2
```

### Issue: ESLint Configuration Errors

**Symptoms**:
```
Error: Failed to load config "next"
```

**Solution**: ESLint 9 requires new configuration format.

Create `eslint.config.mjs`:
```javascript
import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
];

export default eslintConfig;
```

Or use ESLint 8:
```bash
npm install --save-dev eslint@^8.57.1 eslint-config-next@^15.1.6
```

### Issue: Next.js 15 Breaking Changes

**Changes in Next.js 15**:
1. `fetch()` no longer cached by default
2. Route handlers are dynamic by default
3. React 19 is default

**Migration**:
Most code should work without changes. If you see issues:

```typescript
// Before (Next.js 14):
export default async function Page() {
  const data = await fetch(url) // cached
}

// After (Next.js 15):
export default async function Page() {
  const data = await fetch(url, { cache: 'force-cache' }) // explicit cache
}
```

### Issue: Framer Motion Warnings

**Symptoms**:
```
Warning: useLayoutEffect does nothing on the server
```

**Solution**: This is harmless, but you can suppress:

```typescript
// Add to next.config.js
const nextConfig = {
  // ...
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
}
```

### Issue: Build Fails with TypeScript Errors

**Solution**: Strict mode might catch new issues.

Temporarily disable for migration:
```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": false, // Change to true after fixing errors
    // ...
  }
}
```

## 📋 Version Compatibility

| Package | Old Version | New Version | Breaking? |
|---------|-------------|-------------|-----------|
| Next.js | 14.0.4 | 15.1.6 | Minor |
| React | 18.2.0 | 19.0.0 | Minor |
| Supabase | auth-helpers | @supabase/ssr | Yes* |
| ESLint | 8.57.1 | 9.17.0 | Config change |

*Breaking but already fixed in updated files

## 🔄 Manual Migration (If Needed)

### Supabase Client Migration

**Old Code** (auth-helpers):
```typescript
import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs'

const supabase = createPagesBrowserClient()
```

**New Code** (@supabase/ssr):
```typescript
import { createBrowserClient } from '@supabase/ssr'

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
```

### Server-Side Usage

**For API routes:**
```typescript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Server-side only
)
```

## ✅ Post-Update Checklist

- [ ] `npm install` completes without errors
- [ ] `npm audit` shows 0 vulnerabilities
- [ ] `npm run dev` starts successfully
- [ ] Can access `http://localhost:3000`
- [ ] Supabase connection works
- [ ] No console errors in browser
- [ ] Can add content items
- [ ] Tags and folders work
- [ ] SMS/Telegram webhook works

## 🆘 Still Having Issues?

### Complete Reset

If all else fails, start fresh:

```bash
# 1. Backup your .env.local
cp .env.local .env.backup

# 2. Delete everything
rm -rf node_modules package-lock.json .next

# 3. Install fresh
npm install

# 4. Restore env
cp .env.backup .env.local

# 5. Start
npm run dev
```

### Check System Requirements

Ensure you have compatible versions:
- Node.js: **18.18.0 or higher** (check: `node -v`)
- npm: **9.0.0 or higher** (check: `npm -v`)

**Update Node.js if needed:**
- Mac: `brew install node@20`
- Windows: Download from [nodejs.org](https://nodejs.org)
- Linux: `nvm install 20`

### Common Fixes

**"Cannot find module"**:
```bash
rm -rf node_modules package-lock.json
npm install
```

**"Port 3000 already in use"**:
```bash
# Mac/Linux:
lsof -ti:3000 | xargs kill

# Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

**TypeScript errors on build**:
```bash
npx tsc --noEmit
# Fix reported errors
```

## 📚 Additional Resources

- [Next.js 15 Upgrade Guide](https://nextjs.org/docs/app/building-your-application/upgrading/version-15)
- [React 19 Upgrade Guide](https://react.dev/blog/2024/12/05/react-19)
- [Supabase SSR Guide](https://supabase.com/docs/guides/auth/server-side/nextjs)
- [ESLint 9 Migration](https://eslint.org/docs/latest/use/migrate-to-9.0.0)

## 🎉 Success!

After following this guide, you should have:
- ✅ Zero npm warnings
- ✅ Zero security vulnerabilities  
- ✅ Latest stable versions
- ✅ All features working

**Your Second Brain is now secure and up-to-date!** 🧠✨
