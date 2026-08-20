export function Pagination({
  page,
  pageSize,
  total,
  onChange,
}: {
  page: number;
  pageSize: number;
  total: number;
  onChange: (page: number) => void;
}) {
  const totalPages = Math.ceil(total / pageSize);
  if (totalPages <= 1) return null;

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, padding: "12px 16px" }}>
      <button
        className="pg-btn"
        onClick={() => onChange(Math.max(1, page - 1))}
        disabled={page <= 1}
      >
        ‹
      </button>
      <span style={{ fontSize: 13, color: "var(--t2)" }}>
        หน้า {page}/{totalPages} <span style={{ opacity: 0.6 }}>({total})</span>
      </span>
      <button
        className="pg-btn"
        onClick={() => onChange(Math.min(totalPages, page + 1))}
        disabled={page >= totalPages}
      >
        ›
      </button>
    </div>
  );
}
