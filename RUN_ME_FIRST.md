# 🚀 Quick Setup Guide

## ⚠️ IMPORTANT: Install Node.js First!

**Node.js is required** to run this application.

### Install Node.js:
1. Go to: **https://nodejs.org/**
2. Download the **LTS version** (recommended)
3. Run the installer
4. **Restart your terminal** after installation

### Verify Installation:
Open a new terminal and run:
```bash
node --version
npm --version
```

You should see version numbers.

---

## 🎯 After Node.js is Installed:

### Option 1: Automated Setup (Easiest)
```powershell
.\setup.ps1
```

This script will:
- ✅ Install all dependencies
- ✅ Create .env file
- ✅ Set up database
- ✅ Seed with default services
- ✅ Create admin user

### Option 2: Manual Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Create .env file:**
   ```bash
   # Copy this content to a new .env file:
   DATABASE_URL="file:./dev.db"
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-random-secret-here"
   ```

3. **Set up database:**
   ```bash
   npx prisma db push
   npx prisma generate
   npm run db:seed
   ```

4. **Create admin user:**
   ```bash
   npm run create-admin your-email@example.com
   ```

5. **Start the app:**
   ```bash
   npm run dev
   ```

---

## 🎉 Then Open:
**http://localhost:3000**

---

**Need help?** Let me know once Node.js is installed!






