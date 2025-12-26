# 🧪 Razornate - Complete Testing Checklist

Use this checklist to ensure your webapp is 100% working. Test each item systematically.

---

## 🔐 **1. AUTHENTICATION & USER MANAGEMENT**

### Sign Up
- [ ] **Can create new account** with email/password
  - [ ] Form validation works (required fields)
  - [ ] Error shown if email already exists
  - [ ] Success message appears after signup
  - [ ] User is automatically signed in after signup
  - [ ] User is redirected to dashboard after signup

### Sign In
- [ ] **Can sign in with existing account**
  - [ ] Valid credentials work
  - [ ] Invalid email shows error
  - [ ] Invalid password shows error
  - [ ] **Cannot sign in without account** (must sign up first) ✅
  - [ ] Success message appears
  - [ ] Redirects to dashboard after sign in

### Sign Out
- [ ] **Can sign out**
  - [ ] Sign out button works
  - [ ] Session is cleared
  - [ ] Redirected to homepage
  - [ ] Sign in button appears after sign out

### OAuth (Optional - if configured)
- [ ] Google sign in works (if credentials set)
- [ ] Apple sign in works (if credentials set)

### UI Visibility
- [ ] **Sign in button hidden when signed in** ✅
- [ ] Sign in button shows when signed out
- [ ] Navbar shows correct buttons based on auth state
- [ ] Dashboard link only shows when signed in

---

## 👤 **2. CLIENT FEATURES**

### Homepage
- [ ] **Homepage loads correctly**
  - [ ] All sections visible (hero, features, CTA, footer)
  - [ ] Animations work smoothly
  - [ ] Links work (Book, Portfolio, Sign In)
  - [ ] Responsive on mobile/tablet/desktop
  - [ ] Sign in button conditionally shows/hides

### Booking Page (`/book`)
- [ ] **Service selection works**
  - [ ] All services are displayed
  - [ ] Service details show (name, price, duration)
  - [ ] Can select a service

- [ ] **Date/Time selection works**
  - [ ] Calendar shows available dates
  - [ ] Blocked dates are not selectable
  - [ ] Time slots show correctly
  - [ ] Booked slots are disabled
  - [ ] Can select date and time

- [ ] **Booking submission works**
  - [ ] Can add notes for barber
  - [ ] Form validation works
  - [ ] Booking is created successfully
  - [ ] Success message appears
  - [ ] Redirects to dashboard
  - [ ] New appointment appears in dashboard

### Dashboard (`/dashboard`)
- [ ] **Dashboard loads correctly**
  - [ ] Shows user's appointments
  - [ ] Upcoming appointments shown first
  - [ ] Past appointments shown separately
  - [ ] Appointment details are correct (date, time, service, status)

- [ ] **Appointment actions work**
  - [ ] Can cancel appointments
  - [ ] Cancellation confirmation works
  - [ ] Can reschedule appointments
  - [ ] Rescheduling shows available slots
  - [ ] Can add reviews for completed appointments
  - [ ] Review submission works (rating + comment)

- [ ] **Additional features**
  - [ ] Messaging works (if implemented)
  - [ ] Photo gallery works (if implemented)
  - [ ] Referral program visible (if implemented)
  - [ ] Push notification setup works (if implemented)

### Profile Page (`/profile`)
- [ ] **Profile page loads**
  - [ ] Shows user information
  - [ ] Can edit name, phone, email
  - [ ] Profile updates save correctly
  - [ ] Success message on update

### Portfolio Page (`/portfolio`)
- [ ] **Portfolio page loads**
  - [ ] Images display correctly
  - [ ] Gallery navigation works
  - [ ] Responsive layout

### QR Code Page (`/qr`)
- [ ] **QR code page loads**
  - [ ] QR code generates correctly
  - [ ] Can be scanned
  - [ ] Links to booking page

---

## 👨‍💼 **3. ADMIN FEATURES**

### Admin Dashboard (`/admin`)
- [ ] **Admin access works**
  - [ ] Only ADMIN role can access
  - [ ] CLIENT role cannot access (redirects or shows error)
  - [ ] Dashboard shows statistics
  - [ ] Stats are accurate (total appointments, revenue, etc.)

### Service Management
- [ ] **Can view all services**
  - [ ] Services list displays correctly
  - [ ] Service details shown (name, price, duration, active status)

- [ ] **Can create new service**
  - [ ] Create form works
  - [ ] Validation works
  - [ ] New service appears in list
  - [ ] New service available for booking

- [ ] **Can edit service**
  - [ ] Edit form pre-fills with current data
  - [ ] Can update name, price, duration
  - [ ] Changes save correctly
  - [ ] Updated service shows in list

- [ ] **Can delete service**
  - [ ] Delete confirmation works
  - [ ] Service is removed
  - [ ] Service no longer available for booking

