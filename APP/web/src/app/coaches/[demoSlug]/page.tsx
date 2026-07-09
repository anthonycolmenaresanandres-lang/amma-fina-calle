import { isSupabaseConfigured } from "@/lib/supabase/config";
import {
  addCoachPlayerNote,
  getCoachDemoData,
  setCoachAttendanceStatus,
  upsertCoachPlayerPayment,
} from "@/lib/coaches/actions";
import {
  attendanceFor,
  dollars,
  paymentTone,
  summarizeCoachDemo,
} from "@/lib/coaches/metrics";
import type { AttendanceStatus, CoachDemoData, CoachPlayer } from "@/lib/coaches/types";
import { Button, Card, Field, SectionHeading, StatusPill, fieldClass } from "@/components/ui";
import ExcelPanel from "./ExcelPanel";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ demoSlug: string }>;
};

const PAYMENT_OPTIONS = ["paid", "partial", "overdue", "comped"] as const;
const ATTENDANCE_OPTIONS: AttendanceStatus[] = ["present", "late", "absent", "excused", "unmarked"];

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-dvh bg-[#030405] px-4 py-6 text-[#f4f6f7] sm:px-6 lg:px-8">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_20%_8%,rgba(127,209,162,0.14),transparent_26%),radial-gradient(circle_at_78%_0%,rgba(216,179,109,0.12),transparent_24%),linear-gradient(145deg,#020303_0%,#0d1012_45%,#050607_100%)]" />
      <div className="mx-auto w-full max-w-7xl">{children}</div>
    </main>
  );
}

function SetupNotice() {
  return (
    <Shell>
      <Card className="mx-auto mt-20 max-w-lg text-center">
        <p className="text-xs uppercase tracking-[0.32em] text-[#d8b36d]">Coach Ops</p>
        <h1 className="mt-4 text-2xl font-semibold">Setup needed</h1>
        <p className="mt-3 text-sm leading-6 text-[#aeb7bd]">
          Supabase is not configured or the Coach Ops migration has not been applied yet.
          Apply migration <span className="text-[#eef2f4]">0010_coach_ops_demo.sql</span> before
          using this hidden demo route.
        </p>
      </Card>
    </Shell>
  );
}

function StatCard({
  label,
  value,
  hint,
  tone = "neutral",
}: {
  label: string;
  value: string;
  hint: string;
  tone?: "success" | "danger" | "neutral" | "gold";
}) {
  return (
    <Card className="min-h-32">
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7f8a91]">{label}</p>
        <StatusPill tone={tone}>{hint}</StatusPill>
      </div>
      <p className="mt-5 text-3xl font-semibold text-[#f4f6f7]">{value}</p>
    </Card>
  );
}

