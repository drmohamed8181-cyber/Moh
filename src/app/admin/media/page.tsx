import { Metadata } from "next";
import { safeDb } from "@/lib/prisma";
import MediaLibrary from "@/components/admin/MediaLibrary";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Media Library – Admin" };

export default async function AdminMediaPage() {
  const rows = await safeDb((db) => db.mediaFile.findMany({ orderBy: { createdAt: "desc" } })) ?? [];
  const files = rows.map((f) => ({
    id: f.id,
    url: f.url,
    name: f.name,
    folder: f.folder,
    createdAt: f.createdAt.toISOString(),
  }));

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-900">Media Library</h1>
        <p className="text-slate-400 text-sm mt-0.5">{files.length} files</p>
      </div>
      <MediaLibrary initialFiles={files} />
    </div>
  );
}
