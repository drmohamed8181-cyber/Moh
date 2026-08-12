export interface Product {
  id: string;
  name: string;
  slug: string;
  sku: string;
  categoryId: string;
  category?: Category;
  brand?: string | null;
  manufacturer?: string | null;
  price: number;
  discountPrice?: number | null;
  images: string[];
  shortDesc?: string | null;
  description?: string | null;
  specifications?: Record<string, string> | null;
  features: string[];
  isAvailable: boolean;
  stockQty: number;
  weight?: number | null;
  dimensions?: string | null;
  warranty?: string | null;
  isFeatured: boolean;
  seoTitle?: string | null;
  seoDesc?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  image?: string | null;
  order: number;
  isActive: boolean;
  seoTitle?: string | null;
  seoDesc?: string | null;
}

export interface CartItem {
  id: string;
  productId: string;
  product: Product;
  quantity: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  status: OrderStatus;
  subtotal: number;
  shipping: number;
  tax: number;
  discount: number;
  total: number;
  couponCode?: string | null;
  shippingAddress: Address;
  items: OrderItem[];
  createdAt: Date;
  updatedAt: Date;
}

export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED"
  | "REFUNDED";

export interface OrderItem {
  id: string;
  productId: string;
  name: string;
  image?: string | null;
  price: number;
  quantity: number;
}

export interface Address {
  name: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

export interface HeroSlide {
  id: string;
  title: string;
  description?: string | null;
  image: string;
  buttonText?: string | null;
  buttonLink?: string | null;
  order: number;
  isActive: boolean;
}

export interface SiteSettings {
  companyName: string;
  logo: string;
  phone: string;
  email: string;
  address: string;
  facebook: string;
  twitter: string;
  instagram: string;
  linkedin: string;
  youtube: string;
  favicon: string;
  aboutText: string;
  aboutImage: string;
  footerText: string;
}
