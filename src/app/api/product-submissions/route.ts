import { NextRequest, NextResponse } from "next/server";
import { safeDb } from "@/lib/prisma";
import { sendMail } from "@/lib/mail";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";
import { escapeHtml, generateSubmissionReference } from "@/lib/utils";

const NOTIFY_EMAIL = process.env.PRODUCT_SUBMISSION_NOTIFY_EMAIL || "dr.mohamed8181@gmail.com";
const SUPPORT_EMAIL = process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "dr.mohamed8181@gmail.com";
const REVIEW_TIMEFRAME = "2–3 business days";
const MIN_PHOTOS = 3;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface SubmittedImage {
  publicId: string;
  label: string;
}

function str(v: unknown) {
  return typeof v === "string" ? v.trim() : "";
}

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    if (!checkRateLimit(`sell-submit:${ip}`, 5, 60 * 60 * 1000)) {
      return NextResponse.json({ error: "Too many submissions. Please try again later." }, { status: 429 });
    }

    const body = await req.json();

    // Honeypot: real users never fill this hidden field. Pretend success so bots don't learn.
    if (str(body.website)) {
      return NextResponse.json({ success: true, referenceNumber: generateSubmissionReference() });
    }

    const productName = str(body.productName);
    const category = str(body.category);
    const manufacturer = str(body.manufacturer);
    const condition = str(body.condition);
    const fullName = str(body.fullName);
    const email = str(body.email);
    const phone = str(body.phone);

    if (!productName) return NextResponse.json({ error: "Product name is required." }, { status: 400 });
    if (!category) return NextResponse.json({ error: "Product category is required." }, { status: 400 });
    if (!manufacturer) return NextResponse.json({ error: "Manufacturer or brand is required." }, { status: 400 });
    if (!condition) return NextResponse.json({ error: "Condition is required." }, { status: 400 });
    if (!fullName) return NextResponse.json({ error: "Full name is required." }, { status: 400 });
    if (!email || !EMAIL_RE.test(email)) return NextResponse.json({ error: "A valid email address is required." }, { status: 400 });
    if (!phone) return NextResponse.json({ error: "Phone number is required." }, { status: 400 });

    const images: SubmittedImage[] = Array.isArray(body.images)
      ? body.images
          .filter((img: unknown): img is SubmittedImage =>
            !!img && typeof img === "object" && typeof (img as SubmittedImage).publicId === "string"
          )
          .map((img: SubmittedImage) => ({ publicId: img.publicId, label: str(img.label) || "Photo" }))
      : [];

    if (images.length < MIN_PHOTOS) {
      return NextResponse.json({ error: `Please upload at least ${MIN_PHOTOS} product photos.` }, { status: 400 });
    }

    const consents = {
      consentAccurate: Boolean(body.consentAccurate),
      consentRight: Boolean(body.consentRight),
      consentNoPhi: Boolean(body.consentNoPhi),
      consentContact: Boolean(body.consentContact),
      consentPrivacy: Boolean(body.consentPrivacy),
    };
    if (Object.values(consents).some((v) => !v)) {
      return NextResponse.json({ error: "Please confirm all required consent checkboxes." }, { status: 400 });
    }

    const referenceNumber = generateSubmissionReference();

    const submission = await safeDb((db) =>
      db.productSubmission.create({
        data: {
          referenceNumber,
          productName,
          category,
          manufacturer,
          modelNumber: str(body.modelNumber) || null,
          modelYear: str(body.modelYear) || null,
          serialNumber: str(body.serialNumber) || null,
          quantity: str(body.quantity) || null,
          condition,
          location: str(body.location) || null,
          description: str(body.description) || null,
          askingPrice: str(body.askingPrice) || null,
          images: images as unknown as object,
          fullName,
          companyName: str(body.companyName) || null,
          email,
          phone,
          preferredContact: str(body.preferredContact) || null,
          country: str(body.country) || null,
          city: str(body.city) || null,
          comments: str(body.comments) || null,
          ...consents,
        },
      })
    );

    if (!submission) {
      return NextResponse.json({ error: "We could not save your submission. Please try again." }, { status: 500 });
    }

    const detailsHtml = `
      <table style="width:100%;border-collapse:collapse;font-size:14px;">
        <tr><td style="padding:4px 12px 4px 0;color:#667;">Product</td><td><strong>${escapeHtml(productName)}</strong></td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#667;">Category</td><td>${escapeHtml(category)}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#667;">Manufacturer</td><td>${escapeHtml(manufacturer)}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#667;">Condition</td><td>${escapeHtml(condition)}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#667;">Photos</td><td>${images.length} uploaded</td></tr>
      </table>`;

    await sendMail({
      to: NOTIFY_EMAIL,
      subject: `New Product Submission ${referenceNumber} — ${productName}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;">
          <h2 style="color:#0a2540;">New Product Submission</h2>
          <p style="color:#667;">Reference: <strong>${escapeHtml(referenceNumber)}</strong></p>
          ${detailsHtml}
          <h3 style="color:#0a2540;margin-top:20px;">Submitted By</h3>
          <table style="width:100%;border-collapse:collapse;font-size:14px;">
            <tr><td style="padding:4px 12px 4px 0;color:#667;">Name</td><td>${escapeHtml(fullName)}</td></tr>
            <tr><td style="padding:4px 12px 4px 0;color:#667;">Company</td><td>${escapeHtml(str(body.companyName) || "—")}</td></tr>
            <tr><td style="padding:4px 12px 4px 0;color:#667;">Email</td><td>${escapeHtml(email)}</td></tr>
            <tr><td style="padding:4px 12px 4px 0;color:#667;">Phone</td><td>${escapeHtml(phone)}</td></tr>
          </table>
          <p style="margin-top:20px;">Review this submission and its photos in the admin panel under Product Submissions.</p>
        </div>`,
      text: `New product submission ${referenceNumber} for "${productName}" from ${fullName} (${email}). Review it in the admin panel.`,
    });

    await sendMail({
      to: email,
      subject: `We've Received Your Submission — ${referenceNumber}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;">
          <h2 style="color:#0a2540;">Thank You, ${escapeHtml(fullName)}</h2>
          <p style="color:#333;line-height:1.6;">
            Thank you for submitting your product to MP MedPharma. Our team will review the information and
            images provided. If your submission meets our requirements, a member of our team will contact you
            using the details provided.
          </p>
          <table style="width:100%;border-collapse:collapse;font-size:14px;margin:20px 0;background:#f8f9fa;border-radius:8px;">
            <tr><td style="padding:10px 14px;color:#667;">Reference Number</td><td style="padding:10px 14px;"><strong>${escapeHtml(referenceNumber)}</strong></td></tr>
            <tr><td style="padding:10px 14px;color:#667;">Estimated Review</td><td style="padding:10px 14px;">${REVIEW_TIMEFRAME}</td></tr>
            <tr><td style="padding:10px 14px;color:#667;">Product</td><td style="padding:10px 14px;">${escapeHtml(productName)}</td></tr>
          </table>
          <p style="color:#667;font-size:13px;line-height:1.6;">
            Submitting a product does not guarantee acceptance, purchase, resale, or a quotation. All submissions
            are subject to review, verification, applicable regulations, product condition, market demand, and
            MP MedPharma approval.
          </p>
          <p style="color:#667;font-size:13px;">Questions? Contact us at ${escapeHtml(SUPPORT_EMAIL)}.</p>
        </div>`,
      text: `Thank you for submitting your product to MP MedPharma (reference ${referenceNumber}). Estimated review time: ${REVIEW_TIMEFRAME}. Questions? ${SUPPORT_EMAIL}`,
    });

    return NextResponse.json({
      success: true,
      referenceNumber,
      estimatedReview: REVIEW_TIMEFRAME,
      supportEmail: SUPPORT_EMAIL,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
