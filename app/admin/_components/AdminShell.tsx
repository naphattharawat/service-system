"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AdminDataProvider, useAdminData } from "@/contexts/AdminDataContext";
import { ChangePasswordModal } from "./ChangePasswordModal";
import { NotifModal } from "./NotifModal";
import { api } from "@/lib/api-client";
import { useDarkMode } from "@/hooks/useDarkMode";
import type { SessionUser } from "@/types";

export function AdminShell({ session, children }: { session: SessionUser; children: React.ReactNode }) {
  return (
    <AdminDataProvider session={session}>
      <AdminShellInner session={session}>{children}</AdminShellInner>
    </AdminDataProvider>
  );
}

function AdminShellInner({ session: initialSession, children }: { session: SessionUser; children: React.ReactNode }) {
  const router = useRouter();
  const data = useAdminData();
  const { isDark, toggle: toggleDark } = useDarkMode();
  const [session, setSession] = useState(initialSession);
  const [pwOpen, setPwOpen] = useState(false);
  const [pwKey, setPwKey] = useState(0);
  const [notifOpen, setNotifOpen] = useState(false);
  const [sysBusy, setSysBusy] = useState(false);

  const isAdmin = session.role === "admin";
  const badgeTotal = data.myWaitingJobs.length + data.unassignedJobs.length;
  const activeStaffNames = data.users.filter((u) => u.active).map((u) => u.name);

  async function logout() {
    await api.logout();
    router.push("/");
  }

  function openChangePw() {
    setPwKey((k) => k + 1);
    setPwOpen(true);
  }

  function openNotif() {
    setNotifOpen(true);
    data.refreshJobs();
  }

  async function toggleSysOverride() {
    const isOn = !!data.systemOpen;
    const msg = isOn ? "ต้องการปิดระบบกลับเป็นปกติ?" : "ต้องการเปิดระบบนอกเวลาทำการ?\n(ทุกคนจะเข้าใช้งานได้ทันที)";
    if (!confirm(msg)) return;
    setSysBusy(true);
    try {
      await data.setSystemOpen(!isOn);
    } catch {
      alert("เกิดข้อผิดพลาด กรุณาลองใหม่");
    } finally {
      setSysBusy(false);
    }
  }

  return (
    <div id="admin" className="page active">
      <div className="topbar">
        <button className="back-btn" onClick={logout}>
          <span className="material-symbols-rounded">logout</span>
        </button>
        <div className="topbar-title">{isAdmin ? "Admin" : "Staff"}</div>
        {isAdmin && (
          <button
            onClick={toggleSysOverride}
            disabled={sysBusy}
            style={{
              display: "flex", alignItems: "center", gap: 4, padding: "5px 10px", borderRadius: 99, border: "none",
              cursor: "pointer", fontFamily: "inherit", fontSize: 12, fontWeight: 500, transition: "all .2s",
              background: data.systemOpen ? "rgba(16,185,129,.12)" : "rgba(200,210,230,.3)",
              color: data.systemOpen ? "#10b981" : "var(--t3)",
            }}
          >
            <span className="material-symbols-rounded" style={{ fontSize: 15, margin: 0 }}>power_settings_new</span>
            <span>{data.systemOpen ? "เปิดอยู่" : "ปิดอยู่"}</span>
          </button>
        )}
        <button onClick={openNotif} style={{ position: "relative", background: "none", border: "none", cursor: "pointer", padding: 6, marginRight: 6 }}>
          <span className="material-symbols-rounded" style={{ fontSize: 22, color: "var(--t2)", margin: 0 }}>notifications</span>
          {badgeTotal > 0 && (
            <span
              style={{
                position: "absolute", top: 2, right: 2, width: 16, height: 16, background: "#ef4444", borderRadius: "50%",
                fontSize: 10, fontWeight: 700, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", lineHeight: 1,
              }}
            >
              {badgeTotal > 9 ? "9+" : badgeTotal}
            </span>
          )}
        </button>
        <div className="admin-user-badge">
          <span className="material-symbols-rounded">account_circle</span>
          <span>{session.name}</span>
        </div>
      </div>

      <div className="wrap inner-page" style={{ paddingTop: 14 }}>
        <div className="admin-nav" id="adminNavTop" style={!isAdmin ? { gridTemplateColumns: "repeat(2,1fr)" } : undefined}>
          {isAdmin && (
            <Link href="/admin?view=all" className="btn secondary">
              <span className="material-symbols-rounded">list_alt</span>ทั้งหมด
            </Link>
          )}
          <Link href="/admin?view=my" className="btn secondary">
            <span className="material-symbols-rounded">person</span>งานของฉัน
          </Link>
          {isAdmin && (
            <Link href="/admin/resources" className="btn secondary">
              <span className="material-symbols-rounded">inventory_2</span>ทรัพยากร
            </Link>
          )}
          {!isAdmin && (
            <button className="btn secondary" onClick={openChangePw}>
              <span className="material-symbols-rounded">key</span>บัญชีของฉัน
            </button>
          )}
        </div>

        {isAdmin && (
          <div className="admin-nav admin-nav-bottom" id="adminNavBottom">
            <Link href="/admin/users" className="btn secondary">
              <span className="material-symbols-rounded">manage_accounts</span>ผู้ใช้
            </Link>
            <button className="btn secondary" onClick={openChangePw}>
              <span className="material-symbols-rounded">key</span>บัญชีของฉัน
            </button>
          </div>
        )}

        {children}
      </div>

      <button
        onClick={toggleDark}
        style={{
          position: "fixed", bottom: 24, right: 20, zIndex: 999, width: 48, height: 48, borderRadius: "50%",
          background: "rgba(255,255,255,.45)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
          border: "1px solid rgba(255,255,255,.9)", boxShadow: "0 4px 16px rgba(100,130,220,.15),inset 0 1px 0 rgba(255,255,255,1)",
          cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
        }}
      >
        <span className="material-symbols-rounded" style={{ fontSize: 22, margin: 0, color: "var(--t2)" }}>
          {isDark ? "light_mode" : "dark_mode"}
        </span>
      </button>

      <ChangePasswordModal
        key={pwKey}
        open={pwOpen}
        onClose={() => setPwOpen(false)}
        session={session}
        onUsernameChanged={(newUser) => setSession((s) => ({ ...s, user: newUser }))}
      />
      <NotifModal
        open={notifOpen}
        onClose={() => setNotifOpen(false)}
        session={session}
        myWaitingJobs={data.myWaitingJobs}
        unassignedJobs={data.unassignedJobs}
        staffOptions={activeStaffNames}
        onJobsChanged={data.refreshJobs}
      />
    </div>
  );
}
