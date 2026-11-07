// Timezone-aware "today" boundaries without a date library. Computes the UTC
// instant range [start, end) for the current calendar day in an IANA timezone,
// plus the YYYY-MM-DD label. DST transitions at midnight are an irrelevant edge
// for traffic reporting.

export const TRAFFIC_TIMEZONE = "America/New_York";
export function requireTrafficTimezone(timezone: string): void {
  if (timezone !== TRAFFIC_TIMEZONE) throw new Error("UNSUPPORTED_TRAFFIC_TIMEZONE");
}
function tzOffsetMs(timeZone: string, atMs: number): number {
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const parts = dtf.formatToParts(new Date(atMs));
  const map: Record<string, number> = {};
  for (const part of parts) {
    if (part.type !== "literal") map[part.type] = Number(part.value);
  }
  // Some environments render midnight hour as 24; normalize to 0.
  const hour = map.hour === 24 ? 0 : map.hour;
  const asIfUtc = Date.UTC(map.year, map.month - 1, map.day, hour, map.minute, map.second);
  return asIfUtc - atMs;
}

export function dateStringInTz(timeZone: string, atMs: number): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(atMs));
}

function dayStartMs(dateStr: string, timeZone: string): number {
  const asUtc = new Date(`${dateStr}T00:00:00Z`).getTime();
  const offset = tzOffsetMs(timeZone, asUtc);
  return asUtc - offset;
}

function addDays(dateStr: string, days: number): string {
  const next = new Date(`${dateStr}T00:00:00Z`);
  next.setUTCDate(next.getUTCDate() + days);
  return next.toISOString().slice(0, 10);
}

export interface TodayRange {
  dateStr: string;
  startMs: number;
  endMs: number;
}

export function todayRange(timeZone: string, now: number = Date.now()): TodayRange {
  requireTrafficTimezone(timeZone);
  const dateStr = dateStringInTz(timeZone, now);
  const startMs = dayStartMs(dateStr, timeZone);
  const endMs = dayStartMs(addDays(dateStr, 1), timeZone);
  return { dateStr, startMs, endMs };
}

export function previousEasternDay(now = Date.now()): { date: string; range: { since: string; until: string } } {
  const date = addDays(dateStringInTz("America/New_York", now), -1);
  const day = { dateStr: date, startMs: dayStartMs(date, "America/New_York"), endMs: dayStartMs(addDays(date, 1), "America/New_York") };
  return { date: day.dateStr, range: { since: new Date(day.startMs).toISOString(), until: new Date(day.endMs).toISOString() } };
}

export function calendarRange(first: string, last: string, timezone = "America/New_York") {
  requireTrafficTimezone(timezone);
  // Inclusive calendar labels -> half-open UTC instants. Never assume 24h days.
  for (const date of [first, last]) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(Date.parse(date)) ||
      new Date(`${date}T00:00:00Z`).toISOString().slice(0, 10) !== date) throw new Error("INVALID_CALENDAR_DATE");
  }
  if (last < first) throw new Error("INVALID_DATE_ORDER");
  if ((Date.parse(last) - Date.parse(first)) / 86400000 >= 90) throw new Error("RANGE_TOO_LONG");
  const since = new Date(dayStartMs(first, timezone)).toISOString();
  const until = new Date(dayStartMs(addDays(last, 1), timezone)).toISOString();
  validateRange({ since, until }, timezone);
  return { since, until, timezone, first, last, mode: "complete-calendar-days" as const };
}
export function completeDays(days = 30, now = Date.now(), timezone = "America/New_York") {
  requireTrafficTimezone(timezone);
  if (!Number.isInteger(days) || days < 1 || days > 90) throw new Error("INVALID_DAY_COUNT");
  const today = dateStringInTz(timezone, now);
  return calendarRange(addDays(today, -days), addDays(today, -1), timezone);
}
export function validateRange(range: { since: string; until: string }, timezone: string) {
  requireTrafficTimezone(timezone);
  new Intl.DateTimeFormat("en-US", { timeZone: timezone });
  const start = Date.parse(range.since), end = Date.parse(range.until);
  if (!/T.*(?:Z|[+-]\d{2}:\d{2})$/.test(range.since) || !/T.*(?:Z|[+-]\d{2}:\d{2})$/.test(range.until) ||
    !Number.isFinite(start) || !Number.isFinite(end) || end <= start || end - start > 91 * 86400000) throw new Error("INVALID_RANGE");
}

