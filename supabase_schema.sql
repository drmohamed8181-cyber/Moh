-- ============================================================
-- MedPharma - Supabase SQL Schema
-- قم بتشغيل هذا الملف في Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- ENUMS
-- ============================================================

CREATE TYPE "Role" AS ENUM ('SUPER_ADMIN', 'ADMIN', 'CONTENT_MANAGER', 'CUSTOMER');
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED');
CREATE TYPE "CouponType" AS ENUM ('PERCENTAGE', 'FIXED');

-- ============================================================
-- TABLES
-- ============================================================

-- Users
CREATE TABLE "User" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  name TEXT,
  email TEXT UNIQUE NOT NULL,
  "emailVerified" TIMESTAMPTZ,
  image TEXT,
  password TEXT,
  role "Role" NOT NULL DEFAULT 'CUSTOMER',
  "isActive" BOOLEAN NOT NULL DEFAULT TRUE,
  phone TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Accounts (NextAuth)
CREATE TABLE "Account" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  "userId" TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  provider TEXT NOT NULL,
  "providerAccountId" TEXT NOT NULL,
  refresh_token TEXT,
  access_token TEXT,
  expires_at INT,
  token_type TEXT,
  scope TEXT,
  id_token TEXT,
  session_state TEXT,
  UNIQUE (provider, "providerAccountId")
);

-- Sessions (NextAuth)
CREATE TABLE "Session" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  "sessionToken" TEXT UNIQUE NOT NULL,
  "userId" TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  expires TIMESTAMPTZ NOT NULL
);

-- VerificationTokens (NextAuth)
CREATE TABLE "VerificationToken" (
  identifier TEXT NOT NULL,
  token TEXT UNIQUE NOT NULL,
  expires TIMESTAMPTZ NOT NULL,
  UNIQUE (identifier, token)
);

-- Categories
CREATE TABLE "Category" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  image TEXT,
  "order" INT NOT NULL DEFAULT 0,
  "isActive" BOOLEAN NOT NULL DEFAULT TRUE,
  "seoTitle" TEXT,
  "seoDesc" TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Products
CREATE TABLE "Product" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  sku TEXT UNIQUE NOT NULL,
  "categoryId" TEXT NOT NULL REFERENCES "Category"(id),
  "brandId" TEXT,
  manufacturer TEXT,
  price FLOAT NOT NULL,
  "discountPrice" FLOAT,
  images TEXT[] NOT NULL DEFAULT '{}',
  "shortDesc" TEXT,
  description TEXT,
  specifications JSONB,
  features TEXT[] NOT NULL DEFAULT '{}',
  "isAvailable" BOOLEAN NOT NULL DEFAULT TRUE,
  "stockQty" INT NOT NULL DEFAULT 0,
  weight FLOAT,
  dimensions TEXT,
  warranty TEXT,
  "isFeatured" BOOLEAN NOT NULL DEFAULT FALSE,
  "seoTitle" TEXT,
  "seoDesc" TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Orders
CREATE TABLE "Order" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  "orderNumber" TEXT UNIQUE NOT NULL,
  "userId" TEXT NOT NULL REFERENCES "User"(id),
  status "OrderStatus" NOT NULL DEFAULT 'PENDING',
  subtotal FLOAT NOT NULL,
  shipping FLOAT NOT NULL DEFAULT 0,
  tax FLOAT NOT NULL DEFAULT 0,
  discount FLOAT NOT NULL DEFAULT 0,
  total FLOAT NOT NULL,
  "couponCode" TEXT,
  "shippingAddress" JSONB NOT NULL,
  "paymentMethod" TEXT,
  "paymentId" TEXT,
  notes TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Order Items
CREATE TABLE "OrderItem" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  "orderId" TEXT NOT NULL REFERENCES "Order"(id) ON DELETE CASCADE,
  "productId" TEXT NOT NULL REFERENCES "Product"(id),
  name TEXT NOT NULL,
  image TEXT,
  price FLOAT NOT NULL,
  quantity INT NOT NULL
);

-- Cart Items
CREATE TABLE "CartItem" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  "userId" TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  "productId" TEXT NOT NULL REFERENCES "Product"(id),
  quantity INT NOT NULL DEFAULT 1,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE ("userId", "productId")
);

