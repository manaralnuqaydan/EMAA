import { createFileRoute } from "@tanstack/react-router";
import { PhoneFrame } from "@/components/PhoneFrame";
import { SplashScreen } from "@/components/screens/SplashScreen";
import { HomeScreen } from "@/components/screens/HomeScreen";
import { ModeScreen } from "@/components/screens/ModeScreen";
import { CameraScreen } from "@/components/screens/CameraScreen";
import { ChatScreen } from "@/components/screens/ChatScreen";
import { useI18n } from "@/lib/i18n";
import { LanguageSwitcher } from "@/components/LanguageControls";

export const Route = createFileRoute("/overview")({
  component: Overview,
});

const screens = [
  { id: "splash", label: "01 · Splash", caption: "overview.splash", Component: SplashScreen },
  { id: "home", label: "02 · Home", caption: "overview.home", Component: HomeScreen },
  { id: "mode", label: "03 · Modes", caption: "overview.mode", Component: ModeScreen },
  { id: "camera", label: "04 · AI Chat", caption: "overview.camera", Component: CameraScreen },
  { id: "chat", label: "05 · Live Translate", caption: "overview.chat", Component: ChatScreen },
];

function Overview() {
  const { t } = useI18n();
  return (
    <div className="relative min-h-dvh w-full overflow-x-hidden">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 grad-soft" />
        <div className="absolute -top-32 left-1/4 h-[500px] w-[500px] rounded-full opacity-50 blur-3xl"
          style={{ background: "radial-gradient(circle, oklch(0.82 0.14 295 / 0.6), transparent 70%)" }} />
        <div className="absolute top-1/3 -right-32 h-[500px] w-[500px] rounded-full opacity-40 blur-3xl"
          style={{ background: "radial-gradient(circle, oklch(0.82 0.1 245 / 0.6), transparent 70%)" }} />
      </div>

      <header className="px-6 pt-24 text-center">
        <div className="mx-auto inline-flex items-center gap-2 rounded-full glass px-3 py-1.5 shadow-soft">
          <span className="h-2 w-2 rounded-full bg-primary" />
          <span className="text-[11px] font-semibold tracking-wide text-foreground/70">EEMAA · Design Concept 2026</span>
        </div>
        <h1 className="mt-5 text-4xl font-black leading-tight md:text-6xl">
          <span className="text-gradient">إيماء</span>
        </h1>
        <p className="mt-3 text-base font-medium text-foreground/80">{t("overview.tagline")}</p>
        <div className="mt-4 flex justify-center"><LanguageSwitcher /></div>
      </header>

      <section className="mx-auto mt-12 max-w-7xl px-4 pb-24">
        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 place-items-center">
          {screens.map((s) => (
            <PhoneFrame key={s.id} label={s.label} caption={t(s.caption)}>
              <s.Component />
            </PhoneFrame>
          ))}
        </div>
        <footer className="mt-20 text-center text-[11px] text-muted-foreground">
          © 2026 إيماء
        </footer>
      </section>
    </div>
  );
}
