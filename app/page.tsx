"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api-client";
import { computeHomeGate, type HomeGateResult } from "@/lib/business-hours";
import { useDarkMode } from "@/hooks/useDarkMode";
import { Card } from "@/components/Card";
import { OffHoursClock } from "@/components/OffHoursClock";

export default function HomePage() {
  const router = useRouter();
  const { isDark, toggle } = useDarkMode();
  const [gate, setGate] = useState<HomeGateResult | null>(null);
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    let cancelled = false;
    api
      .getSystemStatus()
      .then((status) => {
        if (!cancelled) setGate(computeHomeGate(status));
      })
      .catch(() => {
        if (!cancelled) setGate(computeHomeGate(null));
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!gate) return;
    const t = setTimeout(() => setShowSplash(false), 600);
    return () => clearTimeout(t);
  }, [gate]);

  return (
    <>
      {showSplash && <SplashScreen fadingOut={!!gate} />}
      {gate?.showHome && <HomeContent isDark={isDark} onToggleDark={toggle} />}
      {gate && !gate.showHome && (
        <OffHoursContent
          holiday={gate.holiday}
          holidayName={gate.holidayName}
          onSearch={() => router.push("/search")}
          onLogin={() => router.push("/login")}
        />
      )}
    </>
  );
}

function SplashScreen({ fadingOut }: { fadingOut: boolean }) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "linear-gradient(135deg,#dce8ff 0%,#f0e0ff 50%,#ffe0e8 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
        transition: "opacity .6s ease",
        opacity: fadingOut ? 0 : 1,
      }}
    >
      <div
        style={{
          position: "absolute", width: 220, height: 220, borderRadius: "50%",
          background: "radial-gradient(circle,#c4b5fd,#93c5fd)", top: -60, left: -60,
          filter: "blur(60px)", opacity: 0.55, animation: "orbDrift 6s ease-in-out infinite alternate",
        }}
      />
      <div
        style={{
          position: "absolute", width: 180, height: 180, borderRadius: "50%",
          background: "radial-gradient(circle,#fbcfe8,#f9a8d4)", bottom: -40, right: -40,
          filter: "blur(60px)", opacity: 0.55, animation: "orbDrift 8s ease-in-out infinite alternate-reverse",
        }}
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/logo.png"
        alt="โลโก้"
        style={{
          width: 76, height: 76, objectFit: "contain", borderRadius: 22,
          boxShadow: "0 8px 28px rgba(100,130,220,.22)",
          animation: "splashLogoIn .6s cubic-bezier(.16,1,.3,1) both",
          position: "relative", zIndex: 1,
        }}
      />
      <div
        style={{
          fontSize: 16, fontWeight: 600, color: "var(--t1)", textAlign: "center", lineHeight: 1.5,
          animation: "splashTextIn .6s .2s cubic-bezier(.16,1,.3,1) both", position: "relative", zIndex: 1,
        }}
      >
        งานเวชนิทัศน์และ<br />โสตทัศนศึกษา
      </div>
      <div
        style={{
          fontSize: 11, color: "var(--p)", letterSpacing: ".18em",
          animation: "splashTextIn .6s .35s cubic-bezier(.16,1,.3,1) both", position: "relative", zIndex: 1,
        }}
      >
        Smart Service System
      </div>
      <div
        style={{
          display: "flex", gap: 6, marginTop: 6,
          animation: "splashTextIn .6s .5s cubic-bezier(.16,1,.3,1) both", position: "relative", zIndex: 1,
        }}
      >
        {[0, 0.2, 0.4].map((delay) => (
          <span
            key={delay}
            style={{
              width: 7, height: 7, borderRadius: "50%", background: "var(--p)",
              animation: `splashDot 1.2s ${delay}s ease-in-out infinite`,
            }}
          />
        ))}
      </div>
    </div>
  );
}

function HomeContent({ isDark, onToggleDark }: { isDark: boolean; onToggleDark: () => void }) {
  const router = useRouter();
  return (
    <div id="home" className="page active">
      <div className="home-inner">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.png" className="logo" alt="logo" />
        <div className="brand">ระบบขอรับบริการออนไลน์</div>
        <div className="brand">งานเวชนิทัศน์และโสตทัศนศึกษา</div>
        <span className="brand-sub">Smart Service System</span>

        <button className="home-btn home-btn-primary" onClick={() => router.push("/service")}>
          <div className="home-btn-icon">
            <span className="material-symbols-rounded" style={{ color: "#fff", margin: 0, fontSize: 17 }}>
              edit_document
            </span>
          </div>
          <div className="home-btn-text">
            ขอรับบริการออนไลน์
            <span>กรอกฟอร์มส่งงานใหม่</span>
          </div>
          <span className="material-symbols-rounded" style={{ color: "rgba(255,255,255,.55)", margin: 0, fontSize: 15 }}>
            chevron_right
          </span>
        </button>

        <button className="home-btn home-btn-glass" onClick={() => router.push("/search")}>
          <div className="home-btn-icon">
            <span className="material-symbols-rounded" style={{ color: "var(--p)", margin: 0, fontSize: 17 }}>
              search
            </span>
          </div>
          <div className="home-btn-text">
            ติดตามสถานะงาน
            <span>ค้นหาด้วยเลขงานหรือชื่อ</span>
          </div>
          <span className="material-symbols-rounded" style={{ color: "var(--t3)", margin: 0, fontSize: 15 }}>
            chevron_right
          </span>
        </button>

        <button className="home-btn home-btn-glass" onClick={() => router.push("/login")}>
          <div className="home-btn-icon">
            <span className="material-symbols-rounded" style={{ color: "var(--t2)", margin: 0, fontSize: 17 }}>
              admin_panel_settings
            </span>
          </div>
          <div className="home-btn-text">
            เข้าสู่ระบบเจ้าหน้าที่
            <span>สำหรับ Staff และ Admin</span>
          </div>
          <span className="material-symbols-rounded" style={{ color: "var(--t3)", margin: 0, fontSize: 15 }}>
            chevron_right
          </span>
        </button>

        <button className="home-btn home-btn-glass" onClick={() => router.push("/help")}>
          <div className="home-btn-icon">
            <span className="material-symbols-rounded" style={{ color: "var(--t2)", margin: 0, fontSize: 17 }}>
              help_outline
            </span>
          </div>
          <div className="home-btn-text">
            วิธีใช้งาน
            <span>คู่มือการใช้ระบบ</span>
          </div>
          <span className="material-symbols-rounded" style={{ color: "var(--t3)", margin: 0, fontSize: 15 }}>
            chevron_right
          </span>
        </button>

        <div className="divider">
          <div className="divider-dot" />
        </div>

        <button id="darkToggleBtn" className="btn neutral" onClick={onToggleDark}>
          <span className="material-symbols-rounded">{isDark ? "light_mode" : "dark_mode"}</span>
          <span>{isDark ? "โหมดกลางวัน" : "โหมดกลางคืน"}</span>
        </button>

        <div className="home-notice">
          <span className="material-symbols-rounded">info</span>
          กรุณาจดจำเลขลำดับงานไว้ทุกครั้งหลังส่งคำขอ
        </div>
      </div>
    </div>
  );
}

