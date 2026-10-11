"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import ModalShell from "@/components/modals/ModalShell";
import { useLocale } from "@/components/business-center/LocaleContext";
import { fetchUserLocation } from "@/lib/clientLocation";
import { getDobLocale } from "@/lib/i18n";
import type { ClientFormData } from "@/lib/types";

const DIAL_CODES = [
  { iso: "vn", dial: "+84" },
  { iso: "us", dial: "+1" },
  { iso: "gb", dial: "+44" },
  { iso: "au", dial: "+61" },
  { iso: "ca", dial: "+1" },
  { iso: "cn", dial: "+86" },
  { iso: "tw", dial: "+886" },
  { iso: "hk", dial: "+852" },
  { iso: "jp", dial: "+81" },
  { iso: "kr", dial: "+82" },
  { iso: "th", dial: "+66" },
  { iso: "sg", dial: "+65" },
  { iso: "my", dial: "+60" },
  { iso: "id", dial: "+62" },
  { iso: "ph", dial: "+63" },
  { iso: "fr", dial: "+33" },
  { iso: "de", dial: "+49" },
  { iso: "es", dial: "+34" },
  { iso: "pt", dial: "+351" },
  { iso: "br", dial: "+55" },
  { iso: "it", dial: "+39" },
  { iso: "nl", dial: "+31" },
  { iso: "pl", dial: "+48" },
  { iso: "ru", dial: "+7" },
  { iso: "ua", dial: "+380" },
  { iso: "tr", dial: "+90" },
  { iso: "in", dial: "+91" },
  { iso: "ae", dial: "+971" },
  { iso: "sa", dial: "+966" },
  { iso: "il", dial: "+972" },
  { iso: "se", dial: "+46" },
  { iso: "no", dial: "+47" },
  { iso: "dk", dial: "+45" },
  { iso: "gr", dial: "+30" },
  { iso: "cz", dial: "+420" },
  { iso: "mn", dial: "+976" },
  { iso: "mx", dial: "+52" },
  { iso: "ar", dial: "+54" },
  { iso: "cl", dial: "+56" },
  { iso: "co", dial: "+57" },
  { iso: "pe", dial: "+51" },
  { iso: "za", dial: "+27" },
  { iso: "eg", dial: "+20" },
  { iso: "ng", dial: "+234" },
  { iso: "ke", dial: "+254" },
  { iso: "pk", dial: "+92" },
  { iso: "bd", dial: "+880" },
  { iso: "np", dial: "+977" },
  { iso: "mm", dial: "+95" },
  { iso: "kh", dial: "+855" },
  { iso: "la", dial: "+856" },
  { iso: "nz", dial: "+64" },
  { iso: "ie", dial: "+353" },
  { iso: "fi", dial: "+358" },
  { iso: "ch", dial: "+41" },
  { iso: "at", dial: "+43" },
  { iso: "be", dial: "+32" },
  { iso: "hu", dial: "+36" },
  { iso: "ro", dial: "+40" },
  { iso: "bg", dial: "+359" },
  { iso: "hr", dial: "+385" },
  { iso: "sk", dial: "+421" },
  { iso: "rs", dial: "+381" },
  { iso: "lt", dial: "+370" },
  { iso: "lv", dial: "+371" },
  { iso: "ee", dial: "+372" },
  { iso: "qa", dial: "+974" },
  { iso: "kw", dial: "+965" },
  { iso: "bh", dial: "+973" },
  { iso: "om", dial: "+968" },
  { iso: "jo", dial: "+962" },
  { iso: "ma", dial: "+212" },
  { iso: "tn", dial: "+216" },
  { iso: "lk", dial: "+94" },
  { iso: "kz", dial: "+7" },
  { iso: "uz", dial: "+998" },
];

function CountryFlag({ iso }: { iso: string }) {
  return (
    <img
      className="info-flag"
      src={`/icons/flags/${iso}.svg`}
      alt=""
      width={22}
      height={16}
    />
  );
}

type Props = {
  open: boolean;
  ticketId: string;
  onSubmit: (data: ClientFormData) => void;
};

