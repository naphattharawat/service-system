// Google Sheets/Excel date serials count days since 1899-12-30 (the classic
// "Lotus 1-2-3 epoch" that both Excel and Sheets inherited).
const SHEETS_EPOCH_MS = Date.UTC(1899, 11, 30);
const MS_PER_DAY = 86400000;

/**
 * The legacy backend read cells via GAS's SpreadsheetApp, which auto-boxes
 * date-formatted cells into real JS Date objects; `formatDate()` in gs.txt
 * branched on `val instanceof Date`. The Sheets API instead returns a raw
 * numeric serial for any date-formatted cell (with UNFORMATTED_VALUE /
 * SERIAL_NUMBER rendering) and a string for anything else — so `number`
 * here plays the same role `instanceof Date` did in the original code.
 */
export function formatDateCell(value: unknown): string {
  if (value === null || value === undefined || value === "") return "";
  if (typeof value === "number") {
    // Whole-day serials (orderDate/needDate/doneDate have no time component)
    // land on exact-UTC midnight, so UTC getters give the right calendar date
    // regardless of server timezone.
    const date = new Date(SHEETS_EPOCH_MS + value * MS_PER_DAY);
    const d = String(date.getUTCDate()).padStart(2, "0");
    const m = String(date.getUTCMonth() + 1).padStart(2, "0");
    const y = date.getUTCFullYear();
    return `${d}/${m}/${y}`;
  }
  return String(value).toString();
}

/** Best-effort timestamp (ms) out of a raw Sheets cell, mirroring `new Date(data[i][3]).getTime()`. */
export function dateCellToTimestamp(value: unknown): number {
  if (typeof value === "number") {
    return SHEETS_EPOCH_MS + value * MS_PER_DAY;
  }
  const t = new Date(String(value ?? "")).getTime();
  return Number.isNaN(t) ? 0 : t;
}

/** Formats "now" as a Sheets-parseable datetime string (Asia/Bangkok), for USER_ENTERED writes. */
export function nowAsSheetsDateTime(): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Bangkok",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(new Date());
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "00";
  return `${get("year")}-${get("month")}-${get("day")} ${get("hour")}:${get("minute")}:${get("second")}`;
}
