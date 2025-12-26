# 🔑 How to Access Barber/Admin View

## Step 1: Make Sure You Have an Admin Account

We already created an admin account during setup:
- **Email**: `admin@razornate.com`
- **Password**: Any password (for demo purposes)

If you need to create a new admin account or convert an existing user:

```bash
npm run create-admin your-email@example.com
```

## Step 2: Sign In

1. Go to: **http://localhost:3000**
2. Click **"Sign In"** in the top right
3. Enter your admin email: `admin@razornate.com`
4. Enter any password (for demo)
5. Click **"Sign In"**

## Step 3: Access Admin Dashboard

Once logged in as admin, you'll see an **"Admin"** link in the navigation bar.

### Direct URLs:

- **Main Admin Dashboard**: http://localhost:3000/admin
- **Today's Schedule**: http://localhost:3000/admin/schedule
- **Client Database**: http://localhost:3000/admin/clients
- **Working Hours**: http://localhost:3000/admin/working-hours
- **Block Dates**: http://localhost:3000/admin/block-dates

## What You Can Do as Barber:

### 📅 Schedule View (`/admin/schedule`)
- See all appointments for any day
- View client details
- Add barber notes
- Mark appointments as complete
- Confirm or cancel appointments

### 👥 Clients (`/admin/clients`)
- View all your clients
- Search clients
- See client history and spending
- Add notes about each client
- Track loyalty points

### ⚙️ Settings
- **Services**: Manage your services and prices
- **Working Hours**: Set your availability
- **Block Dates**: Mark days you're unavailable

### 📊 Dashboard
- See today's appointments count
- View upcoming appointments
- Track total revenue

---

## Quick Start:

1. **Sign in** with `admin@razornate.com`
2. Click **"Admin"** in the navbar
3. Start with **"Schedule"** to see today's appointments!






