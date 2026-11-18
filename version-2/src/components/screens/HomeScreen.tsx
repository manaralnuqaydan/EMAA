import { Camera, Home, Sparkles } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useI18n } from "@/lib/i18n";
import { LanguageSwitcher } from "@/components/LanguageControls";

export function HomeScreen() {
  const { t } = useI18n();
  return (
    <div className="relative h-full w-full grad-soft">
      {/* floating shapes */}
      <div
        className="absolute -top-16 -left-12 h-56 w-56 rounded-full opacity-60 blur-3xl"
        style={{
          background:
            "radial-gradient(circle, oklch(0.85 0.12 295 / 0.7), transparent 70%)",
        }}
      />
      <div
        className="absolute top-40 -right-16 h-56 w-56 rounded-full opacity-50 blur-3xl"
        style={{
          background:
            "radial-gradient(circle, oklch(0.82 0.1 245 / 0.7), transparent 70%)",
        }}
      />
      <div
        className="absolute bottom-32 left-8 h-32 w-32 rounded-full opacity-40 blur-2xl"
        style={{
          background:
            "radial-gradient(circle, oklch(0.8 0.14 310 / 0.7), transparent 70%)",
        }}
      />

      {/* عمود واحد بعرض ثابت في كل اللغات: نفس المكان والمقاسات بالعربي والإنجليزي */}
      <div className="relative z-10 mx-auto flex h-full min-h-[600px] w-full max-w-md flex-col px-6 pb-5 pt-12">
        {/* الشعار */}
        <div className="flex flex-col items-center">
          <div
            className="text-3xl leading-none text-gradient"
            style={{ fontWeight: 300 }}
          >
            إيماء
          </div>
          <div className="mt-2 text-[10px] uppercase tracking-[0.35em] text-muted-foreground/80">
            Eemaa
          </div>
        </div>

        <div className="mt-4 flex justify-center">
          <LanguageSwitcher />
        </div>

        {/* حالة الذكاء الاصطناعي */}
        <div className="mt-4 flex justify-center">
          <div className="flex h-8 items-center gap-2 rounded-full glass px-3.5 shadow-soft">
            <span className="relative grid h-2 w-2 place-items-center">
              <span className="absolute inset-0 animate-ping rounded-full bg-emerald-400/60" />
              <span className="relative h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            <span className="text-[11px] font-medium leading-none text-foreground/80">
              {t("home.aiReady")}
            </span>
            <Sparkles className="h-3 w-3 text-primary" />
          </div>
        </div>

        {/* زر الكاميرا + العنوان: العنوان له مساحة ثابتة عشان الزر ما يتحرك لو النص صار سطرين */}
        <div className="flex flex-1 flex-col items-center justify-center py-6">
          <div className="relative">
            <div
              className="absolute -inset-8 rounded-full opacity-70 blur-3xl"
              style={{
                background:
                  "radial-gradient(circle, oklch(0.7 0.25 300 / 0.75), transparent 65%)",
              }}
            />
            <div className="absolute -inset-3 animate-pulse-glow rounded-full" />
            <Link
              to="/modes"
              aria-label={t("home.open")}
              className="relative grid h-44 w-44 place-items-center rounded-full text-white shadow-glow grad-purple"
            >
              <div className="absolute inset-2 rounded-full border border-white/30" />
              <div className="absolute inset-5 rounded-full border border-white/15" />
              <Camera className="h-14 w-14 drop-shadow-lg" strokeWidth={1.3} />
            </Link>
          </div>

          <div className="mt-8 flex h-32 w-full flex-col items-center text-center">
            <h2
              className="max-w-xs text-balance text-[26px] leading-snug text-foreground ltr:tracking-tight rtl:leading-normal"
              style={{ fontWeight: 300 }}
            >
              {/* كل جزء ما ينقسم: لو ضاق المكان ينزل الجزء الثاني كامل لسطر جديد */}
              <span className="inline-block whitespace-nowrap font-semibold text-gradient">
                {t("home.headline1")}
              </span>{" "}
              <span className="inline-block whitespace-nowrap text-foreground/85">
                <span className="me-1.5 text-foreground/40">…</span>
                {t("home.headline2")}
              </span>
            </h2>
            <p className="mt-3 text-[11px] text-muted-foreground ltr:tracking-[0.14em]">
              {t("home.tap")}
            </p>
          </div>
        </div>

        {/* الشريط السفلي: جزء من الصفحة (مو absolute) وبنفس العرض في كل اللغات */}
        <nav className="glass shadow-card flex items-center justify-center rounded-3xl px-2 py-3">
          <Link
            to="/home"
            className="relative flex min-w-[5.5rem] flex-col items-center gap-1 px-4 py-1"
            aria-label={t("common.home")}
          >
            <div className="absolute -top-1 h-1 w-6 rounded-full grad-purple" />
            <Home className="h-5 w-5 text-primary" strokeWidth={2.2} />
            <span className="text-[10px] font-semibold leading-none text-primary">
              {t("common.home")}
            </span>
          </Link>
        </nav>
      </div>
    </div>
  );
}
