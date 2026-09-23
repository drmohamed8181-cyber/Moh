"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, GripVertical, Eye, EyeOff, X, Save, Check } from "lucide-react";
import SearchSuggestInput from "@/components/ui/SearchSuggestInput";
import { productSearchRank } from "@/lib/productSearch";

interface Slide {
  id: string;
  title: string;
  description?: string | null;
  image: string;
  buttonText?: string | null;
  buttonLink?: string | null;
  order: number;
  isActive: boolean;
}

interface PickableProduct {
  id: string;
  name: string;
  slug: string;
  sku: string;
  shortDesc: string | null;
  images: string[];
  category: { name: string } | null;
}

const emptySlide = { title: "", description: "", image: "", buttonText: "Shop Now", buttonLink: "/products" };

export default function HomepageManager({ slides: initialSlides, products = [] }: { slides: Slide[]; products?: PickableProduct[] }) {
  const [slides, setSlides] = useState<Slide[]>(initialSlides);
  const [editing, setEditing] = useState<Slide | null>(null);
  const [form, setForm] = useState(emptySlide);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [productQuery, setProductQuery] = useState("");
  const [picked, setPicked] = useState<PickableProduct | null>(null);

  const productMatches = useMemo(() => {
    const q = productQuery.trim();
    if (!q) return [];
    return products
      .map((p) => ({ p, r: productSearchRank({ name: p.name, sku: p.sku, category: p.category?.name ?? null }, q) }))
      .filter((x) => x.r >= 0)
      .sort((a, b) => a.r - b.r || a.p.name.localeCompare(b.p.name))
      .slice(0, 8)
      .map((x) => x.p);
  }, [products, productQuery]);

  // Fill the whole slide from a product; every field stays editable after.
  const pickProduct = (id: string) => {
    const p = products.find((x) => x.id === id);
    if (!p) return;
    setPicked(p);
    setProductQuery("");
    setForm({
      title: p.name,
      description: p.shortDesc ?? "",
      image: p.images[0] ?? "",
      buttonText: "View Product",
      buttonLink: `/products/${p.slug}`,
    });
  };

  const resetPicker = () => {
    setProductQuery("");
    setPicked(null);
  };

  const openNew = () => {
    setEditing(null);
    setForm(emptySlide);
    resetPicker();
    setShowModal(true);
  };

  const openEdit = (slide: Slide) => {
    setEditing(slide);
    setForm({ title: slide.title, description: slide.description ?? "", image: slide.image, buttonText: slide.buttonText ?? "", buttonLink: slide.buttonLink ?? "" });
    resetPicker();
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.title || !form.image) { toast.error("Title and image are required"); return; }
    setLoading(true);
    try {
      const method = editing ? "PUT" : "POST";
      const url = editing ? `/api/admin/homepage/slides/${editing.id}` : "/api/admin/homepage/slides";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        // Only new slides go to the end; editing must keep a slide's place.
        body: JSON.stringify(editing ? form : { ...form, order: slides.length }),
      });
      if (res.ok) {
        const saved = await res.json();
        if (editing) {
          setSlides(slides.map((s) => (s.id === editing.id ? saved : s)));
        } else {
          setSlides([...slides, saved]);
        }
        toast.success(editing ? "Slide updated" : "Slide created");
        setShowModal(false);
      } else {
        toast.error("Failed to save slide");
      }
    } catch {
      toast.error("Error saving slide");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this slide?")) return;
    try {
      await fetch(`/api/admin/homepage/slides/${id}`, { method: "DELETE" });
      setSlides(slides.filter((s) => s.id !== id));
      toast.success("Slide deleted");
    } catch {
      toast.error("Failed to delete");
    }
  };

  const toggleActive = async (slide: Slide) => {
    try {
      const res = await fetch(`/api/admin/homepage/slides/${slide.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !slide.isActive }),
      });
      if (res.ok) {
        setSlides(slides.map((s) => (s.id === slide.id ? { ...s, isActive: !s.isActive } : s)));
      }
    } catch {}
  };

  const inputClass = "w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm";

  return (
    <div>
      <div className="bg-white rounded-2xl border">
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="font-bold text-gray-900">Hero Slides</h2>
            <p className="text-sm text-gray-500">{slides.length} slide{slides.length !== 1 ? "s" : ""}</p>
          </div>
          <button onClick={openNew} className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white text-sm font-semibold rounded-xl hover:bg-primary-700">
            <Plus size={16} /> Add Slide
          </button>
        </div>

        <div className="divide-y">
          {slides.length === 0 ? (
            <div className="p-12 text-center text-gray-500 text-sm">No slides yet. Add your first hero slide.</div>
          ) : slides.map((slide) => (
            <div key={slide.id} className="flex items-center gap-4 p-5">
              <GripVertical size={18} className="text-gray-300 cursor-grab flex-shrink-0" />
              <div className="relative w-24 h-14 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                {slide.image && <Image src={slide.image} alt={slide.title} fill className="object-cover" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 truncate">{slide.title}</p>
                {slide.description && <p className="text-sm text-gray-500 truncate">{slide.description}</p>}
                <p className="text-xs text-primary-600 mt-1">{slide.buttonText} → {slide.buttonLink}</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button onClick={() => toggleActive(slide)} className={`p-2 rounded-lg transition-colors ${slide.isActive ? "text-green-600 bg-green-50" : "text-gray-400 bg-gray-50"}`}>
                  {slide.isActive ? <Eye size={16} /> : <EyeOff size={16} />}
                </button>
                <button onClick={() => openEdit(slide)} className="p-2 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
                  <Pencil size={16} />
                </button>
                <button onClick={() => handleDelete(slide.id)} className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[calc(100vh-2rem)] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="font-bold text-gray-900">{editing ? "Edit Slide" : "New Slide"}</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4 overflow-y-auto">
              {products.length > 0 && (
                <div className="rounded-xl bg-primary-50/60 border border-primary-100 p-4">
                  <label className="block text-sm font-semibold text-gray-800 mb-1">Choose a product to feature</label>
                  <p className="text-xs text-gray-500 mb-2.5">Fills in the title, description, picture and link below. You can still edit any of them.</p>
                  <SearchSuggestInput
                    value={productQuery}
                    onChange={setProductQuery}
                    suggestions={productMatches.map((p) => ({
                      id: p.id,
                      title: p.name,
                      subtitle: `SKU: ${p.sku}${p.category ? ` · ${p.category.name}` : ""}`,
                      image: p.images[0] ?? null,
                    }))}
                    onSelect={(sg) => pickProduct(sg.id)}
                    noun="products"
                    placeholder="Type a product name..."
                    inputClassName="py-2.5 text-sm bg-white"
                  />
                  {picked && (
                    <p className="flex items-center gap-1.5 text-xs text-green-700 mt-2">
                      <Check size={13} /> Filled from <span className="font-semibold">{picked.name}</span>
                    </p>
                  )}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Title *</label>
                <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={inputClass} placeholder="Slide title" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
                <textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={inputClass + " resize-none"} placeholder="Short description..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Image *</label>
                {picked && picked.images.length > 1 && (
                  <div className="mb-2">
                    <p className="text-xs text-gray-500 mb-1.5">Pick which photo of this product to show:</p>
                    <div className="flex flex-wrap gap-2">
                      {picked.images.map((img) => (
                        <button
                          key={img}
                          type="button"
                          onClick={() => setForm({ ...form, image: img })}
                          className={`relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100 border-2 ${form.image === img ? "border-primary-600" : "border-transparent hover:border-gray-300"}`}
                        >
                          <Image src={img} alt="" fill sizes="64px" className="object-contain p-1" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                <input type="text" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} className={inputClass} placeholder="https://... or pick a product above" />
                {form.image && (
                  <div className="relative h-32 bg-gray-100 rounded-xl overflow-hidden mt-2">
                    <Image src={form.image} alt="Preview" fill className="object-contain p-2" />
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Button Text</label>
                  <input type="text" value={form.buttonText} onChange={(e) => setForm({ ...form, buttonText: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Button Link</label>
                  <input type="text" value={form.buttonLink} onChange={(e) => setForm({ ...form, buttonLink: e.target.value })} className={inputClass} />
                </div>
              </div>
            </div>
            <div className="flex gap-3 p-6 border-t">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 border rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
              <button onClick={handleSave} disabled={loading} className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-primary-600 text-white text-sm font-semibold rounded-xl hover:bg-primary-700 disabled:opacity-60">
                <Save size={15} />{loading ? "Saving..." : "Save Slide"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
