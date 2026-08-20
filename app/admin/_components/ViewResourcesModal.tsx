"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/components/Modal";
import { api } from "@/lib/api-client";
import type { Job, ResourceUsageRow } from "@/types";

export function ViewResourcesModal({
  job,
  onClose,
}: {
  job: Job | null;
  onClose: () => void;
}) {
  const [items, setItems] = useState<ResourceUsageRow[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!job) return;
    let cancelled = false;
    api
      .getResources()
      .then((data) => {
        if (cancelled) return;
        setItems(data.filter((r) => String(r.jobId) === String(job.id)));
      })
      .catch(() => {
        if (!cancelled) setError(true);
      });
    return () => {
      cancelled = true;
    };
  }, [job]);

  return (
    <Modal id="viewResModal" open={!!job} onClose={onClose}>
      <h3 style={{ margin: "0 0 4px", fontSize: 17, fontWeight: 600, color: "var(--t1)", display: "flex", alignItems: "center", gap: 7 }}>
        <span className="material-symbols-rounded" style={{ color: "#10b981", margin: 0, fontSize: 17 }}>task_alt</span>
        งาน <span style={{ color: "var(--p)" }}>#{job?.id}</span>
        <span style={{ fontSize: 12, background: "rgba(16,185,129,.12)", color: "#10b981", padding: "3px 10px", borderRadius: 99, fontWeight: 500 }}>
          เสร็จสิ้น
        </span>
        <button
          onClick={onClose}
          style={{ marginLeft: "auto", background: "rgba(0,0,0,.06)", border: "none", cursor: "pointer", color: "var(--t2)", fontSize: 26, lineHeight: 1, padding: "2px 6px", borderRadius: 8, flexShrink: 0 }}
        >
          ×
        </button>
      </h3>
      <div style={{ fontSize: 13, color: "var(--t3)", marginBottom: 16 }}>
        {items && items.length > 0 && items[0].doneDate ? `วันที่เสร็จ: ${items[0].doneDate}` : ""}
      </div>
      <span className="section-label" style={{ display: "flex", alignItems: "center", gap: 5 }}>
        <span className="material-symbols-rounded" style={{ fontSize: 13, margin: 0, color: "var(--p)" }}>inventory_2</span> ทรัพยากรที่ใช้
      </span>
      <div style={{ marginTop: 10 }}>
        {items === null && !error && <div style={{ fontSize: 13, color: "var(--t3)" }}>กำลังโหลด...</div>}
        {error && <div style={{ color: "#ef4444", fontSize: 13 }}>โหลดไม่สำเร็จ</div>}
        {items && items.length === 0 && (
          <div style={{ textAlign: "center", color: "var(--t3)", padding: "16px 0", fontSize: 14 }}>ไม่มีข้อมูลทรัพยากร</div>
        )}
        {items &&
          items.map((r, i) => {
            const detail = [r.qty ? `จำนวน ${r.qty}` : "", r.color, r.size].filter(Boolean).join(" · ");
            return (
              <div
                key={`${r.name}-${i}`}
                style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", marginBottom: 7, background: "rgba(255,255,255,.5)", border: "0.5px solid var(--g-b2)", borderRadius: 12 }}
              >
                <span className="material-symbols-rounded" style={{ fontSize: 16, color: "var(--p)", margin: 0, flexShrink: 0 }}>inventory_2</span>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: "var(--t1)" }}>{r.name}</div>
                  {detail && <div style={{ fontSize: 13, color: "var(--t3)" }}>{detail}</div>}
                </div>
              </div>
            );
          })}
      </div>
      <div style={{ marginTop: 18 }}>
        <span className="section-label">หมายเหตุ</span>
        <div style={{ marginTop: 8, fontSize: 15, color: "var(--t2)", background: "rgba(255,255,255,.5)", border: "1px solid var(--g-b2)", borderRadius: "var(--r1)", padding: "10px 14px", minHeight: 36 }}>
          {job?.note || "-"}
        </div>
      </div>
      <button className="btn neutral" style={{ marginTop: 20 }} onClick={onClose}>ปิด</button>
    </Modal>
  );
}
