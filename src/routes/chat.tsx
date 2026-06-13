import { createFileRoute } from "@tanstack/react-router";
import { ScreenStage } from "@/components/ScreenStage";
import { ChatScreen } from "@/components/screens/ChatScreen";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/chat")({
  component: () => {
    const [dataset, setDataset] = useState<any>({});
    const [text, setText] = useState("");
    const [reply, setReply] = useState("");

    useEffect(() => {
      fetch("/data/dataset.json")
        .then((res) => res.json())
        .then((data) => setDataset(data));
    }, []);

    useEffect(() => {
      if (!text) return;

      const key = Object.keys(dataset).find((k) =>
        text.includes(k)
      );

      setReply(key ? dataset[key].response : "ما فهمت الجملة");
    }, [text, dataset]);

    return (
      <ScreenStage label="05 · AI Chat" caption="محادثة ذكية مع AI">
        <ChatScreen />
      </ScreenStage>
    );
  },
});