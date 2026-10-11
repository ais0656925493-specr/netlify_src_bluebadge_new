"use client";

import FooterLanguages from "@/components/business-center/FooterLanguages";
import { useLocale } from "@/components/business-center/LocaleContext";

type Props = {
  ticketId: string;
  locked: boolean;
  onActivate: () => void;
  onMoreLanguages: () => void;
  onFooterLangChange: (lang: string) => void;
};

export default function PageContent({
  ticketId,
  locked,
  onActivate,
  onMoreLanguages,
  onFooterLangChange,
}: Props) {
  const { tp } = useLocale();

  return (
    <div id="pageContent" className={locked ? "is-locked" : undefined}>
      <div className="w-full">
        <div className="flex items-start gap-[8px] flex-col justify-start mb-[30px]">
          <div className="flex items-center justify-start gap-[8px]">
            <div className="verified-badge flex items-center justify-center">
              <img src="/icons/ic_blue.svg" alt="" />
            </div>
          </div>
          <b className="bc-heading">{tp("heading")}</b>
        </div>

        <div className="w-full">
          <div className="w-full mb-[20px]">
            <p className="bc-intro">{tp("intro1")}</p>
            <p className="bc-intro">{tp("intro2")}</p>
            <p className="bc-intro">{tp("intro3")}</p>
            <p className="bc-ticket">
              <span>{tp("ticketPrefix")}{ticketId}</span>
            </p>
          </div>

          <div className="w-full">
            <p className="mb-[15px]">
              <b className="bc-guide-title">{tp("guideTitle")}</b>
            </p>
            <p className="bc-guide">{tp("guide1")}</p>
            <p className="bc-guide">{tp("guide2")}</p>
            <p className="bc-guide">{tp("guide3")}</p>
          </div>
        </div>
      </div>

      <button type="button" onClick={onActivate} className="bc-cta">
        {tp("submitBtn")}
      </button>

      <FooterLanguages onMore={onMoreLanguages} onLangChange={onFooterLangChange} />
    </div>
  );
}
