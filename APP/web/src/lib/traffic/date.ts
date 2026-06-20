// Timezone-aware "today" boundaries without a date library. Computes the UTC
// instant range [start, end) for the current calendar day in an IANA timezone,
// plus the YYYY-MM-DD label. DST transitions at midnight are an irrelevant edge
// for traffic reporting.

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
  const dateStr = dateStringInTz(timeZone, now);
  const startMs = dayStartMs(dateStr, timeZone);
  const endMs = dayStartMs(addDays(dateStr, 1), timeZone);
  return { dateStr, startMs, endMs };
}
