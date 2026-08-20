"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useAdminData } from "@/contexts/AdminDataContext";
import { DatePickerInput } from "@/components/DatePickerInput";
import { PullToRefresh } from "@/components/PullToRefresh";
import { FilterPills } from "./_components/FilterPills";
import { Pagination } from "./_components/Pagination";
import { AdminDonutChart } from "./_components/AdminDonutChart";
import { JobCard } from "./_components/JobCard";
import { EditJobModal } from "./_components/EditJobModal";
import { ViewResourcesModal } from "./_components/ViewResourcesModal";
import { statusColor, cleanStatusLabel } from "@/lib/status-colors";
import { api } from "@/lib/api-client";
import type { Job } from "@/types";

const PAGE_SIZE = 5;

function parseDMY(str: string): number | null {
  const parts = str.split("/");
  if (parts.length < 3) return null;
  const [d, m, y] = parts.map(Number);
  return new Date(y, m - 1, d).getTime();
}

export default function AdminJobsPage() {
  const searchParams = useSearchParams();
  const { session, jobs, users, resourceList, refreshJobs } = useAdminDataWithResourceList();
  const view = searchParams.get("view") || (session.role === "admin" ? "all" : "my");

  const [dateStart, setDateStart] = useState("");
  const [dateEnd, setDateEnd] = useState("");
  const [staffFilter, setStaffFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [searchId, setSearchId] = useState("");
  const [searchedJob, setSearchedJob] = useState<Job | null | undefined>(undefined);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [viewingJob, setViewingJob] = useState<Job | null>(null);

  const activeStaffNames = users.filter((u) => u.active).map((u) => u.name);

  const baseJobs = useMemo(() => {
    let list = jobs;

    if (dateStart && dateEnd) {
      const sTime = parseDMY(dateStart);
      const eTimeStart = parseDMY(dateEnd);
      if (sTime !== null && eTimeStart !== null) {
        const eTime = eTimeStart + 24 * 60 * 60 * 1000 - 1;
        list = list.filter((j) => j.timestamp >= sTime && j.timestamp <= eTime);
      }
    }

    if (view === "my") {
      list = list.filter((j) => (j.owner || "").includes(session.name.trim()));
    } else if (view === "all" && session.role === "admin") {
      if (staffFilter === "__none__") {
        list = list.filter((j) => (!j.owner || j.owner.trim() === "-" || j.owner.trim() === "") && j.status.includes("รอ"));
      } else if (staffFilter !== "all") {
        list = list.filter((j) => (j.owner || "").includes(staffFilter.trim()));
      }
    }

    return list;
  }, [jobs, dateStart, dateEnd, view, session, staffFilter]);

  const counts = useMemo(
    () => ({
      all: baseJobs.length,
      รอ: baseJobs.filter((j) => j.status.includes("รอ")).length,
      กำลัง: baseJobs.filter((j) => j.status.includes("กำลัง")).length,
      เสร็จ: baseJobs.filter((j) => j.status.includes("เสร็จ")).length,
      ยกเลิก: baseJobs.filter((j) => j.status.includes("ยกเลิก")).length,
    }),
    [baseJobs]
  );

  const filtered = statusFilter === "all" ? baseJobs : baseJobs.filter((j) => j.status.includes(statusFilter));
  const pageStart = (page - 1) * PAGE_SIZE;
  const pageItems = filtered.slice(pageStart, pageStart + PAGE_SIZE);

  function changeStatusFilter(key: string) {
    setStatusFilter(key);
    setPage(1);
  }

  function openManage(job: Job) {
    if (job.status.includes("เสร็จ")) setViewingJob(job);
    else setEditingJob(job);
  }

  function doSearchId() {
    const val = searchId.trim();
    if (!val) return;
    const job = jobs.find((j) => String(j.id) === val);
    setSearchedJob(job || null);
  }

  function clearSearchId() {
    setSearchId("");
    setSearchedJob(undefined);
  }

  return (
    <PullToRefresh onRefresh={refreshJobs}>
      <div id="jobSection">
        <div className="card" style={{ padding: "14px 16px", marginBottom: 10 }}>
          <div className="noise" />
          <span className="section-label">กรองตามวันที่</span>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <DatePickerInput placeholder="ตั้งแต่วันที่" onChange={setDateStart} style={{ flex: 1, margin: 0, minWidth: 110 }} />
            <DatePickerInput placeholder="ถึงวันที่" onChange={setDateEnd} style={{ flex: 1, margin: 0, minWidth: 110 }} />
          </div>
          <div style={{ display: "flex", gap: 7, marginTop: 8 }}>
            <button className="btn primary" style={{ margin: 0, flex: 1, padding: 10 }} onClick={() => setPage(1)}>ค้นหา</button>
            <button
              className="btn neutral" style={{ margin: 0, flex: 1, padding: 10 }}
              onClick={() => { setDateStart(""); setDateEnd(""); setPage(1); }}
            >
              ล้าง
            </button>
          </div>
        </div>

        {view === "all" && session.role === "admin" && (
          <div className="card" style={{ padding: "14px 16px", marginBottom: 10 }}>
            <div className="noise" />
            <span className="section-label">ดูงานรายบุคคล</span>
            <select value={staffFilter} onChange={(e) => { setStaffFilter(e.target.value); setPage(1); }} style={{ marginTop: 6 }}>
              <option value="all">-- ดูงานทุกคน --</option>
              <option value="__none__">งานที่ยังไม่ได้มอบหมาย</option>
              {activeStaffNames.map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
        )}

        <AdminDonutChart jobs={baseJobs} />

        <div className="card" style={{ padding: "14px 16px", marginBottom: 10 }}>
          <div className="noise" />
          <span className="section-label">ค้นหาจากเลขงาน</span>
          <div style={{ display: "flex", gap: 7 }}>
            <input
              placeholder="เลขงาน" inputMode="numeric" value={searchId} style={{ flex: 1, margin: 0 }}
              onChange={(e) => setSearchId(e.target.value.replace(/[^0-9]/g, ""))}
              onKeyDown={(e) => { if (e.key === "Enter") doSearchId(); }}
            />
            <button className="btn primary" style={{ margin: 0, width: "auto", padding: "10px 14px", borderRadius: "var(--r1)" }} onClick={doSearchId}>
              <span className="material-symbols-rounded" style={{ margin: 0 }}>search</span>
            </button>
            <button className="btn neutral" style={{ margin: 0, width: "auto", padding: "10px 12px", borderRadius: "var(--r1)" }} onClick={clearSearchId}>
              <span className="material-symbols-rounded" style={{ margin: 0 }}>close</span>
            </button>
          </div>
          <div style={{ marginTop: 9 }}>
            {searchedJob === null && <div style={{ color: "#ef4444", fontSize: 14, fontWeight: 600 }}>ไม่พบงานเลขที่ {searchId}</div>}
            {searchedJob && <AdminSearchResultCard job={searchedJob} onManage={openManage} />}
          </div>
        </div>

        <FilterPills active={statusFilter} counts={counts} onChange={changeStatusFilter} />

        <Pagination page={page} pageSize={PAGE_SIZE} total={filtered.length} onChange={setPage} />
        <div>
          {pageItems.length === 0 && (
            <div className="glass-card" style={{ textAlign: "center" }}>ไม่มีข้อมูลงานที่ตรงเงื่อนไข</div>
          )}
          {pageItems.map((j) => (
            <JobCard key={j.id} job={j} onManage={openManage} />
          ))}
        </div>
        <Pagination page={page} pageSize={PAGE_SIZE} total={filtered.length} onChange={setPage} />
      </div>

      <EditJobModal
        key={editingJob ? `edit-${editingJob.id}` : "edit-none"}
        job={editingJob}
        session={session}
        staffOptions={activeStaffNames}
        resourceList={resourceList}
        onClose={() => setEditingJob(null)}
        onSaved={refreshJobs}
      />
      <ViewResourcesModal
        key={viewingJob ? `view-${viewingJob.id}` : "view-none"}
        job={viewingJob}
        onClose={() => setViewingJob(null)}
      />
    </PullToRefresh>
  );
}

function AdminSearchResultCard({ job, onManage }: { job: Job; onManage: (job: Job) => void }) {
  const { sc, sb } = statusColor(job.status);
  return (
    <div className="jcard" style={{ borderLeft: `3px solid ${sc}` }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 800, color: "var(--p)" }}>#{job.id}</div>
          <div style={{ fontSize: 13, color: "var(--t2)" }}>{job.fullName}</div>
        </div>
        <span style={{ background: sb, color: sc, padding: "3px 10px", borderRadius: 99, fontSize: 11, fontWeight: 600, border: `1px solid ${sc}44` }}>
          {cleanStatusLabel(job.status)}
        </span>
      </div>
      <div style={{ fontSize: 13, lineHeight: 1.8 }}>
        <b>หน่วยงาน:</b> {job.department || "-"}<br />
        <b>ประเภทงาน:</b> {job.jobType || "-"}<br />
        <b>ผู้รับผิดชอบ:</b> {job.owner || "-"}<br />
        <b>วันที่ต้องการ:</b> {job.needDate || "-"}
      </div>
      <button className="btn secondary" style={{ marginTop: 12, marginBottom: 0, padding: 10, borderRadius: 12, fontSize: 13 }} onClick={() => onManage(job)}>
        <span className="material-symbols-rounded">settings</span> จัดการงาน
      </button>
    </div>
  );
}

// Small adapter: resource item names are needed for the "done job" resource
// picker inside EditJobModal, but aren't part of AdminDataContext (only
// fetched lazily by the resources section) — fetch them once here too.
function useAdminDataWithResourceList() {
  const data = useAdminData();
  const [resourceList, setResourceList] = useState<string[]>([]);
  useEffect(() => {
    let cancelled = false;
    api
      .getResourceList()
      .then((list) => {
        if (!cancelled) setResourceList(list);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);
  return { ...data, resourceList };
}
