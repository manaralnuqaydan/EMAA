import {
  Volume2,
  Pause,
  ChevronRight,
  Sparkles,
  X,
  AlertCircle,
  Send,
  RotateCcw,
} from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import AvatarViewer from "../ui/AvatarViewer";
import { downloadText, speak, stopSpeaking } from "@/lib/speech";
import { translate, useI18n } from "@/lib/i18n";
import {
  LanguageSwitcher,
  SignLanguagePicker,
} from "@/components/LanguageControls";
import {
  askAssistant,
  spellOnAvatar,
  type AssistantReply,
  type ChatTurn,
} from "@/lib/assistant";

type Bubble = {
  role: "user" | "assistant";
  text: string;
  reply?: AssistantReply;
};

// 🔍 كلمات تدل على تعثر المستخدم (مطابقة كلمات بسيطة، مو تحليل بالذكاء الاصطناعي)
const proactiveKeywords = [
  "لا اعرف",
  "لا أعرف",
  "ما اعرف",
  "ما أعرف",
  "مدري",
  "خطأ",
  "غلط",
  "مشكلة",
  "مشكله",
  "علق",
  "تعليق",
  "ما فهمت",
  "مافهمت",
  "صعب",
  "معقد",
  "مو واضح",
  "غير واضح",
  "عيد",
  "إعادة",
  "ما رضي",
  "رفض",
  "فشل",
  "don't know",
  "dont know",
  "problem",
  "error",
  "stuck",
  "confused",
  "don't understand",
  "dont understand",
  "difficult",
  "failed",
];