- [ ] **Can activate/deactivate service**
  - [ ] Toggle works
  - [ ] Inactive services don't show in booking

### Appointment Management
- [ ] **Can view all appointments**
  - [ ] All appointments listed
  - [ ] Filtering works (by status, date)
  - [ ] Appointment details shown correctly

- [ ] **Can confirm appointments**
  - [ ] Confirm button works
  - [ ] Status changes to CONFIRMED
  - [ ] Client sees updated status

- [ ] **Can cancel appointments**
  - [ ] Cancel button works
  - [ ] Status changes to CANCELLED
  - [ ] Time slot becomes available again

- [ ] **Can view appointment details**
  - [ ] Client information shown
  - [ ] Service details shown
  - [ ] Notes visible
  - [ ] Can add barber notes

### Client Management (`/admin/clients`)
- [ ] **Can view all clients**
  - [ ] Client list displays
  - [ ] Client details shown (name, email, phone)
  - [ ] Can view client's appointment history
  - [ ] Can view client preferences

- [ ] **Can manage clients**
  - [ ] Can view client profile
  - [ ] Can add notes about client
  - [ ] Can see client's total bookings

### Analytics (`/admin/analytics`)
- [ ] **Analytics page loads**
  - [ ] Charts display correctly
  - [ ] Revenue trends chart works
  - [ ] Service popularity chart works
  - [ ] Appointments over time chart works
  - [ ] Date range filtering works
  - [ ] Metrics are accurate

### Schedule (`/admin/schedule`)
- [ ] **Schedule view works**
  - [ ] Calendar displays appointments
  - [ ] Can see all appointments on calendar
  - [ ] Can click appointments for details

### Working Hours (`/admin/working-hours`)
- [ ] **Can manage working hours**
  - [ ] Can set hours for each day
  - [ ] Can mark days as closed
  - [ ] Changes save correctly
  - [ ] Booking respects working hours

### Block Dates (`/admin/block-dates`)
- [ ] **Can block dates**
  - [ ] Can add blocked dates
  - [ ] Can add reason for blocking
  - [ ] Blocked dates don't show in booking
  - [ ] Can remove blocked dates

### Export Data (`/admin/export`)
- [ ] **Can export data**
  - [ ] CSV export works
  - [ ] JSON export works
  - [ ] Date range filtering works
  - [ ] Exported data is correct

---

## ⭐ **4. PREMIUM FEATURES**

### Reviews & Ratings
- [ ] **Can leave review**
  - [ ] Review modal opens for completed appointments
  - [ ] Can select rating (1-5 stars)
  - [ ] Can add comment
  - [ ] Review submits successfully
  - [ ] Review appears in dashboard

### Rescheduling
- [ ] **Can reschedule appointment**
  - [ ] Reschedule modal opens
  - [ ] Shows available time slots
  - [ ] Can select new date/time
  - [ ] Rescheduling saves correctly
  - [ ] Original date is tracked
  - [ ] Old time slot becomes available

### Messaging
- [ ] **In-app messaging works**
  - [ ] Can send messages
  - [ ] Messages appear in real-time
  - [ ] Can view message history
  - [ ] Read status works
  - [ ] Messages linked to appointments

### Photo Gallery
- [ ] **Photo upload works**
  - [ ] Can upload before/after photos
  - [ ] Photos display in gallery
  - [ ] Can add captions
  - [ ] Photos linked to appointments

### Referral Program
- [ ] **Referral system works**
  - [ ] User has unique referral code
  - [ ] Can share referral code
  - [ ] Can refer by email
  - [ ] Referral status tracking works
  - [ ] Loyalty points awarded correctly

### Waitlist
- [ ] **Waitlist works**
  - [ ] Can join waitlist for full slots
  - [ ] Can set preferred date/time
  - [ ] Admin can view waitlist
  - [ ] Admin can manage waitlist entries

### Push Notifications
- [ ] **Push notifications work**
  - [ ] Can enable notifications
  - [ ] Browser permission prompt works
  - [ ] Notifications are received
  - [ ] Notification click works

### Aftercare Notes
- [ ] **Aftercare notes work**
  - [ ] Admin can add aftercare notes
  - [ ] Notes display for clients
  - [ ] Notes linked to appointments

---

## 🎨 **5. UI/UX & RESPONSIVENESS**

### Navigation
- [ ] **Navbar works correctly**
  - [ ] All links work
  - [ ] Responsive menu (mobile)
  - [ ] Sign in/out buttons show correctly
  - [ ] Admin link only shows for admins
  - [ ] Dashboard link only shows when signed in

### Responsive Design
- [ ] **Mobile view works**
  - [ ] All pages responsive on mobile
  - [ ] Forms work on mobile
  - [ ] Buttons are tappable
  - [ ] Text is readable
  - [ ] No horizontal scrolling

