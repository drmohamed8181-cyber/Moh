import { Shield, Truck, RotateCcw, Headphones, Award } from "lucide-react";

const items = [
  { icon: Shield, title: "Certified Quality", desc: "ISO & FDA Approved" },
  { icon: Truck, title: "Fast Shipping", desc: "2–5 Business Days" },
  { icon: RotateCcw, title: "Easy Returns", desc: "30-Day Return Policy" },
  { icon: Headphones, title: "24/7 Support", desc: "Technical Assistance" },
  { icon: Award, title: "Warranty", desc: "Up to 2 Years Warranty" },
];

export default function TrustBar() {
  return (
    <div className="bg-primary-600 text-white py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
          {items.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <Icon size={20} className="text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white leading-tight">{title}</p>
                <p className="text-xs text-blue-200 leading-tight">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
