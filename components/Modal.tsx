import type { CSSProperties, MouseEvent, ReactNode } from "react";

// Generic shell for the legacy app's 5 modals (editModal, changePwModal,
// viewResModal, resItemModal, notifModal). Rendering with a matching `id`
// keeps the id-scoped glass/dark-mode overrides in app/globals.css applied
// to the inner content div automatically.
export function Modal({
  id,
  open,
  onClose,
  children,
  align = "center",
  zIndex = 9999,
}: {
  id: string;
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  align?: "center" | "top-right";
  zIndex?: number;
}) {
  if (!open) return null;

  const style: CSSProperties = {
    display: "flex",
    position: "fixed",
    inset: 0,
    background: "rgba(8,14,26,.12)",
    backdropFilter: "blur(6px)",
    WebkitBackdropFilter: "blur(6px)",
    zIndex,
    padding: align === "top-right" ? "70px 16px 0" : "16px",
    alignItems: align === "top-right" ? "flex-start" : "center",
    justifyContent: align === "top-right" ? "flex-end" : "center",
  };

  function handleBackdropClick(e: MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) onClose();
  }

  return (
    <div id={id} style={style} onClick={handleBackdropClick}>
      <div>{children}</div>
    </div>
  );
}
