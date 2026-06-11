import "server-only";

const RESEND_ENDPOINT = "https://api.resend.com/emails";
const FALLBACK_RECIPIENT = "anthonycolmenaresanandres@gmail.com";

function slugify(input: string): string {
  return (
    input
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
      .slice(0, 80) || "lead"
  );
}

export async function sendPitchEmail(opts: {
  businessName: string;
  sheetBase64: string;
  mockupBase64: string;
}): Promise<{ sent: boolean }> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.REQUESTS_FROM_EMAIL;
  const recipient = process.env.REQUESTS_NOTIFICATION_EMAIL ?? FALLBACK_RECIPIENT;

  if (!apiKey || !from || !recipient) return { sent: false };

  const slug = slugify(opts.businessName);

  try {
    const response = await fetch(RESEND_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [recipient],
        subject: `Pitch pack — ${opts.businessName}`,
        text: `Fina Calle pitch pack for ${opts.businessName} — sheet + mockup attached.`,
        attachments: [
          { filename: `${slug}-pitch.png`, content: opts.sheetBase64 },
          { filename: `${slug}-mockup.png`, content: opts.mockupBase64 },
        ],
      }),
    });

    if (!response.ok) {
      console.error("[lead-arcade] pitch email failed", response.status);
      return { sent: false };
    }
    return { sent: true };
  } catch (error) {
    console.error("[lead-arcade] pitch email threw", error);
    return { sent: false };
  }
}
