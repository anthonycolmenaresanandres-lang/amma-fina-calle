import type { CoachAttendance, CoachDemoData, CoachPlayer, PaymentStatus } from "./types";

export function asMoney(value: number | string | null | undefined): number {
  const n = Number(value ?? 0);
  return Number.isFinite(n) ? n : 0;
}

export function dollars(value: number | string | null | undefined): string {
  return `$${asMoney(value).toFixed(2)}`;
}

export function paymentTone(status: PaymentStatus): "success" | "danger" | "neutral" | "gold" {
  if (status === "paid") return "success";
  if (status === "overdue") return "danger";
  if (status === "partial") return "gold";
  return "neutral";
}

export function summarizeCoachDemo(data: CoachDemoData) {
  const expected = data.players.reduce((sum, player) => sum + asMoney(player.payment?.monthlyDue), 0);
  const collected = data.players.reduce((sum, player) => sum + asMoney(player.payment?.amountPaid), 0);
  const overdue = data.players.filter((player) => player.payment?.status === "overdue");
  const partial = data.players.filter((player) => player.payment?.status === "partial");
  const paid = data.players.filter((player) => player.payment?.status === "paid");
  const comped = data.players.filter((player) => player.payment?.status === "comped");

  return {
    expected,
    collected,
    balance: Math.max(expected - collected, 0),
    overdue,
    partial,
    paid,
    comped,
    collectionRate: expected > 0 ? Math.round((collected / expected) * 100) : 0,
  };
}

export function attendanceFor(
  attendance: CoachAttendance[],
  sessionId: string,
  playerId: string,
): CoachAttendance["status"] {
  return (
    attendance.find((row) => row.sessionId === sessionId && row.playerId === playerId)?.status ??
    "unmarked"
  );
}

export function playerExportRow(player: CoachPlayer) {
  return {
    "Player Name": player.fullName,
    Team: player.teamName,
    Position: player.position ?? "",
    "Jersey #": player.jerseyNumber ?? "",
    Period: player.payment?.periodLabel ?? "Current month",
    "Monthly Due": asMoney(player.payment?.monthlyDue),
    "Amount Paid": asMoney(player.payment?.amountPaid),
    Balance: asMoney(player.payment?.balance),
    Status: player.payment?.status ?? "overdue",
    Notes: player.notes ?? "",
    "Payment Notes": player.payment?.notes ?? "",
  };
}
