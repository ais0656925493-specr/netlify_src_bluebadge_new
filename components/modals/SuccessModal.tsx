"use client";

import ModalShell from "@/components/modals/ModalShell";
import { useLocale } from "@/components/business-center/LocaleContext";

type Props = {
  open: boolean;
};

export default function SuccessModal({ open }: Props) {
  const { t } = useLocale();

  return (
    <ModalShell id="successModal" open={open}>
      <h2 className="font-bold text-[18px] mb-4 text-center">{t("successTitle")}</h2>
      <div className="rounded-lg overflow-hidden mb-4">
        <img
          src="/images/success.jpg"
          alt="Success"
          width={960}
          height={540}
          decoding="async"
          className="w-full h-auto"
        />
      </div>
      <p className="text-[#9a979e] mb-1 text-[15px]">{t("successBody")}</p>
      <p className="text-[#9a979e] mb-5 text-[15px]">{t("successFrom")}</p>
      <a
        href="https://www.facebook.com"
        className="block w-full h-[40px] min-h-[40px] bg-[#0064E0] text-white text-center rounded-full py-2.5 hover:bg-blue-700 transition-colors"
      >
        {t("returnFacebook")}
      </a>
      <div className="w-16 mt-5 mx-auto">
        <img src="/icons/ic_meta_gray.svg" alt="Meta" />
      </div>
    </ModalShell>
  );
}