-- Wishlist Items
CREATE TABLE "WishlistItem" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  "userId" TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  "productId" TEXT NOT NULL REFERENCES "Product"(id),
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE ("userId", "productId")
);

-- Addresses
CREATE TABLE "Address" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  "userId" TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  street TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  zip TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'US',
  "isDefault" BOOLEAN NOT NULL DEFAULT FALSE
);

-- Reviews
CREATE TABLE "Review" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  "userId" TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  "productId" TEXT NOT NULL REFERENCES "Product"(id),
  rating INT NOT NULL,
  comment TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Contact Messages
CREATE TABLE "ContactMessage" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  "isRead" BOOLEAN NOT NULL DEFAULT FALSE,
  reply TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Coupons
CREATE TABLE "Coupon" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  code TEXT UNIQUE NOT NULL,
  type "CouponType" NOT NULL DEFAULT 'PERCENTAGE',
  value FLOAT NOT NULL,
  "minOrder" FLOAT,
  "maxUses" INT,
  "usedCount" INT NOT NULL DEFAULT 0,
  "isActive" BOOLEAN NOT NULL DEFAULT TRUE,
  "expiresAt" TIMESTAMPTZ,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Hero Slides (CMS)
CREATE TABLE "HeroSlide" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  title TEXT NOT NULL,
  description TEXT,
  image TEXT NOT NULL,
  "buttonText" TEXT,
  "buttonLink" TEXT,
  "order" INT NOT NULL DEFAULT 0,
  "isActive" BOOLEAN NOT NULL DEFAULT TRUE,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Site Settings (CMS)
CREATE TABLE "SiteSetting" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  key TEXT UNIQUE NOT NULL,
  value TEXT NOT NULL,
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Nav Items (CMS)
CREATE TABLE "NavItem" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  label TEXT NOT NULL,
  href TEXT NOT NULL,
  "order" INT NOT NULL DEFAULT 0,
  "isActive" BOOLEAN NOT NULL DEFAULT TRUE,
  "parentId" TEXT REFERENCES "NavItem"(id)
);

-- Media Files
CREATE TABLE "MediaFile" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  url TEXT NOT NULL,
  "publicId" TEXT NOT NULL,
  name TEXT NOT NULL,
  size INT,
  "mimeType" TEXT,
  folder TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- AUTO UPDATE updatedAt TRIGGER
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW."updatedAt" = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_updated_at BEFORE UPDATE ON "User" FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_category_updated_at BEFORE UPDATE ON "Category" FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_product_updated_at BEFORE UPDATE ON "Product" FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_order_updated_at BEFORE UPDATE ON "Order" FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_heroslide_updated_at BEFORE UPDATE ON "HeroSlide" FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_sitesetting_updated_at BEFORE UPDATE ON "SiteSetting" FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- INDEXES (للأداء)
-- ============================================================

CREATE INDEX idx_product_category ON "Product"("categoryId");
CREATE INDEX idx_product_slug ON "Product"(slug);
CREATE INDEX idx_product_sku ON "Product"(sku);
CREATE INDEX idx_order_user ON "Order"("userId");
CREATE INDEX idx_order_status ON "Order"(status);
CREATE INDEX idx_cartitem_user ON "CartItem"("userId");
CREATE INDEX idx_wishlist_user ON "WishlistItem"("userId");
CREATE INDEX idx_review_product ON "Review"("productId");
CREATE INDEX idx_account_user ON "Account"("userId");

-- ============================================================
-- ROW LEVEL SECURITY (RLS) - اختياري
-- ============================================================

-- تفعيل RLS على الجداول الحساسة
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Order" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "CartItem" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "WishlistItem" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Address" ENABLE ROW LEVEL SECURITY;

-- سياسة: كل مستخدم يرى بياناته فقط (عبر service_role للـ API)
-- ملاحظة: بما أن المشروع يستخدم Prisma مع service_role key، RLS لن تعيق الـ API
-- لكن تحميها من الوصول المباشر

-- ============================================================
-- انتهى! الآن المشروع جاهز للربط مع Prisma
-- ============================================================
