export type OwnerAccountProfile = {
  billingName: string | null;
  contactName: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  billingAddress: string[];
};

/** Explicit display allowlist. Never pass the raw restaurant or payment record. */
export function ownerAccountProfile(input: unknown): OwnerAccountProfile | null {
  if (!input || typeof input !== "object" || Array.isArray(input)) return null;
  const row = input as Record<string, unknown>;
  const text = (key: string) => typeof row[key] === "string" ? row[key].trim() || null : null;
  const locality = [text("billing_address_city"), text("billing_address_state"), text("billing_address_postal_code")].filter(Boolean).join(" ");
  return {
    billingName: text("billing_name"),
    contactName: text("contact_name"),
    contactEmail: text("contact_email"),
    contactPhone: text("contact_phone"),
    billingAddress: [text("billing_address_line1"), locality || null, text("billing_address_country")].filter((line): line is string => Boolean(line)),
  };
}
