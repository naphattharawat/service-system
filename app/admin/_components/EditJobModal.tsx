"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/components/Modal";
import { DatePickerInput } from "@/components/DatePickerInput";
import { OwnerTagPicker } from "@/components/OwnerTagPicker";
import { api } from "@/lib/api-client";
import type { Job, ResourceLineItem, SessionUser } from "@/types";

function normalizeStatus(status: string): string {
  if (status.includes("รอ")) return "รอดำเนินการ";
  if (status.includes("กำลัง")) return "กำลังดำเนินการ";
  if (status.includes("เสร็จ")) return "เสร็จสิ้น";
  if (status.includes("ยกเลิก")) return "ยกเลิก";
  return "รอดำเนินการ";
}

const EMPTY_RESOURCES: ResourceLineItem[] = [{}, {}, {}];

export function EditJobModal({
  job,
  session,
  staffOptions,
  resourceList,
  onClose,
  onSaved,
}: {
  job: Job | null;
  session: SessionUser;
  staffOptions: string[];
  resourceList: string[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [status, setStatus] = useState(() => (job ? normalizeStatus(job.status) : "รอดำเนินการ"));
  const [note, setNote] = useState(job?.note ?? "");
  const [ownerCsv, setOwnerCsv] = useState(job?.owner && job.owner !== "-" ? job.owner : "");
  const [doneDate, setDoneDate] = useState("");
  const [doneDatePrefill, setDoneDatePrefill] = useState("");
  const [resources, setResources] = useState<ResourceLineItem[]>(EMPTY_RESOURCES);
  const [saving, setSaving] = useState(false);
  // Gates rendering the resources section for an already-completed job until
  // its previously-saved lines have loaded — the done-date field is a
  // flatpickr input that only reads its initial value once at mount, so it
  // must not mount before we know what to prefill it with.
  const [resourcesLoading, setResourcesLoading] = useState(
    () => !!job && normalizeStatus(job.status) === "เสร็จสิ้น"
  );

  // Re-opening an already-completed job: load its previously-saved resource
  // lines/done-date instead of starting the form blank, so they're editable
  // rather than just visible-once at close time.
  useEffect(() => {
    if (!job || normalizeStatus(job.status) !== "เสร็จสิ้น") return;
    let cancelled = false;
    api
      .getResources()
      .then((data) => {
        if (cancelled) return;
        const items = data.filter((r) => String(r.jobId) === String(job.id));
        if (items.length === 0) return;
        setResources((prev) =>
          prev.map((r, i) => (items[i] ? { name: items[i].name, qty: items[i].qty, color: items[i].color, size: items[i].size } : r))
        );
        if (items[0].doneDate) {
          setDoneDate(items[0].doneDate);
          setDoneDatePrefill(items[0].doneDate);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setResourcesLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [job]);

  function setResourceField(i: number, field: keyof ResourceLineItem, value: string) {
    setResources((prev) => prev.map((r, idx) => (idx === i ? { ...r, [field]: value } : r)));
  }

  async function save() {
    if (!job) return;
    setSaving(true);
    try {
      const owner =
        session.role !== "admin"
          ? job.owner
          : ownerCsv.split(",").map((s) => s.trim()).filter(Boolean).join(", ") || "-";

      await api.updateJob(job.id, {
        status,
        note,
        owner,
        doneDate,
        resources: status === "เสร็จสิ้น" ? resources : [],
      });
      onSaved();
      onClose();
    } catch (err) {
      alert(`เกิดข้อผิดพลาด: ${err instanceof Error ? err.message : "ไม่ทราบสาเหตุ"}`);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal id="editModal" open={!!job} onClose={onClose}>
      <h3 style={{ margin: "0 0 16px", fontSize: 17, fontWeight: 600, color: "var(--t1)", display: "flex", alignItems: "center", gap: 7 }}>
        <span className="material-symbols-rounded" style={{ color: "var(--p)", margin: 0, fontSize: 17 }}>folder_open</span>
        งาน <span style={{ color: "var(--p)" }}>#{job?.id}</span>
        <button
          onClick={onClose}
          style={{ marginLeft: "auto", background: "rgba(0,0,0,.06)", border: "none", cursor: "pointer", color: "var(--t2)", fontSize: 26, lineHeight: 1, padding: "2px 6px", borderRadius: 8, flexShrink: 0 }}
        >
          ×
        </button>
      </h3>

      {session.role === "admin" && (
        <div>
          <span className="section-label">มอบหมายให้</span>
          <OwnerTagPicker value={ownerCsv} staffOptions={staffOptions} onChange={setOwnerCsv} />
        </div>
      )}

      <span className="section-label" style={{ marginTop: 14, display: "block" }}>สถานะ</span>
      <select value={status} onChange={(e) => setStatus(e.target.value)} style={{ marginTop: 4 }}>
        <option value="รอดำเนินการ">รอดำเนินการ</option>
        <option value="กำลังดำเนินการ">กำลังดำเนินการ</option>
        <option value="เสร็จสิ้น">เสร็จสิ้น</option>
        <option value="ยกเลิก">ยกเลิก</option>
      </select>

      {status === "เสร็จสิ้น" && resourcesLoading && (
        <div style={{ marginTop: 14, fontSize: 13, color: "var(--t3)" }}>กำลังโหลดข้อมูลทรัพยากร...</div>
      )}

      {status === "เสร็จสิ้น" && !resourcesLoading && (
        <div>
          <span className="section-label" style={{ marginTop: 14, display: "block" }}>วันที่เสร็จสิ้น</span>
          <DatePickerInput placeholder="เลือกวันที่" defaultValue={doneDatePrefill} onChange={setDoneDate} style={{ marginTop: 4 }} />
          <span className="section-label" style={{ marginTop: 14, display: "flex", alignItems: "center", gap: 5 }}>
            <span className="material-symbols-rounded" style={{ fontSize: 13, margin: 0, color: "var(--p)" }}>inventory_2</span> ทรัพยากรที่ใช้
          </span>
          <div>
            {[0, 1, 2].map((i) => (
              <div key={i} className="res-group">
                <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--t3)", marginBottom: 8 }}>
                  ชิ้นที่ {i + 1}
                </div>
                <select
                  value={resources[i].name || ""} onChange={(e) => setResourceField(i, "name", e.target.value)}
                  style={{ marginTop: 0, marginBottom: 10 }}
                >
                  <option value="">-- เลือกทรัพยากร --</option>
                  {resourceList.map((n) => <option key={n}>{n}</option>)}
                </select>
                <div style={{ display: "flex", gap: 10 }}>
                  <input placeholder="จำนวน" style={{ flex: 1, marginTop: 0 }} value={resources[i].qty || ""} onChange={(e) => setResourceField(i, "qty", e.target.value)} />
                  <input placeholder="สี" style={{ flex: 1, marginTop: 0 }} value={resources[i].color || ""} onChange={(e) => setResourceField(i, "color", e.target.value)} />
                  <input placeholder="ขนาด" style={{ flex: 1, marginTop: 0 }} value={resources[i].size || ""} onChange={(e) => setResourceField(i, "size", e.target.value)} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <span className="section-label" style={{ marginTop: 14, display: "block" }}>หมายเหตุ</span>
      <input placeholder="พิมพ์หมายเหตุ (ถ้ามี)" value={note} onChange={(e) => setNote(e.target.value)} style={{ marginTop: 4 }} />

      <div style={{ display: "flex", gap: 9, marginTop: 20 }}>
        <button className="btn neutral" style={{ flex: 1, margin: 0 }} onClick={onClose}>ยกเลิก</button>
        <button className="btn primary" style={{ flex: 1, margin: 0 }} onClick={save} disabled={saving}>
          <span className="material-symbols-rounded">save</span> บันทึก
        </button>
      </div>
    </Modal>
  );
}