export type TrafficDeliveryPeriod = {
  kind: "daily" | "weekly";
  first: string;
  last: string;
  range: ReturnType<typeof calendarRange>;
};

export function dailyTrafficPeriod(now = Date.now()): TrafficDeliveryPeriod {
  const { date } = previousEasternDay(now);
  return { kind: "daily", first: date, last: date, range: calendarRange(date, date) };
}

/** A single whole-period query is required: never sum daily distinct identifiers. */
export function previousCompletedWeek(now = Date.now()): TrafficDeliveryPeriod {
  const today = dateStringInTz(TRAFFIC_TIMEZONE, now);
  const weekday = new Date(`${today}T00:00:00Z`).getUTCDay();
  const monday = addDays(today, -((weekday + 6) % 7));
  const first = addDays(monday, -7), last = addDays(monday, -1);
  return { kind: "weekly", first, last, range: calendarRange(first, last) };
}

export const TRAFFIC_SCHEDULES = ["0 12 * * *", "0 13 * * *", "17 12 * * *", "17 13 * * *", "17 16 * * *", "17 20 * * *", "17 23 * * *"];

/** The delivery date, not the worker's eventual execution date, owns the batch. */
export function trafficPeriodsForDeliveryDate(date: string): TrafficDeliveryPeriod[] {
  calendarRange(date, date); // strict calendar validation
  if (date < "2026-10-18") return [];
  const anchor = dayStartMs(date, TRAFFIC_TIMEZONE) + 12 * 3600000;
  const periods: TrafficDeliveryPeriod[] = [];
  if (date <= "2026-10-31") periods.push(dailyTrafficPeriod(anchor));
  if (new Date(`${date}T00:00:00Z`).getUTCDay() === 1) periods.push(previousCompletedWeek(anchor));
  return periods;
}

export type TrafficScheduleDecision = {
  state: "deliver" | "skip" | "missed";
  reason?: "not_due" | "inactive_dst_slot" | "before_delivery_window" | "delivery_window_missed";
  periods: TrafficDeliveryPeriod[];
};

export function trafficScheduleDecision(schedule: string, deliveryDate: string, now = Date.now()): TrafficScheduleDecision {
  if (!TRAFFIC_SCHEDULES.includes(schedule)) throw new Error("INVALID_SCHEDULE");
  const periods = trafficPeriodsForDeliveryDate(deliveryDate);
  const today = dateStringInTz(TRAFFIC_TIMEZONE, now);
  if (deliveryDate > today) throw new Error("FUTURE_DELIVERY_DATE");
  if (!periods.length) return { state: "skip", reason: "not_due", periods };
  // At 08:00 on a DST-transition date the midnight offset may differ.
  // Anchor at local noon, then ask Intl which UTC hour represents 08:00.
  const noon = dayStartMs(deliveryDate, TRAFFIC_TIMEZONE) + 12 * 3600000;
  const offset = tzOffsetMs(TRAFFIC_TIMEZONE, noon);
  const slot = 8 - offset / 3600000;
  const cronHour = Number(schedule.split(" ")[1]);
  if ([12, 13].includes(cronHour) && cronHour !== slot) return { state: "skip", reason: "inactive_dst_slot", periods };
  const hour = Number(new Intl.DateTimeFormat("en-US", {
    timeZone: TRAFFIC_TIMEZONE, hour: "2-digit", hourCycle: "h23",
  }).format(new Date(now)));
  if (deliveryDate < today || hour >= 18) return { state: "missed", reason: "delivery_window_missed", periods };
  if (hour < 8) return { state: "skip", reason: "before_delivery_window", periods };
  return { state: "deliver", periods };
}

/** Compatibility for existing offline callers. Routes always supply a date. */
export function scheduledTrafficPeriods(schedule: string, now = Date.now()): TrafficDeliveryPeriod[] | null {
  const decision = trafficScheduleDecision(schedule, dateStringInTz(TRAFFIC_TIMEZONE, now), now);
  return decision.state === "deliver" ? decision.periods : null;
}
