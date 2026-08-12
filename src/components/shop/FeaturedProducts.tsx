import Link from "next/link";
import { ArrowRight } from "lucide-react";
import ProductCard from "@/components/product/ProductCard";

interface Product {
  id: string;
  name: string;
  slug: string;
  images: string[];
  stockQty: number;
  isAvailable: boolean;
  shortDesc?: string | null;
  category?: { name: string; slug: string } | null;
}

const demoProducts: Product[] = [
  { id: "p1", name: "Digital Blood Pressure Monitor Pro", slug: "blood-pressure-monitor-pro", images: ["https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&q=80"], stockQty: 50, isAvailable: true, shortDesc: "Clinically validated, irregular heartbeat detection, 2-user memory", category: { name: "Patient Monitoring", slug: "patient-monitoring" } },
  { id: "p2", name: "Fingertip Pulse Oximeter", slug: "fingertip-pulse-oximeter", images: ["https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&q=80"], stockQty: 120, isAvailable: true, shortDesc: "SpO₂ & pulse rate with OLED display and 12-hour battery", category: { name: "Diagnostic Equipment", slug: "diagnostic-equipment" } },
  { id: "p3", name: "No-Touch Infrared Thermometer", slug: "infrared-thermometer", images: ["https://images.unsplash.com/photo-1585435421671-0c16764628e3?w=400&q=80"], stockQty: 200, isAvailable: true, shortDesc: "1-second reading, fever alarm, stores 32 readings", category: { name: "Diagnostic Equipment", slug: "diagnostic-equipment" } },
  { id: "p4", name: "12-Lead ECG Machine", slug: "12-lead-ecg-machine", images: ["https://images.unsplash.com/photo-1628771065518-0d82f1938462?w=400&q=80"], stockQty: 15, isAvailable: true, shortDesc: "Professional 12-lead system with thermal printer and PC connectivity", category: { name: "Diagnostic Equipment", slug: "diagnostic-equipment" } },
  { id: "p5", name: "Portable Ultrasound Scanner", slug: "portable-ultrasound-scanner", images: ["https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=400&q=80"], stockQty: 8, isAvailable: true, shortDesc: "Point-of-care handheld ultrasound with wireless tablet display", category: { name: "Diagnostic Equipment", slug: "diagnostic-equipment" } },
  { id: "p6", name: "ICU Patient Monitor", slug: "icu-patient-monitor", images: ["https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=400&q=80"], stockQty: 20, isAvailable: true, shortDesc: "Multi-parameter monitor: ECG, SpO₂, NIBP, temp, respiration rate", category: { name: "Patient Monitoring", slug: "patient-monitoring" } },
  { id: "p7", name: "Mesh Nebulizer System", slug: "mesh-nebulizer-system", images: ["https://images.unsplash.com/photo-1551190822-a9333d879b1f?w=400&q=80"], stockQty: 75, isAvailable: true, shortDesc: "Silent vibrating mesh technology, 0.5 μm particle size, USB rechargeable", category: { name: "Home Healthcare", slug: "home-healthcare" } },
  { id: "p8", name: "Digital Stethoscope", slug: "digital-stethoscope", images: ["https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=400&q=80"], stockQty: 40, isAvailable: true, shortDesc: "40x amplification, active noise cancellation, Bluetooth audio streaming", category: { name: "Diagnostic Equipment", slug: "diagnostic-equipment" } },
];

interface FeaturedProductsProps {
  products?: Product[];
}

export default function FeaturedProducts({ products }: FeaturedProductsProps) {
  const items = (products && products.length > 0) ? products : demoProducts;

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-blue-600 text-sm font-semibold uppercase tracking-wider mb-2">Top Picks</p>
            <h2 className="text-3xl font-bold text-slate-900">Featured Products</h2>
          </div>
          <Link href="/products" className="hidden sm:flex items-center gap-1.5 text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors">
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {items.slice(0, 8).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        <div className="sm:hidden text-center mt-8">
          <Link href="/products" className="inline-flex items-center gap-1.5 text-blue-600 text-sm font-medium">
            View All Products <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
