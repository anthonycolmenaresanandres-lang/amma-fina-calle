export type PaymentStatus = "paid" | "partial" | "overdue" | "comped";
export type AttendanceStatus = "present" | "absent" | "late" | "excused" | "unmarked";

export type CoachOrg = {
  id: string;
  slug: string;
  name: string;
  sport: string;
  venueName: string | null;
};

export type CoachTeam = {
  id: string;
  name: string;
  ageGroup: string | null;
  seasonLabel: string | null;
};

export type CoachPayment = {
  id: string;
  periodLabel: string;
  monthlyDue: number | string;
  amountPaid: number | string;
  balance: number | string;
  status: PaymentStatus;
  notes: string | null;
  updatedAt: string;
};

export type CoachPlayer = {
  id: string;
  teamId: string;
  teamName: string;
  fullName: string;
  position: string | null;
  jerseyNumber: string | null;
  status: "active" | "inactive" | "trial";
  notes: string | null;
  payment: CoachPayment | null;
};

export type CoachSession = {
  id: string;
  teamId: string;
  title: string;
  sessionDate: string;
  sessionType: string;
  startsAt: string | null;
  location: string | null;
};

export type CoachAttendance = {
  sessionId: string;
  playerId: string;
  status: AttendanceStatus;
  note: string | null;
  updatedAt: string;
};

export type CoachNote = {
  id: string;
  playerId: string;
  playerName: string;
  category: string;
  note: string;
  createdAt: string;
};

export type CoachDemoData = {
  org: CoachOrg;
  teams: CoachTeam[];
  players: CoachPlayer[];
  sessions: CoachSession[];
  attendance: CoachAttendance[];
  notes: CoachNote[];
};

export type ImportRosterRow = {
  playerName: string;
  team?: string;
  periodLabel?: string;
  monthlyDue?: number | string;
  amountPaid?: number | string;
  balance?: number | string;
  status?: string;
  position?: string;
  jerseyNumber?: string;
  notes?: string;
  paymentNotes?: string;
};
