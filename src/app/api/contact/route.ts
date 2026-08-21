import { NextRequest, NextResponse } from "next/server";
import { safeDb } from "@/lib/prisma";
import { sendMail } from "@/lib/mail";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";
import { escapeHtml } from "@/lib/utils";

const NOTIFY_EMAIL = process.env.CONTACT_NOTIFY_EMAIL || process.env.PRODUCT_SUBMISSION_NOTIFY_EMAIL || "dr.mohamed8181@gmail.com";
const INQUIRY_NOTIFY_EMAIL = "info@mpmedpharma.com";
const INQUIRY_FROM_EMAIL = process.env.INQUIRY_FROM_EMAIL || process.env.SMTP_FROM;

function formatUsd(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);
}

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    if (!checkRateLimit(`contact:${ip}`, 5, 60 * 60 * 1000)) {
      return NextResponse.json({ error: "Too many messages. Please try again later." }, { status: 429 });
    }

    const { name, email, phone, jobTitle, organization, address, workLocation, subject, message, productSlug } = await req.json();
    if (!name || !email || !message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const product = productSlug
      ? await safeDb((db) => db.product.findUnique({
          where: { slug: productSlug },
          select: { name: true, dealerPrice: true, retailPrice: true },
        }))
      : null;
    const isInquiry = Boolean(product);

    if (isInquiry && (!address || !workLocation)) {
      return NextResponse.json({ error: "Address and work location are required for product inquiries" }, { status: 400 });
    }

    const finalSubject = subject || "General Inquiry";
    const saved = await safeDb((db) => db.contactMessage.create({
      data: {
        name,
        email,
        phone: phone || null,
        jobTitle: jobTitle || null,
        organization: organization || null,
        address: address || null,
        workLocation: workLocation || null,
        subject: finalSubject,
        message,
      },
    }));
    if (!saved) {
      return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }

    const notifyTo = isInquiry ? INQUIRY_NOTIFY_EMAIL : NOTIFY_EMAIL;

    const pricingRow = isInquiry
      ? `<tr><td style="padding:4px 12px 4px 0;color:#667;">Product</td><td>${escapeHtml(product!.name)}</td></tr>
         <tr><td style="padding:4px 12px 4px 0;color:#667;">My Price (dealer)</td><td>${product!.dealerPrice != null ? formatUsd(product!.dealerPrice) : "Not on file — check current distributor sheet"}</td></tr>
         <tr><td style="padding:4px 12px 4px 0;color:#667;">End User Price (retail)</td><td>${product!.retailPrice != null ? formatUsd(product!.retailPrice) : "Not on file — check current distributor sheet"}</td></tr>`
      : "";
    const pricingText = isInquiry
      ? `\nProduct: ${product!.name}\nMy Price (dealer): ${product!.dealerPrice != null ? formatUsd(product!.dealerPrice) : "Not on file"}\nEnd User Price (retail): ${product!.retailPrice != null ? formatUsd(product!.retailPrice) : "Not on file"}\n`
      : "";

    await sendMail({
      to: notifyTo,
      subject: isInquiry ? `New Pricing Inquiry: ${product!.name}` : `New Contact Message: ${finalSubject}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;">
          <h2 style="color:#0a2540;">${isInquiry ? "New Pricing Inquiry" : "New Contact Message"}</h2>
          <table style="width:100%;border-collapse:collapse;font-size:14px;">
            ${pricingRow}
            <tr><td style="padding:4px 12px 4px 0;color:#667;">Name</td><td>${escapeHtml(name)}</td></tr>
            <tr><td style="padding:4px 12px 4px 0;color:#667;">Email</td><td>${escapeHtml(email)}</td></tr>
            <tr><td style="padding:4px 12px 4px 0;color:#667;">Phone</td><td>${escapeHtml(phone || "—")}</td></tr>
            <tr><td style="padding:4px 12px 4px 0;color:#667;">Job Title</td><td>${escapeHtml(jobTitle || "—")}</td></tr>
            <tr><td style="padding:4px 12px 4px 0;color:#667;">Workplace</td><td>${escapeHtml(organization || "—")}</td></tr>
            <tr><td style="padding:4px 12px 4px 0;color:#667;">Address</td><td>${escapeHtml(address || "—")}</td></tr>
            <tr><td style="padding:4px 12px 4px 0;color:#667;">Work Location</td><td>${escapeHtml(workLocation || "—")}</td></tr>
            <tr><td style="padding:4px 12px 4px 0;color:#667;">Subject</td><td>${escapeHtml(finalSubject)}</td></tr>
          </table>
          <p style="margin-top:16px;color:#0a2540;font-weight:600;">Message</p>
          <p style="white-space:pre-line;color:#333;line-height:1.6;">${escapeHtml(message)}</p>
        </div>`,
      text: `${isInquiry ? "New pricing inquiry" : "New contact message"} from ${name} (${email}${phone ? `, ${phone}` : ""})${jobTitle ? `\nJob Title: ${jobTitle}` : ""}${organization ? `\nWorkplace: ${organization}` : ""}${address ? `\nAddress: ${address}` : ""}${workLocation ? `\nWork Location: ${workLocation}` : ""}\nSubject: ${finalSubject}\n${pricingText}\n${message}`,
    });

    // Customer-facing acknowledgement — sent regardless of email delivery success above.
    const firstName = name.split(" ")[0];
    await sendMail({
      to: email,
      from: INQUIRY_FROM_EMAIL,
      subject: isInquiry ? `We've received your inquiry — MP MedPharma` : `We've received your message — MP MedPharma`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;">
          <h2 style="color:#0a2540;">Thank you, ${escapeHtml(firstName)}!</h2>
          <p style="color:#333;line-height:1.6;">
            ${isInquiry
              ? `We've received your inquiry about the <strong>${escapeHtml(product!.name)}</strong> and a member of the MP MedPharma team will respond soon.`
              : `We've received your message and a member of the MP MedPharma team will respond soon.`}
          </p>
          <p style="color:#667;font-size:13px;margin-top:24px;">— MP MedPharma</p>
        </div>`,
      text: `Thank you, ${firstName}!\n\n${isInquiry ? `We've received your inquiry about the ${product!.name} and a member of the MP MedPharma team will respond soon.` : `We've received your message and a member of the MP MedPharma team will respond soon.`}\n\n— MP MedPharma`,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
