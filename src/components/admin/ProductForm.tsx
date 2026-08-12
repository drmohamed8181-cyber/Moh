"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "sonner";
import { Plus, X, Upload } from "lucide-react";
import type { Product } from "@prisma/client";
import { slugify } from "@/lib/utils";

interface Category { id: string; name: string; }
interface Props { categories: Category[]; product?: Product; }

export default function ProductForm({ categories, product }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<string[]>(product?.images ?? []);
  const [features, setFeatures] = useState<string[]>(product?.features ?? [""]);
  const [accessories, setAccessories] = useState<string[]>(product?.accessories ?? [""]);
  const [indications, setIndications] = useState<string[]>(product?.indications ?? [""]);
  const [clinicalEvidence, setClinicalEvidence] = useState<string[]>(product?.clinicalEvidence ?? [""]);
  const [specs, setSpecs] = useState<{ key: string; value: string }[]>(
    product?.specifications
      ? Object.entries(product.specifications).map(([key, value]) => ({ key, value: value as string }))
      : [{ key: "", value: "" }]
  );

  const [form, setForm] = useState({
    name: product?.name ?? "",
    slug: product?.slug ?? "",
    sku: product?.sku ?? "",
    categoryId: product?.categoryId ?? "",
    manufacturer: product?.manufacturer ?? "",
    price: product?.price ?? "",
    discountPrice: product?.discountPrice ?? "",
    shortDesc: product?.shortDesc ?? "",
    description: product?.description ?? "",
    isAvailable: product?.isAvailable ?? true,
    isFeatured: product?.isFeatured ?? false,
    stockQty: product ? String(product.stockQty) : "0",
    weight: product?.weight ?? "",
    dimensions: product?.dimensions ?? "",
    warranty: product?.warranty ?? "",
    seoTitle: product?.seoTitle ?? "",
    seoDesc: product?.seoDesc ?? "",
  });

  const handleNameChange = (name: string) => {
    setForm((f) => ({ ...f, name, slug: product ? f.slug : slugify(name) }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    for (const file of Array.from(files)) {
      const reader = new FileReader();
      reader.onload = async (ev) => {
        const data = ev.target?.result as string;
        try {
          const res = await fetch("/api/upload", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ data, folder: "medpharma/products" }),
          });
          if (res.ok) {
            const { url } = await res.json();
            setImages((prev) => [...prev, url]);
          } else {
            // For demo: add a placeholder
            setImages((prev) => [...prev, data]);
          }
        } catch {
          setImages((prev) => [...prev, data]);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.sku || !form.categoryId || !form.price) {
      toast.error("Please fill all required fields");
      return;
    }
    setLoading(true);
    try {
      const specsObj = specs.reduce<Record<string, string>>((acc, { key, value }) => {
        if (key) acc[key] = value;
        return acc;
      }, {});

      const body = {
        ...form,
        price: parseFloat(form.price as string),
        discountPrice: form.discountPrice ? parseFloat(form.discountPrice as string) : null,
        stockQty: parseInt(form.stockQty as string),
        weight: form.weight ? parseFloat(form.weight as string) : null,
        images,
        features: features.filter(Boolean),
        accessories: accessories.filter(Boolean),
        indications: indications.filter(Boolean),
        clinicalEvidence: clinicalEvidence.filter(Boolean),
        specifications: specsObj,
      };

      const url = product ? `/api/products/${product.id}` : "/api/products";
      const method = product ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        toast.success(product ? "Product updated!" : "Product created!");
        router.push("/admin/products");
      } else {
        const data = await res.json();
        toast.error(data.error ?? "Failed to save product");
      }
    } catch {
      toast.error("Network error");
    } finally {
      setLoading(false);
    }
  };

  const Field = ({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
    </div>
  );

  const inputClass = "w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm";

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border p-6 space-y-5">
            <h2 className="font-semibold text-gray-900">Basic Information</h2>
            <Field label="Product Name" required>
              <input type="text" value={form.name} onChange={(e) => handleNameChange(e.target.value)} className={inputClass} placeholder="e.g. Digital Blood Pressure Monitor" required />
            </Field>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Slug" required>
                <input type="text" value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))} className={inputClass} required />
              </Field>
              <Field label="SKU" required>
                <input type="text" value={form.sku} onChange={(e) => setForm((f) => ({ ...f, sku: e.target.value }))} className={inputClass} required />
              </Field>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Category" required>
                <select value={form.categoryId} onChange={(e) => setForm((f) => ({ ...f, categoryId: e.target.value }))} className={inputClass} required>
                  <option value="">Select category</option>
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </Field>
              <Field label="Manufacturer">
                <input type="text" value={form.manufacturer} onChange={(e) => setForm((f) => ({ ...f, manufacturer: e.target.value }))} className={inputClass} />
              </Field>
            </div>
            <Field label="Short Description">
              <textarea rows={2} value={form.shortDesc} onChange={(e) => setForm((f) => ({ ...f, shortDesc: e.target.value }))} className={inputClass + " resize-none"} placeholder="Brief product summary..." />
            </Field>
            <Field label="Full Description">
              <textarea rows={6} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} className={inputClass + " resize-none"} placeholder="Detailed product description..." />
            </Field>
          </div>

          {/* Images */}
          <div className="bg-white rounded-2xl border p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Product Images</h2>
            <div className="grid grid-cols-4 gap-3 mb-4">
              {images.map((img, i) => (
                <div key={i} className="relative aspect-square bg-gray-50 rounded-xl overflow-hidden group">
                  <Image src={img} alt={`Product ${i}`} fill className="object-contain p-1" />
                  <button type="button" onClick={() => setImages(images.filter((_, j) => j !== i))}
                    className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <X size={12} />
                  </button>
                  {i === 0 && <span className="absolute bottom-1 left-1 bg-primary-600 text-white text-xs px-1.5 py-0.5 rounded">Main</span>}
                </div>
              ))}
              <label className="aspect-square border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-primary-400 transition-colors">
                <Upload size={20} className="text-gray-400 mb-1" />
                <span className="text-xs text-gray-400">Upload</span>
                <input type="file" className="hidden" multiple accept="image/*" onChange={handleImageUpload} />
              </label>
            </div>
          </div>

          {/* Features */}
          <div className="bg-white rounded-2xl border p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900">Features</h2>
              <button type="button" onClick={() => setFeatures([...features, ""])} className="text-sm text-primary-600 hover:underline flex items-center gap-1">
                <Plus size={14} /> Add Feature
              </button>
            </div>
            {features.map((f, i) => (
              <div key={i} className="flex gap-2 mb-2">
                <input type="text" value={f} onChange={(e) => { const n = [...features]; n[i] = e.target.value; setFeatures(n); }} className={inputClass} placeholder={`Feature ${i + 1}`} />
                <button type="button" onClick={() => setFeatures(features.filter((_, j) => j !== i))} className="text-red-400 hover:text-red-600">
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>

          {/* Specifications */}
          <div className="bg-white rounded-2xl border p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900">Specifications</h2>
              <button type="button" onClick={() => setSpecs([...specs, { key: "", value: "" }])} className="text-sm text-primary-600 hover:underline flex items-center gap-1">
                <Plus size={14} /> Add Spec
              </button>
            </div>
            {specs.map((s, i) => (
              <div key={i} className="flex gap-2 mb-2">
                <input type="text" value={s.key} onChange={(e) => { const n = [...specs]; n[i].key = e.target.value; setSpecs(n); }} className={inputClass} placeholder="Spec name" />
                <input type="text" value={s.value} onChange={(e) => { const n = [...specs]; n[i].value = e.target.value; setSpecs(n); }} className={inputClass} placeholder="Value" />
                <button type="button" onClick={() => setSpecs(specs.filter((_, j) => j !== i))} className="text-red-400 hover:text-red-600">
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>

          {/* Accessories */}
          <div className="bg-white rounded-2xl border p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900">Accessories</h2>
              <button type="button" onClick={() => setAccessories([...accessories, ""])} className="text-sm text-primary-600 hover:underline flex items-center gap-1">
                <Plus size={14} /> Add Accessory
              </button>
            </div>
            {accessories.map((a, i) => (
              <div key={i} className="flex gap-2 mb-2">
                <input type="text" value={a} onChange={(e) => { const n = [...accessories]; n[i] = e.target.value; setAccessories(n); }} className={inputClass} placeholder={`Accessory ${i + 1}`} />
                <button type="button" onClick={() => setAccessories(accessories.filter((_, j) => j !== i))} className="text-red-400 hover:text-red-600">
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>

          {/* Indications */}
          <div className="bg-white rounded-2xl border p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900">Indications</h2>
              <button type="button" onClick={() => setIndications([...indications, ""])} className="text-sm text-primary-600 hover:underline flex items-center gap-1">
                <Plus size={14} /> Add Indication
              </button>
            </div>
            {indications.map((ind, i) => (
              <div key={i} className="flex gap-2 mb-2">
                <input type="text" value={ind} onChange={(e) => { const n = [...indications]; n[i] = e.target.value; setIndications(n); }} className={inputClass} placeholder={`Indication ${i + 1}`} />
                <button type="button" onClick={() => setIndications(indications.filter((_, j) => j !== i))} className="text-red-400 hover:text-red-600">
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>

          {/* Clinical Evidence */}
          <div className="bg-white rounded-2xl border p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900">Clinical Evidence</h2>
              <button type="button" onClick={() => setClinicalEvidence([...clinicalEvidence, ""])} className="text-sm text-primary-600 hover:underline flex items-center gap-1">
                <Plus size={14} /> Add Study / Citation
              </button>
            </div>
            {clinicalEvidence.map((c, i) => (
              <div key={i} className="flex gap-2 mb-2">
                <input type="text" value={c} onChange={(e) => { const n = [...clinicalEvidence]; n[i] = e.target.value; setClinicalEvidence(n); }} className={inputClass} placeholder={`Study or finding ${i + 1}`} />
                <button type="button" onClick={() => setClinicalEvidence(clinicalEvidence.filter((_, j) => j !== i))} className="text-red-400 hover:text-red-600">
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>

          {/* SEO */}
          <div className="bg-white rounded-2xl border p-6 space-y-4">
            <h2 className="font-semibold text-gray-900">SEO</h2>
            <Field label="SEO Title">
              <input type="text" value={form.seoTitle} onChange={(e) => setForm((f) => ({ ...f, seoTitle: e.target.value }))} className={inputClass} placeholder="Optimized title for search engines" />
            </Field>
            <Field label="SEO Description">
              <textarea rows={2} value={form.seoDesc} onChange={(e) => setForm((f) => ({ ...f, seoDesc: e.target.value }))} className={inputClass + " resize-none"} placeholder="Meta description..." />
            </Field>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          <div className="bg-white rounded-2xl border p-6 space-y-4">
            <h2 className="font-semibold text-gray-900">Pricing</h2>
            <Field label="Price (USD)" required>
              <input type="number" step="0.01" value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))} className={inputClass} placeholder="0.00" required />
            </Field>
            <Field label="Discount Price">
              <input type="number" step="0.01" value={form.discountPrice} onChange={(e) => setForm((f) => ({ ...f, discountPrice: e.target.value }))} className={inputClass} placeholder="Leave empty for no discount" />
            </Field>
          </div>

          <div className="bg-white rounded-2xl border p-6 space-y-4">
            <h2 className="font-semibold text-gray-900">Inventory</h2>
            <Field label="Stock Quantity">
              <input type="number" value={form.stockQty} onChange={(e) => setForm((f) => ({ ...f, stockQty: e.target.value }))} className={inputClass} />
            </Field>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={form.isAvailable} onChange={(e) => setForm((f) => ({ ...f, isAvailable: e.target.checked }))} className="rounded text-primary-600" />
              <span className="text-sm text-gray-700">Available for sale</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={form.isFeatured} onChange={(e) => setForm((f) => ({ ...f, isFeatured: e.target.checked }))} className="rounded text-primary-600" />
              <span className="text-sm text-gray-700">Featured product</span>
            </label>
          </div>

          <div className="bg-white rounded-2xl border p-6 space-y-4">
            <h2 className="font-semibold text-gray-900">Shipping</h2>
            <Field label="Weight (kg)">
              <input type="number" step="0.01" value={form.weight} onChange={(e) => setForm((f) => ({ ...f, weight: e.target.value }))} className={inputClass} />
            </Field>
            <Field label="Dimensions">
              <input type="text" value={form.dimensions} onChange={(e) => setForm((f) => ({ ...f, dimensions: e.target.value }))} className={inputClass} placeholder="L × W × H mm" />
            </Field>
            <Field label="Warranty">
              <input type="text" value={form.warranty} onChange={(e) => setForm((f) => ({ ...f, warranty: e.target.value }))} className={inputClass} placeholder="e.g. 2 Years" />
            </Field>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-colors disabled:opacity-60"
          >
            {loading ? "Saving..." : product ? "Update Product" : "Create Product"}
          </button>
        </div>
      </div>
    </form>
  );
}
