export type CustomerPlan = "Starter" | "Interactive" | "Premium";
export type CustomerStatus = "active" | "pending" | "paused";
export type BillingStatus = "manual" | "invoice_sent" | "paid" | "past_due";

export type CustomerAccount = {
  id: string;
  businessName: string;
  plan: CustomerPlan;
  status: CustomerStatus;
  billingStatus: BillingStatus;
  siteUrl: string;
  requestUpdateUrl: string;
  stripeInvoiceUrl?: string;
  stripePortalUrl?: string;
  contactName: string;
  contactEmail: string;
  businessPhone: string;
  notes: string;
};

export const customers: CustomerAccount[] = [
  {
    id: "colattao",
    businessName: "Colattao",
    plan: "Interactive",
    status: "active",
    billingStatus: "manual",
    siteUrl: "https://colattao-cafe-rush.vercel.app",
    requestUpdateUrl: "/request-update",
    stripeInvoiceUrl: "",
    stripePortalUrl: "",
    contactName: "Owner / Manager",
    contactEmail: "",
    businessPhone: "",
    notes:
      "Flagship proof of concept for QR menu, game, living receipt direction, and customer request intake.",
  },
];

export function getCustomerById(id: string) {
  return customers.find((customer) => customer.id === id);
}
