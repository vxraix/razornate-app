# 🚀 Production Deployment Checklist

## ⚠️ CRITICAL: Before Pushing to Production

### 1. **Database Configuration** ⚠️ REQUIRED
**Current Status:** Using SQLite (`file:./dev.db`) - **NOT production-ready!**

**Action Required:**
- [ ] Change Prisma schema to PostgreSQL
- [ ] Set up PostgreSQL database (Vercel Postgres, Supabase, or Neon)
- [ ] Update `DATABASE_URL` environment variable

**Steps:**
1. Update `prisma/schema.prisma`:
   ```prisma
   datasource db {
     provider = "postgresql"  // Change from "sqlite"
     url      = env("DATABASE_URL")
   }
   ```

2. Set up PostgreSQL database:
   - **Vercel Postgres** (easiest if deploying to Vercel)
   - **Supabase** (free tier available)
   - **Neon** (free tier available)

3. Run migrations:
   ```bash
   npx prisma migrate dev --name init
   npx prisma generate
   ```

### 2. **Environment Variables** ⚠️ REQUIRED

Set these in your hosting platform (Vercel, etc.):

**Required:**
- [ ] `DATABASE_URL` - PostgreSQL connection string
- [ ] `NEXTAUTH_URL` - Your production URL (e.g., `https://your-app.vercel.app`)
- [ ] `NEXTAUTH_SECRET` - Generate with: `openssl rand -base64 32`

**Optional (but recommended):**
- [ ] `GOOGLE_CLIENT_ID` - For Google OAuth
- [ ] `GOOGLE_CLIENT_SECRET` - For Google OAuth
- [ ] `APPLE_CLIENT_ID` - For Apple OAuth
- [ ] `APPLE_CLIENT_SECRET` - For Apple OAuth
- [ ] `NEXT_PUBLIC_VAPID_PUBLIC_KEY` - For push notifications
- [ ] `VAPID_PRIVATE_KEY` - For push notifications

### 3. **Build Verification** ✅ DONE
- [x] Build completes without errors
- [x] All warnings fixed
- [x] No TypeScript errors

### 4. **Code Quality** ✅ VERIFIED
- [x] No hardcoded localhost URLs
- [x] No hardcoded credentials
- [x] All environment variables use `process.env`

### 5. **Security Checklist**
- [ ] `NEXTAUTH_SECRET` is set and secure (32+ characters)
- [ ] Database credentials are secure
- [ ] OAuth redirect URIs match production URL
- [ ] `.env` file is in `.gitignore` (should not be committed)

### 6. **Post-Deployment Steps**
- [ ] Run database migrations in production
- [ ] Seed initial data (services, working hours)
- [ ] Create admin user in production database
- [ ] Test authentication flow
- [ ] Test booking flow
- [ ] Verify environment variables are set correctly

---

## 🚨 **DO NOT DEPLOY YET IF:**
- ❌ Still using SQLite database
- ❌ `NEXTAUTH_SECRET` is not set
- ❌ `NEXTAUTH_URL` points to localhost
- ❌ `DATABASE_URL` points to `file:./dev.db`

---

## ✅ **SAFE TO DEPLOY WHEN:**
- ✅ Prisma schema uses PostgreSQL
- ✅ PostgreSQL database is set up
- ✅ All environment variables are configured
- ✅ Build passes without errors
- ✅ You've tested locally with production-like settings

---

## 📝 Quick Production Setup Commands

```bash
# 1. Update schema to PostgreSQL
# Edit prisma/schema.prisma: change provider to "postgresql"

# 2. Generate Prisma client
npx prisma generate

# 3. Create migration
npx prisma migrate dev --name init

# 4. Seed database (optional)
npm run db:seed

# 5. Create admin user
npm run create-admin your-email@example.com
```

---

## 🔗 Helpful Resources

- **Vercel Deployment Guide:** See `VERCEL_DEPLOYMENT.md`
- **Quick Start:** See `VERCEL_QUICK_START.md`
- **Database Setup:** See `VERCEL_DEPLOYMENT.md` Step 2

