"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api-client";
import { DEPT_MAP } from "@/lib/dept-map";
import { TopBar } from "@/components/TopBar";
import { Card } from "@/components/Card";
import { DatePickerInput } from "@/components/DatePickerInput";
import type { SubmitFilePayload } from "@/types";

const PREFIXES = ["นาย", "นาง", "นางสาว"];
const JOB_TYPES = [
  "งานผลิตสื่อต่างๆ", "ทำข่าวประชาสัมพันธ์", "เกียรติบัตร / ใบประกาศ", "ถ่ายภาพ / ทำข่าวประชาสัมพันธ์",
  "งานป้าย", "งานถ่ายภาพ", "งานวีดีโอ", "รับคณะ", "ระบบ Zoom / Webex", "ดูแลห้องประชุม",
  "เครื่องเสียง", "ยืม/ติดตั้ง อุปกรณ์", "ปริ้นเอกสาร / ภาพ", "บัตร / บัตรคิว", "เคลือบพลาสติก",
];

const FILE_ICONS: Record<string, string> = {
  pdf: "picture_as_pdf", doc: "description", docx: "description",
  xls: "table_chart", xlsx: "table_chart", ppt: "slideshow", pptx: "slideshow",
};

const MAX_FILE_SIZE = 25 * 1024 * 1024;

function fileToBase64(file: File): Promise<SubmitFilePayload> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve({ data: result.split(",")[1], name: file.name, type: file.type });
    };
    reader.onerror = () => reject(new Error("อ่านไฟล์ไม่สำเร็จ"));
    reader.readAsDataURL(file);
  });
}

interface FormState {
  prefix: string; name: string; lastname: string;
  group: string; department: string;
  type: string; orderDate: string; detail: string; needDate: string; phone: string;
}

const EMPTY_FORM: FormState = {
  prefix: "", name: "", lastname: "", group: "", department: "",
  type: "", orderDate: "", detail: "", needDate: "", phone: "",
};

