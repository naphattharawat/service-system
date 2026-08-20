"use client";

import { useCallback, useEffect, useState } from "react";
import { Modal } from "@/components/Modal";
import { api } from "@/lib/api-client";

export function ResourceItemModal({
  open,
  onClose,
  onListChanged,
}: {
  open: boolean;
  onClose: () => void;
  onListChanged: (list: string[]) => void;
}) {
  const [items, setItems] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [msg, setMsg] = useState("");

  const load = useCallback(async () => {
    try {
      const list = await api.getResourceList();
      setItems(list);
      onListChanged(list);
    } finally {
      setLoading(false);
    }
  }, [onListChanged]);

  useEffect(() => {
    if (open) load();
  }, [open, load]);

  async function addItem() {
    const name = newName.trim();
    if (!name) { setMsg("กรุณากรอกชื่อวัสดุ"); return; }
    setMsg("");
    try {
      await api.addResourceItem(name);
      setNewName("");
      await load();
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
    }
  }

  async function deleteItem(name: string) {
    if (!confirm(`ลบ "${name}" ออกจากรายการ?`)) return;
    try {
      await api.deleteResourceItem(name);
      await load();
    } catch (err) {
      alert(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
    }
  }

  return (
    <Modal id="resItemModal" open={open} onClose={onClose}>
      <h3 style={{ margin: "0 0 16px", fontSize: 17, fontWeight: 600, color: "var(--t1)", display: "flex", alignItems: "center", gap: 7 }}>
        <span className="material-symbols-rounded" style={{ color: "var(--p)", margin: 0, fontSize: 17 }}>inventory_2</span> จัดการรายการวัสดุ
        <button
          onClick={onClose}
          style={{ marginLeft: "auto", background: "rgba(0,0,0,.06)", border: "none", cursor: "pointer", color: "var(--t2)", fontSize: 26, lineHeight: 1, padding: "2px 6px", borderRadius: 8, flexShrink: 0 }}
        >
          ×
        </button>
      </h3>
      <div style={{ display: "flex", gap: 8, marginBottom: 6, alignItems: "center" }}>
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="ชื่อวัสดุใหม่"
          style={{ flex: 1, minWidth: 0, width: 0, margin: 0, padding: "12px 14px", borderRadius: 14, border: "1px solid var(--g-b2)", background: "rgba(255,255,255,.6)", fontFamily: "inherit", fontSize: 15, color: "var(--t1)", outline: "none" }}
        />
        <button className="btn primary" style={{ margin: 0, padding: "12px 16px", width: "auto", flexShrink: 0, borderRadius: 14 }} onClick={addItem}>
          <span className="material-symbols-rounded" style={{ margin: 0, fontSize: 20 }}>add</span>
        </button>
      </div>
      <div style={{ fontSize: 13, marginBottom: 8, color: "#ef4444", minHeight: 18 }}>{msg}</div>
      <div>
        {loading && <div style={{ fontSize: 13, color: "var(--t3)" }}>กำลังโหลด...</div>}
        {!loading && items.length === 0 && (
          <div style={{ fontSize: 13, color: "var(--t3)", padding: "8px 0" }}>ไม่มีรายการ</div>
        )}
        {!loading &&
          items.map((name) => (
            <div
              key={name}
              style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", marginBottom: 5, background: "rgba(255,255,255,.5)", border: "0.5px solid var(--g-b2)", borderRadius: 10 }}
            >
              <span className="material-symbols-rounded" style={{ fontSize: 15, color: "var(--p)", margin: 0, flexShrink: 0 }}>inventory_2</span>
              <span style={{ flex: 1, fontSize: 14, color: "var(--t1)" }}>{name}</span>
              <button
                onClick={() => deleteItem(name)}
                style={{ background: "rgba(239,68,68,.1)", border: "none", borderRadius: 8, padding: "4px 8px", cursor: "pointer", color: "#ef4444", fontSize: 12, fontFamily: "inherit", display: "flex", alignItems: "center", gap: 3 }}
              >
                <span className="material-symbols-rounded" style={{ fontSize: 14, margin: 0 }}>delete</span>
              </button>
            </div>
          ))}
      </div>
    </Modal>
  );
}
