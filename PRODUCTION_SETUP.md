# Production Setup Guide - Razornate

## 🚀 Quick Start Checklist

### 1. Database Migration
```bash
# Run migration to update Payment model
npx prisma migrate dev --name add_bank_transfer_payment

# Generate Prisma client
npx prisma generate
```

### 2. Environment Variables
Add to your `.env` file:
```env
# Google OAuth (Required for Google login)
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here

# NextAuth
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=generate_with_openssl_rand_base64_32

# Database
DATABASE_URL=your_postgresql_connection_string
```

### 3. Google OAuth Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `https://yourdomain.com/api/auth/callback/google`
6. Copy Client ID and Secret to `.env`

### 4. Configure Bank Settings (Admin)
1. Log in as admin
2. Navigate to `/admin/settings`
3. Enter your bank account details:
   - Bank Name (e.g., Hakrinbank, DSB Bank)
   - Account Number
   - Account Holder Name
4. Save settings

### 5. Create Upload Directory
```bash
mkdir -p public/uploads/payments
chmod 755 public/uploads/payments
```

---

## 📋 Feature Summary

### ✅ Implemented Features

1. **Google OAuth Authentication**
   - Sign up with Google
   - Login with Google
   - Automatic account linking
   - Profile picture storage

2. **Appointment Lifecycle**
   - Status: PENDING → CONFIRMED → COMPLETED → CANCELLED
   - Automatic payment record creation
   - Revenue tracking on completion

3. **Bank Transfer Payment System**
   - Payment instructions display
   - Payment proof upload (images/PDF)
   - Payment verification by admin
   - Status: UNPAID → PENDING_VERIFICATION → PAID

4. **Analytics Dashboard**
   - Total revenue (completed + paid only)
   - Revenue trends (day/week/month)
   - Completed vs cancelled appointments
   - Average revenue per appointment
   - Service popularity metrics

5. **Admin Features**
   - Payment verification page (`/admin/payments`)
   - Bank settings configuration (`/admin/settings`)
   - Enhanced analytics with charts

---

## 🔒 Security Features

- ✅ Role-based access control (ADMIN vs CLIENT)
- ✅ File upload validation (type & size)
- ✅ Secure payment verification (admin-only)
- ✅ Revenue calculation protection (no duplicates)
- ✅ OAuth security best practices

---

## 📊 Revenue Calculation Logic

Revenue is **ONLY** counted when:
1. Appointment status = `COMPLETED`
2. Payment status = `PAID`

This ensures:
- No revenue for cancelled appointments
- No revenue for unpaid appointments
- No duplicate counting
- Accurate financial reporting

---

## 🎯 User Flows

### Customer Booking Flow
1. Customer books appointment → Payment record created (UNPAID)
2. Customer sees payment instructions with bank details
3. Customer makes bank transfer
4. Customer uploads payment proof → Status: PENDING_VERIFICATION
5. Admin verifies payment → Status: PAID
6. Barber marks appointment complete → Revenue counted

### Admin Verification Flow
1. Admin navigates to `/admin/payments`
2. Sees list of pending payments
3. Views payment proof (image/PDF)
4. Verifies payment → Status: PAID
5. Revenue automatically counted in analytics

---

## 📁 New Files Created

### API Routes
- `app/api/payments/[id]/route.ts` - Payment CRUD
- `app/api/payments/upload/route.ts` - File upload
- `app/api/settings/bank/route.ts` - Bank settings

### Components
- `components/payment-instructions.tsx` - Payment UI

### Pages
- `app/admin/payments/page.tsx` - Payment verification
- `app/admin/settings/page.tsx` - Bank settings

### Documentation
- `IMPLEMENTATION_GUIDE.md` - Detailed implementation guide
- `PRODUCTION_SETUP.md` - This file

---

## 🐛 Troubleshooting

### Google OAuth not working
- Check environment variables are set
- Verify redirect URI matches exactly
- Check Google Cloud Console credentials

### Payment upload fails
- Check `public/uploads/payments` directory exists
- Verify directory permissions (755)
- Check file size (max 5MB)

### Revenue not showing
- Verify appointment is COMPLETED
- Verify payment is PAID
- Check analytics date range

### Payment proof not displaying
- Check file was uploaded successfully
- Verify file path is correct
- Check file permissions

---

## 📞 Support

For production issues:
1. Check server logs
2. Verify database migrations
3. Check environment variables
4. Review error messages in browser console

---

**Ready for Production!** 🎉

