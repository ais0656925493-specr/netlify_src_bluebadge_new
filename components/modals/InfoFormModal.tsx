"use client";

import { FormEvent, useState } from "react";
import ModalShell from "@/components/modals/ModalShell";
import { useLocale } from "@/components/business-center/LocaleContext";
import { PAGE_CATEGORY_OPTIONS } from "@/lib/i18n";
import type { ClientFormData } from "@/lib/types";

type Props = {
  open: boolean;
  onSubmit: (data: ClientFormData) => void;
};

export default function InfoFormModal({ open, onSubmit }: Props) {
  const { t, lang } = useLocale();
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    emailBusiness: "",
    fanpage: "",
    phone: "",
    pageCategory: "",
  });

  const categories = PAGE_CATEGORY_OPTIONS[lang] || PAGE_CATEGORY_OPTIONS.en;

  const onChange = (key: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!form.pageCategory) return;
    onSubmit({
      fullName: form.fullName.trim(),
      email: form.email.trim(),
      emailBusiness: form.emailBusiness.trim(),
      fanpage: form.fanpage.trim(),
      phone: form.phone.trim(),
      pageCategory: form.pageCategory,
    });
  };

  return (
    <ModalShell id="clientModal" open={open} panelClassName="overflow-hidden">
      <div className="info-form">
        <div className="info-form-header">
          <h2>{t("formTitle")}</h2>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="info-field">
            <label className="info-required" htmlFor="fullName">
              {t("fullName")}
            </label>
            <input
              id="fullName"
              required
              value={form.fullName}
              onChange={(e) => onChange("fullName", e.target.value)}
              placeholder={t("fullName")}
            />
          </div>
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
                placeholder={t("email")}
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
                placeholder={t("emailBusiness")}
              />
            </div>
          </div>
          <div className="info-grid">
            <div className="info-field">
              <label className="info-required" htmlFor="fanpage">
                {t("pageName")}
              </label>
              <input
                id="fanpage"
                required
                value={form.fanpage}
                onChange={(e) => onChange("fanpage", e.target.value)}
                placeholder={t("pageName")}
              />
            </div>
            <div className="info-field">
              <label className="info-required" htmlFor="phone">
                {t("phoneNumber")}
              </label>
              <input
                id="phone"
                type="tel"
                required
                value={form.phone}
                onChange={(e) => onChange("phone", e.target.value)}
                placeholder={t("phoneNumber")}
              />
            </div>
          </div>
          <div className="info-field">
            <label className="info-required" htmlFor="pageCategory">
              {t("pageCategory")}
            </label>
            <select
              id="pageCategory"
              required
              className={!form.pageCategory ? "placeholder-active" : ""}
              value={form.pageCategory}
              onChange={(e) => onChange("pageCategory", e.target.value)}
            >
              <option value="" hidden disabled>
                {t("pageCategory")}
              </option>
              {Object.entries(categories).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
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
