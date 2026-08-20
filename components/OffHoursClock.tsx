"use client";

import { useEffect, useRef, useState } from "react";

const DAYS = ["อาทิตย์", "จันทร์", "อังคาร", "พุธ", "พฤหัสบดี", "ศุกร์", "เสาร์"];
const TICK_ANGLES = [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330];

export function OffHoursClock() {
  const [text, setText] = useState("");
  const hhRef = useRef<SVGLineElement>(null);
  const mhRef = useRef<SVGLineElement>(null);
  const shRef = useRef<SVGLineElement>(null);

  useEffect(() => {
    function update() {
      const now = new Date();
      const thai = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Bangkok" }));
      const h = thai.getHours() % 12;
      const m = thai.getMinutes();
      const s = thai.getSeconds();
      const t = thai.toLocaleTimeString("th-TH", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
      setText(`${t} น. (${DAYS[thai.getDay()]})`);
      hhRef.current?.setAttribute("transform", `rotate(${h * 30 + m * 0.5} 70 70)`);
      mhRef.current?.setAttribute("transform", `rotate(${m * 6} 70 70)`);
      shRef.current?.setAttribute("transform", `rotate(${s * 6} 70 70)`);
    }
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <>
      <svg
        width="110"
        height="110"
        viewBox="0 0 140 140"
        style={{ display: "block", margin: "0 auto", filter: "drop-shadow(0 4px 16px rgba(124,158,248,.25))" }}
      >
        <circle cx="70" cy="70" r="65" fill="rgba(255,255,255,.5)" stroke="rgba(255,255,255,.95)" strokeWidth={2} />
        <circle cx="70" cy="70" r="60" fill="none" stroke="rgba(124,158,248,.15)" strokeWidth={0.5} />
        <g stroke="rgba(124,158,248,.5)" strokeWidth={2} strokeLinecap="round">
          {TICK_ANGLES.map((deg) => (
            <line key={deg} x1="70" y1="14" x2="70" y2="22" transform={`rotate(${deg} 70 70)`} />
          ))}
        </g>
        <line ref={hhRef} x1="70" y1="70" x2="70" y2="36" stroke="#7c9ef8" strokeWidth={4} strokeLinecap="round" />
        <line ref={mhRef} x1="70" y1="70" x2="70" y2="24" stroke="#a78bfa" strokeWidth={2.5} strokeLinecap="round" />
        <line ref={shRef} x1="70" y1="78" x2="70" y2="18" stroke="#f9a8d4" strokeWidth={1.5} strokeLinecap="round" />
        <circle cx="70" cy="70" r="4" fill="#7c9ef8" />
        <circle cx="70" cy="70" r="2" fill="white" />
      </svg>
      <div style={{ fontSize: 13, color: "rgba(20,30,50,.75)", margin: "8px 0 12px" }}>{text}</div>
    </>
  );
}
