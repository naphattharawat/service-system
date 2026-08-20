const FILTERS: { key: string; label: string }[] = [
  { key: "all", label: "ทั้งหมด" },
  { key: "รอ", label: "รอจัดการ" },
  { key: "กำลัง", label: "กำลังดำเนินการ" },
  { key: "เสร็จ", label: "เสร็จสิ้น" },
  { key: "ยกเลิก", label: "ยกเลิก" },
];

export function FilterPills({
  active,
  counts,
  onChange,
}: {
  active: string;
  counts: Record<string, number>;
  onChange: (key: string) => void;
}) {
  return (
    <div
      id="filterPillsRow"
      style={{ display: "flex", gap: 6, marginBottom: 12, overflowX: "auto", paddingBottom: 4, scrollbarWidth: "none" }}
    >
      {FILTERS.map((f) => (
        <button
          key={f.key}
          onClick={() => onChange(f.key)}
          className={`filter-btn${active === f.key ? " active" : ""}`}
          style={{ whiteSpace: "nowrap", flexShrink: 0 }}
        >
          {f.label} ({counts[f.key] ?? 0})
        </button>
      ))}
    </div>
  );
}
