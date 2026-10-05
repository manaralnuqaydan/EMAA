import { ChevronRight, Volume2, Send, Sparkles, Mic, RefreshCw, X, Camera, Pause, AlertCircle } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useState, useRef, useEffect, useCallback } from "react";
import AvatarViewer from "@/components/ui/AvatarViewer";

export function ChatScreen() {
  const [signTranslation, setSignTranslation] = useState("في انتظار الإشارة...");
  const [replyText, setReplyText] = useState("بالتأكيد، كيف يمكنني مساعدتك؟");
  const [inputText, setInputText] = useState("");
  const [isDetecting, setIsDetecting] = useState(false);
  const [confidence, setConfidence] = useState<number | null>(null);
  const [isProactive, setIsProactive] = useState<boolean>(false);
  const [proactiveReason, setProactiveReason] = useState<string>("");

  const retryCountRef = useRef<number>(0);
  const recordingStartTimeRef = useRef<number>(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const handsRef = useRef<any>(null);
  const animFrameRef = useRef<number | null>(null);
  const lastPredictTime = useRef<number>(0);
  const isDetectingRef = useRef(false);
  const cropCanvasRef = useRef<HTMLCanvasElement | null>(null);
  // الموديل يتعرف على حروف ArASL، فنجمعها هنا في كلمة
  const wordRef = useRef<string>("");
  const pendingLetterRef = useRef<string>("");
  const committedLetterRef = useRef<string>("");

  const proactiveKeywords = [
    "لا اعرف", "لا أعرف", "ما اعرف", "ما أعرف", "مدري",
    "خطأ", "غلط", "خطأ في", "مشكلة", "مشكله", "علق", "تعليق",
    "ما فهمت", "مافهمت", "صعب", "معقد", "مو واضح", "غير واضح",
    "عيد", "إعادة", "كيف", "طريقة", "ما رضي", "رفض", "فشل"
  ];

  useEffect(() => {
    const loadMediaPipe = () => {
      return new Promise<void>((resolve) => {
        if ((window as any).Hands) { resolve(); return; }
        const s1 = document.createElement("script");
        s1.src = "https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js";
        s1.crossOrigin = "anonymous";
        s1.onload = () => {
          const s2 = document.createElement("script");
          s2.src = "https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js";
          s2.crossOrigin = "anonymous";
          s2.onload = () => resolve();
          document.head.appendChild(s2);
        };
        document.head.appendChild(s1);
      });
    };

    loadMediaPipe().then(() => {
      const Hands = (window as any).Hands;
      const mpHands = new Hands({
        locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
      });
      mpHands.setOptions({
        maxNumHands: 2,
        modelComplexity: 1,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });
      mpHands.onResults((results: any) => {
        if (!isDetectingRef.current) return;
        if (!results.multiHandLandmarks || results.multiHandLandmarks.length === 0) return;
        const now = Date.now();
        if (now - lastPredictTime.current < 700) return;
        lastPredictTime.current = now;
        const image = cropHand(results.multiHandLandmarks[0]);
        if (image) sendImageToAPI(image);
      });
      handsRef.current = mpHands;
    });

    return () => {
      streamRef.current?.getTracks().forEach(t => t.stop());
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  const processFrame = useCallback(async () => {
    if (!isDetectingRef.current || !handsRef.current || !videoRef.current) return;
    await handsRef.current.send({ image: videoRef.current });
    animFrameRef.current = requestAnimationFrame(processFrame);
  }, []);

  const startDetection = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      isDetectingRef.current = true;
      setIsDetecting(true);
      recordingStartTimeRef.current = Date.now();
      animFrameRef.current = requestAnimationFrame(processFrame);
    } catch (err) {
      console.error("خطأ في الكاميرا:", err);
    }
  }, [processFrame]);

  const stopDetection = useCallback(() => {
    isDetectingRef.current = false;
    setIsDetecting(false);
    streamRef.current?.getTracks().forEach(t => t.stop());
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
  }, []);

  // يقص مربعًا حول اليد بحجم صور ArASL (64×64) ويرجعه كصورة JPEG
  const cropHand = (landmarks: { x: number; y: number }[]) => {
    const video = videoRef.current;
    if (!video || !video.videoWidth) return null;
    const xs = landmarks.map((lm) => lm.x * video.videoWidth);
    const ys = landmarks.map((lm) => lm.y * video.videoHeight);
    const minX = Math.min(...xs), maxX = Math.max(...xs);
    const minY = Math.min(...ys), maxY = Math.max(...ys);
    const size = Math.max(maxX - minX, maxY - minY) * 1.5;
    const cx = (minX + maxX) / 2;
    const cy = (minY + maxY) / 2 + size * 0.1; // صور ArASL تظهر جزءًا من المعصم
    if (!cropCanvasRef.current) {
      cropCanvasRef.current = document.createElement("canvas");
      cropCanvasRef.current.width = 64;
      cropCanvasRef.current.height = 64;
    }
    const ctx = cropCanvasRef.current.getContext("2d");
    if (!ctx) return null;
    ctx.fillStyle = "#808080";
    ctx.fillRect(0, 0, 64, 64);
    ctx.drawImage(video, cx - size / 2, cy - size / 2, size, size, 0, 0, 64, 64);
    return cropCanvasRef.current.toDataURL("image/jpeg", 0.9);
  };

  const sendImageToAPI = async (image: string) => {
    try {
      const res = await fetch("http://localhost:8000/predict-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image }),
      });
      const data = await res.json();
      console.log("prediction:", data.prediction, "confidence:", data.confidence);

      if (data.prediction && data.prediction !== "لم يتم التعرف على إشارة") {
        if (data.confidence !== undefined) setConfidence(data.confidence);
        // نضيف الحرف بعد تكراره في قراءتين متتاليتين، ولا نكرره حتى يتغير
        const letter: string = data.prediction;
        const isStable = letter === pendingLetterRef.current;
        pendingLetterRef.current = letter;
        if (!isStable || letter === committedLetterRef.current) return;
        committedLetterRef.current = letter;
        wordRef.current += letter;
        setSignTranslation(wordRef.current);

        // فحص الترددات
        const recordingDuration = (Date.now() - recordingStartTimeRef.current) / 1000;
        if (recordingDuration > 6 || (data.confidence !== undefined && data.confidence < 70)) {
          retryCountRef.current += 1;
          if (retryCountRef.current >= 2) {
            triggerProactiveMode("Hesitation Filter: تردد المستخدم أو ثقة منخفضة.");
            return;
          }
        }

        checkProactiveContext(wordRef.current);

        if (wordRef.current.endsWith("سلام")) {
          console.log("dispatching playAvatar event!");
          window.dispatchEvent(new CustomEvent("playAvatar"));
        }
      }
    } catch (err) {
      console.error("خطأ في الاتصال بالـ API:", err);
    }
  };

  const checkProactiveContext = (text: string) => {
    const hasStrugglingWord = proactiveKeywords.some(keyword => text.includes(keyword));
    if (hasStrugglingWord) {
      retryCountRef.current += 1;
      if (retryCountRef.current >= 2) {
        triggerProactiveMode("Background Context Analyzer: تكرار تعثر المستخدم.");
      } else {
        setReplyText("أنا هنا لفهمك ومساعدتك، يبدو أنك تواجه صعوبة بسيطة في الخطوة الحالية. تفضل بإعادة الإشارة وسيقوم الأفاتار بإرشادك.");
      }
    }
  };

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
    wordRef.current = userText;
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

      {/* شريط مراقبة الـ Agent */}
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

        {/* PERSON A */}
        <div className="relative flex flex-1 flex-col overflow-hidden rounded-3xl glass-dark p-5 md:p-8 shadow-card">
          <div className="absolute inset-0 opacity-80"
            style={{ background: "linear-gradient(160deg, oklch(0.32 0.16 290), oklch(0.18 0.13 280))" }} />

          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-[10px] backdrop-blur">
              <span className="relative grid h-1.5 w-1.5 place-items-center">
                <span className={`absolute inset-0 rounded-full ${isDetecting ? 'animate-ping bg-rose-400' : 'bg-green-400'}`} />
                <span className={`relative h-1.5 w-1.5 rounded-full ${isDetecting ? 'bg-rose-500' : 'bg-green-500'}`} />
              </span>
              <span className="font-semibold">{isDetecting ? 'جاري الكشف...' : 'اضغط للبدء'}</span>
            </div>
            <div className="text-[10px] text-white/60">المستخدم · نور</div>
          </div>

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
              onClick={isDetecting ? stopDetection : startDetection}
              className={`absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold shadow-glow transition-all ${isDetecting ? 'bg-rose-500 text-white' : 'grad-purple text-white'}`}
            >
              {isDetecting ? <><Pause className="h-3.5 w-3.5" /> إيقاف</> : <><Camera className="h-3.5 w-3.5" /> بدء الكشف</>}
            </button>
          </div>

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
                onChange={(e) => { setSignTranslation(e.target.value); wordRef.current = e.target.value; checkProactiveContext(e.target.value); }}
                rows={2}
                className="w-full resize-none rounded-xl bg-white/[0.04] p-2 pl-8 text-right text-lg font-semibold leading-snug text-white outline-none ring-1 ring-white/10 focus:ring-primary/50 md:text-xl"
              />
              <button
                onClick={() => { setSignTranslation(""); wordRef.current = ""; pendingLetterRef.current = ""; committedLetterRef.current = ""; setConfidence(null); setIsProactive(false); retryCountRef.current = 0; }}
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

        {/* PERSON B */}
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

            <div className={`relative mt-4 flex flex-1 items-center justify-center overflow-hidden rounded-2xl z-[999] transition-all border-2 ${isProactive ? 'border-amber-400 shadow-lg' : 'border-transparent'}`}
              style={{ background: "oklch(0.95 0.02 295)" }}>
              <AvatarViewer />
              <div className="absolute right-3 top-3 rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-semibold text-primary backdrop-blur">
                إشارة حية
              </div>
            </div>

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

            <div className="mt-3 flex items-center gap-2 rounded-full bg-white/90 p-2 shadow-soft backdrop-blur">
              <button className="grid h-9 w-9 place-items-center rounded-full bg-foreground/5">
                <Mic className="h-4 w-4 text-foreground/70" />
              </button>
              <input
                dir="rtl"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleTextSend()}
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
              <button
                onClick={handleTextSend}
                className="grid h-9 w-9 place-items-center rounded-full grad-purple shadow-soft"
              >
                <Send className="h-4 w-4 text-white" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}