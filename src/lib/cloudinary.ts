import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export { cloudinary };

export async function uploadImage(file: string, folder = "medpharma") {
  const result = await cloudinary.uploader.upload(file, {
    folder,
    transformation: [{ quality: "auto", fetch_format: "auto" }],
  });
  return { url: result.secure_url, publicId: result.public_id };
}

export async function deleteImage(publicId: string) {
  await cloudinary.uploader.destroy(publicId);
}

/**
 * Uploads with Cloudinary's "authenticated" delivery type so the asset has no
 * public URL — it can only be viewed via a signed, time-limited URL (see
 * getSignedImageUrl). Used for seller-submitted photos, which may contain
 * serial numbers or other identifying details that shouldn't be publicly indexable.
 */
export async function uploadPrivateImage(file: string, folder = "medpharma/sell-submissions") {
  const result = await cloudinary.uploader.upload(file, {
    folder,
    type: "authenticated",
    transformation: [{ quality: "auto", fetch_format: "auto" }],
  });
  return { publicId: result.public_id };
}

export function getSignedImageUrl(publicId: string) {
  return cloudinary.url(publicId, {
    type: "authenticated",
    sign_url: true,
    secure: true,
  });
}

export async function deletePrivateImage(publicId: string) {
  await cloudinary.uploader.destroy(publicId, { type: "authenticated" });
}
