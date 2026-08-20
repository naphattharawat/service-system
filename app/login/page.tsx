"use client";

import { useState, type KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api-client";
import { Card } from "@/components/Card";

export default function LoginPage() {
  const router = useRouter();
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  async function login() {
    setLoading(true);
    setMsg("");
    try {
      const res = await api.login(user, pass);
      if (res.success) {
        router.push("/admin");
      } else {
        setMsg("รหัสผ่านผิด หรือบัญชีถูกระงับ");
      }
    } catch {
      setMsg("เกิดข้อผิดพลาด กรุณาลองใหม่");
    } finally {
      setLoading(false);
    }
  }

  function onUserKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") document.getElementById("loginPass")?.focus();
  }

  function onPassKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") login();
  }

  return (
    <div
      id="login"
      className="page active"
      style={{ justifyContent: "center", alignItems: "center", padding: "40px 16px" }}
    >
      <div style={{ width: "100%", maxWidth: 380, zIndex: 10, position: "relative" }}>
        <button className="back-btn" style={{ marginBottom: 8 }} onClick={() => router.push("/")}>
          <span className="material-symbols-rounded">arrow_back</span> ย้อนกลับ
        </button>
        <Card>
          <div style={{ textAlign: "center", marginBottom: 20 }}>
            <div
              style={{
                width: 52, height: 52, borderRadius: 16,
                background: "linear-gradient(145deg,rgba(124,158,248,.18),rgba(124,158,248,.08))",
                border: "1px solid rgba(124,158,248,.22)", display: "flex", alignItems: "center",
                justifyContent: "center", margin: "0 auto 12px",
              }}
            >
              <span className="material-symbols-rounded" style={{ fontSize: 26, color: "var(--p)", margin: 0 }}>
                lock
              </span>
            </div>
            <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: ".2em", textTransform: "uppercase", color: "var(--p)", opacity: 0.85 }}>
              Staff Access
            </div>
          </div>
          <h2 style={{ justifyContent: "center", marginBottom: 20 }}>เข้าสู่ระบบ</h2>
          <input
            placeholder="Username"
            value={user}
            onChange={(e) => setUser(e.target.value)}
            onKeyDown={onUserKeyDown}
          />
          <input
            id="loginPass"
            type="password"
            placeholder="Password"
            value={pass}
            onChange={(e) => setPass(e.target.value)}
            onKeyDown={onPassKeyDown}
          />
          <button className="btn primary" style={{ marginTop: 18 }} onClick={login} disabled={loading}>
            <span className="material-symbols-rounded" style={loading ? { animation: "spin 1s linear infinite" } : undefined}>
              {loading ? "cached" : "login"}
            </span>
            {loading ? "รอสักครู่..." : "เข้าสู่ระบบ"}
          </button>
          {msg && <div style={{ color: "#c04040", marginTop: 10, fontSize: 13, fontWeight: 500, textAlign: "center" }}>{msg}</div>}
        </Card>
      </div>
    </div>
  );
}
