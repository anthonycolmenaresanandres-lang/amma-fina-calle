/** Delivery evidence only. A saved row or email never grants execution authority. */
export function requestReceipt(persisted: boolean, emailSent: boolean) {
  return {
    ok: persisted || emailSent,
    receiptStatus: persisted ? "saved" : emailSent ? "email_only" : "unconfirmed",
    ...(persisted || emailSent ? {} : {
      reason: "delivery_unconfirmed",
      detail: "We couldn't confirm delivery. Keep your details and try again, or contact Fina Calle.",
    }),
  };
}
