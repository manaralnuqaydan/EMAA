import { createFileRoute } from "@tanstack/react-router";
import { ScreenStage } from "@/components/ScreenStage";
import { ModeScreen } from "@/components/screens/ModeScreen";

export const Route = createFileRoute("/modes")({
  component: () => (
    <ScreenStage label="03 · Modes" caption="اختيار وضع الترجمة">
      <ModeScreen />
    </ScreenStage>
  ),
});
