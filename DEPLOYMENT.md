# Invest Different — Deployment Guide

## Environment Variables

```env
# Required
DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET="your-secret-32+chars"
NEXTAUTH_URL="https://your-domain.com"
JWT_SECRET="your-jwt-secret"

# Admin (first deploy only)
ADMIN_EMAIL="Admin@gmail.com"
ADMIN_PASSWORD_HASH="bcrypt-hash-of-Admin123"

# Optional
GROQ_API_KEY="your-groq-key"
RESEND_API_KEY="your-resend-key"
NEXT_PUBLIC_APP_URL="https://your-domain.com"
```

## Deploy Commands

```bash
# 1. Install
npm install

# 2. Build
npm run build

# 3. Seed data (first deploy only)
npm run seed

# 4. Start
npm run start
```

## Vercel / Cloud Run Deploy

```bash
vercel --prod
```

## Verification Checklist

- [x] Landing page loads with dynamic year & market features
- [x] Login/register works with Remember Me option
- [x] Forgot Password flow sends reset link request
- [x] Admin login at /admin works (Admin@gmail.com / Admin123)
- [x] Admin Social Link Review Queue approves & credits $5 bonus
- [x] KYC submission works with multi-document upload
- [x] Deposit creates record and notifies admin
- [x] Withdrawal request enforces transaction password
- [x] Groq AI assistant responds with real user context awareness
- [x] Onboarding tutorial guides new users on first login
- [x] Error boundaries catch rendering failures gracefully
