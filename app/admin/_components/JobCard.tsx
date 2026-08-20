import { cleanStatusLabel, needDateBadge, statusColor } from "@/lib/status-colors";
import type { Job } from "@/types";

export function JobCard({ job, onManage }: { job: Job; onManage: (job: Job) => void }) {
  const { sc, sb } = statusColor(job.status);
  const badge = needDateBadge(job.needDate, job.status);
  const fileUrls = job.fileUrl ? job.fileUrl.split(", ").filter(Boolean) : [];

  return (
    <div className="glass-card" style={{ borderLeft: `6px solid ${sc}`, padding: 0, overflow: "hidden" }}>
      <div style={{ padding: "14px 16px 0" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
          <span style={{ fontSize: 22, fontWeight: 800, color: "var(--p)", lineHeight: 1.2, flexShrink: 0 }}>#{job.id}</span>
          <div style={{ display: "flex", alignItems: "center", gap: 4, flexWrap: "nowrap" }}>
            {badge && (
              <span style={{ background: badge.bg, color: badge.color, padding: "3px 10px", borderRadius: 99, fontSize: 11, fontWeight: 600 }}>
                {badge.text}
              </span>
            )}
            <span style={{ background: sb, color: sc, padding: "6px 12px", borderRadius: 99, fontSize: 13, fontWeight: 700 }}>
              {cleanStatusLabel(job.status)}
            </span>
          </div>
        </div>
        <div style={{ fontSize: 17, fontWeight: 600, color: "var(--t2)", lineHeight: 1.4, marginTop: 2, wordBreak: "break-word", overflowWrap: "break-word" }}>
          {job.fullName}
        </div>
        <div style={{ fontSize: 17, color: "var(--t2)", marginTop: 0, wordBreak: "break-word", overflowWrap: "break-word" }}>
          · {job.jobType || "-"}
        </div>
      </div>
      <div style={{ padding: "6px 16px 6px", fontSize: 16, lineHeight: 1.8, wordBreak: "break-word", overflowWrap: "break-word" }}>
        <b>กลุ่มภารกิจ:</b> {job.group || "-"}<br />
        <b>หน่วยงาน:</b> {job.department || "-"}<br />
        <b>เบอร์ติดต่อ:</b> {job.phone || "-"}
      </div>
      <div style={{ padding: "8px 16px", fontSize: 16, lineHeight: 1.8, wordBreak: "break-word", overflowWrap: "break-word", borderTop: "1px solid rgba(255,255,255,.12)" }}>
        <b>วันที่สั่ง:</b> {job.orderDate || "-"}<br />
        <b>วันที่ต้องการ:</b> {job.needDate || "-"}<br />
        <b>รายละเอียด:</b> {job.detail || "-"}<br />
        {fileUrls.map((url, i) => (
          <a
            key={url}
            href={url} target="_blank" rel="noreferrer"
            style={{ color: "var(--p)", textDecoration: "none", fontWeight: 700, display: "inline-flex", alignItems: "center", marginTop: 8, background: "rgba(37,99,235,0.1)", padding: "6px 12px", borderRadius: 99 }}
          >
            <span className="material-symbols-rounded" style={{ fontSize: 16 }}>attachment</span> ไฟล์แนบ{fileUrls.length > 1 ? ` ${i + 1}` : ""}
          </a>
        ))}
      </div>
      <div style={{ height: 0.5, background: "rgba(255,255,255,.14)", margin: "0 16px" }} />
      <div style={{ padding: "8px 16px 14px", fontSize: 16, lineHeight: 1.8, wordBreak: "break-word", overflowWrap: "break-word" }}>
        <b>ผู้รับผิดชอบ:</b> {job.owner || "-"}<br />
        <b>หมายเหตุ:</b> {job.note || "-"}
        <button className="btn secondary" style={{ marginTop: 10, marginBottom: 0, padding: 12, borderRadius: 14 }} onClick={() => onManage(job)}>
          <span className="material-symbols-rounded">settings</span> จัดการงาน
        </button>
      </div>
    </div>
  );
}
