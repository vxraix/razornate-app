# 🚀 Vercel Deployment Guide

Complete guide to deploy Razornate from scratch on Vercel.

## Prerequisites

1. **GitHub Account** - Your code needs to be in a Git repository
2. **Vercel Account** - Sign up at [vercel.com](https://vercel.com)
3. **PostgreSQL Database** - SQLite won't work on Vercel (serverless)

---

## Step 1: Prepare Your Code

### 1.1 Push to GitHub

If your code isn't already in a Git repository:

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit"

# Create a repository on GitHub, then:
git remote add origin https://github.com/yourusername/razornate.git
git push -u origin main
```

### 1.2 Update Prisma Schema for PostgreSQL

The current schema uses SQLite. For Vercel, you need PostgreSQL.

**Update `prisma/schema.prisma`:**

```prisma
datasource db {
  provider = "postgresql"  // Change from "sqlite"
  url      = env("DATABASE_URL")
}
```

---

## Step 2: Set Up PostgreSQL Database

You have two options:

### Option A: Vercel Postgres (Recommended - Easiest)

1. Go to your Vercel dashboard
2. Navigate to **Storage** → **Create Database** → **Postgres**
3. Choose a name and region
4. Click **Create**
5. Vercel will automatically add the `POSTGRES_URL` environment variable

**Note:** Vercel Postgres uses `POSTGRES_URL`, but Prisma expects `DATABASE_URL`. You'll need to set `DATABASE_URL` to the same value as `POSTGRES_URL` in your environment variables.

### Option B: External PostgreSQL (Supabase, Neon, etc.)

#### Using Supabase (Free tier available):

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Go to **Settings** → **Database**
4. Copy the **Connection string** (URI format)
5. Use this as your `DATABASE_URL`

#### Using Neon (Free tier available):

1. Go to [neon.tech](https://neon.tech)
2. Create a new project
3. Copy the connection string
4. Use this as your `DATABASE_URL`

---

## Step 3: Deploy to Vercel

### 3.1 Import Project

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click **Add New** → **Project**
3. Import your GitHub repository
4. Vercel will auto-detect Next.js

### 3.2 Configure Environment Variables

In the Vercel project settings, add these environment variables:

#### Required Variables:

```
DATABASE_URL=postgresql://user:password@host:port/database?sslmode=require
NEXTAUTH_URL=https://your-app.vercel.app
NEXTAUTH_SECRET=your-random-secret-here
```

#### Optional Variables (for OAuth):

```
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
APPLE_CLIENT_ID=your-apple-client-id
APPLE_CLIENT_SECRET=your-apple-client-secret
```

#### Optional Variables (for email):

```
EMAIL_SERVER=smtp://username:password@smtp.example.com:587
EMAIL_FROM=noreply@yourdomain.com
```

#### How to Generate NEXTAUTH_SECRET:

```bash
# On Mac/Linux:
openssl rand -base64 32

# On Windows (PowerShell):
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | ForEach-Object {[char]$_})

# Or use online generator:
https://generate-secret.vercel.app/32
```

### 3.3 Configure Build Settings

Vercel should auto-detect these, but verify:

- **Framework Preset:** Next.js
- **Build Command:** `npm run build` (default)
- **Output Directory:** `.next` (default)
- **Install Command:** `npm install` (default)

### 3.4 Deploy

Click **Deploy**. Vercel will:
1. Install dependencies
2. Build your app
3. Deploy it

**⚠️ First deployment will likely fail** because the database isn't set up yet. That's normal!

---

## Step 4: Set Up Database

After the first deployment, you need to run Prisma migrations.

### 4.1 Install Vercel CLI (if not already installed)

```bash
npm i -g vercel
```

### 4.2 Link Your Project

```bash
vercel link
```

### 4.3 Run Prisma Migrations

You have two options:

#### Option A: Using Vercel CLI (Recommended)

```bash
# Pull environment variables
vercel env pull .env.local

# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# Seed the database
npm run db:seed
```

#### Option B: Using Prisma Studio (Alternative)

```bash
# Pull environment variables
vercel env pull .env.local

# Generate Prisma client
npx prisma generate

