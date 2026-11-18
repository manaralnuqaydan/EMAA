import { Volume2, Pause, ChevronRight, Sparkles, X, AlertCircle, Send } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useState, useRef } from "react";
import AvatarViewer from "../ui/AvatarViewer";
import { downloadText, speak, stopSpeaking } from "@/lib/speech";
import { SIGN_API_URL } from "@/lib/arasl";
import { translate, useI18n } from "@/lib/i18n";
import { LanguageSwitcher } from "@/components/LanguageControls";

export function CameraScreen() {
  const { t, lang } = useI18n();
  // الرد يجي من الشات بوت بالعربي والإنجليزي، ونعرض لغة الواجهة أولًا
  const [reply, setReply] = useState({
    ar: translate("ar", "assistant.greeting"),
    en: translate("en", "assistant.greeting"),
  });
  const primaryKey = lang === "ar" ? "ar" : "en";
  const secondaryKey = lang === "ar" ? "en" : "ar";
  const [inputText, setInputText] = useState("");

  // 🧠 إدارة حوار الشات والذكاء الاستباقي وحركة الأفاتار
  const [isProactive, setIsProactive] = useState<boolean>(false);
  const [proactiveReason, setProactiveReason] = useState<string>("");
  const [avatarAction, setAvatarAction] = useState<string>("idle");
  const retryCountRef = useRef<number>(0);
  const logRef = useRef<string[]>([]);
  const historyRef = useRef<{ role: "user" | "assistant"; content: string }[]>([]);
  const [thinking, setThinking] = useState(false);

  // 🔍 قاموس الكلمات المفتاحية الشامل لرصد التعثر والحيرة (Frustration & Hesitation Vocabulary)
  const proactiveKeywords = [
    "لا اعرف", "لا أعرف", "ما اعرف", "ما أعرف", "مدري",
    "خطأ", "غلط", "خطأ في", "مشكلة", "مشكله", "علق", "تعليق",
    "ما فهمت", "مافهمت", "صعب", "معقد", "مو واضح", "غير واضح",
    "عيد", "إعادة", "كيف", "طريقة", "ما رضي", "رفض", "فشل",
    "don't know", "dont know", "problem", "error", "stuck", "confused",
    "don't understand", "dont understand", "hard", "difficult", "failed",
  ];

  const handleSendMessage = async () => {
    if (!inputText.trim() || thinking) return;

    const userMessage = inputText.trim();
    setInputText("");
    setIsProactive(false);
    logRef.current.push(`${t("assistant.you")}: ${userMessage}`);
    const history = [...historyRef.current, { role: "user" as const, content: userMessage }];
    historyRef.current = history;

    // رصد التعثر: تكرار كلمات الحيرة يفعّل التدخل الاستباقي مع رد الشات بوت
    if (proactiveKeywords.some((keyword) => userMessage.toLowerCase().includes(keyword))) {
      retryCountRef.current += 1;
      if (retryCountRef.current >= 2) {
        setIsProactive(true);
        setProactiveReason(t("assistant.proactiveReason"));
      }
    }

    setThinking(true);
    try {
      const res = await fetch(`${SIGN_API_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history }),
      });
      const data: { ar: string; en: string } = await res.json();
      historyRef.current = [...history, { role: "assistant", content: data.ar }];
      logRef.current.push(`${t("assistant.bot")}: ${lang === "ar" ? data.ar : data.en}`);
      setReply({ ar: data.ar, en: data.en });
      setAvatarAction("signing");
      window.dispatchEvent(new CustomEvent("playAvatar"));
      speak(lang === "ar" ? data.ar : data.en);
    } catch {
      setReply({
        ar: translate("ar", "assistant.serverDown"),
        en: translate("en", "assistant.serverDown"),
      });
    } finally {
      setThinking(false);
    }
  };

  const saveConversation = () => {
    const lines = logRef.current;
    downloadText(`emaa-${new Date().toISOString().slice(0, 10)}.txt`, lines.join("\n"));
  };

  const stopAll = () => {
    stopSpeaking();
    setAvatarAction("idle");
  };

  return (
    <div className="flex min-h-dvh w-full flex-col text-white md:h-dvh md:overflow-hidden"
      style={{ background: "linear-gradient(170deg, #1a1230 0%, #0a0617 100%)" }}>
      
      {/* header */}
      <div className="relative z-20 flex w-full shrink-0 items-center justify-between px-5 pt-6 md:pt-8 pb-4">
        <Link to="/modes" aria-label={t("common.back")} className="grid h-10 w-10 place-items-center rounded-full glass-dark">
          <ChevronRight className="h-4 w-4 ltr:-scale-x-100" />
        </Link>
        <div className="flex items-center gap-1.5 rounded-full glass-dark px-3 py-1.5">
          <span className="relative grid h-2 w-2 place-items-center">
            <span className={`absolute inset-0 animate-ping rounded-full ${isProactive ? 'bg-amber-400/70' : 'bg-green-400/70'}`} />
            <span className={`relative h-2 w-2 rounded-full ${isProactive ? 'bg-amber-500' : 'bg-green-500'}`} />
          </span>
          <span className="text-[10px] font-semibold">
            {isProactive ? t("assistant.proactiveOn") : t("assistant.online")}
          </span>
        </div>
        <LanguageSwitcher dark />
      </div>

      {/* 🧠 شريط مراقبة الـ Agent في الخلفية للتحكيم */}
      {isProactive && (
        <div className="mx-5 mb-2 flex items-center gap-2 rounded-xl bg-amber-500/20 border border-amber-500/30 p-3 text-amber-200 text-xs animate-pulse">
          <AlertCircle className="h-4 w-4 shrink-0 text-amber-400" />
          <div className="text-start flex-1">
            <span className="font-bold">{t("assistant.proactiveTitle")}</span> {proactiveReason}
          </div>
        </div>
      )}

      {/* main content */}
      <div className="relative z-10 flex flex-1 flex-col gap-4 px-4 sm:px-5 md:min-h-0 md:flex-row md:items-stretch md:gap-6 md:pb-5">

        {/* 3D Avatar Box */}
        <div className={`relative flex flex-1 flex-col items-center justify-center rounded-3xl glass-dark p-5 md:p-8 overflow-hidden border transition-all duration-500 ${isProactive ? 'border-amber-500/40 shadow-[0_0_20px_rgba(245,158,11,0.15)]' : 'border-transparent'}`}>
          <div className="absolute inset-x-0 top-0 h-full"
            style={{ background: isProactive ? "radial-gradient(ellipse at center top, oklch(0.65 0.2 60 / 0.3), transparent 70%)" : "radial-gradient(ellipse at center top, oklch(0.5 0.22 295 / 0.55), transparent 70%)" }} />
          
          <div className="relative z-[999] flex h-72 w-full items-center justify-center sm:h-80 md:h-full">
            <AvatarViewer currentAction={avatarAction} />
          </div>

          {thinking && (
            <div className="absolute end-3 top-3 rounded-2xl glass-dark px-3 py-2 text-[11px] text-white/80">
              {t("assistant.typing")}
            </div>
          )}
        </div>

        {/* Chat & Translation Box */}
        <div className={`relative flex flex-1 flex-col justify-center rounded-3xl glass-dark p-5 md:p-8 shadow-card overflow-hidden border transition-all duration-500 ${isProactive ? 'bg-amber-950/10 border-amber-500/30' : 'border-transparent'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-[10px] text-white/60">
              <Sparkles className={`h-3 w-3 ${isProactive ? 'text-amber-400' : 'text-primary'}`} />
              <span>{isProactive ? t("assistant.panelGuide") : t("assistant.panelTitle")}</span>
            </div>
            <span className="text-[9px] text-white/40">{t("assistant.live")}</span>
          </div>

          {/* صندوق النص القابل للتعديل */}
          <div className="relative mt-4 rounded-2xl bg-white/[0.04] p-3 ring-1 ring-white/10 focus-within:ring-primary/50">
            <textarea
              dir={primaryKey === "ar" ? "rtl" : "ltr"}
              lang={primaryKey}
              value={reply[primaryKey]}
              onChange={(e) => setReply({ ...reply, [primaryKey]: e.target.value })}
              rows={3}
              className="w-full resize-none bg-transparent px-8 text-start text-xl font-bold leading-relaxed text-white outline-none md:text-2xl"
            />
            <button
              type="button"
              aria-label={t("common.clear")}
              onClick={() => { setReply({ ar: "", en: "" }); setIsProactive(false); retryCountRef.current = 0; setAvatarAction("idle"); }}
              className="absolute end-2 top-2 grid h-7 w-7 place-items-center rounded-full bg-white/10 text-white/70 hover:bg-white/20"
            >
              <X className="h-3.5 w-3.5" />
            </button>
            <textarea
              dir={secondaryKey === "ar" ? "rtl" : "ltr"}
              lang={secondaryKey}
              value={reply[secondaryKey]}
              onChange={(e) => setReply({ ...reply, [secondaryKey]: e.target.value })}
              rows={1}
              className="mt-2 w-full resize-none bg-transparent text-start text-xs text-white/55 outline-none md:text-sm"
            />
          </div>

          {/* حقل إدخال الشات التفاعلي المطور */}
          <div className="mt-4 flex items-center gap-2 rounded-full bg-white/10 p-1.5 border border-white/10 focus-within:border-primary/50">
            <input
              dir="auto"
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder={t("assistant.placeholder")}
              className="flex-1 bg-transparent px-3 text-sm text-white outline-none placeholder:text-white/40"
            />
            <button 
              onClick={handleSendMessage}
              disabled={thinking}
              aria-label={t("common.send")}
              className="grid disabled:opacity-50 h-8 w-8 place-items-center rounded-full grad-purple shadow-soft hover:opacity-90 transition-all"
            >
              <Send className="h-3.5 w-3.5 text-white rtl:-scale-x-100" />
            </button>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-1">
              {[3, 5, 7, 4, 6, 8, 5, 3, 6, 4, 7, 5].map((h, i) => (
                <span key={i} className="w-0.5 rounded-full"
                  style={{ height: h * 2, background: isProactive ? "linear-gradient(180deg, #f59e0b, #d97706)" : "linear-gradient(180deg, oklch(0.8 0.2 300), oklch(0.7 0.18 250))" }} />
              ))}
            </div>
            <button onClick={() => speak(reply[primaryKey])} className={`flex items-center gap-2 rounded-full px-5 py-2 text-xs font-bold shadow-glow transition-all ${isProactive ? 'bg-amber-600 text-white' : 'grad-purple text-white'}`}>
              <Volume2 className="h-4 w-4" /> {t("assistant.playVoice")}
            </button>
          </div>
        </div>
      </div>

      {/* bottom controls */}
      <div className="relative z-20 flex w-full shrink-0 items-center justify-center gap-5 px-5 pb-6 pt-4">
        <button onClick={() => speak(reply[primaryKey])} aria-label={t("common.listen")} className="grid h-12 w-12 place-items-center rounded-full glass-dark">
          <Volume2 className="h-5 w-5" />
        </button>
        <button onClick={stopAll} aria-label={t("common.stop")} className="grid h-16 w-16 place-items-center rounded-full bg-white text-deep shadow-glow">
          <Pause className="h-6 w-6 fill-current" />
        </button>
        <button onClick={saveConversation} aria-label={t("common.save")} className="grid h-12 w-12 place-items-center rounded-full glass-dark text-[10px] font-bold">{t("common.save")}</button>
      </div>
    </div>
  );
}
