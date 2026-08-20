"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAdminData } from "@/contexts/AdminDataContext";
import { api } from "@/lib/api-client";
import type { Role } from "@/types";

export default function AdminUsersPage() {
  const router = useRouter();
  const { session, users, refreshUsers } = useAdminData();

  useEffect(() => {
    if (session.role !== "admin") router.replace("/admin");
  }, [session.role, router]);

  const [formOpen, setFormOpen] = useState(false);
  const [newUser, setNewUser] = useState("");
  const [newPass, setNewPass] = useState("");
  const [newName, setNewName] = useState("");
  const [newRole, setNewRole] = useState<Role>("staff");
  const [saving, setSaving] = useState(false);

  if (session.role !== "admin") return null;

  function resetForm() {
    setNewUser("");
    setNewPass("");
    setNewName("");
    setNewRole("staff");
  }

  async function addUser() {
    if (!newUser || !newPass || !newName) {
      alert("กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }
    setSaving(true);
    try {
      await api.addUser(newUser, newPass, newRole, newName);
      alert("บันทึกผู้ใช้สำเร็จ");
      setFormOpen(false);
      resetForm();
      await refreshUsers();
    } catch (err) {
      alert(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
    } finally {
      setSaving(false);
    }
  }

  async function toggleUser(user: string, currentActive: boolean) {
    try {
      await api.toggleUserStatus(user, currentActive);
      await refreshUsers();
    } catch (err) {
      alert(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
    }
  }

  async function removeUser(user: string) {
    if (!confirm(`ยืนยันการลบผู้ใช้ '${user}' ออกจากระบบอย่างถาวร?`)) return;
    try {
      await api.deleteUser(user);
    } catch (err) {
      alert(`เกิดข้อผิดพลาด: ${err instanceof Error ? err.message : "ไม่ทราบสาเหตุ"}`);
    } finally {
      await refreshUsers();
    }
  }

  return (
    <div id="userSection">
      <div className="card" style={{ marginBottom: 10 }}>
        <div className="noise" />
        <button
          className={`btn ${formOpen ? "secondary" : "primary"}`} style={{ margin: 0 }}
          onClick={() => { setFormOpen((v) => !v); if (formOpen) resetForm(); }}
        >
          <span className="material-symbols-rounded">{formOpen ? "close" : "person_add"}</span>
          {formOpen ? "ยกเลิกการเพิ่ม" : "เพิ่มผู้ใช้งานใหม่"}
        </button>
        {formOpen && (
          <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid var(--g-b2)" }}>
            <input placeholder="Username" value={newUser} onChange={(e) => setNewUser(e.target.value)} />
            <input placeholder="Password" value={newPass} onChange={(e) => setNewPass(e.target.value)} />
            <input placeholder="ชื่อ-นามสกุล" value={newName} onChange={(e) => setNewName(e.target.value)} />
            <select value={newRole} onChange={(e) => setNewRole(e.target.value as Role)}>
              <option value="staff">Staff</option>
              <option value="admin">Admin</option>
            </select>
            <button className="btn primary" style={{ marginTop: 12, marginBottom: 0 }} onClick={addUser} disabled={saving}>
              <span className="material-symbols-rounded">save</span> บันทึก
            </button>
          </div>
        )}
      </div>

      <div>
        {users.map((u) => (
          <div key={u.user} className="jcard" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "nowrap" }}>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 16, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{u.name}</div>
              <div style={{ fontSize: 13, color: "var(--t2)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                ID: {u.user} | Role: <span style={{ textTransform: "uppercase" }}>{u.role}</span>
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
              <button
                className={`btn ${u.active ? "neutral" : "primary"}`} style={{ margin: 0, padding: "8px 14px", width: "auto", fontSize: 14 }}
                onClick={() => toggleUser(u.user, u.active)}
              >
                {u.active ? "ระงับสิทธิ์" : "เปิดใช้งาน"}
              </button>
              <button className="btn danger" style={{ margin: 0, padding: "8px 10px", width: "auto" }} onClick={() => removeUser(u.user)} title="ลบผู้ใช้">
                <span className="material-symbols-rounded" style={{ margin: 0 }}>delete</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
