import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import ar from "@/i18n/ar.json";
import en from "@/i18n/en.json";

// لغة الواجهة (عربي/إنجليزي) ولغة الإشارة (عربية/ASL) مستقلتان، وتنحفظان في المتصفح
export type UiLang = "ar" | "en";
export type SignLang = "arsl" | "asl";

const DICTS: Record<UiLang, unknown> = { ar, en };
const UI_KEY = "emaa.uiLang";
const SIGN_KEY = "emaa.signLang";

function lookup(dict: unknown, key: string): string | undefined {
  let cur: unknown = dict;
  for (const part of key.split(".")) {
    if (cur && typeof cur === "object" && part in cur)
      cur = (cur as Record<string, unknown>)[part];
    else return undefined;
  }
  return typeof cur === "string" ? cur : undefined;
}

export function translate(
  lang: UiLang,
  key: string,
  vars?: Record<string, string>,
) {
  const text = lookup(DICTS[lang], key) ?? lookup(DICTS.ar, key) ?? key;
  return vars
    ? text.replace(/\{(\w+)\}/g, (_, name) => vars[name] ?? `{${name}}`)
    : text;
}

function read<T extends string>(key: string, allowed: T[], fallback: T): T {
  try {
    const v = localStorage.getItem(key) as T | null;
    return v && allowed.includes(v) ? v : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // التخزين غير متاح (وضع خاص مثلًا): نكمل بدون حفظ
  }
}

type I18n = {
  lang: UiLang;
  dir: "rtl" | "ltr";
  setLang: (l: UiLang) => void;
  signLang: SignLang;
  setSignLang: (l: SignLang) => void;
  t: (key: string, vars?: Record<string, string>) => string;
};

const I18nContext = createContext<I18n | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  // الخادم يرسم بالعربي، وبعد التحميل نقرأ الاختيار المحفوظ
  const [lang, setLangState] = useState<UiLang>("ar");
  const [signLang, setSignState] = useState<SignLang>("arsl");

  useEffect(() => {
    setLangState(read<UiLang>(UI_KEY, ["ar", "en"], "ar"));
    setSignState(read<SignLang>(SIGN_KEY, ["arsl", "asl"], "arsl"));
  }, []);

  const dir = lang === "ar" ? "rtl" : "ltr";

  useEffect(() => {
    const html = document.documentElement;
    html.lang = lang;
    html.dir = dir;
    document.title = translate(lang, "meta.title");
  }, [lang, dir]);

  const setLang = useCallback((l: UiLang) => {
    setLangState(l);
    write(UI_KEY, l);
  }, []);

  const setSignLang = useCallback((l: SignLang) => {
    setSignState(l);
    write(SIGN_KEY, l);
  }, []);

  const value = useMemo<I18n>(
    () => ({
      lang,
      dir,
      setLang,
      signLang,
      setSignLang,
      t: (key, vars) => translate(lang, key, vars),
    }),
    [lang, dir, setLang, signLang, setSignLang],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used inside I18nProvider");
  return ctx;
}

// يقرأ اللغة المحفوظة قبل رسم الصفحة عشان ما يومض الاتجاه الخطأ
export const PRELOAD_LANG_SCRIPT = `try{var l=localStorage.getItem("${UI_KEY}");if(l==="en"){document.documentElement.lang="en";document.documentElement.dir="ltr"}}catch(e){}`;
