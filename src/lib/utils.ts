import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(price);
}

export function formatDate(date: Date | string) {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(date));
}

export function escapeHtml(text: string) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function generateOrderNumber() {
  return `MP-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
}

export function generateSubmissionReference() {
  return `MP-SELL-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
}

export function buildInquiryHref(product: {
  name: string;
  slug?: string;
  sku?: string | null;
  category?: string | null;
}) {
  const subject = `Inquiry: ${product.name}`;
  const lines = ["I'm interested in the following product:", "", `Product: ${product.name}`];
  if (product.sku) lines.push(`SKU: ${product.sku}`);
  if (product.category) lines.push(`Category: ${product.category}`);
  if (product.slug) lines.push(`Link: /products/${product.slug}`);
  lines.push("", "Please send me more details and pricing.");

  const params = new URLSearchParams({ subject, message: lines.join("\n") });
  if (product.slug) params.set("product", product.slug);
  return `/contact?${params.toString()}`;
}
