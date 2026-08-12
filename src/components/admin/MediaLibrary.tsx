"use client";

import { useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { Upload, Trash2, Copy } from "lucide-react";

interface MediaFile {
  id: string;
  url: string;
  name: string;
  folder: string | null;
  createdAt: string;
}

export default function MediaLibrary({ initialFiles }: { initialFiles: MediaFile[] }) {
  const [files, setFiles] = useState(initialFiles);
  const [uploading, setUploading] = useState(false);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList?.length) return;
    setUploading(true);

    Array.from(fileList).forEach((file) => {
      const reader = new FileReader();
      reader.onload = async (ev) => {
        const data = ev.target?.result as string;
        try {
          const res = await fetch("/api/upload", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ data, folder: "medpharma/library", name: file.name }),
          });
          if (res.ok) {
            const { url, mediaId } = await res.json();
            if (mediaId) {
              setFiles((prev) => [
                { id: mediaId, url, name: file.name, folder: "medpharma/library", createdAt: new Date().toISOString() },
                ...prev,
              ]);
            }
            toast.success(`${file.name} uploaded.`);
          } else {
            toast.error(`Failed to upload ${file.name}.`);
          }
        } catch {
          toast.error(`Failed to upload ${file.name}.`);
        } finally {
          setUploading(false);
        }
      };
      reader.readAsDataURL(file);
    });

    e.target.value = "";
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this file? This cannot be undone.")) return;
    const prev = files;
    setFiles((cur) => cur.filter((f) => f.id !== id));
    const res = await fetch(`/api/admin/media/${id}`, { method: "DELETE" });
    if (!res.ok) {
      setFiles(prev);
      toast.error("Failed to delete file.");
    }
  };

  const handleCopy = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success("URL copied to clipboard.");
  };

  return (
    <div>
      <label className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white text-sm font-semibold rounded-xl hover:bg-primary-700 transition-colors cursor-pointer mb-6">
        <Upload size={16} />
        {uploading ? "Uploading..." : "Upload Images"}
        <input type="file" accept="image/*" multiple className="hidden" onChange={handleUpload} disabled={uploading} />
      </label>

      {files.length === 0 ? (
        <div className="bg-white rounded-2xl border p-16 text-center">
          <Upload size={40} className="text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No media files yet. Upload your first image above.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {files.map((file) => (
            <div key={file.id} className="group relative bg-white rounded-2xl border overflow-hidden">
              <div className="relative aspect-square bg-gray-50">
                <Image src={file.url} alt={file.name} fill className="object-contain p-2" sizes="200px" />
              </div>
              <div className="p-2.5">
                <p className="text-xs text-gray-600 truncate">{file.name}</p>
              </div>
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                <button onClick={() => handleCopy(file.url)} className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-gray-700 hover:text-primary-600" title="Copy URL">
                  <Copy size={14} />
                </button>
                <button onClick={() => handleDelete(file.id)} className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-gray-700 hover:text-red-600" title="Delete">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
