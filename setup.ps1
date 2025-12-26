# Razornate Setup Script
# Run this after installing Node.js

Write-Host "🚀 Setting up Razornate..." -ForegroundColor Cyan
Write-Host ""

# Step 1: Check Node.js
Write-Host "Step 1: Checking Node.js installation..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    $npmVersion = npm --version
    Write-Host "✅ Node.js: $nodeVersion" -ForegroundColor Green
    Write-Host "✅ npm: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js not found! Please install Node.js first." -ForegroundColor Red
    Write-Host "   Download from: https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

# Step 2: Install dependencies
Write-Host ""
Write-Host "Step 2: Installing dependencies..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Dependencies installed" -ForegroundColor Green

# Step 3: Create .env file
Write-Host ""
Write-Host "Step 3: Creating .env file..." -ForegroundColor Yellow
if (-not (Test-Path .env)) {
    $secret = -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | ForEach-Object {[char]$_})
    @"
DATABASE_URL="file:./dev.db"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="$secret"
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
APPLE_CLIENT_ID=""
APPLE_CLIENT_SECRET=""
EMAIL_SERVER=""
EMAIL_FROM=""
LOYALTY_POINTS_PER_VISIT=10
LOYALTY_POINTS_FOR_FREE_CUT=100
"@ | Out-File -FilePath .env -Encoding utf8
    Write-Host "✅ .env file created with random secret" -ForegroundColor Green
} else {
    Write-Host "✅ .env file already exists" -ForegroundColor Green
}

# Step 4: Set up database
Write-Host ""
Write-Host "Step 4: Setting up database..." -ForegroundColor Yellow
npx prisma db push
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to set up database" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Database created" -ForegroundColor Green

# Step 5: Generate Prisma client
Write-Host ""
Write-Host "Step 5: Generating Prisma client..." -ForegroundColor Yellow
npx prisma generate
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to generate Prisma client" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Prisma client generated" -ForegroundColor Green

# Step 6: Seed database
Write-Host ""
Write-Host "Step 6: Seeding database with default services..." -ForegroundColor Yellow
npm run db:seed
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  Seeding failed (might be okay if services already exist)" -ForegroundColor Yellow
} else {
    Write-Host "✅ Database seeded" -ForegroundColor Green
}

# Step 7: Create admin user
Write-Host ""
Write-Host "Step 7: Creating admin user..." -ForegroundColor Yellow
$email = Read-Host "Enter your email address for admin account"
if ($email) {
    npm run create-admin $email
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Admin user created: $email" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Failed to create admin user (you can do this manually later)" -ForegroundColor Yellow
    }
} else {
    Write-Host "⚠️  Skipped admin user creation" -ForegroundColor Yellow
}

# Done!
Write-Host ""
Write-Host "🎉 Setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "To start the app, run:" -ForegroundColor Cyan
Write-Host "  npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "Then open: http://localhost:3000" -ForegroundColor Cyan
Write-Host ""






