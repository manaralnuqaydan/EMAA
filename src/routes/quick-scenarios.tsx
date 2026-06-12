import { createFileRoute } from "@tanstack/react-router";
import { QuickScenariosScreen } from "@/components/screens/QuickScenariosScreen";

export const Route = createFileRoute("/quick-scenarios")({
  component: QuickScenariosScreen,
});