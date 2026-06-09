import { createFileRoute } from "@tanstack/react-router";
import { ScreenStage } from "@/components/ScreenStage";
import { ChatScreen } from "@/components/screens/ChatScreen";

export const Route = createFileRoute("/chat")({
  component: () => (
    <ScreenStage label="05 · AI Chat" caption="محادثة ذكية مع AI">
      <ChatScreen />
    </ScreenStage>
  ),
});
