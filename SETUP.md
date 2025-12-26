# Razornate Setup Guide

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

## Installation Steps

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Set Up Environment Variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your configuration:
   - `DATABASE_URL` - SQLite database (default: `file:./dev.db`)
   - `NEXTAUTH_URL` - Your app URL (default: `http://localhost:3000`)
   - `NEXTAUTH_SECRET` - Generate a secret key (run: `openssl rand -base64 32`)
   - OAuth credentials (optional): Google, Apple

3. **Set Up Database**
   ```bash
   npx prisma db push
   npx prisma generate
   npm run db:seed
   ```

4. **Create Admin User**
   
   The first user you create will be a CLIENT by default. To create an admin user, you can:
   
   - Use Prisma Studio: `npm run db:studio` and manually change a user's role to ADMIN
   - Or use the database directly to update a user's role

5. **Run Development Server**
   ```bash
   npm run dev
   ```

6. **Open Browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Default Services

The seed script creates these default services:
- Classic Haircut - $35 (30 min)
- Beard Trim - $25 (20 min)
- Haircut & Beard Combo - $55 (45 min)
- Premium Cut - $50 (45 min)
- Custom Service - $65 (60 min)

## Features

### Client Features
- ✅ Sign up & login (email, Google, Apple)
- ✅ Profile management
- ✅ View availability
- ✅ Book appointments
- ✅ Service selection
- ✅ Add notes for barber
- ✅ Booking history
- ✅ Cancel appointments
- ✅ QR code booking page

### Admin Features
- ✅ Admin dashboard
- ✅ Manage services & prices
- ✅ View all appointments
- ✅ Accept/confirm bookings
- ✅ Client management
- ✅ Earnings overview

### Coming Soon
- Working hours management
- Block dates manually
- Appointment reminders (email/push)
- Reviews & ratings
- Portfolio gallery
- Loyalty system
- Promo codes
- Payment integration
- WhatsApp contact
- Social media links

## Production Deployment

1. **Set up a production database** (PostgreSQL recommended)
2. **Update environment variables** for production
3. **Build the application**:
   ```bash
   npm run build
   npm start
   ```
4. **Set up email service** for notifications
5. **Configure OAuth providers** (Google, Apple)
6. **Set up push notifications** (optional)

## Troubleshooting

### Database Issues
- Make sure Prisma is generated: `npx prisma generate`
- Reset database: Delete `prisma/dev.db` and run `npx prisma db push` again

### Authentication Issues
- Check `NEXTAUTH_SECRET` is set
- Verify `NEXTAUTH_URL` matches your app URL

### Type Errors
- Run `npm install` to ensure all dependencies are installed
- Run `npx prisma generate` to regenerate Prisma client

## Support

For issues or questions, check the codebase or create an issue.






