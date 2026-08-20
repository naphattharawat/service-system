import type { Job } from "@/types";

const R = 54;
const CIRCUMFERENCE = 2 * Math.PI * R;

interface Slice {
  key: string;
  count: number;
  color: string;
  label: string;
}

export function AdminDonutChart({ jobs }: { jobs: Job[] }) {
  if (!jobs.length) return null;

  const counts = { wait: 0, doing: 0, done: 0, cancel: 0 };
  jobs.forEach((j) => {
    const s = j.status || "";
    if (s.includes("รอ")) counts.wait++;
    else if (s.includes("กำลัง")) counts.doing++;
    else if (s.includes("เสร็จ")) counts.done++;
    else if (s.includes("ยกเลิก")) counts.cancel++;
  });

  const total = jobs.length;
  const slices: Slice[] = [
    { key: "wait", count: counts.wait, color: "#e8c060", label: "รอจัดการ" },
    { key: "doing", count: counts.doing, color: "var(--p)", label: "กำลังดำเนินการ" },
    { key: "done", count: counts.done, color: "#50c890", label: "เสร็จสิ้น" },
    { key: "cancel", count: counts.cancel, color: "#d07070", label: "ยกเลิก" },
  ];

  let offset = 0;
  const arcs = slices.map((sl) => {
    const arc = (sl.count / total) * CIRCUMFERENCE;
    const gap = total > 1 && sl.count > 0 ? 3 : 0;
    const dash = Math.max(arc - gap, 0);
    const dashArray = `${dash} ${CIRCUMFERENCE - dash}`;
    const dashOffset = -offset;
    offset += arc;
    return { ...sl, dashArray, dashOffset };
  });

  return (
    <div id="chartContainer" className="card" style={{ padding: 16, marginBottom: 10 }}>
      <div className="noise" />
      <span className="section-label">สรุปภาพรวม</span>
      <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
        <div style={{ position: "relative", width: 100, height: 100, flexShrink: 0, margin: "0 auto" }}>
          <svg width={100} height={100} viewBox="0 0 140 140">
            <circle cx={70} cy={70} r={R} fill="none" stroke="var(--g-b2)" strokeWidth={18} />
            {arcs.map((a) => (
              <circle
                key={a.key}
                cx={70} cy={70} r={R} fill="none" stroke={a.color} strokeWidth={18}
                strokeLinecap="round"
                strokeDasharray={a.dashArray}
                strokeDashoffset={a.dashOffset}
                transform="rotate(-90 70 70)"
                style={{ transition: "stroke-dasharray .7s ease" }}
              />
            ))}
          </svg>
          <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", textAlign: "center" }}>
            <div style={{ fontSize: 22, fontWeight: 600, color: "var(--p)", lineHeight: 1 }}>{total}</div>
            <div style={{ fontSize: 9, fontWeight: 500, letterSpacing: ".08em", textTransform: "uppercase", color: "var(--t3)", marginTop: 2 }}>
              งาน
            </div>
          </div>
        </div>
        <div style={{ flex: 1, minWidth: 110, display: "flex", flexDirection: "column", gap: 7 }}>
          {slices.map((sl) => (
            <div key={sl.key} style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 12, height: 12, borderRadius: 4, background: sl.color, flexShrink: 0, boxShadow: `0 2px 6px ${sl.color}55` }} />
              <div style={{ flex: 1 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: "var(--t1)" }}>{sl.label}</span>
              </div>
              <div style={{ textAlign: "right" }}>
                <span style={{ fontSize: 16, fontWeight: 800, color: sl.color }}>{sl.count}</span>
                <span style={{ fontSize: 11, color: "var(--t2)", marginLeft: 3 }}>
                  {total > 0 ? Math.round((sl.count / total) * 100) : 0}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
