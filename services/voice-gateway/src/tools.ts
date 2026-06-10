// Function/tool schemas advertised to the Realtime model. The model proposes a
// call; our orchestrator runs the real action (draft-first, idempotent).

export const tools = [
  {
    type: "function",
    name: "list_services",
    description: "List the services this business offers and their durations.",
    parameters: { type: "object", properties: {}, required: [] },
  },
  {
    type: "function",
    name: "check_availability",
    description: "Get open appointment slots for a service on a given date.",
    parameters: {
      type: "object",
      properties: {
        date: { type: "string", description: "Local date as yyyy-mm-dd" },
        service: { type: "string", description: "Service name, e.g. 'Full Groom'" },
      },
      required: ["date", "service"],
    },
  },
  {
    type: "function",
    name: "hold_slot",
    description: "Create a DRAFT appointment for a chosen open slot. Does NOT book yet — you must read it back and get a verbal yes, then call confirm_booking.",
    parameters: {
      type: "object",
      properties: {
        start_iso: { type: "string", description: "Chosen slot start time, ISO 8601, exactly as offered by check_availability" },
        service: { type: "string" },
        customer_name: { type: "string" },
        customer_phone: { type: "string" },
      },
      required: ["start_iso", "service"],
    },
  },
  {
    type: "function",
    name: "confirm_booking",
    description: "Commit a held draft into the real booking system after the caller confirms. Safe to retry — it never double-books.",
    parameters: {
      type: "object",
      properties: { draft_id: { type: "string", description: "The draft_id returned by hold_slot" } },
      required: ["draft_id"],
    },
  },
] as const;

export function systemInstructions(businessName: string, kind: string, hours: string): string {
  return [
    `You are the friendly front-desk assistant for ${businessName}, a ${kind} business (hours: ${hours}).`,
    `You answer calls and BOOK APPOINTMENTS. Be warm, brief, and natural; one question at a time.`,
    `Booking flow you MUST follow: 1) find the service, 2) check_availability, 3) offer real open times,`,
    `4) hold_slot for the chosen time, 5) READ BACK the service/time/name and ask "should I book that?",`,
    `6) only after a clear yes, call confirm_booking with the draft_id. Never claim it's booked before confirm_booking succeeds.`,
    `Never invent services, prices, or open times — only use what the tools return. If a tool fails or the caller`,
    `needs something out of scope, take a message and say a team member will follow up. Always offer to help with anything else.`,
  ].join(" ");
}
