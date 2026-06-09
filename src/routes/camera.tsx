import { createFileRoute } from "@tanstack/react-router";
import { ScreenStage } from "@/components/ScreenStage";
import { CameraScreen } from "@/components/screens/CameraScreen";

export const Route = createFileRoute("/camera")({
  component: () => (
    <ScreenStage label="04 · Live Translate" caption="الترجمة الفورية بالكاميرا">
      <CameraScreen />
    </ScreenStage>
  ),
});
