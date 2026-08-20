"use client";

import { useEffect, useRef } from "react";

// Ported from old/index.html.txt's initPTR(), scoped per-page: in the legacy
// single-page app this listened globally and asked "is admin or search
// active?"; here each page mounts its own instance instead.
export function PullToRefresh({
  onRefresh,
  children,
}: {
  onRefresh: () => Promise<void> | void;
  children: React.ReactNode;
}) {
  const indicatorRef = useRef<HTMLDivElement>(null);
  const onRefreshRef = useRef(onRefresh);

  useEffect(() => {
    onRefreshRef.current = onRefresh;
  }, [onRefresh]);

  useEffect(() => {
    const ind = indicatorRef.current;
    if (!ind) return;

    const THRESHOLD = 80;
    let startY = 0;
    let currentY = 0;
    let pulling = false;

    function onTouchStart(e: TouchEvent) {
      if (window.scrollY > 0) return;
      startY = e.touches[0].clientY;
      pulling = true;
    }

    function onTouchMove(e: TouchEvent) {
      if (!pulling) return;
      currentY = e.touches[0].clientY;
      const diff = currentY - startY;
      if (diff <= 0) return;
      ind!.style.top = `${Math.min(diff * 0.4, 60)}px`;
      ind!.classList.add("visible");
      if (diff >= THRESHOLD) ind!.classList.add("ready");
      else ind!.classList.remove("ready");
    }

    async function onTouchEnd() {
      if (!pulling) return;
      pulling = false;
      const diff = currentY - startY;
      if (diff >= THRESHOLD) {
        ind!.classList.remove("ready");
        ind!.classList.add("loading");
        await onRefreshRef.current();
        setTimeout(() => {
          ind!.classList.remove("visible", "loading");
          ind!.style.top = "0px";
        }, 1200);
      } else {
        ind!.classList.remove("visible", "ready");
        ind!.style.top = "0px";
      }
      startY = 0;
      currentY = 0;
    }

    document.addEventListener("touchstart", onTouchStart, { passive: true });
    document.addEventListener("touchmove", onTouchMove, { passive: true });
    document.addEventListener("touchend", onTouchEnd);
    return () => {
      document.removeEventListener("touchstart", onTouchStart);
      document.removeEventListener("touchmove", onTouchMove);
      document.removeEventListener("touchend", onTouchEnd);
    };
  }, []);

  return (
    <>
      <div className="ptr-indicator" ref={indicatorRef}>
        <span className="material-symbols-rounded">cached</span>
      </div>
      {children}
    </>
  );
}
