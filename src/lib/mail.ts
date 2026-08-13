import nodemailer from "nodemailer";
import { Resend } from "resend";

function getTransport() {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) return null;
  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT) || 587,
    secure: Number(SMTP_PORT) === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
}

export async function sendMail(options: { to: string; subject: string; html: string; text?: string }) {
  const from = process.env.SMTP_FROM || process.env.SMTP_USER;

  if (process.env.RESEND_API_KEY) {
    try {
      const resend = new Resend(process.env.RESEND_API_KEY);
      const { error } = await resend.emails.send({
        from: from || "onboarding@resend.dev",
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      });
      if (error) {
        console.error("Failed to send email via Resend:", error);
        return false;
      }
      return true;
    } catch (e) {
      console.error("Failed to send email via Resend:", e);
      return false;
    }
  }

  const transport = getTransport();
  if (!transport) {
    console.error("Email not sent: no email provider is configured (set RESEND_API_KEY or SMTP_*).");
    return false;
  }
  try {
    await transport.sendMail({
      from,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    });
    return true;
  } catch (e) {
    console.error("Failed to send email:", e);
    return false;
  }
}
