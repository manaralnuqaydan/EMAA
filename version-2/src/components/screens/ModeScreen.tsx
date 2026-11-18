import { ChevronRight, Type, Video, ArrowLeft, Camera } from "lucide-react";
import { Link } from "@tanstack/react-router";
import avatarSaudi from "@/assets/avatar-saudi.png";
import { useI18n } from "@/lib/i18n";
import { LanguageSwitcher, SignLanguagePicker } from "@/components/LanguageControls";

export function ModeScreen() {
  const { t } = useI18n();
  return (
    <div className="relative h-full w-full grad-soft">
      <div className="absolute top-20 -right-20 h-64 w-64 rounded-full opacity-60 blur-3xl"
        style={{ background: "radial-gradient(circle, oklch(0.82 0.14 295 / 0.7), transparent 70%)" }} />
      <div className="absolute bottom-0 -left-20 h-64 w-64 rounded-full opacity-50 blur-3xl"
        style={{ background: "radial-gradient(circle, oklch(0.8 0.1 245 / 0.7), transparent 70%)" }} />

      <div className="relative z-10 mx-auto flex h-full w-full max-w-xl flex-col px-5 pb-8 pt-12">
        <div className="flex items-center justify-between">
          <Link to="/home" className="grid h-10 w-10 place-items-center rounded-full glass shadow-soft" aria-label={t("common.back")}>
            <ChevronRight className="h-4 w-4 text-foreground/70 ltr:-scale-x-100" />
          </Link>
          <div className="text-sm font-bold">{t("modes.title")}</div>
          <LanguageSwitcher />
        </div>

        <p className="mt-3 text-center text-[11px] text-muted-foreground">
          {t("modes.subtitle")}
        </p>

        <div className="mt-4">
          <div className="mb-1.5 text-center text-[11px] font-bold text-foreground/70">{t("signLang.label")}</div>
          <SignLanguagePicker />
          <p className="mt-1.5 text-center text-[10px] text-muted-foreground">{t("signLang.chooseHint")}</p>
        </div>

        <div className="mt-6 flex flex-1 flex-col gap-4">
          {/* Card A */}
          <div className="relative overflow-hidden rounded-[28px] glass shadow-card p-5">
            <div className="absolute -top-10 -left-10 h-32 w-32 rounded-full opacity-70 blur-2xl"
              style={{ background: "radial-gradient(circle, oklch(0.85 0.15 295 / 0.7), transparent 70%)" }} />
            <div className="relative flex gap-4">
              <div className="flex-1">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-[9px] font-bold text-primary">
                  <Type className="h-3 w-3" /> {t("modes.first")}
                </div>
                <h3 className="mt-2 text-lg font-black leading-tight">{t("modes.chatTitle")}</h3>
                <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
                  {t("modes.chatDesc")}
                </p>
                <Link to="/camera" className="mt-3 inline-flex items-center gap-1.5 rounded-full grad-purple px-3.5 py-1.5 text-[11px] font-bold text-white shadow-soft">
                  {t("modes.start")} <ArrowLeft className="h-3 w-3 ltr:-scale-x-100" />
                </Link>
              </div>
              <div className="relative h-24 w-24 shrink-0">
                <div className="absolute inset-0 rounded-3xl opacity-80"
                  style={{ background: "linear-gradient(160deg, oklch(0.9 0.08 295), oklch(0.85 0.1 270))" }} />
                <img src={avatarSaudi} alt="" loading="lazy" width={200} height={200} className="absolute inset-0 h-full w-full object-cover object-top rounded-3xl" />
              </div>
            </div>
          </div>

          {/* Card B */}
          <div className="relative overflow-hidden rounded-[28px] shadow-card p-5 text-white"
            style={{ background: "linear-gradient(160deg, oklch(0.32 0.15 290), oklch(0.22 0.13 280))" }}>
            <div className="absolute -bottom-10 -right-10 h-40 w-40 rounded-full opacity-60 blur-2xl"
              style={{ background: "radial-gradient(circle, oklch(0.7 0.25 300 / 0.8), transparent 70%)" }} />
            <div className="absolute top-3 end-3 rounded-full bg-white/10 px-2 py-0.5 text-[9px] text-white/80 backdrop-blur">LIVE</div>
            <div className="relative flex gap-4">
              <div className="flex-1">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1 text-[9px] font-bold backdrop-blur">
                  <Video className="h-3 w-3" /> {t("modes.second")}
                </div>
                <h3 className="mt-2 text-lg font-black leading-tight">{t("modes.liveTitle")}</h3>
                <p className="mt-1 text-[11px] leading-relaxed text-white/70">
                  {t("modes.liveDesc")}
                </p>
                <Link to="/chat" className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white px-3.5 py-1.5 text-[11px] font-bold text-primary shadow-soft">
                  {t("modes.try")} <ArrowLeft className="h-3 w-3 ltr:-scale-x-100" />
                </Link>
              </div>
              <div className="relative h-24 w-24 shrink-0">
                <div className="absolute inset-0 rounded-3xl"
                  style={{ background: "linear-gradient(160deg, oklch(0.4 0.2 290), oklch(0.25 0.15 270))" }} />
                <div className="absolute inset-2 rounded-2xl border border-white/20" />
                <span className="absolute left-3 top-3 h-3 w-3 rounded-tl-md border-l-2 border-t-2 border-white/80" />
                <span className="absolute right-3 top-3 h-3 w-3 rounded-tr-md border-r-2 border-t-2 border-white/80" />
                <span className="absolute bottom-3 left-3 h-3 w-3 rounded-bl-md border-b-2 border-l-2 border-white/80" />
                <span className="absolute bottom-3 right-3 h-3 w-3 rounded-br-md border-b-2 border-r-2 border-white/80" />
                <div className="absolute inset-0 grid place-items-center">
                  <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white/15 backdrop-blur">
                    <Camera className="h-6 w-6 text-white" />
                  </div>
                </div>
                <span className="absolute bottom-4 left-1/2 h-1.5 w-1.5 -translate-x-1/2 animate-pulse rounded-full bg-red-400" />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-center gap-1.5">
          <span className="h-1.5 w-6 rounded-full bg-primary" />
          <span className="h-1.5 w-1.5 rounded-full bg-foreground/20" />
          <span className="h-1.5 w-1.5 rounded-full bg-foreground/20" />
        </div>
      </div>
    </div>
  );
}
