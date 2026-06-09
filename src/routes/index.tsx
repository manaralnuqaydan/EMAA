import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { ScreenStage } from "@/components/ScreenStage";
import { SplashScreen } from "@/components/screens/SplashScreen";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const navigate = useNavigate();
  useEffect(() => {
    const t = setTimeout(() => navigate({ to: "/home" }), 2600);
    return () => clearTimeout(t);
  }, [navigate]);

  return (
    <ScreenStage label="01 · Splash" caption="شاشة البداية">
      <SplashScreen />
    </ScreenStage>
  );
}
