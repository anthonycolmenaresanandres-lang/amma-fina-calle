export type PaymentNoticeStatus = "reported" | "verified" | "rejected";

export type PaymentNotice = {
  id: string;
  amountCents: number;
  currency: string;
  ownerNote: string | null;
  referenceId: string;
  status: PaymentNoticeStatus;
  reportedAt: string;
  reviewedAt: string | null;
};

export type ZelleInstructions = {
  configured: boolean;
  recipientName: string | null;
  recipientHandle: string | null;
  qrImageUrl: string | null;
};