export default function ServicePage() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [files, setFiles] = useState<File[]>([]);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState<{ id: number; form: FormState } | null>(null);

  const departments = useMemo(() => DEPT_MAP[form.group] || [], [form.group]);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function onGroupChange(group: string) {
    setForm((f) => ({ ...f, group, department: "" }));
  }

  function addFiles(fileList: FileList | null) {
    if (!fileList) return;
    setFiles((prev) => {
      const next = [...prev];
      Array.from(fileList).forEach((f) => {
        if (!next.find((x) => x.name === f.name && x.size === f.size)) next.push(f);
      });
      return next;
    });
  }

  function removeFile(idx: number) {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
  }

  async function submit() {
    const missing: string[] = [];
    if (!form.prefix) missing.push("คำนำหน้า");
    if (!form.name) missing.push("ชื่อ");
    if (!form.lastname) missing.push("นามสกุล");
    if (!form.group) missing.push("กลุ่มภารกิจ");
    if (!form.department) missing.push("หน่วยงาน");
    if (!form.type) missing.push("ประเภทงาน");
    if (!form.orderDate) missing.push("วันที่สั่งงาน");
    if (!form.detail) missing.push("รายละเอียดงาน");
    if (!form.needDate) missing.push("วันที่ต้องการ");
    if (!form.phone) missing.push("เบอร์ภายใน");
    if (missing.length > 0) {
      setError(`กรุณากรอก: ${missing.join(", ")}`);
      return;
    }
    if (!/^[0-9]{4}$/.test(form.phone)) {
      setError("กรุณากรอกเบอร์ภายใน 4 หลัก");
      return;
    }
    for (const f of files) {
      if (f.size > MAX_FILE_SIZE) {
        setError(`ไฟล์ "${f.name}" ขนาดเกิน 25MB`);
        return;
      }
    }

    setError("");
    setSubmitting(true);
    try {
      const filePayloads = await Promise.all(files.map(fileToBase64));
      const res = await api.submitJob({
        prefix: form.prefix, name: form.name, lastname: form.lastname,
        group: form.group, department: form.department, type: form.type,
        orderDate: form.orderDate, detail: form.detail, needDate: form.needDate,
        phone: form.phone, files: filePayloads,
      });
      setSuccess({ id: res.id, form });
    } catch (err) {
      setError(`เกิดข้อผิดพลาด: ${err instanceof Error ? err.message : "ไม่ทราบสาเหตุ"}`);
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return <SuccessView id={success.id} form={success.form} onHome={() => router.push("/")} />;
  }

  return (
    <div id="service" className="page active">
      <TopBar title="ขอรับบริการใหม่" onBack={() => router.push("/")} />
      <div className="wrap inner-page" style={{ paddingTop: 16 }}>
        <Card>
          <span className="section-label">ข้อมูลผู้ติดต่อ</span>
          <select value={form.prefix} onChange={(e) => set("prefix", e.target.value)}>
            <option value="">— คำนำหน้า —</option>
            {PREFIXES.map((p) => <option key={p}>{p}</option>)}
          </select>
          <div style={{ display: "flex", gap: 9 }}>
            <input
              placeholder="ชื่อ" style={{ flex: 1 }} value={form.name}
              onChange={(e) => set("name", e.target.value.replace(/[0-9]/g, ""))}
            />
            <input
              placeholder="นามสกุล" style={{ flex: 1 }} value={form.lastname}
              onChange={(e) => set("lastname", e.target.value.replace(/[0-9]/g, ""))}
            />
          </div>

          <span className="section-label" style={{ marginTop: 18, display: "block" }}>หน่วยงาน</span>
          <select value={form.group} onChange={(e) => onGroupChange(e.target.value)}>
            <option value="">— กลุ่มภารกิจ —</option>
            {Object.keys(DEPT_MAP).map((g) => <option key={g}>{g}</option>)}
          </select>
          <select value={form.department} onChange={(e) => set("department", e.target.value)}>
            <option value="">— หน่วยงาน —</option>
            {departments.map((d) => <option key={d}>{d}</option>)}
          </select>

          <span className="section-label" style={{ marginTop: 18, display: "block" }}>รายละเอียดงาน</span>
          <select value={form.type} onChange={(e) => set("type", e.target.value)}>
            <option value="">— ประเภทงาน —</option>
            {JOB_TYPES.map((t) => <option key={t}>{t}</option>)}
          </select>
          <DatePickerInput placeholder="วันที่สั่งงาน" onChange={(v) => set("orderDate", v)} />
          <textarea
            id="detailInput" placeholder="รายละเอียด (ขนาด จำนวน ฯลฯ)" value={form.detail}
            onChange={(e) => set("detail", e.target.value)}
          />

          <div className="file-wrap">
            <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: ".08em", textTransform: "uppercase", color: "var(--t3)", display: "flex", alignItems: "center", gap: 5, marginBottom: 8 }}>
              <span className="material-symbols-rounded" style={{ fontSize: 13, margin: 0 }}>attach_file</span> ไฟล์แนบ (ถ้ามี)
            </div>
            <input
              type="file" multiple
              style={{ marginTop: 0, border: "none", padding: 0, background: "transparent", boxShadow: "none", fontSize: 13 }}
              onChange={(e) => { addFiles(e.target.files); e.target.value = ""; }}
            />
            {files.length > 0 && (
              <div style={{ marginTop: 6, display: "flex", flexDirection: "column", gap: 4 }}>
                {files.map((f, i) => (
                  <FilePreviewItem key={`${f.name}-${f.size}-${i}`} file={f} onRemove={() => removeFile(i)} onOpen={setLightboxUrl} />
                ))}
              </div>
            )}
            {files.length > 0 && (
              <div style={{ fontSize: 11, color: "var(--t3)", marginTop: 4 }}>{files.length} ไฟล์เลือกแล้ว</div>
            )}
            <div style={{ fontSize: 11, color: "var(--t3)", marginTop: 4 }}>ไม่เกิน 25MB</div>
          </div>

          <DatePickerInput placeholder="วันที่ต้องการงาน" onChange={(v) => set("needDate", v)} />

          <span className="section-label" style={{ marginTop: 18, display: "block" }}>ข้อมูลติดต่อ</span>
          <input
            placeholder="เบอร์ภายใน (4 หลัก)" maxLength={4} inputMode="numeric" value={form.phone}
            onChange={(e) => set("phone", e.target.value.replace(/[^0-9]/g, ""))}
          />
          <div style={{ fontSize: 11, color: "var(--t3)", marginTop: 4, marginLeft: 2 }}>เบอร์ภายในโรงพยาบาล 4 หลัก</div>

          <button className="btn primary" style={{ marginTop: 20 }} onClick={submit} disabled={submitting}>
            <span className="material-symbols-rounded" style={submitting ? { animation: "spin 1s linear infinite" } : undefined}>
              {submitting ? "cached" : "send"}
            </span>
            {submitting ? "กำลังประมวลผล..." : "ส่งคำขอรับบริการ"}
          </button>
          {error && <div style={{ color: "#c04040", marginTop: 10, textAlign: "center", fontSize: 13, fontWeight: 500 }}>{error}</div>}
        </Card>
      </div>

      {lightboxUrl && (
        <div
          style={{ position: "fixed", inset: 0, zIndex: 99999, background: "rgba(8,14,26,.7)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
          onClick={(e) => { if (e.target === e.currentTarget) setLightboxUrl(null); }}
        >
          <div style={{ position: "relative", maxWidth: "100%", maxHeight: "90dvh" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={lightboxUrl} alt="" style={{ maxWidth: "100%", maxHeight: "85dvh", borderRadius: 16, boxShadow: "0 20px 60px rgba(0,0,0,.4)", display: "block" }} />
            <button
              onClick={() => setLightboxUrl(null)}
              style={{ position: "absolute", top: -12, right: -12, width: 32, height: 32, borderRadius: "50%", background: "rgba(255,255,255,.9)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 8px rgba(0,0,0,.2)" }}
            >
              <span className="material-symbols-rounded" style={{ fontSize: 16, margin: 0, color: "#18243c" }}>close</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function FilePreviewItem({ file, onRemove, onOpen }: { file: File; onRemove: () => void; onOpen: (url: string) => void }) {
  const isImg = file.type.startsWith("image/");
  const url = useMemo(() => (isImg ? URL.createObjectURL(file) : ""), [file, isImg]);
  const ext = file.name.split(".").pop()?.toLowerCase() || "";
  const icon = FILE_ICONS[ext] || "attach_file";

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,.5)", border: "1px solid rgba(255,255,255,.85)", borderRadius: 10, padding: "6px 10px" }}>
      {isImg ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt="" style={{ width: 34, height: 34, borderRadius: 6, objectFit: "cover", flexShrink: 0, cursor: "pointer" }} onClick={() => onOpen(url)} />
      ) : (
        <div style={{ width: 34, height: 34, borderRadius: 6, background: "rgba(124,158,248,.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <span className="material-symbols-rounded" style={{ fontSize: 18, margin: 0, color: "var(--p)" }}>{icon}</span>
        </div>
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 12, color: "var(--t1)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{file.name}</div>
        <div style={{ fontSize: 10, color: "var(--t3)" }}>{(file.size / 1024).toFixed(0)} KB</div>
      </div>
      <button
        onClick={onRemove}
        style={{ width: 22, height: 22, borderRadius: "50%", background: "rgba(239,68,68,.08)", border: "1px solid rgba(239,68,68,.15)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, padding: 0 }}
      >
        <span className="material-symbols-rounded" style={{ fontSize: 13, margin: 0, color: "#ef4444" }}>close</span>
      </button>
    </div>
  );
}

function SuccessView({ id, form, onHome }: { id: number; form: FormState; onHome: () => void }) {
  return (
    <div id="success" className="page active" style={{ justifyContent: "center", alignItems: "center", padding: "40px 16px" }}>
      <div style={{ width: "100%", maxWidth: 400, zIndex: 10, position: "relative" }}>
        <Card style={{ textAlign: "center" }}>
          <svg className="success-svg" viewBox="0 0 52 52">
            <circle cx="26" cy="26" r="25" fill="none" stroke="var(--p)" strokeWidth={1.5} />
            <path fill="none" stroke="var(--p)" strokeWidth={2.5} strokeLinecap="round" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
          </svg>
          <div className="brand" style={{ marginBottom: 3 }}>ส่งคำขอสำเร็จ</div>
          <span className="brand-sub" style={{ marginBottom: 18 }}>Request Submitted</span>
          <div style={{ textAlign: "left", fontSize: 13, lineHeight: 1.85, color: "var(--t2)", wordBreak: "break-word", overflowWrap: "break-word" }}>
            <div style={{ background: "rgba(52, 211, 153, 0.1)", padding: 16, borderRadius: 16, border: "1px solid rgba(52, 211, 153, 0.3)", marginBottom: 16, fontSize: 14 }}>
              <span className="material-symbols-rounded" style={{ color: "#10b981" }}>check_circle</span> กรุณาแคปหน้าจอ หรือบันทึกรหัสอ้างอิงไว้
            </div>
            <div style={{ fontSize: 15 }}>
              <div style={{ color: "var(--t2)", fontWeight: 600, marginTop: 12 }}>รหัสอ้างอิง</div>
              <div style={{ fontSize: 32, color: "var(--p)", fontWeight: 800, marginBottom: 16 }}>{id}</div>
              <b>ผู้ติดต่อ:</b> {form.prefix} {form.name} {form.lastname}<br />
              <b>กลุ่มภารกิจ:</b> {form.group}<br />
              <b>หน่วยงาน:</b> {form.department}<br />
              <b>ประเภทงาน:</b> {form.type}<br />
              <b>รายละเอียด:</b> {form.detail}<br />
              <b>วันที่สั่งงาน:</b> {form.orderDate}<br />
              <b>วันที่ต้องการ:</b> {form.needDate}<br />
              <b>เบอร์ติดต่อ:</b> {form.phone}
            </div>
          </div>
          <button className="btn primary" style={{ marginTop: 20 }} onClick={onHome}>
            <span className="material-symbols-rounded">home</span> กลับหน้าหลัก
          </button>
        </Card>
      </div>
    </div>
  );
}
