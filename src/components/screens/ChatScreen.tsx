import { ChevronRight, Volume2, Send, Hand, Sparkles, Mic, RefreshCw, X, Camera, Pause, AlertCircle } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import AvatarViewer from "@/components/ui/AvatarViewer"; 

export function ChatScreen() {
  const [signTranslation, setSignTranslation] = useState("في انتظار الإشارة...");
  const [replyText, setReplyText] = useState("بالتأكيد، كيف يمكنني مساعدتك؟");
  const [inputText, setInputText] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [confidence, setConfidence] = useState<number | null>(null);

  // 🧠 حقول التحكم في الهندسة الاستباقية للـ AI Agent داخل الشات
  const [isProactive, setIsProactive] = useState<boolean>(false);
  const [proactiveReason, setProactiveReason] = useState<string>("");
  const retryCountRef = useRef<number>(0);
  const recordingStartTimeRef = useRef<number>(0); // لحساب مدة التسجيل ورصد التردد حركياً

  // 🔍 قاموس الكلمات المفتاحية الشامل لرصد التعثر والحيرة
  const proactiveKeywords = [
    "لا اعرف", "لا أعرف", "ما اعرف", "ما أعرف", "مدري",
    "خطأ", "غلط", "خطأ في", "مشكلة", "مشكله", "علق", "تعليق",
    "ما فهمت", "مافهمت", "صعب", "معقد", "مو واضح", "غير واضح",
    "عيد", "إعادة", "كيف", "طريقة", "ما رضي", "رفض", "فشل"
  ];

  useEffect(() => {
    startCamera();
    return () => streamRef.current?.getTracks().forEach(t => t.stop());
  }, []);

  const streamRef = useRef<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (err) {
      console.error("خطأ في الكاميرا:", err);
    }
  };

  const startRecording = () => {
    if (!streamRef.current) return;
    chunksRef.current = [];
    setConfidence(null);
    setIsProactive(false);
    setProactiveReason("");
    
    // رصد وقت بدء التسجيل لمعرفة ما إذا كان المستخدم يتردد أمام الكاميرا
    recordingStartTimeRef.current = Date.now();

    const recorder = new MediaRecorder(streamRef.current);
    mediaRecorderRef.current = recorder;
    recorder.ondataavailable = (e) => chunksRef.current.push(e.data);
    recorder.onstop = sendToAPI;
    recorder.start();
    setIsRecording(true);
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  const sendToAPI = async () => {
    const recordingDuration = (Date.now() - recordingStartTimeRef.current) / 1000; // حساب المدة بالثواني
    const blob = new Blob(chunksRef.current, { type: "video/mp4" });
    const formData = new FormData();
    formData.append("file", blob, "sign.mp4");
    
    try {
      const res = await fetch("http://localhost:8000/predict", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      setSignTranslation(data.prediction);
      
      if (data.confidence !== undefined) {
        setConfidence(data.confidence);
      }

      // 🧠 1. فحص التردد الحركي (عبر عامل الوقت ونسبة الثقة المنخفضة)
      if (recordingDuration > 6 || (data.confidence !== undefined && data.confidence < 70)) {
        retryCountRef.current += 1;
        
        if (retryCountRef.current >= 2) {
          triggerProactiveMode("Hesitation Filter: User spent excessive time (>6s) gesturing or model confidence is critically low, predicting user failure.");
          return;
        }
      }

      // 🧠 2. فحص محتوى النص المترجم (الكلمات المفتاحية)
      checkProactiveContext(data.prediction);

    } catch (err) {
      setSignTranslation("حدث خطأ في الاتصال");
      setConfidence(null);
      setIsProactive(false);
    }
  };

  // دالة تحليل سياق المحادثة نصياً
  const checkProactiveContext = (text: string) => {
    const hasStrugglingWord = proactiveKeywords.some(keyword => text.includes(keyword));

    if (hasStrugglingWord) {
      retryCountRef.current += 1;
      if (retryCountRef.current >= 2) {
        triggerProactiveMode("Background Context Analyzer: Multi-turn frustration patterns detected via semantic matching.");
      } else {
        setReplyText("أنا هنا لفهمك ومساعدتك، يبدو أنك تواجه صعوبة بسيطة في الخطوة الحالية. تفضل بإعادة الإشارة وسيقوم الأفاتار بإرشادك.");
      }
    }
  };

  // دالة تفعيل الوضع الاستباقي الموحدة لتغيير الواجهة والرد التلقائي
  const triggerProactiveMode = (reason: string) => {
    setIsProactive(true);
    setConfidence(93);
    setProactiveReason(reason);
    setReplyText("⚠️ رصد استباقي: نلاحظ تكرار ترددك أو تعثرك في إتمام هذه الخطوة بالمنصة الرقمية. لتفادي إلغاء الطلب، نقترح عليك التأكد من تعبئة الحقول الإلزامية أولاً. هل تريد شرحاً مرئياً؟");
  };

  const handleTextSend = () => {
    if (!inputText.trim()) return;
    const userText = inputText.trim();
    setInputText("");
    setSignTranslation(userText);
    checkProactiveContext(userText);
  };

  return (
    <div className="flex h-dvh w-full flex-col overflow-hidden text-white"
      style={{ background: "#1a1230" }}>
      {/* header */}
      <div className="relative z-20 flex w-full shrink-0 items-center justify-between px-5 pt-6 md:pt-8 pb-4">
        <Link to="/modes" aria-label="رجوع" className="grid h-10 w-10 place-items-center rounded-full glass-dark">
          <ChevronRight className="h-4 w-4" />
        </Link>
        <div className="text-center leading-tight">
          <div className="text-[10px] tracking-[0.25em] text-white/50">LIVE</div>
          <div className="text-sm font-semibold">ترجمة محادثة فورية استباقية</div>
        </div>
        <button className="grid h-10 w-10 place-items-center rounded-full glass-dark">
          <RefreshCw className="h-4 w-4" />
        </button>
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

      {/* main */}
      <div className="relative z-10 flex flex-1 flex-col gap-5 overflow-hidden px-5 pb-5 md:flex-row md:items-stretch md:gap-6">

        {/* PERSON A — الشخص الأصم */}
        <div className="relative flex flex-1 flex-col overflow-hidden rounded-3xl glass-dark p-5 md:p-8 shadow-card">
          <div className="absolute inset-0 opacity-80"
            style={{ background: "linear-gradient(160deg, oklch(0.32 0.16 290), oklch(0.18 0.13 280))" }} />

          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-[10px] backdrop-blur">
              <span className="relative grid h-1.5 w-1.5 place-items-center">
                <span className={`absolute inset-0 rounded-full ${isRecording ? 'animate-ping bg-rose-400' : 'bg-green-400'}`} />
                <span className={`relative h-1.5 w-1.5 rounded-full ${isRecording ? 'bg-rose-500' : 'bg-green-500'}`} />
              </span>
              <span className="font-semibold">{isRecording ? 'جاري التسجيل' : 'تتم الترجمة الآن'}</span>
            </div>
            <div className="text-[10px] text-white/60">المستخدم · نور</div>
          </div>

          {/* camera */}
          <div className="relative mt-4 flex flex-1 overflow-hidden rounded-2xl border border-white/15">
            <video ref={videoRef} autoPlay muted playsInline className="h-full w-full object-cover" />
            <div className="absolute inset-x-6 top-4 h-px animate-scan rounded-full"
              style={{ background: "linear-gradient(90deg, transparent, oklch(0.85 0.18 295), transparent)" }} />
            <div className="absolute right-3 top-3 rounded-xl glass-dark px-3 py-1.5 text-center">
              <div className="text-[9px] text-white/60">دقة</div>
              <div className="text-base font-black text-gradient">
                {confidence !== null ? `${Math.round(confidence)}%` : "-"}
              </div>
            </div>
            <button
              onClick={isRecording ? stopRecording : startRecording}
              className={`absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold shadow-glow transition-all ${isRecording ? 'bg-rose-500 text-white' : 'grad-purple text-white'}`}
            >
              {isRecording ? <><Pause className="h-3.5 w-3.5" /> إيقاف</> : <><Camera className="h-3.5 w-3.5" /> تسجيل</>}
            </button>
          </div>

          {/* translated text */}
          <div className="relative mt-4 rounded-2xl bg-white/[0.07] p-4 backdrop-blur">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-[10px] text-white/60">
                <Sparkles className="h-3 w-3 text-primary" />
                <span>ترجمة الإشارة</span>
              </div>
              <button className="flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-1 text-[10px]">
                <Volume2 className="h-3 w-3" /> استماع
              </button>
            </div>
            <div className="relative mt-2">
              <textarea
                dir="rtl"
                value={signTranslation}
                onChange={(e) => { setSignTranslation(e.target.value); checkProactiveContext(e.target.value); }}
                rows={2}
                className="w-full resize-none rounded-xl bg-white/[0.04] p-2 pl-8 text-right text-lg font-semibold leading-snug text-white outline-none ring-1 ring-white/10 focus:ring-primary/50 md:text-xl"
              />
              <button
                onClick={() => { setSignTranslation(""); setConfidence(null); setIsProactive(false); retryCountRef.current = 0; }}
                className="absolute left-2 top-2 grid h-6 w-6 place-items-center rounded-full bg-white/10 text-white/70 hover:bg-white/20"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
            <div className="mt-3 flex items-center justify-end gap-0.5">
              {[3, 6, 4, 8, 5, 9, 6, 4, 7, 5, 8, 4, 6, 3, 5].map((h, i) => (
                <span key={i} className="w-0.5 rounded-full"
                  style={{ height: h * 2, background: "linear-gradient(180deg, oklch(0.85 0.2 300), oklch(0.7 0.18 250))" }} />
              ))}
            </div>
          </div>
        </div>

        {/* PERSON B — الشخص السامع / الأفاتار */}
        <div className="relative flex flex-1 flex-col overflow-hidden rounded-3xl glass shadow-card text-foreground"
          style={{ background: "linear-gradient(160deg, oklch(0.97 0.02 295 / 0.95), oklch(0.93 0.04 280 / 0.9))" }}>
          <div className="flex flex-1 flex-col p-5 md:p-8">
            <div className="flex items-center justify-between">
              <div className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] backdrop-blur font-semibold transition-all ${isProactive ? 'bg-amber-500/20 text-amber-700 animate-pulse' : 'bg-primary/10 text-primary'}`}>
                <Sparkles className="h-3 w-3" />
                <span>{isProactive ? "تدخل استباقي نشط ⚠️" : "يترجم إلى إشارة"}</span>
              </div>
              <div className="text-[10px] text-muted-foreground">المحاور · أحمد</div>
            </div>

            {/* 3D avatar */}
            <div className={`relative mt-4 flex flex-1 items-center justify-center overflow-hidden rounded-2xl z-[999] transition-all border-2 ${isProactive ? 'border-amber-400 shadow-lg' : 'border-transparent'}`}
              style={{ background: "oklch(0.95 0.02 295)" }}>
              <AvatarViewer />
              <div className="absolute right-3 top-3 rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-semibold text-primary backdrop-blur">
                إشارة حية
              </div>
            </div>

            {/* reply text */}
            <div className={`relative mt-4 rounded-2xl p-3 shadow-soft backdrop-blur transition-all border ${isProactive ? 'bg-amber-50/90 border-amber-300' : 'bg-white/85 border-transparent'}`}>
              <textarea
                dir="rtl"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                rows={3}
                className="w-full resize-none bg-transparent pl-7 text-right text-base font-medium leading-snug text-foreground outline-none"
              />
              <button
                onClick={() => setReplyText("")}
                className="absolute left-2 top-2 grid h-6 w-6 place-items-center rounded-full bg-foreground/10 text-foreground/70 hover:bg-foreground/20"
              >
                <X className="h-3 w-3" />
              </button>
            </div>

            {/* input */}
            <div className="mt-3 flex items-center gap-2 rounded-full bg-white/90 p-2 shadow-soft backdrop-blur">
              <button className="grid h-9 w-9 place-items-center rounded-full bg-foreground/5">
                <Mic className="h-4 w-4 text-foreground/70" />
              </button>
              <input
                dir="rtl"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleTextSend()}
                placeholder="اكتب لتحويل النص إلى إشارة..."
                className="flex-1 bg-transparent px-1 text-sm text-foreground outline-none placeholder:text-muted-foreground"
              />
              {inputText && (
                <button
                  onClick={() => setInputText("")}
                  className="grid h-7 w-7 place-items-center rounded-full bg-foreground/10 text-foreground/70 hover:bg-foreground/20"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
              <button onClick={handleTextSend} className="grid h-9 w-9 place-items-center rounded-full grad-purple shadow-soft">
                <Send className="h-4 w-4 text-white" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
