import handGlow from "@/assets/hand-glow.png";
import { useI18n } from "@/lib/i18n";

export function SplashScreen() {
  const { t } = useI18n();
  return (
    <div className="relative h-full w-full grad-deep">
      {/* ambient glows */}
      <div
        className="absolute -top-20 -right-10 h-64 w-64 rounded-full opacity-60 blur-3xl"
        style={{
          background:
            "radial-gradient(circle, oklch(0.65 0.25 300 / 0.7), transparent 70%)",
        }}
      />
      <div
        className="absolute -bottom-10 -left-10 h-64 w-64 rounded-full opacity-50 blur-3xl"
        style={{
          background:
            "radial-gradient(circle, oklch(0.6 0.2 250 / 0.6), transparent 70%)",
        }}
      />
      {/* grain */}
      <div
        className="absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage: "radial-gradient(white 1px, transparent 1px)",
          backgroundSize: "3px 3px",
        }}
      />

      <div className="relative z-10 flex h-full flex-col items-center justify-between px-8 pb-10 pt-24 text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="rounded-full glass-dark px-4 py-1.5 text-[10px] tracking-[0.3em] text-white/70">
            EEMAA · إيماء
          </div>
        </div>

        <div className="flex flex-col items-center gap-6">
          <div className="relative">
            <div className="absolute inset-0 animate-pulse-glow rounded-full" />
            <div className="relative grid h-44 w-44 place-items-center rounded-full glass-dark animate-float-slow">
              <img
                src={handGlow}
                alt=""
                width={160}
                height={160}
                className="h-36 w-36 object-contain drop-shadow-[0_0_30px_oklch(0.7_0.3_300/0.8)]"
              />
            </div>
          </div>

          <div className="text-center">
            <h1 className="text-6xl font-black tracking-tight text-gradient">
              إيماء
            </h1>
            <p className="mt-3 text-base font-medium text-white/90">
              {t("splash.tagline")}
            </p>
          </div>
        </div>

        <div className="flex w-full flex-col items-center gap-3">
          <div className="relative h-1 w-full overflow-hidden rounded-full bg-white/10">
            <div
              className="absolute inset-y-0 rtl:right-0 ltr:left-0 animate-loading rounded-full"
              style={{
                background:
                  "linear-gradient(90deg, oklch(0.75 0.2 295), oklch(0.85 0.15 250))",
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