- [ ] **Tablet view works**
  - [ ] Layout adapts correctly
  - [ ] All features accessible

- [ ] **Desktop view works**
  - [ ] Layout uses space well
  - [ ] All features accessible

### Animations & Interactions
- [ ] **Animations work smoothly**
  - [ ] Page transitions
  - [ ] Button hover effects
  - [ ] Loading states
  - [ ] No janky animations

### Error Handling
- [ ] **Error messages work**
  - [ ] Form validation errors show
  - [ ] API errors show toast messages
  - [ ] 404 page works
  - [ ] Network errors handled gracefully

### Loading States
- [ ] **Loading indicators work**
  - [ ] Loading spinners show during API calls
  - [ ] Buttons disabled during submission
  - [ ] No double submissions

---

## 🔒 **6. SECURITY & VALIDATION**

### Authentication Security
- [ ] **Cannot access protected routes without auth**
  - [ ] Dashboard redirects if not signed in
  - [ ] Admin pages redirect if not admin
  - [ ] API routes protected

### Data Validation
- [ ] **Form validation works**
  - [ ] Required fields enforced
  - [ ] Email format validated
  - [ ] Phone format validated (if applicable)
  - [ ] Date/time validation works

### Authorization
- [ ] **Users can only see their own data**
  - [ ] Cannot access other users' appointments
  - [ ] Cannot modify other users' data
  - [ ] Admin can see all data

---

## 🗄️ **7. DATABASE & DATA INTEGRITY**

### Data Persistence
- [ ] **Data saves correctly**
  - [ ] Appointments persist after refresh
  - [ ] User data persists
  - [ ] Service changes persist
  - [ ] Profile updates persist

### Data Relationships
- [ ] **Relationships work correctly**
  - [ ] Appointments linked to users
  - [ ] Appointments linked to services
  - [ ] Reviews linked to appointments
  - [ ] Messages linked to appointments

### Data Consistency
- [ ] **No orphaned data**
  - [ ] Deleting user doesn't break appointments
  - [ ] Deleting service handles appointments correctly
  - [ ] Status changes are consistent

---

## 🚀 **8. PERFORMANCE**

### Page Load Times
- [ ] **Pages load quickly**
  - [ ] Homepage loads < 2 seconds
  - [ ] Dashboard loads < 2 seconds
  - [ ] Admin pages load < 2 seconds

### API Response Times
- [ ] **API calls are fast**
  - [ ] Booking submission < 1 second
  - [ ] Data fetching < 1 second
  - [ ] No unnecessary API calls

### Optimization
- [ ] **No console errors**
  - [ ] Check browser console
  - [ ] No React warnings
  - [ ] No network errors

---

## 📱 **9. CROSS-BROWSER TESTING**

Test in multiple browsers:
- [ ] **Chrome** - All features work
- [ ] **Firefox** - All features work
- [ ] **Safari** - All features work
- [ ] **Edge** - All features work
- [ ] **Mobile browsers** - All features work

---

## ✅ **10. FINAL CHECKS**

### Critical Paths
- [ ] **Complete user journey works**
  1. Sign up → Book appointment → View in dashboard → Cancel appointment
  2. Sign in → Book appointment → Reschedule → Leave review
  3. Admin: View appointments → Confirm → View analytics

### Edge Cases
- [ ] **Edge cases handled**
  - [ ] Booking same slot twice (should fail)
  - [ ] Booking in past (should fail)
  - [ ] Empty states show correctly
  - [ ] No appointments message shows
  - [ ] No services message shows

### Documentation
- [ ] **Code is clean**
  - [ ] No commented-out code
  - [ ] No console.logs in production
  - [ ] Error handling is proper

---

## 🎯 **PRIORITY TESTING ORDER**

1. **Critical (Must Work)**
   - Authentication (sign up, sign in, sign out)
   - Booking appointments
   - Viewing appointments
   - Admin service management
   - Admin appointment management

2. **Important (Should Work)**
   - Rescheduling
   - Canceling appointments
   - Reviews
   - Profile management
   - Analytics

3. **Nice to Have**
   - Messaging
   - Photo gallery
   - Referrals
   - Push notifications

---

## 📝 **TESTING NOTES**

- Test with **multiple user accounts** (client + admin)
- Test with **different browsers**
- Test on **mobile devices**
- Test **error scenarios** (network failures, invalid data)
- Test **edge cases** (empty states, maximum data)
- **Check browser console** for errors
- **Check network tab** for failed requests

---

## 🐛 **IF YOU FIND BUGS**

Document them with:
- What you were doing
- What you expected
- What actually happened
- Browser/device info
- Screenshots if possible

---

**Good luck testing! 🚀**