export function CameraScreen() {
  const { t, lang, signLang } = useI18n();
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [inputText, setInputText] = useState("");
  const [thinking, setThinking] = useState(false);
  const [error, setError] = useState(false);
  const [isProactive, setIsProactive] = useState(false);
  const [spellCaption, setSpellCaption] = useState<{
    letters: string[];
    index: number;
  } | null>(null);
  const retryCountRef = useRef(0);
  const historyRef = useRef<ChatTurn[]>([]);
  const listRef = useRef<HTMLDivElement>(null);

  const textOf = (r: AssistantReply) =>
    (lang === "ar" ? r.ar : r.en) || r.ar || r.en;

  useEffect(() => {
    const onProgress = (e: Event) => {
      const { letters, index } = (
        e as CustomEvent<{ letters: string[]; index: number }>
      ).detail;
      setSpellCaption(index < letters.length ? { letters, index } : null);
    };
    window.addEventListener("spellProgress", onProgress);
    return () => {
      window.removeEventListener("spellProgress", onProgress);
      stopSpeaking();
    };
  }, []);

  useEffect(() => {
    listRef.current?.scrollTo({
      top: listRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [bubbles, thinking]);

  const playReply = (r: AssistantReply) => {
    speak(textOf(r));
    spellOnAvatar(r.sign, signLang);
  };

  const send = async (text: string) => {
    const message = text.trim();
    if (!message || thinking) return;
    setInputText("");
    setError(false);
    const lower = message.toLowerCase();
    if (proactiveKeywords.some((k) => lower.includes(k))) {
      retryCountRef.current += 1;
      if (retryCountRef.current >= 2) setIsProactive(true);
    }
    const history = [
      ...historyRef.current,
      { role: "user" as const, content: message },
    ];
    historyRef.current = history;
    setBubbles((b) => [...b, { role: "user", text: message }]);
    setThinking(true);
    try {
      const reply = await askAssistant(history, lang, signLang);
      historyRef.current = [
        ...history,
        { role: "assistant", content: reply.ar || reply.en },
      ];
      setBubbles((b) => [
        ...b,
        { role: "assistant", text: textOf(reply), reply },
      ]);
      playReply(reply);
    } catch {
      // نرجع الرسالة للخانة عشان المستخدم يعيد الإرسال بدون ما يكتبها من جديد
      historyRef.current = history.slice(0, -1);
      setBubbles((b) => b.slice(0, -1));
      setInputText(message);
      setError(true);
    } finally {
      setThinking(false);
    }
  };

  const resetChat = () => {
    historyRef.current = [];
    retryCountRef.current = 0;
    setBubbles([]);
    setIsProactive(false);
    setError(false);
    stopSpeaking();
  };

  const saveConversation = () => {
    const lines = bubbles.map(
      (b) =>
        `${b.role === "user" ? t("assistant.you") : t("assistant.bot")}: ${b.text}`,
    );
    downloadText(
      `emaa-${new Date().toISOString().slice(0, 10)}.txt`,
      lines.join("\n"),
    );
  };

  const lastReply = [...bubbles].reverse().find((b) => b.reply)?.reply;
  const sourceLabel = (r: AssistantReply) =>
    r.source === "claude"
      ? t("assistant.sourceAi")
      : r.source === "dataset"
        ? t("assistant.sourceDataset")
        : t("assistant.sourceOffline");

  return (
    <div
      className="flex min-h-dvh w-full flex-col text-white md:h-dvh md:overflow-hidden"
      style={{
        background: "linear-gradient(170deg, #1a1230 0%, #0a0617 100%)",
      }}
    >
      {/* header */}
      <div className="relative z-20 flex w-full shrink-0 flex-wrap items-center justify-between gap-2 px-5 pt-6 pb-4 md:pt-8">
        <Link
          to="/modes"
          aria-label={t("common.back")}
          className="grid h-10 w-10 place-items-center rounded-full glass-dark"
        >
          <ChevronRight className="h-4 w-4 ltr:-scale-x-100" />
        </Link>
        <div className="flex items-center gap-1.5 rounded-full glass-dark px-3 py-1.5">
          <span
            className={`h-2 w-2 rounded-full ${isProactive ? "bg-amber-500" : "bg-green-500"}`}
          />
          <span className="text-[10px] font-semibold">
            {isProactive ? t("assistant.proactiveOn") : t("assistant.online")}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <SignLanguagePicker compact dark />
          <LanguageSwitcher dark />
        </div>
      </div>

      {isProactive && (
        <div className="mx-5 mb-2 flex items-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/20 p-3 text-xs text-amber-200">
          <AlertCircle className="h-4 w-4 shrink-0 text-amber-400" />
          <div className="flex-1 text-start">
            <span className="font-bold">{t("assistant.proactiveTitle")}</span>{" "}
            {t("assistant.proactiveReason")}
          </div>
          <button
            onClick={() => setIsProactive(false)}
            aria-label={t("common.hide")}
            className="text-amber-200/70 hover:text-amber-100"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      <div className="relative z-10 flex flex-1 flex-col gap-4 px-4 pb-4 sm:px-5 md:min-h-0 md:flex-row md:items-stretch md:gap-6 md:pb-5">
        {/* الأفاتار */}
        <div className="relative flex min-h-[340px] flex-1 flex-col overflow-hidden rounded-3xl glass-dark md:min-h-0">
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse at center top, oklch(0.5 0.22 295 / 0.55), transparent 70%)",
            }}
          />
          <div className="absolute end-3 top-3 z-10 rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-semibold">
            {t(`signLang.${signLang}`)}
          </div>
          <div className="relative h-80 w-full flex-1 md:h-full">
            <AvatarViewer />
          </div>
          {spellCaption ? (
            <div
              dir={signLang === "arsl" ? "rtl" : "ltr"}
              className="absolute bottom-3 left-1/2 flex max-w-[90%] -translate-x-1/2 flex-wrap justify-center gap-0.5 rounded-2xl bg-black/50 px-4 py-2 text-2xl font-black backdrop-blur"
            >
              {spellCaption.letters.map((l, i) => (
                <span
                  key={i}
                  className={
                    i === spellCaption.index
                      ? "scale-125 text-primary transition-transform"
                      : i < spellCaption.index
                        ? "text-white/80"
                        : "text-white/30"
                  }
                >
                  {l === " " ? " " : l}
                </span>
              ))}
            </div>
          ) : (
            lastReply?.sign && (
              <div className="absolute inset-x-3 bottom-3 flex items-center justify-between gap-2 rounded-2xl bg-black/40 px-3 py-2 text-[11px] text-white/80 backdrop-blur">
                <span>
                  {t("assistant.avatarSpells", { words: lastReply.sign })}
                </span>
                <button
                  onClick={() => spellOnAvatar(lastReply.sign, signLang)}
                  aria-label={t("assistant.replaySign")}
                  className="grid h-7 w-7 place-items-center rounded-full bg-white/15 hover:bg-white/25"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                </button>
              </div>
            )
          )}
        </div>

        {/* المحادثة */}
        <div className="relative flex min-h-[420px] flex-1 flex-col overflow-hidden rounded-3xl glass-dark p-4 shadow-card md:min-h-0 md:p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-[10px] text-white/60">
              <Sparkles className="h-3 w-3 text-primary" />
              <span>{t("assistant.panelTitle")}</span>
            </div>
            <button
              onClick={resetChat}
              className="rounded-full bg-white/10 px-2.5 py-1 text-[10px] hover:bg-white/20"
            >
              {t("common.newChat")}
            </button>
          </div>

          <div
            ref={listRef}
            aria-live="polite"
            className="mt-3 flex flex-1 flex-col gap-2.5 overflow-y-auto pe-1"
          >
            {bubbles.length === 0 && (
              <div className="max-w-[85%] self-start rounded-2xl rounded-ss-sm bg-white/10 px-4 py-3 text-base font-semibold leading-relaxed">
                {translate(lang, "assistant.greeting")}
              </div>
            )}
            {bubbles.map((b, i) =>
              b.role === "user" ? (
                <div
                  key={i}
                  dir="auto"
                  className="max-w-[85%] self-end rounded-2xl rounded-se-sm grad-purple px-4 py-2.5 text-sm"
                >
                  {b.text}
                </div>
              ) : (
                <div
                  key={i}
                  className="max-w-[85%] self-start rounded-2xl rounded-ss-sm bg-white/10 px-4 py-3"
                >
                  <div
                    dir="auto"
                    className="text-base font-semibold leading-relaxed"
                  >
                    {b.text}
                  </div>
                  {b.reply && (lang === "ar" ? b.reply.en : b.reply.ar) && (
                    <div dir="auto" className="mt-1.5 text-xs text-white/55">
                      {lang === "ar" ? b.reply.en : b.reply.ar}
                    </div>
                  )}
                  {b.reply && (
                    <div className="mt-2 flex items-center gap-2 text-[10px] text-white/45">
                      <span className="rounded-full bg-white/10 px-2 py-0.5">
                        {sourceLabel(b.reply)}
                      </span>
                      <button
                        onClick={() => playReply(b.reply!)}
                        className="flex items-center gap-1 hover:text-white"
                      >
                        <Volume2 className="h-3 w-3" />{" "}
                        {t("assistant.playVoice")}
                      </button>
                    </div>
                  )}
                </div>
              ),
            )}
            {thinking && (
              <div className="self-start rounded-2xl bg-white/10 px-4 py-2 text-[12px] text-white/70">
                {t("assistant.typing")}
              </div>
            )}
          </div>

          {error && (
            <div
              role="alert"
              className="mt-2 flex items-center gap-2 rounded-xl border border-rose-400/40 bg-rose-500/15 px-3 py-2 text-[11px] text-rose-100"
            >
              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
              {t("assistant.serverDown")}
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(inputText);
            }}
            className="mt-3 flex items-center gap-2 rounded-full border border-white/10 bg-white/10 p-1.5 focus-within:border-primary/50"
          >
            <input
              dir="auto"
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={t("assistant.placeholder")}
              aria-label={t("assistant.placeholder")}
              className="flex-1 bg-transparent px-3 text-sm text-white outline-none placeholder:text-white/40"
            />
            <button
              type="submit"
              disabled={thinking || !inputText.trim()}
              aria-label={t("common.send")}
              className="grid h-9 w-9 place-items-center rounded-full grad-purple shadow-soft transition-all hover:opacity-90 disabled:opacity-50"
            >
              <Send className="h-4 w-4 text-white rtl:-scale-x-100" />
            </button>
          </form>
        </div>
      </div>

      {/* bottom controls */}
      <div className="relative z-20 flex w-full shrink-0 items-center justify-center gap-5 px-5 pb-6 pt-2">
        <button
          onClick={() => lastReply && playReply(lastReply)}
          disabled={!lastReply}
          aria-label={t("common.listen")}
          className="grid h-12 w-12 place-items-center rounded-full glass-dark disabled:opacity-40"
        >
          <Volume2 className="h-5 w-5" />
        </button>
        <button
          onClick={stopSpeaking}
          aria-label={t("common.stop")}
          className="grid h-16 w-16 place-items-center rounded-full bg-white text-deep shadow-glow"
        >
          <Pause className="h-6 w-6 fill-current" />
        </button>
        <button
          onClick={saveConversation}
          disabled={!bubbles.length}
          aria-label={t("common.save")}
          className="grid h-12 w-12 place-items-center rounded-full glass-dark text-[10px] font-bold disabled:opacity-40"
        >
          {t("common.save")}
        </button>
      </div>
    </div>
  );
}