function OffHoursContent({
  holiday,
  holidayName,
  onSearch,
  onLogin,
}: {
  holiday: boolean;
  holidayName: string;
  onSearch: () => void;
  onLogin: () => void;
}) {
  return (
    <div
      id="offHours"
      className="page active"
      style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: "40px 16px", minHeight: "100dvh" }}
    >
      <div className="wrap" style={{ textAlign: "center", maxWidth: 400 }}>
        <Card>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo.png"
            alt="โลโก้"
            style={{ width: 64, height: 64, objectFit: "contain", borderRadius: 16, margin: "0 auto 6px", display: "block", filter: "drop-shadow(0 4px 12px rgba(100,130,220,.2))" }}
          />
          <div style={{ fontSize: 12, color: "var(--p)", letterSpacing: ".1em", marginBottom: 14 }}>
            งานเวชนิทัศน์และโสตทัศนศึกษา
          </div>

          <OffHoursClock />

          {holiday && (
            <div
              style={{
                display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(239,68,68,.08)",
                border: "1px solid rgba(239,68,68,.2)", borderRadius: 99, padding: "5px 14px", fontSize: 12,
                color: "#c04040", marginBottom: 10,
              }}
            >
              <span className="material-symbols-rounded" style={{ fontSize: 15, margin: 0, color: "#c04040" }}>
                event
              </span>
              <span>วันหยุดราชการ</span>
            </div>
          )}

          <div className="brand" style={{ fontSize: 22, marginBottom: 6 }}>
            {holiday && holidayName ? holidayName : "นอกเวลาทำการ"}
          </div>
          <div style={{ width: 36, height: 2, background: "var(--p)", borderRadius: 99, margin: "0 auto 14px" }} />
          <div style={{ fontSize: 15, color: "var(--t2)", lineHeight: 1.9, marginBottom: 16 }}>
            ระบบให้บริการเฉพาะ<br />
            <b style={{ color: "var(--t1)", fontWeight: 500 }}>วันจันทร์ – วันศุกร์</b><br />
            เวลา <b style={{ color: "var(--p)" }}>08:30 – 16:30 น.</b><br />
            <span style={{ fontSize: 13, color: "var(--t3)" }}>(หยุดเสาร์ – อาทิตย์)</span>
          </div>
          <div style={{ width: "100%", height: 0.5, background: "var(--g-b2)", marginBottom: 12 }} />
          <button className="btn secondary" onClick={onSearch} style={{ margin: "0 0 12px" }}>
            <span className="material-symbols-rounded">search</span> ติดตามสถานะงาน
          </button>
          <div style={{ width: "100%", height: 0.5, background: "var(--g-b2)", marginBottom: 12 }} />
          <button className="btn secondary" onClick={onLogin} style={{ margin: "0 0 14px" }}>
            <span className="material-symbols-rounded">admin_panel_settings</span> เข้าสู่ระบบเจ้าหน้าที่
          </button>
          <div style={{ width: "100%", height: 0.5, background: "var(--g-b2)", marginBottom: 12 }} />
          <div style={{ fontSize: 11, color: "var(--t3)", marginBottom: 6, letterSpacing: ".06em" }}>ติดต่อสอบถาม</div>
          <div style={{ background: "rgba(124,158,248,.06)", border: "1px solid rgba(124,158,248,.15)", borderRadius: 12, padding: "10px 14px" }}>
            <div style={{ fontSize: 15, fontWeight: 500, color: "var(--t1)", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
              <span className="material-symbols-rounded" style={{ fontSize: 16, margin: 0, color: "var(--p)" }}>
                phone_in_talk
              </span>
              037-211-088 ต่อ 2516
            </div>
            <div style={{ fontSize: 12, color: "var(--t3)", marginTop: 3 }}>วันจันทร์ – ศุกร์ เวลา 08:30 – 16:30 น.</div>
          </div>
        </Card>
      </div>
    </div>
  );
}
