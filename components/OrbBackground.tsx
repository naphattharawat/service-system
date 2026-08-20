"use client";

import { useEffect, useRef } from "react";

// Ported verbatim from old/index.html.txt (ORB_PALETTES + the color-shift interval near the end of the script).
const ORB_PALETTES: [string, string][] = [
  ["#c4b5fd", "#93c5fd"], ["#a5b4fc", "#7dd3fc"], ["#bae6fd", "#7dd3fc"],
  ["#fbcfe8", "#f9a8d4"], ["#fda4af", "#f9a8d4"], ["#f0abfc", "#e879f9"],
  ["#a7f3d0", "#6ee7b7"], ["#bbf7d0", "#86efac"],
  ["#fde68a", "#fcd34d"], ["#fed7aa", "#fdba74"],
  ["#fecdd3", "#fda4af"], ["#e9d5ff", "#c4b5fd"],
  ["#ffc8a0", "#ffaac8"], ["#ddc8ff", "#ffb8e0"], ["#ffd4b8", "#e8c8ff"],
  ["#ffb8c8", "#d8b8ff"], ["#ffc0b0", "#ffb0d0"], ["#e0b8ff", "#ffc0e0"],
  ["#ffd0a8", "#ffb0c8"], ["#d8c0ff", "#ffc8e8"],
  ["#99f6e4", "#67e8f9"], ["#6ee7b7", "#67e8f9"], ["#a5f3fc", "#5eead4"],
  ["#7fffd4", "#a0e9e0"], ["#b2f5ea", "#81e6d9"],
  ["#fca5a5", "#fb923c"], ["#fdba74", "#f87171"], ["#ffb347", "#ff8c69"],
  ["#ffc3a0", "#ffafbd"], ["#ff9a9e", "#fecfef"],
  ["#d9f99d", "#bef264"], ["#ecfccb", "#d9f99d"], ["#c6f135", "#a3e635"],
  ["#b8f57a", "#d4fc79"],
  ["#bfdbfe", "#a5b4fc"], ["#c7d2fe", "#818cf8"], ["#a0c4ff", "#b8d8ff"],
  ["#93c5fd", "#6366f1"],
  ["#fef08a", "#fde047"], ["#fcd34d", "#f59e0b"], ["#fef3c7", "#fde68a"],
  ["#fda4af", "#e879f9"], ["#f9a8d4", "#c084fc"], ["#fbcfe8", "#e9d5ff"],
  ["#ff9de2", "#d4a5f5"],
  ["#bbf7d0", "#a7f3d0"], ["#6ee7b7", "#a7f3d0"], ["#d1fae5", "#a7f3d0"],
];

function randomPalette() {
  return ORB_PALETTES[Math.floor(Math.random() * ORB_PALETTES.length)];
}

function lerpColor(a: string, b: string, t: number): string {
  const ah = parseInt(a.slice(1), 16);
  const bh = parseInt(b.slice(1), 16);
  const r = Math.round(((ah >> 16) & 0xff) * (1 - t) + ((bh >> 16) & 0xff) * t);
  const g = Math.round(((ah >> 8) & 0xff) * (1 - t) + ((bh >> 8) & 0xff) * t);
  const bl = Math.round((ah & 0xff) * (1 - t) + (bh & 0xff) * t);
  return "#" + [r, g, bl].map((v) => v.toString(16).padStart(2, "0")).join("");
}

export function OrbBackground() {
  const orb1Ref = useRef<HTMLDivElement>(null);
  const orb2Ref = useRef<HTMLDivElement>(null);
  const orb3Ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const els = [orb1Ref.current, orb2Ref.current, orb3Ref.current].filter(
      (el): el is HTMLDivElement => el !== null
    );
    const state = els.map((el, i) => ({
      el,
      pal: randomPalette(),
      next: randomPalette(),
      t: i * 0.33,
      speed: 0.0006 + i * 0.0002,
    }));
    state.forEach((o) => {
      o.el.style.background = `radial-gradient(circle at 38% 38%,${o.pal[0]},${o.pal[1]})`;
    });

    const id = setInterval(() => {
      state.forEach((o) => {
        o.t += o.speed * 6;
        if (o.t >= 1) {
          o.t = 0;
          o.pal = o.next;
          o.next = randomPalette();
        }
        const c1 = lerpColor(o.pal[0], o.next[0], o.t);
        const c2 = lerpColor(o.pal[1], o.next[1], o.t);
        o.el.style.background = `radial-gradient(circle at 38% 38%,${c1},${c2})`;
      });
    }, 100);

    return () => clearInterval(id);
  }, []);

  return (
    <div className="bg">
      <div className="orb orb-1" ref={orb1Ref} />
      <div className="orb orb-2" ref={orb2Ref} />
      <div className="orb orb-3" ref={orb3Ref} />
    </div>
  );
}
