# 🚀 Quick Start Guide

Follow these steps to get Razornate running:

## Step 1: Install Dependencies
```bash
npm install
```

## Step 2: Set Up Environment Variables
```bash
# Copy the example file
copy .env.example .env
```

Then edit `.env` and set `NEXTAUTH_SECRET`:
- Generate a secret: `openssl rand -base64 32` (or use any random string)
- Or use this online generator: https://generate-secret.vercel.app/32

## Step 3: Set Up Database
```bash
# Create database tables
npx prisma db push

# Generate Prisma client
npx prisma generate

# Seed with default services
npm run db:seed
```

## Step 4: Create Admin User
```bash
npm run create-admin your-email@example.com
```

## Step 5: Start the App
```bash
npm run dev
```

## Step 6: Open in Browser
Navigate to: **http://localhost:3000**

---

## 🎯 What to Do Next

1. **Sign up** with your email (or use the admin email you created)
2. **Book an appointment** to test the booking flow
3. **Access admin panel** at `/admin` (if you're logged in as admin)
4. **Customize services** in the admin panel

## 🔧 Troubleshooting

**"Cannot find module" errors?**
- Run `npm install` again
- Make sure you're in the project directory

**Database errors?**
- Run `npx prisma generate`
- Delete `prisma/dev.db` and run `npx prisma db push` again

**Port 3000 already in use?**
- Change port: `npm run dev -- -p 3001`
- Or kill the process using port 3000

## 📱 Test the App

1. **Homepage**: See the landing page
2. **Sign Up**: Create a new account
3. **Book**: Try booking an appointment
4. **Dashboard**: View your bookings
5. **Admin**: Manage services and appointments (if admin)

---

**Need help?** Check `SETUP.md` for detailed documentation.






