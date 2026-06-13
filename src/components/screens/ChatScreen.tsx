import { ChevronRight, Volume2, Send, Hand, Sparkles, Mic, RefreshCw, X, Camera, Pause } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";

export function ChatScreen() {
  const [signTranslation, setSignTranslation] = useState("في انتظار الإشارة...");
  const [replyText, setReplyText] = useState("بالتأكيد، كيف يمكنني مساعدتك؟");
  const [inputText, setInputText] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  
  // 1. إضافة متغير لحفظ النسبة
  const [confidence, setConfidence] = useState<number | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    startCamera();
    return () => streamRef.current?.getTracks().forEach(t => t.stop());
  }, []);

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
    setConfidence(null); // تصفير النسبة عند بدء تسجيل جديد
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
      
      // 2. استقبال النسبة من السيرفر وتحديث الواجهة
      if (data.confidence !== undefined) {
        setConfidence(data.confidence);
      }
    } catch (err) {
      setSignTranslation("حدث خطأ في الاتصال");
      setConfidence(null);
    }
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
          <div className="text-sm font-semibold">ترجمة محادثة فورية</div>
        </div>
        <button className="grid h-10 w-10 place-items-center rounded-full glass-dark">
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

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
            </div><div className="text-[10px] text-white/60">المستخدم · نور</div>
          </div>

          {/* camera */}
          <div className="relative mt-4 flex flex-1 overflow-hidden rounded-2xl border border-white/15">
            <video ref={videoRef} autoPlay muted playsInline className="h-full w-full object-cover" />
            <div className="absolute inset-x-6 top-4 h-px animate-scan rounded-full"
              style={{ background: "linear-gradient(90deg, transparent, oklch(0.85 0.18 295), transparent)" }} />
            <div className="absolute right-3 top-3 rounded-xl glass-dark px-3 py-1.5 text-center">
              <div className="text-[9px] text-white/60">دقة</div>
              {/* 3. استبدال الرقم الثابت بالمتغير الديناميكي */}
              <div className="text-base font-black text-gradient">
                {confidence !== null ? `${Math.round(confidence)}%` : "-"}
              </div>
            </div>
            {/* زر التسجيل */}
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
                onChange={(e) => setSignTranslation(e.target.value)}
                rows={2}
                className="w-full resize-none rounded-xl bg-white/[0.04] p-2 pl-8 text-right text-lg font-semibold leading-snug text-white outline-none ring-1 ring-white/10 focus:ring-primary/50 md:text-xl"
              />
              <button
                onClick={() => { setSignTranslation(""); setConfidence(null); }}
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

        {/* PERSON B — الشخص السامع */}
        <div className="relative flex flex-1 flex-col overflow-hidden rounded-3xl glass shadow-card text-foreground"
          style={{ background: "linear-gradient(160deg, oklch(0.97 0.02 295 / 0.95), oklch(0.93 0.04 280 / 0.9))" }}>
          <div className="flex flex-1 flex-col p-5 md:p-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-[10px] text-primary backdrop-blur">
                <Sparkles className="h-3 w-3" />
                <span className="font-semibold">يترجم إلى إشارة</span>
              </div>
              <div className="text-[10px] text-muted-foreground">المحاور · أحمد</div>
            </div>

            {/* 3D avatar */}
            <div className="relative mt-4 flex flex-1 items-center justify-center overflow-hidden rounded-2xl"
              style={{ background: "oklch(0.95 0.02 295)" }}><div className="flex flex-col items-center gap-3 text-primary/80">
                <div className="grid h-20 w-20 place-items-center rounded-full grad-purple shadow-soft">
                  <Hand className="h-10 w-10 text-white" strokeWidth={1.5} />
                </div>
                <div className="text-[11px] tracking-[0.25em] text-primary/70">3D AVATAR</div>
              </div>
              <div className="absolute right-3 top-3 rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-semibold text-primary backdrop-blur">
                إشارة حية
              </div>
            </div>

            {/* reply text */}
            <div className="relative mt-4 rounded-2xl bg-white/85 p-3 shadow-soft backdrop-blur">
              <textarea
                dir="rtl"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                rows={2}
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
              <button className="grid h-9 w-9 place-items-center rounded-full grad-purple shadow-soft">
                <Send className="h-4 w-4 text-white" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}