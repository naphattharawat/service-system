"use client";

import { useCallback, useState } from "react";

function readInitialDark(): boolean {
  if (typeof document === "undefined") return false;
  return document.body.classList.contains("dark");
}

export function useDarkMode() {
  const [isDark, setIsDark] = useState(readInitialDark);

  const toggle = useCallback(() => {
    const next = !document.body.classList.contains("dark");
    document.body.classList.toggle("dark", next);
    localStorage.setItem("dm", next ? "1" : "0");
    setIsDark(next);
  }, []);

  return { isDark, toggle };
}
