// The reply the Messages page pre-fills when the admin opens a customer message.
// It is only a draft: the admin edits it, and a price in it still has to be
// confirmed with "This is a price quote" before it is sent.

export interface DraftProduct {
  name: string;
  /** Product.retailPrice: the partner's suggested end-user price. */
  endUserPrice: number | null;
  warranty: string | null;
  isAvailable: boolean;
}

/** Inquiry messages built by buildInquiryHref carry the product's link and name on their own lines. */
export function inquiryProductRef(message: string) {
  return {
    slug: message.match(/^Link: \/products\/([\w-]+)\s*$/m)?.[1] ?? null,
    name: message.match(/^Product: (.+?)\s*$/m)?.[1] ?? null,
    // "I'm looking for a unit similar to this sold product": that unit's price doesn't apply.
    similar: /similar to this sold product/i.test(message),
  };
}

function formatPrice(n: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: Number.isInteger(n) ? 0 : 2,
  }).format(n);
}

export function buildReplyDraft({ name, product, similar }: { name: string; product: DraftProduct | null; similar: boolean }) {
  const firstName = name.trim().split(/\s+/)[0] || "there";
  const lines = [`Hi ${firstName},`, ""];

  if (product && similar) {
    lines.push(
      `Thank you for your interest in the ${product.name}. That unit has been sold, but we can look for a comparable one for you.`,
      "",
      "Could you tell me which features matter most to you and your budget? I'll come back to you with the options we can offer and their prices.",
    );
  } else if (product) {
    lines.push(`Thank you for your interest in the ${product.name}.`, "");
    if (product.endUserPrice != null && product.endUserPrice > 0) {
      lines.push(`The price of the ${product.name} is ${formatPrice(product.endUserPrice)} (USD).`);
    } else {
      lines.push(`I'm confirming the current price of the ${product.name} and will send it to you shortly.`);
    }
    if (product.warranty) lines.push(`It comes with the following warranty: ${product.warranty}.`);
    lines.push(
      "",
      "Shipping and installation depend on your location; let me know if you'd like a quote for those as well.",
      "",
      "I'm happy to answer any questions about the unit.",
    );
  } else {
    lines.push(
      "Thank you for contacting MP MedPharma. I've read your message and will be glad to help.",
      "",
      "Could you share any further details about what you need? I'll get back to you with the information right away.",
    );
  }

  lines.push("", "Best regards,");
  return lines.join("\n");
}
