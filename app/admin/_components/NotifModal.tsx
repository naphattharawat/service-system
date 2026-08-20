"use client";

import { useState } from "react";
import { Modal } from "@/components/Modal";
import { OwnerTagPicker } from "@/components/OwnerTagPicker";
import { api } from "@/lib/api-client";
import type { Job, SessionUser } from "@/types";

export function NotifModal({
  open,
  onClose,
  session,
  myWaitingJobs,
  unassignedJobs,
  staffOptions,
  onJobsChanged,
}: {
  open: boolean;
  onClose: () => void;
  session: SessionUser;
  myWaitingJobs: Job[];
  unassignedJobs: Job[];
  staffOptions: string[];
  onJobsChanged: () => Promise<void>;
}) {
  const [tab, setTab] = useState<"my" | "new">("my");
  const [ownerDrafts, setOwnerDrafts] = useState<Record<string, string>>({});
  const [busyId, setBusyId] = useState<string | null>(null);

  const isAdmin = session.role === "admin";
  const jobs = tab === "my" ? myWaitingJobs : unassignedJobs;

  async function acceptJob(job: Job) {
    setBusyId(job.id);
    try {
      await api.updateJob(job.id, { status: "กำลังดำเนินการ", owner: job.owner, note: "", doneDate: "", resources: [] });
      await onJobsChanged();
    } catch (err) {
      alert(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
    } finally {
      setBusyId(null);
    }
  }

  async function claimJob(job: Job) {
    const names = (ownerDrafts[job.id] || "").split(",").map((s) => s.trim()).filter(Boolean);
    if (!names.length) { alert("กรุณาเลือก Staff ก่อน"); return; }
    setBusyId(job.id);
    try {
      await api.updateJob(job.id, { status: "รอดำเนินการ", owner: names.join(", "), note: "", doneDate: "", resources: [] });
      await onJobsChanged();
    } catch (err) {
      alert(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <Modal id="notifModal" open={open} onClose={onClose} align="top-right">
      <div
        style={{
          background: "rgba(255,255,255,.42)", backdropFilter: "blur(60px) saturate(180%)", WebkitBackdropFilter: "blur(60px) saturate(180%)",
          border: "1px solid rgba(255,255,255,.92)", borderRadius: "var(--r3)", width: "100%", maxWidth: 380, maxHeight: "75vh",
          display: "flex", flexDirection: "column", boxShadow: "0 12px 48px rgba(100,130,220,.1),0 2px 8px rgba(0,0,0,.03),inset 0 1.5px 0 rgba(255,255,255,1)",
        }}
      >
        <div style={{ padding: "16px 20px 12px", borderBottom: "1px solid rgba(255,255,255,.6)", flexShrink: 0, background: "rgba(255,255,255,.2)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: "var(--t1)", display: "flex", alignItems: "center", gap: 7 }}>
              <span className="material-symbols-rounded" style={{ color: "var(--p)", margin: 0, fontSize: 18 }}>inbox</span>
              กล่องงาน
              {!isAdmin && myWaitingJobs.length > 0 && (
                <span style={{ background: "#ef4444", color: "#fff", borderRadius: 99, padding: "1px 8px", fontSize: 12, marginLeft: 2 }}>
                  {myWaitingJobs.length}
                </span>
              )}
            </div>
            <button
              onClick={onClose}
              style={{ background: "var(--g-bg)", border: "1px solid var(--g-b)", borderRadius: 99, cursor: "pointer", color: "var(--t2)", fontSize: 14, fontWeight: 600, padding: "6px 14px", display: "flex", alignItems: "center", gap: 4 }}
            >
              <span className="material-symbols-rounded" style={{ fontSize: 16, margin: 0 }}>close</span> ปิด
            </button>
          </div>
          {isAdmin && (
            <div style={{ display: "flex", gap: 6 }}>
              <button className={`filter-btn${tab === "my" ? " active" : ""}`} style={{ flex: 1 }} onClick={() => setTab("my")}>
                งานของฉัน
                {myWaitingJobs.length > 0 && (
                  <span style={{ background: "#ef4444", color: "#fff", borderRadius: 99, padding: "1px 6px", fontSize: 11, marginLeft: 3 }}>
                    {myWaitingJobs.length}
                  </span>
                )}
              </button>
              <button className={`filter-btn${tab === "new" ? " active" : ""}`} style={{ flex: 1 }} onClick={() => setTab("new")}>
                งานใหม่
                {unassignedJobs.length > 0 && (
                  <span style={{ background: "#ef4444", color: "#fff", borderRadius: 99, padding: "1px 6px", fontSize: 11, marginLeft: 3 }}>
                    {unassignedJobs.length}
                  </span>
                )}
              </button>
            </div>
          )}
        </div>

        <div style={{ padding: "14px 20px", overflowY: "auto", flex: 1 }}>
          {jobs.length === 0 && (
            <div style={{ textAlign: "center", color: "var(--t2)", padding: "24px 0", fontSize: 15 }}>
              {tab === "my" ? "ไม่มีงานที่รอดำเนินการ" : "ไม่มีงานใหม่ที่รอผู้รับผิดชอบ"}
            </div>
          )}
          {jobs.map((j) => (
            <div key={j.id} className="jcard" style={{ marginBottom: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
                <div style={{ fontSize: 20, fontWeight: 800, color: "var(--p)" }}>#{j.id}</div>
                <span style={{ fontSize: 12, color: "var(--t3)" }}>{j.needDate ? `ต้องการ: ${j.needDate}` : ""}</span>
              </div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "var(--t1)" }}>{j.jobType || "-"}</div>
              <div style={{ fontSize: 13, color: "var(--t2)", marginBottom: 4 }}>{j.department || "-"} • {j.fullName || "-"}</div>
              {j.owner && j.owner !== "-" ? (
                <div style={{ fontSize: 13, color: "var(--t3)", marginBottom: 10 }}>ผู้รับผิดชอบ: {j.owner}</div>
              ) : (
                <div style={{ marginBottom: 10 }} />
              )}
              {tab === "my" ? (
                <button className="btn primary" style={{ margin: 0, padding: 10, fontSize: 14 }} onClick={() => acceptJob(j)} disabled={busyId === j.id}>
                  <span className="material-symbols-rounded" style={{ fontSize: 16 }}>play_arrow</span> รับงาน / เริ่มดำเนินการ
                </button>
              ) : (
                <div>
                  <OwnerTagPicker
                    value={ownerDrafts[j.id] || ""}
                    staffOptions={staffOptions}
                    onChange={(csv) => setOwnerDrafts((prev) => ({ ...prev, [j.id]: csv }))}
                  />
                  <button className="btn primary" style={{ margin: "8px 0 0", padding: 10, fontSize: 14 }} onClick={() => claimJob(j)} disabled={busyId === j.id}>
                    <span className="material-symbols-rounded" style={{ fontSize: 16 }}>person_add</span> มอบหมาย
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </Modal>
  );
}
