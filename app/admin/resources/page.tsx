"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAdminData } from "@/contexts/AdminDataContext";
import { DatePickerInput } from "@/components/DatePickerInput";
import { PullToRefresh } from "@/components/PullToRefresh";
import { Pagination } from "../_components/Pagination";
import { ResourceItemModal } from "../_components/ResourceItemModal";
import { api } from "@/lib/api-client";
import type { ResourceUsageRow } from "@/types";

const RES_JOB_PAGE_SIZE = 10;
const SUMMARY_COLORS = ["#7c9ef8", "#a0c4ff", "#c0b8ff", "#ffc0e0", "#ffd4b8", "#a7f3d0", "#c4b5fd", "#fed7aa"];

function parseDMY(str: string): number | null {
  const parts = str.split("/");
  if (parts.length < 3) return null;
  const [d, m, y] = parts.map(Number);
  return new Date(y, m - 1, d).getTime();
}

export default function AdminResourcesPage() {
  const router = useRouter();
  const { session } = useAdminData();

  useEffect(() => {
    if (session.role !== "admin") router.replace("/admin");
  }, [session.role, router]);

  const [data, setData] = useState<ResourceUsageRow[] | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [dateStart, setDateStart] = useState("");
  const [dateEnd, setDateEnd] = useState("");
  const [jobPage, setJobPage] = useState(1);
  const [expanded, setExpanded] = useState(false);
  const [itemModalOpen, setItemModalOpen] = useState(false);

  const refresh = useCallback(
    () =>
      api
        .getResources()
        .then((rows) => {
          setData(rows);
          setLoadError(false);
        })
        .catch(() => setLoadError(true)),
    []
  );

  useEffect(() => {
    refresh();
  }, [refresh]);

  const filtered = useMemo(() => {
    if (!data) return [];
    if (!dateStart || !dateEnd) return data;
    const sTime = parseDMY(dateStart);
    const eTimeStart = parseDMY(dateEnd);
    if (sTime === null || eTimeStart === null) return data;
    const eTime = eTimeStart + 24 * 60 * 60 * 1000 - 1;

    const doneDateByJob = new Map<string, string>();
    data.forEach((r) => {
      if (!doneDateByJob.has(r.jobId)) doneDateByJob.set(r.jobId, r.doneDate);
    });
    const validJobs = new Set<string>();
    doneDateByJob.forEach((doneDate, jobId) => {
      const t = doneDate ? parseDMY(doneDate) : null;
      if (t !== null && t >= sTime && t <= eTime) validJobs.add(jobId);
    });
    return data.filter((r) => validJobs.has(r.jobId));
  }, [data, dateStart, dateEnd]);

  const jobs = useMemo(() => {
    const map = new Map<string, { jobId: string; doneDate: string; items: ResourceUsageRow[] }>();
    filtered.forEach((r) => {
      if (!map.has(r.jobId)) map.set(r.jobId, { jobId: r.jobId, doneDate: r.doneDate, items: [] });
      map.get(r.jobId)!.items.push(r);
    });
    return Array.from(map.values()).sort((a, b) => Number(b.jobId) - Number(a.jobId));
  }, [filtered]);

  const summary = useMemo(() => {
    const countMap = new Map<string, number>();
    const qtyMap = new Map<string, number>();
    filtered.forEach((r) => {
      countMap.set(r.name, (countMap.get(r.name) || 0) + 1);
      qtyMap.set(r.name, (qtyMap.get(r.name) || 0) + (parseFloat(r.qty) || 0));
    });
    const sorted = Array.from(countMap.entries()).sort((a, b) => b[1] - a[1]);
    return { sorted, qtyMap, max: sorted[0]?.[1] || 1 };
  }, [filtered]);

  if (session.role !== "admin") return null;

  const jobPageStart = (jobPage - 1) * RES_JOB_PAGE_SIZE;
  const jobPageItems = jobs.slice(jobPageStart, jobPageStart + RES_JOB_PAGE_SIZE);
  const top5 = summary.sorted.slice(0, 5);
  const extra = summary.sorted.slice(5);

  function clearFilter() {
    setDateStart("");
    setDateEnd("");
    setJobPage(1);
  }

  return (
    <PullToRefresh onRefresh={refresh}>
      <div id="resourceSection">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: 8, marginBottom: 10 }}>
          <div className="card" style={{ padding: "11px 12px", margin: 0 }}>
            <div className="noise" />
            <div style={{ fontSize: 10, color: "var(--t3)", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 3 }}>รายการงาน</div>
            <div style={{ fontSize: 20, fontWeight: 500, color: "var(--t1)" }}>{data === null ? "—" : jobs.length}</div>
            <div style={{ fontSize: 12, color: "var(--t2)", marginTop: 1 }}>ที่บันทึกวัสดุ</div>
          </div>
          <div className="card" style={{ padding: "11px 12px", margin: 0 }}>
            <div className="noise" />
            <div style={{ fontSize: 10, color: "var(--t3)", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 3 }}>ใช้บ่อยสุด</div>
            <div style={{ fontSize: 15, fontWeight: 500, color: "var(--t1)", paddingTop: 3 }}>{summary.sorted[0]?.[0] || "—"}</div>
            <div style={{ fontSize: 13, color: "var(--t2)", marginTop: 1 }}>
              {summary.sorted[0] ? `${summary.sorted[0][1]} ครั้ง · ${Math.round((summary.sorted[0][1] / filtered.length) * 100)}%` : "—"}
            </div>
          </div>
        </div>

        <div className="card" style={{ marginBottom: 10 }}>
          <div className="noise" />
          <button className="btn secondary" style={{ margin: 0 }} onClick={() => setItemModalOpen(true)}>
            <span className="material-symbols-rounded">inventory_2</span> จัดการรายการวัสดุ
          </button>
        </div>

        <div className="card" style={{ padding: "14px 16px", marginBottom: 10 }}>
          <div className="noise" />
          <span className="section-label">กรองตามวันที่เสร็จ</span>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <DatePickerInput placeholder="ตั้งแต่วันที่" onChange={setDateStart} style={{ flex: 1, margin: 0, minWidth: 110 }} />
            <DatePickerInput placeholder="ถึงวันที่" onChange={setDateEnd} style={{ flex: 1, margin: 0, minWidth: 110 }} />
          </div>
          <div style={{ display: "flex", gap: 7, marginTop: 8 }}>
            <button className="btn primary" style={{ margin: 0, flex: 1, padding: 10 }} onClick={() => setJobPage(1)}>ค้นหา</button>
            <button className="btn neutral" style={{ margin: 0, flex: 1, padding: 10 }} onClick={clearFilter}>ล้าง</button>
          </div>
        </div>

        <div className="card" style={{ marginBottom: 10 }}>
          <div className="noise" />
          <span className="section-label">วัสดุที่ใช้บ่อย</span>
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 0 6px", borderBottom: "0.5px solid var(--g-b2)", marginBottom: 2 }}>
            <div style={{ flex: 1, fontSize: 14, color: "var(--t3)", letterSpacing: ".05em" }}>วัสดุ</div>
            <div style={{ width: 60 }} />
            <div style={{ minWidth: 36, textAlign: "right", fontSize: 14, color: "var(--t3)" }}>ครั้ง</div>
            <div style={{ minWidth: 58, textAlign: "right", fontSize: 14, color: "var(--t3)" }}>จำนวน</div>
          </div>
          {data === null && !loadError && <div style={{ textAlign: "center", color: "var(--t2)", padding: "20px 0" }}>กำลังโหลด...</div>}
          {loadError && <div style={{ color: "#ef4444", fontSize: 13, textAlign: "center", padding: "20px 0" }}>เกิดข้อผิดพลาด</div>}
          {data !== null && filtered.length === 0 && (
            <div style={{ textAlign: "center", color: "var(--t2)", padding: "20px 0" }}>ยังไม่มีข้อมูลทรัพยากร</div>
          )}
          {top5.map(([name, count], i) => (
            <SummaryRow key={name} name={name} count={count} qty={summary.qtyMap.get(name) || 0} colorIndex={i} max={summary.max} />
          ))}
          {expanded && extra.map(([name, count], i) => (
            <SummaryRow key={name} name={name} count={count} qty={summary.qtyMap.get(name) || 0} colorIndex={i + 5} max={summary.max} />
          ))}
          {extra.length > 0 && (
            <button
              onClick={() => setExpanded((v) => !v)}
              style={{ display: "flex", width: "100%", padding: 9, borderRadius: 10, border: "0.5px solid var(--g-b2)", background: "transparent", fontFamily: "inherit", fontSize: 12, color: "var(--p)", cursor: "pointer", marginTop: 8, alignItems: "center", justifyContent: "center", gap: 4 }}
            >
              <span className="material-symbols-rounded" style={{ fontSize: 15, margin: 0 }}>{expanded ? "expand_less" : "expand_more"}</span>
              <span>{expanded ? "ย่อ" : `ดูเพิ่มเติม (${extra.length} รายการ)`}</span>
            </button>
          )}
        </div>

        <div className="card" style={{ marginBottom: 10 }}>
          <div className="noise" />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
            <span className="section-label" style={{ margin: 0 }}>รายการงาน</span>
            <span style={{ fontSize: 11, color: "var(--t3)" }}>{jobs.length} รายการ</span>
          </div>
          <Pagination page={jobPage} pageSize={RES_JOB_PAGE_SIZE} total={jobs.length} onChange={setJobPage} />
          <div>
            {jobPageItems.length === 0 && <div style={{ textAlign: "center", color: "var(--t2)", padding: 12 }}>ไม่มีรายการ</div>}
            {jobPageItems.map((j) => (
              <div key={j.jobId} style={{ background: "rgba(255,255,255,.35)", border: "0.5px solid var(--g-b2)", borderRadius: 12, padding: "10px 12px", marginBottom: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <div style={{ fontSize: 17, fontWeight: 500, color: "var(--p)" }}>#{j.jobId}</div>
                  <div style={{ fontSize: 14, color: "var(--t3)" }}>{j.doneDate || ""}</div>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                  {j.items.map((r, i) => {
                    const detail = [r.qty, r.color, r.size].filter(Boolean).join(" ");
                    return (
                      <span key={i} style={{ padding: "3px 8px", borderRadius: 99, fontSize: 14, background: "rgba(255,255,255,.5)", border: "0.5px solid var(--g-b2)", color: "var(--t2)" }}>
                        {r.name}{detail ? ` · ${detail}` : ""}
                      </span>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
          <Pagination page={jobPage} pageSize={RES_JOB_PAGE_SIZE} total={jobs.length} onChange={setJobPage} />
        </div>
      </div>

      <ResourceItemModal open={itemModalOpen} onClose={() => setItemModalOpen(false)} onListChanged={noop} />
    </PullToRefresh>
  );
}

function SummaryRow({ name, count, qty, colorIndex, max }: { name: string; count: number; qty: number; colorIndex: number; max: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 0", borderBottom: "0.5px solid var(--g-b2)" }}>
      <div style={{ flex: 1, fontSize: 16, color: "var(--t1)" }}>{name}</div>
      <div style={{ width: 60, height: 6, background: "var(--g-b2)", borderRadius: 3, overflow: "hidden", flexShrink: 0 }}>
        <div style={{ height: "100%", width: `${Math.round((count / max) * 100)}%`, background: SUMMARY_COLORS[colorIndex % SUMMARY_COLORS.length], borderRadius: 3 }} />
      </div>
      <div style={{ minWidth: 32, textAlign: "right", fontSize: 16, fontWeight: 500, color: "var(--t1)" }}>{count}</div>
      <div style={{ minWidth: 54, textAlign: "right", fontSize: 13, color: "var(--t3)" }}>{qty > 0 ? qty : "—"}</div>
    </div>
  );
}

function noop() {}
