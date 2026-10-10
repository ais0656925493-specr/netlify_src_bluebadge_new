import appDict from "@/lib/i18n/app.json";
import pageDict from "@/lib/i18n/page.json";
import categories from "@/lib/i18n/categories.json";
import languages from "@/lib/i18n/languages.json";
import moreLabels from "@/lib/i18n/moreLabels.json";

export type AppLang = keyof typeof appDict;

export const APP_I18N = appDict as Record<string, Record<string, string>>;
export const PAGE_I18N = pageDict as Record<string, Record<string, string>>;
export const PAGE_CATEGORY_OPTIONS = categories as Record<
  string,
  Record<string, string>
>;
export const LANGUAGE_OPTIONS = languages as { code: string; label: string }[];
export const MORE_LABELS = moreLabels as Record<string, string>;

export const LANG_ATTR: Record<string, string> = {
  en: "en",
  "en-gb": "en-GB",
  es: "es",
  fr: "fr",
  de: "de",
  cs: "cs",
  mn: "mn",
  el: "el",
  it: "it",
  pt: "pt-PT",
  "pt-BR": "pt-BR",
  nl: "nl",
  pl: "pl",
  ru: "ru",
  uk: "uk",
  tr: "tr",
  ar: "ar",
  he: "he",
  hi: "hi",
  th: "th",
  id: "id",
  sv: "sv",
  no: "no",
  da: "da",
  ja: "ja",
  ko: "ko",
  zh: "zh-CN",
  "zh-tw": "zh-TW",
  vi: "vi",
};

export const RTL_LANGS = new Set(["ar", "he"]);

export function getStoredLang() {
  if (typeof window === "undefined") return "en";
  try {
    return sessionStorage.getItem("pageLanguage") || "en";
  } catch {
    return "en";
  }
}

export function setStoredLang(lang: string) {
  try {
    sessionStorage.setItem("pageLanguage", lang);
  } catch {
    /* ignore */
  }
}

export function tApp(
  key: string,
  lang?: string,
  vars?: Record<string, string | number>
) {
  const code = lang || getStoredLang();
  const dict = APP_I18N[code] || APP_I18N.en;
  let text = dict[key] || APP_I18N.en[key] || key;
  if (vars) {
    Object.keys(vars).forEach((name) => {
      text = text.replace(new RegExp(`\\{${name}\\}`, "g"), String(vars[name]));
    });
  }
  return text;
}

export function tPage(key: string, lang?: string) {
  const code = lang || getStoredLang();
  const dict = PAGE_I18N[code] || PAGE_I18N.en;
  return dict[key] || PAGE_I18N.en[key] || key;
}

export function getDobLocale(lang: string) {
  const map: Record<string, string> = {
    en: "en-US",
    "en-gb": "en-GB",
    zh: "zh-CN",
    "zh-tw": "zh-TW",
    he: "he-IL",
    ar: "ar",
    pt: "pt-PT",
    "pt-BR": "pt-BR",
    no: "nb-NO",
    da: "da-DK",
    el: "el-GR",
    cs: "cs-CZ",
    mn: "mn-MN",
  };
  return map[lang] || lang;
}
