"use client";

import { useState } from "react";
import { Modal } from "@/components/Modal";
import { api } from "@/lib/api-client";
import type { SessionUser } from "@/types";

export function ChangePasswordModal({
  open,
  onClose,
  session,
  onUsernameChanged,
}: {
  open: boolean;
  onClose: () => void;
  session: SessionUser;
  onUsernameChanged: (newUsername: string) => void;
}) {
  const [newUser, setNewUser] = useState("");
  const [oldPw, setOldPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirm, setConfirm] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  async function save() {
    if (!oldPw) { setMsg("กรุณากรอกรหัสผ่านปัจจุบัน"); return; }
    if (newPw && newPw !== confirm) { setMsg("รหัสผ่านใหม่ไม่ตรงกัน"); return; }
    if (!newPw && !newUser.trim()) { setMsg("ไม่มีข้อมูลที่จะเปลี่ยน"); return; }

    setMsg("");
    setLoading(true);
    try {
      const res = await api.changeProfile({
        oldPw,
        newPw: newPw || undefined,
        newUser: newUser.trim() || undefined,
      });
      if (res.success) {
        if (newUser.trim()) onUsernameChanged(newUser.trim());
        onClose();
        alert("บันทึกสำเร็จ");
      } else {
        setMsg(res.msg || "เกิดข้อผิดพลาด");
      }
    } catch (err) {
      setMsg(`ผิดพลาด: ${err instanceof Error ? err.message : "ไม่ทราบสาเหตุ"}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal id="changePwModal" open={open} onClose={onClose}>
      <h3 style={{ margin: "0 0 16px", fontSize: 17, fontWeight: 600, color: "var(--t1)", display: "flex", alignItems: "center", gap: 7 }}>
        <span className="material-symbols-rounded" style={{ color: "var(--p)", margin: 0, fontSize: 17 }}>manage_accounts</span> ตั้งค่าบัญชี
        <button
          onClick={onClose}
          style={{ marginLeft: "auto", background: "rgba(0,0,0,.06)", border: "none", cursor: "pointer", color: "var(--t2)", fontSize: 26, lineHeight: 1, padding: "2px 6px", borderRadius: 8, flexShrink: 0 }}
        >
          ×
        </button>
      </h3>
      <div style={{ fontSize: 12, color: "var(--t3)", marginBottom: 4 }}>Username ปัจจุบัน</div>
      <div style={{ fontSize: 15, fontWeight: 600, color: "var(--p)", marginBottom: 14 }}>
        {session.user} ({session.name})
      </div>
      <input placeholder="Username ใหม่ (เว้นว่างถ้าไม่เปลี่ยน)" value={newUser} onChange={(e) => setNewUser(e.target.value)} style={{ marginTop: 0 }} />
      <input type="password" placeholder="รหัสผ่านปัจจุบัน" value={oldPw} onChange={(e) => setOldPw(e.target.value)} style={{ marginTop: 9 }} />
      <input type="password" placeholder="รหัสผ่านใหม่" value={newPw} onChange={(e) => setNewPw(e.target.value)} style={{ marginTop: 9 }} />
      <input type="password" placeholder="ยืนยันรหัสผ่านใหม่" value={confirm} onChange={(e) => setConfirm(e.target.value)} style={{ marginTop: 9 }} />
      {msg && <div style={{ color: "#c04040", marginTop: 8, fontSize: 13, fontWeight: 500, minHeight: 18 }}>{msg}</div>}
      <div style={{ display: "flex", gap: 9, marginTop: 18 }}>
        <button className="btn neutral" style={{ flex: 1, margin: 0 }} onClick={onClose}>ยกเลิก</button>
        <button className="btn primary" style={{ flex: 1, margin: 0 }} onClick={save} disabled={loading}>
          <span className="material-symbols-rounded">save</span> บันทึก
        </button>
      </div>
    </Modal>
  );
}
