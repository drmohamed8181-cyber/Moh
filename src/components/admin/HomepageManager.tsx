"use client";

import { useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, GripVertical, Eye, EyeOff, X, Save } from "lucide-react";

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

const emptySlide = { title: "", description: "", image: "", buttonText: "Shop Now", buttonLink: "/products" };

export default function HomepageManager({ slides: initialSlides }: { slides: Slide[] }) {
  const [slides, setSlides] = useState<Slide[]>(initialSlides);
  const [editing, setEditing] = useState<Slide | null>(null);
  const [form, setForm] = useState(emptySlide);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const openNew = () => {
    setEditing(null);
    setForm(emptySlide);
    setShowModal(true);
  };

  const openEdit = (slide: Slide) => {
    setEditing(slide);
    setForm({ title: slide.title, description: slide.description ?? "", image: slide.image, buttonText: slide.buttonText ?? "", buttonLink: slide.buttonLink ?? "" });
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
        body: JSON.stringify({ ...form, order: slides.length }),
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
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="font-bold text-gray-900">{editing ? "Edit Slide" : "New Slide"}</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Title *</label>
                <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={inputClass} placeholder="Slide title" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
                <textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={inputClass + " resize-none"} placeholder="Short description..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Image URL *</label>
                <input type="url" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} className={inputClass} placeholder="https://..." />
                {form.image && (
                  <div className="relative h-24 bg-gray-100 rounded-xl overflow-hidden mt-2">
                    <Image src={form.image} alt="Preview" fill className="object-cover" />
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
