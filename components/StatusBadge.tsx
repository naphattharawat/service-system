function badgeClass(status: string): string {
  if (status.includes("เสร็จ")) return "badge badge-done";
  if (status.includes("กำลัง")) return "badge badge-doing";
  if (status.includes("ยกเลิก")) return "badge badge-cancel";
  return "badge badge-wait";
}

export function StatusBadge({ status }: { status: string }) {
  return <span className={badgeClass(status)}>{status}</span>;
}