function Hero({ data }: { data: CoachDemoData }) {
  const summary = summarizeCoachDemo(data);

  return (
    <header className="grid gap-4 lg:grid-cols-[1.35fr_0.65fr]">
      <Card className="overflow-hidden">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#d8b36d]">
          Fina Calle OS / Coach Ops
        </p>
        <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold text-[#f4f6f7] sm:text-4xl">{data.org.name}</h1>
            <p className="mt-2 text-sm leading-6 text-[#aeb7bd]">
              Volleyball-first internal demo for roster control, dues tracking, attendance, and
              coach notes. Hidden route only; no checkout or parent portal in v1.
            </p>
          </div>
          <StatusPill tone="success">{data.org.sport}</StatusPill>
        </div>
      </Card>
      <Card>
        <SectionHeading hint={data.org.venueName ?? "Demo venue"}>Collection pulse</SectionHeading>
        <p className="mt-5 text-4xl font-semibold text-[#9fe5bd]">{summary.collectionRate}%</p>
        <p className="mt-2 text-sm text-[#aeb7bd]">
          {dollars(summary.collected)} collected against {dollars(summary.expected)} expected.
        </p>
      </Card>
    </header>
  );
}

function NewPlayerForm({ demoSlug }: { demoSlug: string }) {
  return (
    <Card className="space-y-4">
      <SectionHeading>Add player</SectionHeading>
      <form action={upsertCoachPlayerPayment.bind(null, demoSlug)} className="grid gap-3 sm:grid-cols-2">
        <Field name="fullName" placeholder="Player name" required />
        <Field name="position" placeholder="Position" />
        <Field name="jerseyNumber" placeholder="Jersey #" />
        <Field name="periodLabel" defaultValue="Current month" />
        <Field name="monthlyDue" type="number" min="0" step="0.01" placeholder="Monthly due" />
        <Field name="amountPaid" type="number" min="0" step="0.01" placeholder="Amount paid" />
        <select name="paymentStatus" defaultValue="overdue" className={fieldClass}>
          {PAYMENT_OPTIONS.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
        <Field name="paymentNotes" placeholder="Payment notes" />
        <Field name="playerNotes" placeholder="Coach notes" className="sm:col-span-2" />
        <div className="sm:col-span-2">
          <Button type="submit" variant="primary">
            Save player
          </Button>
        </div>
      </form>
    </Card>
  );
}

function PaymentEditor({ demoSlug, player }: { demoSlug: string; player: CoachPlayer }) {
  return (
    <form
      action={upsertCoachPlayerPayment.bind(null, demoSlug)}
      className="grid gap-2 lg:grid-cols-[1.2fr_0.8fr_0.7fr_0.7fr_0.75fr_auto]"
    >
      <input type="hidden" name="playerId" value={player.id} />
      <Field name="fullName" defaultValue={player.fullName} aria-label={`${player.fullName} name`} />
      <Field name="position" defaultValue={player.position ?? ""} aria-label={`${player.fullName} position`} />
      <Field name="jerseyNumber" defaultValue={player.jerseyNumber ?? ""} aria-label={`${player.fullName} jersey`} />
      <Field
        name="monthlyDue"
        type="number"
        min="0"
        step="0.01"
        defaultValue={String(player.payment?.monthlyDue ?? 0)}
        aria-label={`${player.fullName} monthly due`}
      />
      <Field
        name="amountPaid"
        type="number"
        min="0"
        step="0.01"
        defaultValue={String(player.payment?.amountPaid ?? 0)}
        aria-label={`${player.fullName} amount paid`}
      />
      <input type="hidden" name="periodLabel" value={player.payment?.periodLabel ?? "Current month"} />
      <input type="hidden" name="playerNotes" value={player.notes ?? ""} />
      <input type="hidden" name="paymentNotes" value={player.payment?.notes ?? ""} />
      <div className="flex gap-2">
        <select
          name="paymentStatus"
          defaultValue={player.payment?.status ?? "overdue"}
          className={fieldClass}
          aria-label={`${player.fullName} payment status`}
        >
          {PAYMENT_OPTIONS.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
        <Button type="submit" variant="subtle">
          Save
        </Button>
      </div>
    </form>
  );
}

function RosterTable({ demoSlug, data }: { demoSlug: string; data: CoachDemoData }) {
  return (
    <Card className="space-y-4">
      <SectionHeading hint={`${data.players.length} players`}>Roster + payments</SectionHeading>
      <div className="space-y-3">
        {data.players.map((player) => (
          <div key={player.id} className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-3">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-[#eef2f4]">{player.fullName}</p>
                <p className="text-xs text-[#7f8a91]">
                  {player.teamName} / {player.position ?? "Position open"} / #{player.jerseyNumber ?? "-"}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <StatusPill tone={paymentTone(player.payment?.status ?? "overdue")}>
                  {player.payment?.status ?? "overdue"}
                </StatusPill>
                <span className="text-xs text-[#aeb7bd]">
                  Balance {dollars(player.payment?.balance)}
                </span>
              </div>
            </div>
            <PaymentEditor demoSlug={demoSlug} player={player} />
          </div>
        ))}
      </div>
    </Card>
  );
}

function AttendanceBoard({ demoSlug, data }: { demoSlug: string; data: CoachDemoData }) {
  const session = data.sessions[0];
  if (!session) {
    return (
      <Card>
        <SectionHeading>Attendance</SectionHeading>
        <p className="mt-4 text-sm text-[#aeb7bd]">No training sessions are seeded yet.</p>
      </Card>
    );
  }

  return (
    <Card className="space-y-4">
      <SectionHeading hint={`${session.sessionDate} / ${session.startsAt ?? "time TBD"}`}>
        Attendance
      </SectionHeading>
      <div>
        <p className="text-base font-semibold text-[#eef2f4]">{session.title}</p>
        <p className="text-sm text-[#7f8a91]">{session.location ?? "Location TBD"}</p>
      </div>
      <div className="space-y-2">
        {data.players.map((player) => {
          const current = attendanceFor(data.attendance, session.id, player.id);
          return (
            <div
              key={player.id}
              className="grid gap-2 rounded-2xl border border-white/[0.07] bg-white/[0.025] p-3 sm:grid-cols-[1fr_auto]"
            >
              <div>
                <p className="text-sm font-semibold text-[#eef2f4]">{player.fullName}</p>
                <p className="text-xs uppercase tracking-[0.14em] text-[#7f8a91]">{current}</p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {ATTENDANCE_OPTIONS.map((status) => (
                  <form
                    key={status}
                    action={setCoachAttendanceStatus.bind(null, demoSlug, session.id, player.id, status)}
                  >
                    <Button
                      type="submit"
                      variant={current === status ? "success" : "subtle"}
                      className="px-3 py-1.5 text-[0.58rem]"
                    >
                      {status}
                    </Button>
                  </form>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

function NotesPanel({ demoSlug, data }: { demoSlug: string; data: CoachDemoData }) {
  return (
    <Card className="space-y-4">
      <SectionHeading hint="player development">Coach notes</SectionHeading>
      <div className="grid gap-3">
        {data.players.map((player) => (
          <form
            key={player.id}
            action={addCoachPlayerNote.bind(null, demoSlug, player.id)}
            className="grid gap-2 rounded-2xl border border-white/[0.07] bg-white/[0.025] p-3 sm:grid-cols-[0.8fr_1fr_auto]"
          >
            <select name="category" defaultValue="coach note" className={fieldClass}>
              <option value="coach note">coach note</option>
              <option value="skill">skill</option>
              <option value="attendance">attendance</option>
              <option value="payment">payment</option>
              <option value="follow-up">follow-up</option>
            </select>
            <Field name="note" placeholder={`Note for ${player.fullName}`} required />
            <Button type="submit" variant="subtle">
              Add
            </Button>
          </form>
        ))}
      </div>
      <div className="space-y-2">
        {data.notes.slice(0, 8).map((note) => (
          <div key={note.id} className="rounded-2xl border border-white/[0.07] bg-[#0b0f12]/70 p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-semibold text-[#eef2f4]">{note.playerName}</p>
              <StatusPill tone="neutral">{note.category}</StatusPill>
            </div>
            <p className="mt-2 text-sm leading-6 text-[#aeb7bd]">{note.note}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}

export async function generateMetadata({ params }: PageProps) {
  const { demoSlug } = await params;
  return { title: `Coach Ops / ${demoSlug} | Fina Calle OS` };
}

export default async function CoachOpsPage({ params }: PageProps) {
  const { demoSlug } = await params;

  if (!isSupabaseConfigured) return <SetupNotice />;

  const data = await getCoachDemoData(demoSlug);
  if (!data?.org) return <SetupNotice />;

  const summary = summarizeCoachDemo(data);

  return (
    <Shell>
      <div className="space-y-5">
        <Hero data={data} />
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Expected dues" value={dollars(summary.expected)} hint="month" />
          <StatCard label="Collected" value={dollars(summary.collected)} hint="paid" tone="success" />
          <StatCard label="Open balance" value={dollars(summary.balance)} hint="owed" tone="danger" />
          <StatCard label="Overdue players" value={String(summary.overdue.length)} hint="watch" tone="gold" />
        </section>
        <section className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-5">
            <ExcelPanel demoSlug={demoSlug} players={data.players} />
            <RosterTable demoSlug={demoSlug} data={data} />
          </div>
          <div className="space-y-5">
            <NewPlayerForm demoSlug={demoSlug} />
            <AttendanceBoard demoSlug={demoSlug} data={data} />
            <NotesPanel demoSlug={demoSlug} data={data} />
          </div>
        </section>
      </div>
    </Shell>
  );
}
