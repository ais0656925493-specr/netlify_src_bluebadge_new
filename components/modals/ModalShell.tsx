"use client";

import { useEffect } from "react";

type Props = {
  id?: string;
  open: boolean;
  onClose?: () => void;
  children: React.ReactNode;
  panelClassName?: string;
};

export default function ModalShell({
  id,
  open,
  onClose,
  children,
  panelClassName = "",
}: Props) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && onClose) onClose();
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      id={id}
      className="app-modal-overlay fixed inset-0 z-[1000]"
      onClick={(e) => {
        if (e.target === e.currentTarget && onClose) onClose();
      }}
    >
      <div className={`app-modal-panel ${panelClassName}`.trim()}>{children}</div>
    </div>
  );
}
