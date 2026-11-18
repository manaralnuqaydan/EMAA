import { Languages } from "lucide-react";
import { useI18n, type SignLang, type UiLang } from "@/lib/i18n";

// زر تبديل لغة الواجهة: العربية / English
export function LanguageSwitcher({ dark = false }: { dark?: boolean }) {
  const { lang, setLang, t } = useI18n();
  const options: { id: UiLang; label: string }[] = [
    { id: "ar", label: "العربية" },
    { id: "en", label: "English" },
  ];
  return (
    <div
      role="group"
      aria-label={t("common.uiLanguage")}
      className={`flex h-10 items-center gap-0.5 rounded-full p-1 text-[11px] font-bold ${dark ? "glass-dark" : "glass shadow-soft"}`}
    >
      <Languages
        aria-hidden
        className={`mx-1 h-3.5 w-3.5 ${dark ? "text-white/60" : "text-foreground/50"}`}
      />
      {options.map((o) => (
        <button
          key={o.id}
          type="button"
          lang={o.id}
          aria-pressed={lang === o.id}
          onClick={() => setLang(o.id)}
          className={`h-8 rounded-full px-2.5 transition-all ${
            lang === o.id
              ? "grad-purple text-white shadow-soft"
              : dark
                ? "text-white/60 hover:text-white"
                : "text-foreground/60 hover:text-foreground"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

// اختيار لغة الإشارة اللي تقرأها الكاميرا ويستخدمها الأفاتار
export function SignLanguagePicker({
  compact = false,
  dark = false,
  onChange,
}: {
  compact?: boolean;
  dark?: boolean;
  onChange?: (l: SignLang) => void;
}) {
  const { signLang, setSignLang, t } = useI18n();
  const options: SignLang[] = ["arsl", "asl"];
  return (
    <div
      role="radiogroup"
      aria-label={t("signLang.label")}
      className={`flex items-center gap-0.5 rounded-full p-1 text-[11px] font-bold ${compact ? "h-10" : "w-full"} ${dark ? "glass-dark" : "glass shadow-soft"}`}
    >
      {options.map((l) => (
        <button
          key={l}
          type="button"
          role="radio"
          aria-checked={signLang === l}
          title={t(`signLang.${l}`)}
          onClick={() => {
            setSignLang(l);
            onChange?.(l);
          }}
          className={`rounded-full transition-all ${compact ? "h-8 px-3" : "flex-1 px-3 py-2"} ${
            signLang === l
              ? "grad-purple text-white shadow-soft"
              : dark
                ? "text-white/60 hover:text-white"
                : "text-foreground/60 hover:text-foreground"
          }`}
        >
          {compact ? t(`signLang.${l}Short`) : t(`signLang.${l}`)}
        </button>
      ))}
    </div>
  );
}