# Open Prisma Studio (connects to production DB)
npx prisma studio
```

Then manually create tables or use the SQL editor.

### 4.4 Create Admin User

After seeding, create an admin user:

```bash
# Make sure you have DATABASE_URL in .env.local
npm run create-admin your-email@example.com
```

**Note:** This will create a user in your production database. Make sure `DATABASE_URL` points to production!

---

## Step 5: Configure OAuth Providers (Optional)

### Google OAuth Setup:

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Enable **Google+ API**
4. Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
5. Add authorized redirect URI: `https://your-app.vercel.app/api/auth/callback/google`
6. Copy Client ID and Secret
7. Add to Vercel environment variables

### Apple OAuth Setup:

1. Go to [Apple Developer Portal](https://developer.apple.com)
2. Create an App ID
3. Create a Service ID
4. Configure redirect URLs
5. Add credentials to Vercel environment variables

---

## Step 6: Post-Deployment Checklist

- [ ] Database is set up and migrated
- [ ] Admin user is created
- [ ] Environment variables are configured
- [ ] OAuth providers are set up (if using)
- [ ] Test the app: https://your-app.vercel.app
- [ ] Test authentication
- [ ] Test booking flow
- [ ] Test admin panel

---

## Step 7: Custom Domain (Optional)

1. Go to your Vercel project → **Settings** → **Domains**
2. Add your domain
3. Follow DNS configuration instructions
4. Update `NEXTAUTH_URL` to your custom domain

---

## Troubleshooting

### Build Fails

**Error: "Cannot find module '@prisma/client'"**
- Solution: Add `prisma generate` to your build command or use a build script

**Error: "Database connection failed"**
- Solution: Check `DATABASE_URL` is correct and database is accessible

### Database Issues

**Error: "Table doesn't exist"**
- Solution: Run `npx prisma db push` or create migrations

**Error: "Migration failed"**
- Solution: Check database connection string and permissions

### Authentication Issues

**Error: "NEXTAUTH_SECRET is missing"**
- Solution: Add `NEXTAUTH_SECRET` to Vercel environment variables

**OAuth not working**
- Solution: Check redirect URIs match your Vercel URL exactly

### Runtime Errors

**Error: "Prisma Client not generated"**
- Add a `postinstall` script to `package.json`:
  ```json
  "scripts": {
    "postinstall": "prisma generate"
  }
  ```

---

## Environment Variables Reference

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `DATABASE_URL` | ✅ Yes | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
| `NEXTAUTH_URL` | ✅ Yes | Your app URL | `https://your-app.vercel.app` |
| `NEXTAUTH_SECRET` | ✅ Yes | Secret for NextAuth | Random 32+ character string |
| `GOOGLE_CLIENT_ID` | ❌ No | Google OAuth client ID | From Google Cloud Console |
| `GOOGLE_CLIENT_SECRET` | ❌ No | Google OAuth secret | From Google Cloud Console |
| `APPLE_CLIENT_ID` | ❌ No | Apple OAuth client ID | From Apple Developer |
| `APPLE_CLIENT_SECRET` | ❌ No | Apple OAuth secret | From Apple Developer |
| `EMAIL_SERVER` | ❌ No | SMTP server config | `smtp://user:pass@host:587` |
| `EMAIL_FROM` | ❌ No | Email sender address | `noreply@yourdomain.com` |

---

## Quick Deploy Script

Create a `vercel-deploy.sh` script for easier deployment:

```bash
#!/bin/bash

echo "🚀 Deploying Razornate to Vercel..."

# Pull environment variables
echo "📥 Pulling environment variables..."
vercel env pull .env.local

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate

# Push database schema
echo "🗄️  Pushing database schema..."
npx prisma db push

# Seed database
echo "🌱 Seeding database..."
npm run db:seed

# Deploy
echo "🚀 Deploying to Vercel..."
vercel --prod

echo "✅ Deployment complete!"
```

---

## Next Steps

1. **Monitor your app** - Check Vercel dashboard for logs
2. **Set up analytics** - Add Vercel Analytics
3. **Configure backups** - Set up database backups
4. **Set up monitoring** - Use Vercel's monitoring tools
5. **Optimize performance** - Use Vercel's performance insights

---

## Support

If you encounter issues:
1. Check Vercel deployment logs
2. Check database connection
3. Verify environment variables
4. Check Prisma migrations status

For more help, refer to:
- [Vercel Documentation](https://vercel.com/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Next.js Documentation](https://nextjs.org/docs)

