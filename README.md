# Razornate - Premium Barber Booking App

A luxury, professional barber booking application built with Next.js, TypeScript, and Tailwind CSS.

## Features

### Client Features
- User authentication (Email, Google, Apple)
- Profile management
- Real-time availability viewing
- Appointment booking with service selection
- Booking history
- Appointment cancellation/rescheduling
- In-app notes for barber
- Reviews & ratings
- Portfolio gallery

### Admin Features
- Admin dashboard
- Service & pricing management
- Working hours & availability management
- Booking management
- Client management
- Earnings & analytics
- Manual booking creation

### Premium Features
- QR code booking
- Loyalty system
- Promo codes
- Social media integration
- WhatsApp contact
- Push notifications
- Email notifications

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Authentication**: NextAuth.js
- **Database**: Prisma + PostgreSQL/SQLite
- **Animations**: Framer Motion
- **UI Components**: Radix UI + Custom Components

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
```

3. Set up the database:
```bash
npx prisma migrate dev
npx prisma generate
```

4. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Environment Variables

- `DATABASE_URL` - Database connection string
- `NEXTAUTH_URL` - Your app URL
- `NEXTAUTH_SECRET` - Secret for NextAuth
- `GOOGLE_CLIENT_ID` - Google OAuth client ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth client secret
- `APPLE_CLIENT_ID` - Apple OAuth client ID
- `APPLE_CLIENT_SECRET` - Apple OAuth client secret
- `EMAIL_SERVER` - Email server configuration
- `EMAIL_FROM` - Email sender address

## License

Private - Razornate






