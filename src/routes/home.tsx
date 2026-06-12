import { createFileRoute } from "@tanstack/react-router";
import { ScreenStage } from "../components/ScreenStage";
import { HomeScreen } from "../components/screens/HomeScreen v4.tsx";

export const Route = createFileRoute("/home")({
  component: () => (
    <ScreenStage label="02 . Home" caption="الشاشة الرئيسية">
      <HomeScreen />
    </ScreenStage>
  ),
});