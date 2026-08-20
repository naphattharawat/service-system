export function statusColor(status: string): { sc: string; sb: string } {
  if (status.includes("เสร็จ")) return { sc: "#10b981", sb: "rgba(16, 185, 129, 0.15)" };
  if (status.includes("กำลัง")) return { sc: "#3b82f6", sb: "rgba(59, 130, 246, 0.15)" };
  if (status.includes("ยกเลิก")) return { sc: "#ef4444", sb: "rgba(239, 68, 68, 0.15)" };
  return { sc: "#f59e0b", sb: "rgba(245, 158, 11, 0.15)" };
}

// Ported from old/index.html.txt's inline `.replace(/[က-￿...]/g,'')` —
// strips stray emoji/symbols some status values picked up historically while
// leaving Thai (which sits below က) and ASCII untouched.
export function cleanStatusLabel(status: string): string {
  return status.replace(/[က-￿]/g, "").trim();
}

export interface CountdownBadge {
  text: string;
  bg: string;
  color: string;
}

// Ported from old/index.html.txt#cdBadge — days-remaining-until-needDate pill.
export function needDateBadge(needDate: string, status: string): CountdownBadge | null {
  if (!needDate || needDate === "-") return null;
  if (status && (status.includes("เสร็จ") || status.includes("ยกเลิก"))) return null;
  const p = needDate.split("/");
  if (p.length < 3) return null;
  const need = new Date(Number(p[2]), Number(p[1]) - 1, Number(p[0]));
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const days = Math.round((need.getTime() - today.getTime()) / 86400000);

  if (days < 0) return { text: `เกิน ${Math.abs(days)} วัน`, bg: "rgba(127,0,0,.20)", color: "#600" };
  if (days === 0) return { text: "วันนี้!", bg: "rgba(239,68,68,.15)", color: "#991b1b" };
  if (days === 1) return { text: "เหลือ 1 วัน", bg: "rgba(239,68,68,.15)", color: "#991b1b" };
  if (days <= 3) return { text: `เหลือ ${days} วัน`, bg: "rgba(249,115,22,.15)", color: "#9a3412" };
  return { text: `เหลือ ${days} วัน`, bg: "rgba(99,102,241,.12)", color: "#3730a3" };
}
