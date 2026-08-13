import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Mail, Phone, MapPin, Building2 } from "lucide-react";
import { safeDb } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import { getSignedImageUrl } from "@/lib/cloudinary";
import SubmissionStatusControl from "@/components/admin/SubmissionStatusControl";

export const metadata: Metadata = { title: "Product Submission – Admin" };

interface SubmittedImage { publicId: string; label: string }

function Field({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div>
      <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-0.5">{label}</p>
      <p className="text-sm text-gray-900">{value}</p>
    </div>
  );
}

export default async function AdminProductSubmissionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const submission = await safeDb((db) => db.productSubmission.findUnique({ where: { id } }));
  if (!submission) notFound();

  const images = Array.isArray(submission.images) ? (submission.images as unknown as SubmittedImage[]) : [];
  const signedImages = images.map((img) => ({ ...img, url: getSignedImageUrl(img.publicId) }));

  return (
    <div>
      <Link href="/admin/product-submissions" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-6">
        <ArrowLeft size={15} /> Back to Product Submissions
      </Link>

      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{submission.productName}</h1>
          <p className="text-gray-400 text-sm">{submission.referenceNumber} · Submitted {formatDate(submission.createdAt)}</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Product Information</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Category" value={submission.category} />
              <Field label="Manufacturer" value={submission.manufacturer} />
              <Field label="Model Number" value={submission.modelNumber} />
              <Field label="Model Year" value={submission.modelYear} />
              <Field label="Serial Number" value={submission.serialNumber} />
              <Field label="Quantity" value={submission.quantity} />
              <Field label="Condition" value={submission.condition} />
              <Field label="Location" value={submission.location} />
              <Field label="Asking Price" value={submission.askingPrice} />
            </div>
            {submission.description && (
              <div className="mt-4">
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Description</p>
                <p className="text-sm text-gray-700 leading-relaxed bg-gray-50 rounded-lg p-3">{submission.description}</p>
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl border p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Photos ({signedImages.length})</h2>
            {signedImages.length === 0 ? (
              <p className="text-sm text-gray-400">No photos were uploaded.</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {signedImages.map((img) => (
                  <a key={img.publicId} href={img.url} target="_blank" rel="noopener noreferrer" className="block group">
                    <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-50 border border-gray-100">
                      {/* eslint-disable-next-line @next/next/no-img-element -- signed, short-lived Cloudinary URL; not suitable for next/image optimization caching */}
                      <img src={img.url} alt={img.label} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    </div>
                    <p className="text-xs text-gray-500 mt-1 truncate">{img.label}</p>
                  </a>
                ))}
              </div>
            )}
          </div>

          {submission.comments && (
            <div className="bg-white rounded-2xl border p-6">
              <h2 className="font-semibold text-gray-900 mb-3">Additional Comments</h2>
              <p className="text-sm text-gray-700 leading-relaxed">{submission.comments}</p>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl border p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Submitted By</h2>
            <div className="space-y-3">
              <p className="font-medium text-gray-900">{submission.fullName}</p>
              {submission.companyName && (
                <p className="flex items-center gap-2 text-sm text-gray-600"><Building2 size={14} className="text-gray-400" /> {submission.companyName}</p>
              )}
              <a href={`mailto:${submission.email}`} className="flex items-center gap-2 text-sm text-gray-600 hover:text-primary-600">
                <Mail size={14} className="text-gray-400" /> {submission.email}
              </a>
              <a href={`tel:${submission.phone}`} className="flex items-center gap-2 text-sm text-gray-600 hover:text-primary-600">
                <Phone size={14} className="text-gray-400" /> {submission.phone}
              </a>
              {(submission.city || submission.country) && (
                <p className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin size={14} className="text-gray-400" /> {[submission.city, submission.country].filter(Boolean).join(", ")}
                </p>
              )}
              {submission.preferredContact && (
                <p className="text-xs text-gray-400">Prefers {submission.preferredContact}</p>
              )}
            </div>
          </div>

          <SubmissionStatusControl id={submission.id} status={submission.status} adminNotes={submission.adminNotes} />
        </div>
      </div>
    </div>
  );
}
