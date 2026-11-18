import { createFileRoute, Link } from "@tanstack/react-router";
import { SplashScreen } from "@/components/screens/SplashScreen";

export const Route = createFileRoute("/splash")({
  component: SplashRoute,
});

function SplashRoute() {
  return (
    <div className="relative min-h-dvh w-full" dir="rtl">
      <SplashScreen />
      <Link
        to="/"
        className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full glass-dark px-5 py-2 text-xs text-white/80 backdrop-blur"
      >
        العودة للعرض
      </Link>
    </div>
  );
}
