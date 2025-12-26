# ⚡ Vercel Quick Start Checklist

## Pre-Deployment

- [ ] Code is pushed to GitHub
- [ ] Prisma schema updated to PostgreSQL (change `provider = "sqlite"` to `provider = "postgresql"` in `prisma/schema.prisma`)

## Step 1: Database Setup

- [ ] Create PostgreSQL database (Vercel Postgres, Supabase, or Neon)
- [ ] Copy database connection string

## Step 2: Deploy to Vercel

- [ ] Import project from GitHub on Vercel
- [ ] Add environment variables:
  - [ ] `DATABASE_URL` = PostgreSQL connection string
  - [ ] `NEXTAUTH_URL` = `https://your-app.vercel.app`
  - [ ] `NEXTAUTH_SECRET` = Generated secret (32+ chars)
  - [ ] Optional: OAuth credentials (Google/Apple)
- [ ] Deploy (first deploy will fail - that's OK!)

## Step 3: Database Setup

```bash
# Install Vercel CLI
npm i -g vercel

# Link project
vercel link

# Pull environment variables
vercel env pull .env.local

# Generate Prisma client
npx prisma generate

# Push database schema
npx prisma db push

# Seed database
npm run db:seed

# Create admin user
npm run create-admin your-email@example.com
```

## Step 4: Verify

- [ ] Visit your app: `https://your-app.vercel.app`
- [ ] Test sign up/login
- [ ] Test booking flow
- [ ] Test admin panel (if admin user created)

## Common Issues

**Build fails?**
- Check `DATABASE_URL` is set correctly
- Ensure Prisma schema uses `postgresql` not `sqlite`

**Database connection fails?**
- Verify connection string format
- Check database is accessible (not blocked by firewall)
- Ensure SSL is enabled in connection string

**Can't login?**
- Check `NEXTAUTH_SECRET` is set
- Verify `NEXTAUTH_URL` matches your Vercel URL

---

📖 **Full guide:** See `VERCEL_DEPLOYMENT.md` for detailed instructions.

