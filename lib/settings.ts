import { config } from "./config";
import { appendRow, ensureSheetExists, getSheetValues, updateCell } from "./sheets";
import { checkTodayHoliday } from "./calendar";
import type { SystemStatus } from "@/types";

async function ensureSettingsSheet(): Promise<void> {
  await ensureSheetExists(config.sheet1.id(), config.sheet1.settingsTab(), [
    ["key", "value"],
    ["systemOpen", "false"],
  ]);
}

// systemOpen only changes when an admin flips the manual override, so a
// short cache avoids a Sheets round-trip on every single page load; a stale
// read is at most this many seconds behind an admin's toggle.
const OPEN_CACHE_TTL_MS = 15000;
let openCache: { value: boolean; expiresAt: number } | null = null;

async function readIsOpen(): Promise<boolean> {
  if (openCache && Date.now() < openCache.expiresAt) return openCache.value;

  await ensureSettingsSheet();
  const rows = await getSheetValues(config.sheet1.id(), config.sheet1.settingsTab());

  let isOpen = false;
  for (let i = 1; i < rows.length; i++) {
    if (String(rows[i][0]).trim() === "systemOpen") {
      isOpen = String(rows[i][1]).trim() === "true";
      break;
    }
  }

  openCache = { value: isOpen, expiresAt: Date.now() + OPEN_CACHE_TTL_MS };
  return isOpen;
}

export async function getSystemStatus(): Promise<SystemStatus> {
  const [isOpen, holidayResult] = await Promise.all([
    readIsOpen(),
    checkTodayHoliday().catch(() => ({ holiday: false, holidayName: "" })),
  ]);

  return { open: isOpen, holiday: holidayResult.holiday, holidayName: holidayResult.holidayName };
}

export async function setSystemStatus(open: boolean): Promise<{ open: boolean }> {
  await ensureSettingsSheet();
  const sheetId = config.sheet1.id();
  const tab = config.sheet1.settingsTab();
  const rows = await getSheetValues(sheetId, tab);

  let found = false;
  for (let i = 1; i < rows.length; i++) {
    if (String(rows[i][0]).trim() === "systemOpen") {
      await updateCell(sheetId, tab, i + 1, 2, open ? "true" : "false");
      found = true;
      break;
    }
  }
  if (!found) {
    await appendRow(sheetId, tab, ["systemOpen", open ? "true" : "false"]);
  }

  // Update the cache immediately so the admin who just toggled it (and
  // anyone hitting this same server process) sees the change right away
  // instead of waiting out the TTL.
  openCache = { value: open, expiresAt: Date.now() + OPEN_CACHE_TTL_MS };
  return { open };
}
