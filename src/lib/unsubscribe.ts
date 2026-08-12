import crypto from "crypto";

function getSecret() {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) throw new Error("NEXTAUTH_SECRET is not set");
  return secret;
}

export function createUnsubscribeToken(email: string) {
  return crypto.createHmac("sha256", getSecret()).update(email.toLowerCase()).digest("hex");
}

export function verifyUnsubscribeToken(email: string, token: string) {
  const expected = Buffer.from(createUnsubscribeToken(email));
  const actual = Buffer.from(token || "");
  if (expected.length !== actual.length) return false;
  return crypto.timingSafeEqual(expected, actual);
}
