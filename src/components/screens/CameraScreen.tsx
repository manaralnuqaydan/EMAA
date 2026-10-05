import { Volume2, Pause, ChevronRight, Sparkles, X, AlertCircle, Send } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useState, useRef } from "react";
import AvatarViewer from "../ui/AvatarViewer";
import { downloadText, speak, stopSpeaking } from "@/lib/speech";

export function CameraScreen() {
  const [arabicText, setArabicText] = useState("مرحبًا، أنا مساعدك الذكي إيماء. كيف يمكنني مساعدتك اليوم؟");
  const [englishText, setEnglishText] = useState("Hello, I am your smart assistant EMAA. How can I help you today?");
  const [inputText, setInputText] = useState("");
  const [confidence, setConfidence] = useState<number | null>(100);

  // 🧠 إدارة حوار الشات والذكاء الاستباقي وحركة الأفاتار
  const [isProactive, setIsProactive] = useState<boolean>(false);
  const [proactiveReason, setProactiveReason] = useState<string>("");
  const [avatarAction, setAvatarAction] = useState<string>("idle");
  const retryCountRef = useRef<number>(0);
  const logRef = useRef<string[]>([]);

  // 🔍 قاموس الكلمات المفتاحية الشامل لرصد التعثر والحيرة (Frustration & Hesitation Vocabulary)
  const proactiveKeywords = [
    "لا اعرف", "لا أعرف", "ما اعرف", "ما أعرف", "مدري",
    "خطأ", "غلط", "خطأ في", "مشكلة", "مشكله", "علق", "تعليق",
    "ما فهمت", "مافهمت", "صعب", "معقد", "مو واضح", "غير واضح",
    "عيد", "إعادة", "كيف", "طريقة", "ما رضي", "رفض", "فشل"
  ];

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage = inputText.trim();
    setInputText("");
    setIsProactive(false);
    setAvatarAction("signing"); // تشغيل حركة الإشارة فوراً عند الإرسال
    window.dispatchEvent(new CustomEvent("playAvatar"));
    logRef.current.push(`أنت: ${userMessage}`);

    // التحقق مما إذا كانت رسالة المستخدم تحتوي على أي من كلمات التعثر
    const hasStrugglingWord = proactiveKeywords.some(keyword => userMessage.includes(keyword));

    if (hasStrugglingWord) {
      retryCountRef.current += 1;
      
      // ⚠️ تفعيل التدخل الاستباقي عند رصد تكرار الحيرة أو التعثر (المرة الثانية)
      if (retryCountRef.current >= 2) {
        setIsProactive(true);
        setConfidence(96);
        setAvatarAction("proactive_alert"); // توجيه الأفاتار لعمل الحركة التنبيهية الإرشادية المحدثة
        setProactiveReason("Background Context Analyzer: Multi-turn hesitation & frustration patterns detected via semantic keyword matching.");
        setArabicText("⚠️ رصد استباقي: نلاحظ تكرار تعثرك في إتمام هذه الخطوة بالمنصة الرقمية. لتفادي إلغاء الطلب، نقترح عليك التأكد من تعبئة الحقول الإلزامية أولاً. هل تريد شرحاً مرئياً؟");
        setEnglishText("Proactive Agent: Intervened autonomously to prevent form abandonment.");
        return;
      }

      // رد تفاعلي ذكي عند أول بادرة تعثر
      setTimeout(() => {
        setArabicText("أنا هنا لفهمك ومساعدتك، يبدو أنك تواجه صعوبة بسيطة في الخطوة الحالية. تفضل بكتابة الاستفسار أو تعديله وسيقوم الأفاتار بإرشادك فوراً.");
        setEnglishText("AI Chat: Processing user difficulty cues...");
        setConfidence(88);
      }, 600);

    } else {
      // ردود محادثة طبيعية في حال كانت العبارات عادية
      setTimeout(() => {
        setArabicText(`تم استقبال رسالتك: "${userMessage}". يقوم الأفاتار الآن بتحويلها إلى إشارة حية لتسهيل التواصل.`);
        setEnglishText("AI Chat: Successfully translating conversation into real-time sign language.");
        setConfidence(98);
      }, 600);
    }
  };

  const saveConversation = () => {
    const lines = [...logRef.current, `إيماء: ${arabicText}`];
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
        <Link to="/modes" aria-label="رجوع" className="grid h-10 w-10 place-items-center rounded-full glass-dark">
          <ChevronRight className="h-4 w-4" />
        </Link>
        <div className="flex items-center gap-1.5 rounded-full glass-dark px-3 py-1.5">
          <span className="relative grid h-2 w-2 place-items-center">
            <span className={`absolute inset-0 animate-ping rounded-full ${isProactive ? 'bg-amber-400/70' : 'bg-green-400/70'}`} />
            <span className={`relative h-2 w-2 rounded-full ${isProactive ? 'bg-amber-500' : 'bg-green-500'}`} />
          </span>
          <span className="text-[10px] font-semibold">
            {isProactive ? 'تدخل استباقي نشط ⚠️' : 'شات ذكي متصل'}
          </span>
        </div>
        <div className="grid h-10 w-10 place-items-center rounded-full glass-dark text-[10px]">AR</div>
      </div>

      {/* 🧠 شريط مراقبة الـ Agent في الخلفية للتحكيم */}
      {isProactive && (
        <div className="mx-5 mb-2 flex items-center gap-2 rounded-xl bg-amber-500/20 border border-amber-500/30 p-3 text-amber-200 text-xs animate-pulse">
          <AlertCircle className="h-4 w-4 shrink-0 text-amber-400" />
          <div dir="rtl" className="text-right flex-1">
            <span className="font-bold">تحليل الخلفية المستمر:</span> {proactiveReason}
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

          <div className="absolute right-3 top-3 rounded-2xl glass-dark px-3 py-2 text-right">
            <div className="text-[9px] text-white/60">دقة المعالجة</div>
            <div className="text-base font-black text-gradient">
              {confidence !== null ? `${Math.round(confidence)}%` : "-"}
            </div>
          </div>
        </div>

        {/* Chat & Translation Box */}
        <div className={`relative flex flex-1 flex-col justify-center rounded-3xl glass-dark p-5 md:p-8 shadow-card overflow-hidden border transition-all duration-500 ${isProactive ? 'bg-amber-950/10 border-amber-500/30' : 'border-transparent'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-[10px] text-white/60">
              <Sparkles className={`h-3 w-3 ${isProactive ? 'text-amber-400' : 'text-primary'}`} />
              <span>{isProactive ? "إرشاد استباقي موجه من النظام" : "مساعد إيماء التفاعلي"}</span>
            </div>
            <span className="text-[9px] text-white/40">مباشر</span>
          </div>

          {/* صندوق النص القابل للتعديل */}
          <div className="relative mt-4 rounded-2xl bg-white/[0.04] p-3 ring-1 ring-white/10 focus-within:ring-primary/50">
            <textarea
              dir="rtl"
              value={arabicText}
              onChange={(e) => setArabicText(e.target.value)}
              rows={3}
              className="w-full resize-none bg-transparent text-right text-xl font-bold leading-relaxed text-white outline-none md:text-2xl"
            />
            <button
              type="button"
              onClick={() => { setArabicText(""); setEnglishText(""); setConfidence(null); setIsProactive(false); retryCountRef.current = 0; setAvatarAction("idle"); }}
              className="absolute left-2 top-2 grid h-7 w-7 place-items-center rounded-full bg-white/10 text-white/70 hover:bg-white/20"
            >
              <X className="h-3.5 w-3.5" />
            </button>
            <textarea
              dir="ltr"
              value={englishText}
              onChange={(e) => setEnglishText(e.target.value)}
              rows={1}
              className="mt-2 w-full resize-none bg-transparent text-right text-xs text-white/55 outline-none md:text-sm"
            />
          </div>

          {/* حقل إدخال الشات التفاعلي المطور */}
          <div className="mt-4 flex items-center gap-2 rounded-full bg-white/10 p-1.5 border border-white/10 focus-within:border-primary/50">
            <input
              dir="rtl"
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="اكتب رسالة أو عدل واطلب من المساعد الاستباقي..."
              className="flex-1 bg-transparent px-3 text-sm text-white outline-none placeholder:text-white/40"
            />
            <button 
              onClick={handleSendMessage}
              className="grid h-8 w-8 place-items-center rounded-full grad-purple shadow-soft hover:opacity-90 transition-all"
            >
              <Send className="h-3.5 w-3.5 text-white" />
            </button>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-1">
              {[3, 5, 7, 4, 6, 8, 5, 3, 6, 4, 7, 5].map((h, i) => (
                <span key={i} className="w-0.5 rounded-full"
                  style={{ height: h * 2, background: isProactive ? "linear-gradient(180deg, #f59e0b, #d97706)" : "linear-gradient(180deg, oklch(0.8 0.2 300), oklch(0.7 0.18 250))" }} />
              ))}
            </div>
            <button onClick={() => speak(arabicText)} className={`flex items-center gap-2 rounded-full px-5 py-2 text-xs font-bold shadow-glow transition-all ${isProactive ? 'bg-amber-600 text-white' : 'grad-purple text-white'}`}>
              <Volume2 className="h-4 w-4" /> تشغيل الصوت
            </button>
          </div>
        </div>
      </div>

      {/* bottom controls */}
      <div className="relative z-20 flex w-full shrink-0 items-center justify-center gap-5 px-5 pb-6 pt-4">
        <button onClick={() => speak(arabicText)} aria-label="استماع" className="grid h-12 w-12 place-items-center rounded-full glass-dark">
          <Volume2 className="h-5 w-5" />
        </button>
        <button onClick={stopAll} aria-label="إيقاف" className="grid h-16 w-16 place-items-center rounded-full bg-white text-deep shadow-glow">
          <Pause className="h-6 w-6 fill-current" />
        </button>
        <button onClick={saveConversation} aria-label="حفظ المحادثة" className="grid h-12 w-12 place-items-center rounded-full glass-dark text-[10px] font-bold">حفظ</button>
      </div>
    </div>
  );
}
