import { Shield, Truck, RotateCcw, Headphones, Award } from "lucide-react";

// Claims here must match what the rest of the site says; see the note on
// trustFeatures in src/app/(shop)/page.tsx.
const items = [
  { icon: Award, title: "Since 2009", desc: "Ophthalmic & surgical equipment" },
  { icon: Shield, title: "Service History", desc: "Documented on every unit" },
  { icon: RotateCcw, title: "Warranty", desc: "New & certified refurbished" },
  { icon: Headphones, title: "Private Demos", desc: "Before you buy" },
  { icon: Truck, title: "We Buy Equipment", desc: "Transparent valuations" },
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
