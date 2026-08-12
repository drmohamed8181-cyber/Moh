# MP MedPharma – Setup Guide

## Quick Start (5 steps)

### 1. Configure Environment Variables
Edit `.env.local` and fill in:
- `DATABASE_URL` — your PostgreSQL connection string (Supabase recommended)
- `NEXTAUTH_SECRET` — run `openssl rand -base64 32` to generate
- `CLOUDINARY_*` — your Cloudinary credentials (for image uploads)

### 2. Push Database Schema
```bash
npx prisma generate
npx prisma db push
```

### 3. Seed the Database (demo data + admin account)
```bash
npm run db:seed
```
This creates:
- **Admin account:** dr.mohamed8181@gmail.com / Admin@123456
- 6 product categories
- 5 featured products
- 3 hero slides
- Site settings

### 4. Start Development Server
```bash
npm run dev
```
Open http://localhost:3000

### 5. Access Admin Dashboard
Go to http://localhost:3000/admin  
Login with: dr.mohamed8181@gmail.com / Admin@123456

---

## Key URLs

| Page | URL |
|------|-----|
| Homepage | `/home` |
| Products | `/products` |
| Categories | `/categories` |
| Cart | `/cart` |
| Login | `/login` |
| Register | `/register` |
| Account | `/account/orders` |
| Admin Dashboard | `/admin/dashboard` |
| Admin Products | `/admin/products` |
| Admin Orders | `/admin/orders` |
| Admin Messages | `/admin/messages` |
| Admin Homepage | `/admin/homepage` |
| Admin Settings | `/admin/settings` |

## Database (Supabase – Free Tier)
1. Go to https://supabase.com
2. Create new project
3. Go to Settings → Database → URI
4. Copy "Connection string" and paste into DATABASE_URL in .env.local

## Cloudinary (Free Tier – Image Uploads)
1. Go to https://cloudinary.com
2. Create free account
3. Copy Cloud Name, API Key, API Secret
4. Paste into .env.local

## Production Deployment (Vercel)
1. Push code to GitHub
2. Connect repo to Vercel
3. Add all .env.local variables in Vercel Environment Variables
4. Deploy

## Tech Stack
- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Database:** PostgreSQL via Prisma ORM
- **Auth:** NextAuth v5
- **Images:** Cloudinary
- **State:** Zustand (cart)
- **Toasts:** Sonner
