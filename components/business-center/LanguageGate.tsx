"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { LANGUAGE_OPTIONS } from "@/lib/i18n";
import { useLocale } from "@/components/business-center/LocaleContext";

type Props = {
  visible: boolean;
  checking: boolean;
  dismissible?: boolean;
  onClose?: () => void;
  onConfirm: (lang: string, label: string) => void;
};

export default function LanguageGate({
  visible,
  checking,
  dismissible = false,
  onClose,
  onConfirm,
}: Props) {
  const { lang, setLang } = useLocale();
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(lang);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSelected(lang);
  }, [lang]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  const label = useMemo(() => {
    return (
      LANGUAGE_OPTIONS.find((item) => item.code === selected)?.label ||
      "English (US)"
    );
  }, [selected]);

  const classes = [
    checking ? "is-checking" : "",
    !visible && !checking ? "hidden" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      id="languageGate"
      className={classes || undefined}
      role="dialog"
      aria-modal="true"
      aria-labelledby="languageGateTitle"
    >
      <div className="language-modal" ref={rootRef}>
        {dismissible ? (
          <button
            type="button"
            className="language-close"
            aria-label="Close"
            onClick={onClose}
          >
            ×
          </button>
        ) : null}
        <h2 id="languageGateTitle">Change language</h2>
        <div className="language-field">
          <label htmlFor="languageToggle">Language</label>
          <button
            type="button"
            id="languageToggle"
            className={`language-toggle${open ? " is-open" : ""}`}
            aria-expanded={open}
            aria-haspopup="listbox"
            onClick={() => setOpen((v) => !v)}
          >
            <span id="languageToggleLabel">{label}</span>
          </button>
          <div
            id="languageDropdown"
            className={`language-dropdown${open ? " is-open" : ""}`}
            role="listbox"
          >
            {LANGUAGE_OPTIONS.map((item) => (
              <button
                key={item.code}
                type="button"
                className={`language-option${item.code === selected ? " is-selected" : ""}`}
                role="option"
                aria-selected={item.code === selected}
                onClick={() => {
                  setSelected(item.code);
                  setOpen(false);
                }}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
        <div className="language-modal-actions">
          <button
            type="button"
            className="language-confirm-btn"
            onClick={() => {
              setLang(selected);
              onConfirm(selected, label);
            }}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
