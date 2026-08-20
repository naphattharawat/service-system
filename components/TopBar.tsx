import type { ReactNode } from "react";

export function TopBar({
  title,
  onBack,
  backIcon = "arrow_back",
  backLabel,
  right,
}: {
  title: string;
  onBack: () => void;
  backIcon?: string;
  backLabel?: string;
  right?: ReactNode;
}) {
  return (
    <div className="topbar">
      <button className="back-btn" onClick={onBack}>
        <span className="material-symbols-rounded">{backIcon}</span>
        {backLabel}
      </button>
      <div className="topbar-title">{title}</div>
      {right}
    </div>
  );
}