export default function InfoFormModal({ open, ticketId, onSubmit }: Props) {
  const { t, tp, lang } = useLocale();
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    emailBusiness: "",
    fanpage: "",
    phone: "",
    phoneAlt: "",
  });
  const [dialIso, setDialIso] = useState("us");
  const [dialIsoAlt, setDialIsoAlt] = useState("us");
  const [activeDial, setActiveDial] = useState<"main" | "alt" | null>(null);
  const [menuBox, setMenuBox] = useState({ top: 0, left: 0, width: 280, maxHeight: 280 });
  const [facebookOn, setFacebookOn] = useState(true);
  const phoneRef = useRef<HTMLDivElement>(null);
  const phoneAltRef = useRef<HTMLDivElement>(null);
  const menuAnchorRef = useRef<HTMLDivElement | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const pickedMain = useRef(false);
  const pickedAlt = useRef(false);
  const dial = DIAL_CODES.find((item) => item.iso === dialIso)?.dial || "+1";
  const dialAlt = DIAL_CODES.find((item) => item.iso === dialIsoAlt)?.dial || "+1";
  const activeIso = activeDial === "alt" ? dialIsoAlt : dialIso;
  const dialOptions = useMemo(() => {
    const locale = getDobLocale(lang);
    let names: Intl.DisplayNames | null = null;
    try {
      names = new Intl.DisplayNames([locale], { type: "region" });
    } catch {
      names = null;
    }
    return [...DIAL_CODES]
      .map((item) => ({
        ...item,
        label: names?.of(item.iso.toUpperCase()) || item.iso.toUpperCase(),
      }))
      .sort((a, b) => a.label.localeCompare(b.label, locale));
  }, [lang]);

  const placeDialMenu = () => {
    const rect = menuAnchorRef.current?.getBoundingClientRect();
    if (!rect) return;
    const gap = 6;
    const spaceBelow = window.innerHeight - rect.bottom - gap - 12;
    const spaceAbove = rect.top - gap - 12;
    const openUp = spaceBelow < 200 && spaceAbove > spaceBelow;
    const maxHeight = Math.max(160, Math.min(280, openUp ? spaceAbove : spaceBelow));
    setMenuBox({
      top: openUp ? rect.top - gap - maxHeight : rect.bottom + gap,
      left: rect.left,
      width: rect.width,
      maxHeight,
    });
  };

  useEffect(() => {
    let alive = true;
    fetchUserLocation().then((location) => {
      if (!alive) return;
      const raw = (location.country_code || "").trim().toLowerCase();
      const iso = raw === "uk" ? "gb" : raw;
      const next = DIAL_CODES.some((item) => item.iso === iso) ? iso : "us";
      if (!pickedMain.current) setDialIso(next);
      if (!pickedAlt.current) setDialIsoAlt(next);
    });
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (!open) setActiveDial(null);
  }, [open]);

  useEffect(() => {
    if (!activeDial) return;
    placeDialMenu();
    const onLayout = () => placeDialMenu();
    const onDoc = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        phoneRef.current?.contains(target) ||
        phoneAltRef.current?.contains(target) ||
        menuRef.current?.contains(target)
      ) {
        return;
      }
      setActiveDial(null);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setActiveDial(null);
    };
    const form = phoneRef.current?.closest("form");
    window.addEventListener("resize", onLayout);
    form?.addEventListener("scroll", onLayout);
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    menuRef.current?.querySelector(".is-selected")?.scrollIntoView({ block: "nearest" });
    return () => {
      window.removeEventListener("resize", onLayout);
      form?.removeEventListener("scroll", onLayout);
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [activeDial]);

  const onChange = (key: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit({
      fullName: form.fullName.trim(),
      email: form.email.trim(),
      emailBusiness: form.emailBusiness.trim(),
      fanpage: form.fanpage.trim(),
      phone: `${dial} ${form.phone.trim()}`.trim(),
      phoneSecondary: form.phoneAlt.trim() ? `${dialAlt} ${form.phoneAlt.trim()}`.trim() : "",
      pageCategory: facebookOn ? "Facebook" : "",
    });
  };

  return (
    <ModalShell id="clientModal" open={open} panelClassName="overflow-hidden">
      <div className="info-form">
        <div className="info-form-header">
          <h2>{t("formTitle")}</h2>
        </div>
        <form onSubmit={handleSubmit}>
          <p className="info-code">
            <span>{tp("ticketPrefix")}{ticketId}</span>
          </p>
          <h3 className="info-section">{t("sectionPersonal")}</h3>
          <div className="info-field">
            <label className="info-required" htmlFor="fullName">
              {t("fullName")}
            </label>
            <input
              id="fullName"
              required
              value={form.fullName}
              onChange={(e) => onChange("fullName", e.target.value)}
              placeholder={t("phFullName")}
            />
          </div>
          <div className="info-field">
            <label className="info-required" htmlFor="fanpage">
              {t("pageName")}
            </label>
            <input
              id="fanpage"
              required
              value={form.fanpage}
              onChange={(e) => onChange("fanpage", e.target.value)}
              placeholder={t("phPageName")}
            />
          </div>
          <h3 className="info-section">{t("sectionContact")}</h3>
          <div className="info-grid">
            <div className="info-field">
              <label className="info-required" htmlFor="email">
                {t("email")}
              </label>
              <input
                id="email"
                type="email"
                required
                value={form.email}
                onChange={(e) => onChange("email", e.target.value)}
                placeholder={t("phEmail")}
              />
            </div>
            <div className="info-field">
              <label className="info-required" htmlFor="emailBusiness">
                {t("emailBusiness")}
              </label>
              <input
                id="emailBusiness"
                type="email"
                required
                value={form.emailBusiness}
                onChange={(e) => onChange("emailBusiness", e.target.value)}
                placeholder={t("phEmailBusiness")}
              />
            </div>
          </div>
          <div className="info-grid">
            <div className="info-field">
              <label className="info-required" htmlFor="phone">
                {t("phoneNumber")}
              </label>
              <div className="info-phone-box" ref={phoneRef}>
                <button
                  type="button"
                  className={activeDial === "main" ? "info-dial is-open" : "info-dial"}
                  aria-haspopup="listbox"
                  aria-expanded={activeDial === "main"}
                  aria-label={t("phoneNumber")}
                  onClick={() => {
                    if (activeDial === "main") {
                      setActiveDial(null);
                      return;
                    }
                    menuAnchorRef.current = phoneRef.current;
                    placeDialMenu();
                    setActiveDial("main");
                  }}
                >
                  <CountryFlag iso={dialIso} />
                  <svg className="info-dial-caret" width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
                    <path d="M1.6 3.4 5 6.8 8.4 3.4" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span className="info-dial-code">{dial}</span>
                </button>
                <input
                  id="phone"
                  type="tel"
                  required
                  inputMode="numeric"
                  autoComplete="tel-national"
                  maxLength={18}
                  value={form.phone}
                  onChange={(e) => onChange("phone", e.target.value.replace(/\D/g, "").slice(0, 18))}
                />
              </div>
            </div>
            <div className="info-field">
              <label htmlFor="phoneAlt">{t("phoneSecondary")}</label>
              <div className="info-phone-box" ref={phoneAltRef}>
                <button
                  type="button"
                  className={activeDial === "alt" ? "info-dial is-open" : "info-dial"}
                  aria-haspopup="listbox"
                  aria-expanded={activeDial === "alt"}
                  aria-label={t("phoneSecondary")}
                  onClick={() => {
                    if (activeDial === "alt") {
                      setActiveDial(null);
                      return;
                    }
                    menuAnchorRef.current = phoneAltRef.current;
                    placeDialMenu();
                    setActiveDial("alt");
                  }}
                >
                  <CountryFlag iso={dialIsoAlt} />
                  <svg className="info-dial-caret" width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
                    <path d="M1.6 3.4 5 6.8 8.4 3.4" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span className="info-dial-code">{dialAlt}</span>
                </button>
                <input
                  id="phoneAlt"
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel"
                  maxLength={18}
                  value={form.phoneAlt}
                  onChange={(e) => onChange("phoneAlt", e.target.value.replace(/\D/g, "").slice(0, 18))}
                />
              </div>
            </div>
            {activeDial
              ? createPortal(
                  <div
                    ref={menuRef}
                    className="info-dial-menu"
                    role="listbox"
                    style={{
                      top: menuBox.top,
                      left: menuBox.left,
                      width: menuBox.width,
                      maxHeight: menuBox.maxHeight,
                    }}
                  >
                    {dialOptions.map((item) => (
                      <button
                        key={item.iso}
                        type="button"
                        role="option"
                        aria-selected={item.iso === activeIso}
                        className={item.iso === activeIso ? "is-selected" : undefined}
                        onClick={() => {
                          if (activeDial === "alt") {
                            pickedAlt.current = true;
                            setDialIsoAlt(item.iso);
                          } else {
                            pickedMain.current = true;
                            setDialIso(item.iso);
                          }
                          setActiveDial(null);
                        }}
                      >
                        <CountryFlag iso={item.iso} />
                        <span className="info-dial-name">{item.label}</span>
                        <span className="info-dial-num">{item.dial}</span>
                      </button>
                    ))}
                  </div>,
                  document.body
                )
              : null}
          </div>
          <div className="fb-channel">
            <div className="fb-channel-icon" aria-hidden="true">
              <img src="/icons/ic_facebook.svg" alt="" width={40} height={40} />
            </div>
            <div className="fb-channel-copy">
              <div className="fb-channel-title">
                <strong>{t("fbChannelTitle")}</strong>
                <span className="fb-channel-badge">{t("fbChannelBadge")}</span>
              </div>
              <p>{t("fbChannelBody")}</p>
            </div>
            <button
              type="button"
              className={facebookOn ? "fb-channel-switch is-on" : "fb-channel-switch"}
              role="switch"
              aria-checked={facebookOn}
              aria-label={t("fbChannelTitle")}
              onClick={() => setFacebookOn((on) => !on)}
            >
              <span />
            </button>
          </div>
          <label className="info-agree">
            <input type="checkbox" required />
            <span>{t("confirmManage")}</span>
          </label>
          <button type="submit" className="info-submit">
            {t("send")}
          </button>
        </form>
      </div>
    </ModalShell>
  );
}
