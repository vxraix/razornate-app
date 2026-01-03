# 📧 WhatsApp & Email Notifications Setup Guide

This guide will help you set up email and WhatsApp notifications for your Razornate application.

## Overview

The notification system supports:
- ✅ **Email notifications** via Resend
- ✅ **WhatsApp notifications** via Twilio
- ✅ Automatic appointment confirmations
- ✅ Appointment reminders (ready for cron job integration)
- ✅ Communication logging in database

## Prerequisites

- Node.js 18+ installed
- Active accounts with:
  - [Resend](https://resend.com) (for email)
  - [Twilio](https://www.twilio.com) (for WhatsApp)

---

## 📧 Email Setup (Resend)

### Step 1: Create Resend Account

1. Go to [https://resend.com](https://resend.com)
2. Sign up for a free account
3. Verify your email address

### Step 2: Get API Key

1. Navigate to **API Keys** in your Resend dashboard
2. Click **Create API Key**
3. Give it a name (e.g., "Razornate Production")
4. Copy the API key (starts with `re_`)

### Step 3: Verify Domain (Production Only)

For production, you'll need to verify your domain:

1. Go to **Domains** in Resend dashboard
2. Click **Add Domain**
3. Add your domain (e.g., `razornate.com`)
4. Add the DNS records provided by Resend to your domain's DNS settings
5. Wait for verification (usually takes a few minutes)

**Note:** For development/testing, you can use Resend's default sender email without domain verification.

### Step 4: Configure Environment Variables

Add these to your `.env` file:

```env
# Resend Email Configuration
RESEND_API_KEY=re_your_api_key_here
FROM_EMAIL=noreply@yourdomain.com  # Or use verified domain email
FROM_NAME=Razornate
```

**Development Example:**
```env
RESEND_API_KEY=re_1234567890abcdef
FROM_EMAIL=onboarding@resend.dev  # Resend's test domain
FROM_NAME=Razornate
```

---

## 💬 WhatsApp Setup (Twilio)

### Step 1: Create Twilio Account

1. Go to [https://www.twilio.com](https://www.twilio.com)
2. Sign up for a free account
3. Verify your phone number and email

### Step 2: Get Account Credentials

1. Go to **Console Dashboard**
2. Find your **Account SID** and **Auth Token**
3. Copy both values

### Step 3: Set Up WhatsApp Sandbox (Testing)

For testing, Twilio provides a WhatsApp sandbox:

1. Go to **Messaging** → **Try it out** → **Send a WhatsApp message**
2. Follow the instructions to join the sandbox
3. Send the join code to the Twilio WhatsApp number (usually `+14155238886`)
4. Once joined, you can send messages to any number that has joined the sandbox

**Sandbox Number:** `whatsapp:+14155238886` (default, can be changed)

### Step 4: Request WhatsApp Business API (Production)

For production use:

1. Go to **Messaging** → **Settings** → **WhatsApp Senders**
2. Click **Request WhatsApp Sender**
3. Fill out the form with your business details
4. Wait for approval (usually 24-48 hours)
5. Once approved, you'll get a WhatsApp Business number

### Step 5: Configure Environment Variables

Add these to your `.env` file:

```env
# Twilio WhatsApp Configuration
TWILIO_ACCOUNT_SID=your_account_sid_here
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886  # Sandbox number (change for production)
```

**Example:**
```env
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
```

---

## 🔧 Complete Environment Variables

Here's a complete `.env` example with all notification settings:

```env
# Database
DATABASE_URL="your_database_url"

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_secret_here

# Email (Resend)
RESEND_API_KEY=re_your_api_key_here
FROM_EMAIL=noreply@yourdomain.com
FROM_NAME=Razornate

# WhatsApp (Twilio)
TWILIO_ACCOUNT_SID=your_account_sid_here
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886

# Push Notifications (existing)
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_vapid_public_key
VAPID_PRIVATE_KEY=your_vapid_private_key
```

---

## 🧪 Testing Notifications

### Test Email Notifications

1. Create a test appointment in your app
2. Check the user's email inbox
3. Check the Resend dashboard for delivery status

### Test WhatsApp Notifications

1. Make sure the recipient phone number has joined the Twilio WhatsApp sandbox
2. Create a test appointment with a user that has a phone number
3. Check WhatsApp for the message
4. Check Twilio console for message logs

### Check Communication Logs

All notifications are logged in the database. You can view them via:

```sql
SELECT * FROM communication_logs ORDER BY createdAt DESC;
```

Or use Prisma Studio:
```bash
npm run db:studio
```

---

## 📱 Phone Number Format

The system automatically formats phone numbers for WhatsApp. Supported formats:

- `+5978814672` (with country code)
- `5978814672` (country code without +)
- `8814672` (local number - will add default country code)

**Note:** Adjust the country code logic in `lib/notifications.ts` if needed for your region.

---

## 🚀 Production Deployment

### Vercel Deployment

1. Add all environment variables in Vercel dashboard:
   - Go to **Settings** → **Environment Variables**
   - Add each variable for **Production**, **Preview**, and **Development**

2. For Resend:
   - Use a verified domain email address
   - Ensure domain DNS records are properly configured

3. For Twilio:
   - Use your approved WhatsApp Business number
   - Update `TWILIO_WHATSAPP_NUMBER` to your production number

### Other Platforms

Add the same environment variables to your hosting platform's configuration.

---

## 📅 Setting Up Appointment Reminders

The notification system includes reminder functions that can be integrated with a cron job:

### Option 1: Vercel Cron Jobs

Create `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/send-reminders",
      "schedule": "0 18 * * *"
    }
  ]
}
```

Create `app/api/cron/send-reminders/route.ts`:

```typescript
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendAppointmentReminderEmail, sendAppointmentReminderWhatsApp } from '@/lib/notifications'
import { format } from 'date-fns'
import { addDays, startOfDay, endOfDay } from 'date-fns'

export async function GET(request: Request) {
  // Verify cron secret (add to env: CRON_SECRET)
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Get appointments for tomorrow
    const tomorrow = addDays(new Date(), 1)
    const start = startOfDay(tomorrow)
    const end = endOfDay(tomorrow)

    const appointments = await prisma.appointment.findMany({
      where: {
        date: {
          gte: start,
          lte: end,
        },
        status: {
          in: ['PENDING', 'CONFIRMED'],
        },
        reminderSent: false,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        service: true,
      },
    })

    const results = []

    for (const appointment of appointments) {
      const notificationData = {
        appointmentId: appointment.id,
        userName: appointment.user.name || 'Valued Customer',
        userEmail: appointment.user.email,
        userPhone: appointment.user.phone,
        serviceName: appointment.service.name,
        appointmentDate: appointment.date,
        appointmentTime: format(appointment.date, 'h:mm a'),
        notes: appointment.notes,
        amount: null,
        paymentReference: null,
      }

      // Send email reminder
      if (appointment.user.email) {
        await sendAppointmentReminderEmail(notificationData, appointment.user.id)
      }

      // Send WhatsApp reminder
      if (appointment.user.phone) {
        await sendAppointmentReminderWhatsApp(notificationData, appointment.user.id)
      }

      // Mark reminder as sent
      await prisma.appointment.update({
        where: { id: appointment.id },
        data: {
          reminderSent: true,
          reminderSentAt: new Date(),
        },
      })

      results.push({ appointmentId: appointment.id, sent: true })
    }

    return NextResponse.json({
      success: true,
      remindersSent: results.length,
      appointments: results,
    })
  } catch (error: any) {
    console.error('Error sending reminders:', error)
    return NextResponse.json(
      { error: 'Failed to send reminders' },
      { status: 500 }
    )
  }
}
```

### Option 2: External Cron Service

Use services like:
- [Cron-job.org](https://cron-job.org)
- [EasyCron](https://www.easycron.com)
- [GitHub Actions](https://github.com/features/actions)

Point them to your `/api/cron/send-reminders` endpoint.

---

## 🐛 Troubleshooting

### Email Not Sending

1. **Check Resend API Key:**
   - Verify `RESEND_API_KEY` is set correctly
   - Check Resend dashboard for API key status

2. **Check Domain Verification:**
   - For production, ensure domain is verified
   - For development, use `onboarding@resend.dev`

3. **Check Email Address:**
   - Ensure user has a valid email in database
   - Check spam folder

4. **Check Logs:**
   - Check server console for errors
   - Check Resend dashboard for delivery status

### WhatsApp Not Sending

1. **Check Twilio Credentials:**
   - Verify `TWILIO_ACCOUNT_SID` and `TWILIO_AUTH_TOKEN` are correct
   - Check Twilio console for account status

2. **Check Sandbox:**
   - Ensure recipient has joined WhatsApp sandbox (for testing)
   - Send join code to Twilio WhatsApp number

3. **Check Phone Number:**
   - Ensure user has phone number in database
   - Verify phone number format is correct

4. **Check Twilio Console:**
   - View message logs in Twilio dashboard
   - Check for error messages

### Notifications Not Logged

- Check database connection
- Verify `CommunicationLog` table exists
- Check Prisma schema is up to date

---

## 📚 API Reference

### Functions Available

```typescript
// Send email
sendEmail({ to, subject, html, text })

// Send WhatsApp
sendWhatsApp({ to, message })

// Send appointment confirmation email
sendAppointmentConfirmationEmail(data, userId)

// Send appointment reminder email
sendAppointmentReminderEmail(data, userId)

// Send appointment confirmation WhatsApp
sendAppointmentConfirmationWhatsApp(data, userId)

// Send appointment reminder WhatsApp
sendAppointmentReminderWhatsApp(data, userId)

// Send both email and WhatsApp
sendAppointmentNotifications(data, userId, types)
```

### Usage Example

```typescript
import { sendAppointmentNotifications } from '@/lib/notifications'

await sendAppointmentNotifications(
  {
    appointmentId: 'apt_123',
    userName: 'John Doe',
    userEmail: 'john@example.com',
    userPhone: '+5978814672',
    serviceName: 'Haircut',
    appointmentDate: new Date(),
    appointmentTime: '2:00 PM',
    notes: 'Short on sides',
    amount: 35.00,
    paymentReference: 'APT-123456',
  },
  'user_id_here',
  ['email', 'whatsapp'] // or just ['email'] or ['whatsapp']
)
```

---

## 💰 Pricing

### Resend (Email)
- **Free Tier:** 3,000 emails/month
- **Pro:** $20/month for 50,000 emails
- [View Pricing](https://resend.com/pricing)

### Twilio (WhatsApp)
- **Sandbox:** Free for testing
- **Production:** ~$0.005 per message (varies by country)
- [View Pricing](https://www.twilio.com/pricing)

---

## ✅ Checklist

- [ ] Resend account created and API key obtained
- [ ] Email environment variables added to `.env`
- [ ] Twilio account created and credentials obtained
- [ ] WhatsApp sandbox joined (for testing)
- [ ] WhatsApp environment variables added to `.env`
- [ ] Test email notification sent successfully
- [ ] Test WhatsApp notification sent successfully
- [ ] Communication logs working in database
- [ ] Production domain verified (if applicable)
- [ ] Production WhatsApp Business number approved (if applicable)
- [ ] Cron job set up for reminders (optional)

---

## 🆘 Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review service provider dashboards (Resend/Twilio)
3. Check server logs for error messages
4. Verify all environment variables are set correctly

---

**Happy Notifying! 🎉**

