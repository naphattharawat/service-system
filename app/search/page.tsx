"use client";

import { useState, type KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api-client";
import { TopBar } from "@/components/TopBar";
import { Card } from "@/components/Card";
import { PullToRefresh } from "@/components/PullToRefresh";
import type { JobSearchResult } from "@/types";

function statusColor(status: string): { sc: string; sb: string } {
  if (status.includes("เสร็จ")) return { sc: "#10b981", sb: "rgba(16, 185, 129, 0.15)" };
  if (status.includes("กำลัง")) return { sc: "#3b82f6", sb: "rgba(59, 130, 246, 0.15)" };
  if (status.includes("ยกเลิก")) return { sc: "#ef4444", sb: "rgba(239, 68, 68, 0.15)" };
  return { sc: "#f59e0b", sb: "rgba(245, 158, 11, 0.15)" };
}

export default function SearchPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [result, setResult] = useState<JobSearchResult | null>(null);
  const [error, setError] = useState(false);

  async function doSearch() {
    setLoading(true);
    setSearched(true);
    setError(false);
    try {
      const data = await api.searchJob(query);
      setResult(data);
    } catch {
      setError(true);
      setResult(null);
    } finally {
      setLoading(false);
    }
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") doSearch();
  }

  return (
    <PullToRefresh onRefresh={doSearch}>
      <div id="search" className="page active">
        <TopBar title="ติดตามสถานะงาน" onBack={() => router.push("/")} />
        <div className="wrap inner-page" style={{ paddingTop: 16 }}>
          <Card>
            <input
              placeholder="เลขลำดับงาน หรือ ชื่อผู้สั่ง…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={onKeyDown}
            />
            <button className="btn primary" style={{ marginTop: 12 }} onClick={doSearch}>
              <span className="material-symbols-rounded">search</span> ค้นหา
            </button>
          </Card>

          <div style={{ wordBreak: "break-word", overflowWrap: "break-word" }}>
            {loading && <SkeletonCards />}
            {!loading && searched && error && (
              <div className="glass-card" style={{ textAlign: "center" }}>
                เกิดข้อผิดพลาด กรุณาลองใหม่
              </div>
            )}
            {!loading && searched && !error && !result && (
              <div className="glass-card" style={{ textAlign: "center" }}>
                ไม่พบข้อมูลในระบบ
              </div>
            )}
            {!loading && result && <ResultCard result={result} />}
          </div>
        </div>
      </div>
    </PullToRefresh>
  );
}

function ResultCard({ result }: { result: JobSearchResult }) {
  const { sc, sb } = statusColor(result.status);
  return (
    <div className="glass-card" style={{ borderLeft: `5px solid ${sc}`, marginTop: 16 }}>
      <div className="noise" />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
        <div>
          <div style={{ fontSize: 26, fontWeight: 800, color: "var(--p)" }}>#{result.id}</div>
          <div style={{ fontSize: 14, fontWeight: 600, color: "var(--t2)" }}>{result.name}</div>
        </div>
        <span style={{ background: sb, color: sc, padding: "5px 12px", borderRadius: 99, fontSize: 13, fontWeight: 700 }}>
          {result.status}
        </span>
      </div>
      <div style={{ fontSize: 14, lineHeight: 1.85 }}>
        <b>หน่วยงาน:</b> {result.department || "-"}<br />
        <b>ประเภทงาน:</b> {result.type || "-"}<br />
        <b>วันที่สั่ง:</b> {result.orderDate || "-"} &nbsp;|&nbsp; <b>ต้องการ:</b> {result.needDate || "-"}<br />
        <b>รายละเอียด:</b> {result.detail || "-"}
        <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid rgba(0,0,0,0.05)" }}>
          <b>ผู้รับผิดชอบ:</b> {result.owner || "-"}<br />
          <b>หมายเหตุ:</b> {result.note || "-"}
        </div>
      </div>
    </div>
  );
}

function SkeletonCards() {
  return (
    <>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          style={{
            background: "rgba(255,255,255,.08)", backdropFilter: "blur(32px)",
            border: "1px solid rgba(255,255,255,.55)", borderRadius: 24, padding: 20,
            marginBottom: 10, overflow: "hidden", position: "relative",
          }}
        >
          <div style={{ background: "linear-gradient(90deg,rgba(255,255,255,.06) 25%,rgba(255,255,255,.14) 50%,rgba(255,255,255,.06) 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.4s infinite", borderRadius: 6, height: 20, width: "40%", marginBottom: 10 }} />
          <div style={{ background: "linear-gradient(90deg,rgba(255,255,255,.06) 25%,rgba(255,255,255,.14) 50%,rgba(255,255,255,.06) 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.4s infinite .1s", borderRadius: 6, height: 14, width: "60%", marginBottom: 8 }} />
          <div style={{ background: "linear-gradient(90deg,rgba(255,255,255,.06) 25%,rgba(255,255,255,.14) 50%,rgba(255,255,255,.06) 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.4s infinite .2s", borderRadius: 6, height: 14, width: "80%", marginBottom: 8 }} />
          <div style={{ background: "linear-gradient(90deg,rgba(255,255,255,.06) 25%,rgba(255,255,255,.14) 50%,rgba(255,255,255,.06) 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.4s infinite .3s", borderRadius: 6, height: 14, width: "50%" }} />
        </div>
      ))}
    </>
  );
}
