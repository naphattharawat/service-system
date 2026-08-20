import type { SystemStatus } from "@/types";

// Ported from old/index.html.txt#isBusinessHours (client-side fallback check).
export function isBusinessHours(): boolean {
  const now = new Date();
  const thai = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Bangkok" }));
  const day = thai.getDay();
  const mins = thai.getHours() * 60 + thai.getMinutes();
  return day >= 1 && day <= 5 && mins >= 8 * 60 + 30 && mins < 16 * 60 + 30;
}

export interface HomeGateResult {
  showHome: boolean;
  holiday: boolean;
  holidayName: string;
}

/**
 * Ported from the DOMContentLoaded system-status branching in old/index.html.txt:
 * an admin's manual "open" override skips holiday/business-hours checks entirely;
 * otherwise a holiday always wins over the business-hours clock, and business
 * hours are checked last.
 */
export function computeHomeGate(status: Pick<SystemStatus, "open" | "holiday" | "holidayName"> | null): HomeGateResult {
  if (status?.open) return { showHome: true, holiday: false, holidayName: "" };
  if (status?.holiday) return { showHome: false, holiday: true, holidayName: status.holidayName };
  if (!isBusinessHours()) return { showHome: false, holiday: false, holidayName: "" };
  return { showHome: true, holiday: false, holidayName: "" };
}
