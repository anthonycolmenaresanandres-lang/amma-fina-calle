"use client";

import { useMemo, useRef, useState } from "react";
import ExcelJS from "exceljs";
import { importRosterPayments } from "@/lib/coaches/actions";
import { playerExportRow } from "@/lib/coaches/metrics";
import type { CoachPlayer, ImportRosterRow } from "@/lib/coaches/types";
import { Button, Card, SectionHeading, fieldClass } from "@/components/ui";

type Props = {
  demoSlug: string;
  players: CoachPlayer[];
};

type RawRow = Record<string, unknown>;

const EXPORT_COLUMNS = [
  "Player Name",
  "Team",
  "Position",
  "Jersey #",
  "Period",
  "Monthly Due",
  "Amount Paid",
  "Balance",
  "Status",
  "Notes",
  "Payment Notes",
];

function normalizeKey(key: string): string {
  return key.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function pick(row: RawRow, keys: string[]): string {
  const normalized = new Map(
    Object.entries(row).map(([key, value]) => [normalizeKey(key), String(value ?? "").trim()]),
  );
  for (const key of keys) {
    const value = normalized.get(key);
    if (value) return value;
  }
  return "";
}

function toNumber(value: string): number {
  const parsed = Number(value.replace(/[$,]/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

function parseCsv(text: string): RawRow[] {
  const lines = text.split(/\r?\n/).filter((line) => line.trim());
  const headers = splitCsvLine(lines[0] ?? "");
  return lines.slice(1).map((line) => {
    const cells = splitCsvLine(line);
    return Object.fromEntries(headers.map((header, index) => [header, cells[index] ?? ""]));
  });
}

function splitCsvLine(line: string): string[] {
  const cells: string[] = [];
  let current = "";
  let quoted = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    const next = line[i + 1];

    if (char === '"' && quoted && next === '"') {
      current += '"';
      i += 1;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === "," && !quoted) {
      cells.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }

  cells.push(current.trim());
  return cells;
}

async function workbookRows(file: File): Promise<RawRow[]> {
  if (file.name.toLowerCase().endsWith(".csv")) {
    return parseCsv(await file.text());
  }

  const buffer = await file.arrayBuffer();
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);
  const worksheet = workbook.worksheets[0];
  if (!worksheet) return [];

  const headers: string[] = [];
  const rows: RawRow[] = [];

  worksheet.eachRow((row, rowNumber) => {
    const values = Array.isArray(row.values) ? row.values.slice(1) : [];
    if (rowNumber === 1) {
      values.forEach((value) => headers.push(String(value ?? "")));
      return;
    }

    const record: RawRow = {};
    values.forEach((value, index) => {
      record[headers[index] ?? `Column ${index + 1}`] = value;
    });
    rows.push(record);
  });

  return rows;
}

function normalizeRows(rawRows: RawRow[]): ImportRosterRow[] {
  return rawRows
    .map((row) => {
      const playerName = pick(row, ["playername", "name", "athlete", "athletename"]);
      const monthlyDue = toNumber(pick(row, ["monthlydue", "due", "dues", "amountdue"]));
      const amountPaid = toNumber(pick(row, ["amountpaid", "paid", "payment", "collected"]));
      const status = pick(row, ["status", "paymentstatus"]);
      const balance = toNumber(pick(row, ["balance", "owed", "amountowed"]));

      return {
        playerName,
        team: pick(row, ["team", "teamname"]),
        periodLabel: pick(row, ["period", "periodlabel", "month"]) || "Current month",
        monthlyDue,
        amountPaid,
        balance,
        status,
        position: pick(row, ["position", "role"]),
        jerseyNumber: pick(row, ["jerseynumber", "jersey", "number"]),
        notes: pick(row, ["notes", "playernotes"]),
        paymentNotes: pick(row, ["paymentnotes", "billingnotes"]),
      };
    })
    .filter((row) => row.playerName);
}

export default function ExcelPanel({ demoSlug, players }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [rows, setRows] = useState<ImportRosterRow[]>([]);
  const [fileName, setFileName] = useState<string>("No file selected");

  const rowsJson = useMemo(() => JSON.stringify(rows), [rows]);

  async function handleFile(file: File) {
    setFileName(file.name);
    const rawRows = await workbookRows(file);
    setRows(normalizeRows(rawRows));
  }

  async function exportRoster() {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Roster Payments");
    worksheet.columns = EXPORT_COLUMNS.map((column) => ({
      header: column,
      key: column,
      width: Math.max(column.length + 4, 14),
    }));
    players.map(playerExportRow).forEach((row) => worksheet.addRow(row));
    worksheet.getRow(1).font = { bold: true };

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer as BlobPart], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `coach-ops-${demoSlug}-roster-payments.xlsx`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <Card className="space-y-4">
      <SectionHeading hint="xlsx or csv">Excel bridge</SectionHeading>
      <div className="grid gap-3 lg:grid-cols-[1fr_auto] lg:items-end">
        <label className="block">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-[#7f8a91]">
            Import roster + payments
          </span>
          <input
            ref={fileRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            className={fieldClass}
            onChange={(event) => {
              const file = event.currentTarget.files?.[0];
              if (file) void handleFile(file);
            }}
          />
        </label>
        <Button type="button" variant="ghost" onClick={() => void exportRoster()}>
          Export report
        </Button>
      </div>
      <div className="flex flex-wrap items-center gap-3 text-sm text-[#aeb7bd]">
        <span>{fileName}</span>
        <span className="text-[#7f8a91]">Parsed rows: {rows.length}</span>
      </div>
      <form action={importRosterPayments.bind(null, demoSlug)} className="flex flex-wrap gap-2">
        <input type="hidden" name="rowsJson" value={rowsJson} />
        <Button type="submit" variant="primary" disabled={rows.length === 0}>
          Import into demo
        </Button>
        <Button
          type="button"
          variant="subtle"
          onClick={() => {
            setRows([]);
            setFileName("No file selected");
            if (fileRef.current) fileRef.current.value = "";
          }}
        >
          Clear file
        </Button>
      </form>
      <p className="text-xs leading-5 text-[#7f8a91]">
        Accepted headers: player name, team, monthly due, amount paid, balance, status,
        position, jersey number, notes, and payment notes.
      </p>
    </Card>
  );
}
