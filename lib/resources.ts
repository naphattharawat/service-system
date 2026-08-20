import { config } from "./config";
import { appendRow, deleteRow, ensureSheetExists, getSheetValues } from "./sheets";
import { formatDateCell } from "./date-utils";
import { HttpError, NotFoundError } from "./errors";
import type { ResourceUsageRow } from "@/types";

// Ported verbatim from old/gs.txt getOrCreateResourceSheet().
const RESOURCE_DEFAULTS = [
  "อิงค์เจ็ท A4", "อิงค์เจ็ท A3", "กระดาษ A4", "กระดาษ A3", "กระดาษ A5",
  "กระดาษโฟโต้ A4", "กระดาษโฟโต้", "กระดาษการ์ดขาว 180 แกรม", "กระดาษการ์ด",
  "กระดาษโรเนียว A4", "กระดาษโรเนียว", "กระดาษ", "สติ๊กเกอร์", "กระดาษสติ๊กเกอร์ A4",
  "พลาสติกเคลือบ A3", "พลาสติกเคลือบ A4", "พลาสติกเคลือบ A5", "พลาสติกเคลือบ",
  "อะคริลิค", "ฟิวเจอร์บอร์ด", "ใบประกาศ",
];

async function ensureResourceListSheet(): Promise<void> {
  await ensureSheetExists(config.sheet2.id(), config.sheet2.resourceListTab(), [
    ["name"],
    ...RESOURCE_DEFAULTS.map((n) => [n]),
  ]);
}

export async function getResourceList(): Promise<string[]> {
  await ensureResourceListSheet();
  const rows = await getSheetValues(config.sheet2.id(), config.sheet2.resourceListTab());
  return rows
    .slice(1)
    .map((r) => String(r[0] ?? "").trim())
    .filter(Boolean);
}

export async function addResourceItem(name: string): Promise<true> {
  const n = String(name).trim();
  if (!n) throw new HttpError(400, "ชื่อว่าง");
  await ensureResourceListSheet();
  const sheetId = config.sheet2.id();
  const tab = config.sheet2.resourceListTab();
  const rows = await getSheetValues(sheetId, tab);
  for (let i = 1; i < rows.length; i++) {
    if (String(rows[i][0]).trim() === n) throw new HttpError(400, "มีรายการนี้แล้ว");
  }
  await appendRow(sheetId, tab, [n]);
  return true;
}

export async function deleteResourceItem(name: string): Promise<true> {
  const n = String(name).trim();
  await ensureResourceListSheet();
  const sheetId = config.sheet2.id();
  const tab = config.sheet2.resourceListTab();
  const rows = await getSheetValues(sheetId, tab);
  for (let i = rows.length - 1; i >= 1; i--) {
    if (String(rows[i][0]).trim() === n) {
      await deleteRow(sheetId, tab, i + 1);
      return true;
    }
  }
  throw new NotFoundError("ไม่พบรายการ");
}

export async function getResources(owner: string, role: string): Promise<ResourceUsageRow[]> {
  const rows1 = await getSheetValues(config.sheet1.id(), config.sheet1.jobsTab());
  const ownerMap = new Map<string, string>();
  for (let i = 1; i < rows1.length; i++) {
    ownerMap.set(String(rows1[i][0]).trim(), String(rows1[i][21] ?? "").trim());
  }

  const rows2 = await getSheetValues(config.sheet2.id(), config.sheet2.resourceUsageTab());
  const result: ResourceUsageRow[] = [];

  for (let i = 1; i < rows2.length; i++) {
    const r = rows2[i];
    const jobId = String(r[0]).trim();
    const jobOwner = ownerMap.get(jobId) || "";

    if (role !== "admin" && jobOwner !== owner) continue;

    for (let j = 0; j < 3; j++) {
      const name = String(r[4 + j * 4] ?? "").trim();
      if (!name) continue;
      result.push({
        jobId,
        jobOwner,
        doneDate: r[3] ? formatDateCell(r[3]) : "",
        name,
        qty: String(r[5 + j * 4] ?? "").trim(),
        color: String(r[6 + j * 4] ?? "").trim(),
        size: String(r[7 + j * 4] ?? "").trim(),
      });
    }
  }

  return result;
}
