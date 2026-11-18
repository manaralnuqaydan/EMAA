import {
  ChevronRight,
  Volume2,
  VolumeX,
  Send,
  Sparkles,
  Mic,
  MicOff,
  RefreshCw,
  X,
  Camera,
  Pause,
  AlertCircle,
  Delete,
  Space,
} from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useState, useRef, useEffect, useCallback } from "react";
import AvatarViewer from "@/components/ui/AvatarViewer";
import SpellCaption from "@/components/ui/SpellCaption";
import CameraConsent, { hasCameraConsent } from "@/components/ui/CameraConsent";
import { speak, stopSpeaking, useSpeechToText } from "@/lib/speech";
import { useI18n } from "@/lib/i18n";
import {
  LanguageSwitcher,
  SignLanguagePicker,
} from "@/components/LanguageControls";
import type { SpellRequest } from "@/components/ui/AvatarViewer";
import { askAssistant, spellOnAvatar, type ChatTurn } from "@/lib/assistant";
import {
  ARASL_LETTERS,
  MIN_CONFIDENCE,
  PREDICT_INTERVAL_MS,
  SIGN_API_URL,
  STABLE_READS,
  WORD_GAP_MS,
  correctWord,
  suggestWords,
} from "@/lib/arasl";
import {
  MIN_SIGN_FRAMES,
  SIGN_END_MS,
  hasHands,
  holisticFrame,
  loadHolisticScript,
  resampleSequence,
  type HolisticResults,
} from "@/lib/aslWords";

type Landmark = { x: number; y: number };
type Replies = Record<string, { response: string }>;

const proactiveKeywords = [
  "لا اعرف",
  "لا أعرف",
  "ما اعرف",
  "ما أعرف",
  "مدري",
  "خطأ",
  "غلط",
  "خطأ في",
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
  "كيف",
  "طريقة",
  "ما رضي",
  "رفض",
  "فشل",
  "dont know",
  "problem",
  "error",
  "stuck",
  "confused",
  "hard",
  "help",
];

type ApiStatus = {
  asl_letters: boolean;
  asl_words?: boolean;
  arsl_phrases?: boolean;
} | null;
const PHRASE_MIN_CONFIDENCE = 80;

export function CameraScreen() {
  const { t, lang: uiLang, signLang } = useI18n();
  const [signTranslation, setSignTranslation] = useState("");
  // null يعني الرد الافتراضي بلغة الواجهة الحالية
  const [replyText, setReplyText] = useState<string | null>(null);
  const shownReply = replyText ?? t("live.defaultReply");
  const [inputText, setInputText] = useState("");
  const [isDetecting, setIsDetecting] = useState(false);
  const [handVisible, setHandVisible] = useState(false);
  const [apiError, setApiError] = useState(false);
  const [cameraError, setCameraError] = useState(false);
  const [confidence, setConfidence] = useState<number | null>(null);
  const [isProactive, setIsProactive] = useState<boolean>(false);
  const [proactiveReason, setProactiveReason] = useState<string>("");
  const [autoSpeak, setAutoSpeak] = useState(true);
  // لغة الإشارة اللي يقرأها من الكاميرا: العربية (ArASL) أو الأمريكية (ASL)
  // تنختار من شاشة الأوضاع أو من الزر هنا، ومستقلة عن لغة الواجهة
  const lang = signLang === "asl" ? "en" : "ar";
  const langRef = useRef(lang);
  langRef.current = lang;
  const tRef = useRef(t);
  tRef.current = t;
  const [apiStatus, setApiStatus] = useState<ApiStatus>(null);
  const [chatbotOnline, setChatbotOnline] = useState(false);
  const chatbotOnlineRef = useRef(chatbotOnline);
  chatbotOnlineRef.current = chatbotOnline;
  const chatHistoryRef = useRef<ChatTurn[]>([]);
  const [asking, setAsking] = useState(false);
  // في العربي: حروف (موديل ArASL) أو عبارات (موديل النسخة الأصلية)
  const [arslMode, setArslMode] = useState<"letters" | "phrases">("letters");
  const arslModeRef = useRef(arslMode);
  arslModeRef.current = arslMode;
  // في ASL: حروف (نقاط يد وحدة) أو كلمات (حركة كاملة بـ Holistic)
  const [aslMode, setAslMode] = useState<"letters" | "words">("letters");
  const aslModeRef = useRef(aslMode);
  aslModeRef.current = aslMode;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const holisticRef = useRef<any>(null);
  const [holisticLoading, setHolisticLoading] = useState(false);
  const signFramesRef = useRef<number[][]>([]);
  const lastHandsAtRef = useRef(0);
  const [wordHint, setWordHint] = useState<string | null>(null);

  const retryCountRef = useRef<number>(0);
  const [askConsent, setAskConsent] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handsRef = useRef<any>(null);
  const animFrameRef = useRef<number | null>(null);
  const lastPredictTime = useRef<number>(0);
  const isDetectingRef = useRef(false);
  const requestInFlight = useRef(false);
  const cropCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const repliesRef = useRef<Replies>({});
  const autoSpeakRef = useRef(autoSpeak);
  autoSpeakRef.current = autoSpeak;
  // الموديل يتعرف على حروف ArASL، فنجمعها هنا في كلمات
  const wordRef = useRef<string>("");
  const pendingLetterRef = useRef<string>("");
  const pendingCountRef = useRef(0);
  const committedLetterRef = useRef<string>("");

  const mic = useSpeechToText(
    (text) => setInputText(text),
    uiLang === "ar" ? "ar-SA" : "en-US",
  );

  // نسأل الخادم وش الموديلات المتاحة فعلًا (مثلًا: هل موديل ASL متدرب؟)
  useEffect(() => {
    fetch(`${SIGN_API_URL}/`)
      .then((res) => res.json())
      .then((data) => {
        setApiStatus(data.models ?? null);
        setChatbotOnline(!!data.chatbot);
      })
      .catch(() => setApiStatus(null));
  }, []);
  const usingAslWords = signLang === "asl" && aslMode === "words";
  const aslUnavailable =
    signLang === "asl" &&
    (usingAslWords
      ? apiStatus !== null && !apiStatus.asl_words
      : apiStatus?.asl_letters === false);

  // نحمّل Holistic بس لما نحتاجه (وضع كلمات ASL)
  useEffect(() => {
    if (!usingAslWords || holisticRef.current) return;
    setHolisticLoading(true);
    loadHolisticScript()
      .then(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const Holistic = (window as any).Holistic;
        const h = new Holistic({
          locateFile: (file: string) =>
            `https://cdn.jsdelivr.net/npm/@mediapipe/holistic@0.5.1675471629/${file}`,
        });
        h.setOptions({
          modelComplexity: 1,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5,
        });
        h.onResults((r: HolisticResults) => onHolisticResults(r));
        holisticRef.current = h;
      })
      .catch(() => setApiError(true))
      .finally(() => setHolisticLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usingAslWords]);

  // نجمع لقطات الإشارة، ولما تختفي اليدين نرسل الحركة كاملة
  const onHolisticResults = (r: HolisticResults) => {
    if (!isDetectingRef.current) return;
    const now = Date.now();
    const visible = hasHands(r);
    setHandVisible(visible);
    if (visible) {
      signFramesRef.current.push(holisticFrame(r));
      lastHandsAtRef.current = now;
      return;
    }
    const frames = signFramesRef.current;
    if (!frames.length || now - lastHandsAtRef.current < SIGN_END_MS) return;
    signFramesRef.current = [];
    if (frames.length >= MIN_SIGN_FRAMES)
      sendSequenceToAPI(resampleSequence(frames));
  };

  const sendSequenceToAPI = async (frames: number[][]) => {
    try {
      const res = await fetch(`${SIGN_API_URL}/predict-asl-word`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ frames }),
      });
      const data: {
        prediction: string;
        confidence: number;
        top: { word: string }[];
      } = await res.json();
      setApiError(false);
      setConfidence(data.confidence);
      if (!data.prediction) return;
      if (data.confidence < MIN_CONFIDENCE) {
        // ما نخمّن: نعرض أقرب الكلمات ونخلي المستخدم يختار أو يعيد
        setWordHint(data.top.map((w) => w.word.toLowerCase()).join("، "));
        return;
      }
      setWordHint(null);
      const word = data.prediction.toLowerCase();
      setWord(wordRef.current + word + " ");
      if (autoSpeakRef.current) speak(word);
      answer(wordRef.current);
    } catch (err) {
      setApiError(true);
      console.error("خطأ في الاتصال بالـ API:", err);
    }
  };

  useEffect(() => {
    fetch("/data/dataset.json")
      .then((res) => res.json())
      .then((data: Replies) => (repliesRef.current = data))
      .catch(() => {});
  }, []);

  const setWord = (text: string) => {
    wordRef.current = text;
    setSignTranslation(text);
  };

  const respond = (text: string) => {
    setReplyText(text);
    if (autoSpeakRef.current) speak(text);
  };

  // بدون اتصال بالشات بوت: رد جاهز من dataset.json (ميزة النسخة الأصلية)
  // ومع الشات بوت: المستخدم يضغط "أرسل للمساعد" ويجيه رد حقيقي بدل الردود الجاهزة
  const answer = (text: string) => {
    if (chatbotOnlineRef.current) return false;
    const replies = repliesRef.current;
    const key = Object.keys(replies)
      .sort((a, b) => b.length - a.length)
      .find((k) => text.includes(k));
    if (!key) return false;
    respond(replies[key].response);
    window.dispatchEvent(new CustomEvent("playAvatar"));
    return true;
  };

  // المسار A: الإشارة → نص → الشات بوت → رد بالنص والصوت والأفاتار
  const askFromSigns = async () => {
    const message = wordRef.current.trim();
    if (!message || asking) return;
    const history = [
      ...chatHistoryRef.current,
      { role: "user" as const, content: message },
    ];
    setAsking(true);
    try {
      const reply = await askAssistant(history, uiLang, signLang);
      chatHistoryRef.current = [
        ...history,
        { role: "assistant", content: reply.ar || reply.en },
      ];
      const text =
        (uiLang === "ar" ? reply.ar : reply.en) || reply.ar || reply.en;
      respond(text);
      spellOnAvatar(reply.sign, signLang);
      setWord("");
      setApiError(false);
    } catch {
      setApiError(true);
    } finally {
      setAsking(false);
    }
  };

  useEffect(() => {
    const loadMediaPipe = () => {
      return new Promise<void>((resolve) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if ((window as any).Hands) {
          resolve();
          return;
        }
        const s1 = document.createElement("script");
        s1.src = "https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js";
        s1.crossOrigin = "anonymous";
        s1.onload = () => resolve();
        document.head.appendChild(s1);
      });
    };

    loadMediaPipe().then(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const Hands = (window as any).Hands;
      const mpHands = new Hands({
        locateFile: (file: string) =>
          `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
      });
      mpHands.setOptions({
        maxNumHands: 1,
        modelComplexity: 1,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      mpHands.onResults((results: any) => {
        if (!isDetectingRef.current) return;
        const hand = results.multiHandLandmarks?.[0];
        setHandVisible(!!hand);
        if (!hand) {
          return;
        }
        const now = Date.now();
        if (
          requestInFlight.current ||
          now - lastPredictTime.current < PREDICT_INTERVAL_MS
        )
          return;
        lastPredictTime.current = now;
        if (langRef.current === "en") {
          const world = results.multiHandWorldLandmarks?.[0];
          const side = results.multiHandedness?.[0]?.label ?? "Right";
          if (world) sendLandmarksToAPI(world, side);
          return;
        }
        if (arslModeRef.current === "phrases") {
          sendPhraseToAPI(hand);
          return;
        }
        const image = cropHand(hand);
        if (image) sendImageToAPI(image);
      });
      handsRef.current = mpHands;
    });

    return () => {
      isDetectingRef.current = false;
      streamRef.current?.getTracks().forEach((t) => t.stop());
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      stopSpeaking();
    };
  }, []);

  const processFrame = useCallback(async () => {
    if (!isDetectingRef.current || !videoRef.current) return;
    const tracker =
      langRef.current === "en" && aslModeRef.current === "words"
        ? holisticRef.current
        : handsRef.current;
    if (tracker) await tracker.send({ image: videoRef.current });
    animFrameRef.current = requestAnimationFrame(processFrame);
  }, []);

  const startDetection = useCallback(async () => {
    setCameraError(false);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      isDetectingRef.current = true;
      setIsDetecting(true);
      animFrameRef.current = requestAnimationFrame(processFrame);
    } catch (err) {
      console.error("خطأ في الكاميرا:", err);
      setCameraError(true);
    }
  }, [processFrame]);

  const stopDetection = useCallback(() => {
    isDetectingRef.current = false;
    setIsDetecting(false);
    setHandVisible(false);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
  }, []);

  // يقص مربعًا حول اليد بحجم صور ArASL (64×64) ويرجعه كصورة JPEG
  const cropHand = (landmarks: Landmark[]) => {
    const video = videoRef.current;
    if (!video || !video.videoWidth) return null;
    const xs = landmarks.map((lm) => lm.x * video.videoWidth);
    const ys = landmarks.map((lm) => lm.y * video.videoHeight);
    const minX = Math.min(...xs),
      maxX = Math.max(...xs);
    const minY = Math.min(...ys),
      maxY = Math.max(...ys);
    const size = Math.max(maxX - minX, maxY - minY) * 1.8; // أفضل هامش في اختبار صور ArASL
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
    ctx.drawImage(
      video,
      cx - size / 2,
      cy - size / 2,
      size,
      size,
      0,
      0,
      64,
      64,
    );
    return cropCanvasRef.current.toDataURL("image/jpeg", 0.9);
  };

  // العبارات: نرسل نقاط اليد الـ21 بإحداثيات الصورة، مثل النسخة الأصلية
  const sendPhraseToAPI = async (
    hand: { x: number; y: number; z: number }[],
  ) => {
    requestInFlight.current = true;
    try {
      const res = await fetch(`${SIGN_API_URL}/predict-phrase`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ landmarks: hand.map((p) => [p.x, p.y, p.z]) }),
      });
      const data = await res.json();
      setApiError(false);
      if (data.prediction) handlePhrase(data.prediction, data.confidence ?? 0);
    } catch (err) {
      setApiError(true);
      console.error("خطأ في الاتصال بالـ API:", err);
    } finally {
      requestInFlight.current = false;
    }
  };

  // الموديل الأصلي فيه عبارتين بس ودايم يختار وحدة منهم، فنطلب ثقة عالية وثبات
  const handlePhrase = (phrase: string, conf: number) => {
    setConfidence(conf);
    if (conf < PHRASE_MIN_CONFIDENCE) {
      pendingCountRef.current = 0;
      return;
    }
    pendingCountRef.current =
      phrase === pendingLetterRef.current ? pendingCountRef.current + 1 : 1;
    pendingLetterRef.current = phrase;
    if (
      pendingCountRef.current < STABLE_READS + 1 ||
      phrase === committedLetterRef.current
    )
      return;
    committedLetterRef.current = phrase;
    setWord(wordRef.current + phrase + " ");
    if (autoSpeakRef.current) speak(phrase);
    answer(wordRef.current);
  };

  const sendImageToAPI = async (image: string) => {
    requestInFlight.current = true;
    try {
      const res = await fetch(`${SIGN_API_URL}/predict-image`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image }),
      });
      const data = await res.json();
      setApiError(false);
      if (!ARASL_LETTERS.includes(data.prediction)) return;
      handlePrediction(data.prediction, data.confidence ?? 0);
    } catch (err) {
      setApiError(true);
      console.error("خطأ في الاتصال بالـ API:", err);
    } finally {
      requestInFlight.current = false;
    }
  };

  // ASL: نرسل نقاط اليد الـ21 بدل الصورة
  const sendLandmarksToAPI = async (
    world: { x: number; y: number; z: number }[],
    handedness: string,
  ) => {
    requestInFlight.current = true;
    try {
      const res = await fetch(`${SIGN_API_URL}/predict-asl`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          landmarks: world.map((p) => [p.x, p.y, p.z]),
          handedness,
        }),
      });
      const data = await res.json();
      setApiError(false);
      if (!data.prediction || data.prediction === "nothing") return;
      // "space" و "del" إشارات في ASL Alphabet: تنهي الكلمة أو تحذف حرف
      const token =
        data.prediction.length === 1
          ? data.prediction.toLowerCase()
          : data.prediction;
      handlePrediction(token, data.confidence ?? 0);
    } catch (err) {
      setApiError(true);
      console.error("خطأ في الاتصال بالـ API:", err);
    } finally {
      requestInFlight.current = false;
    }
  };

  const handlePrediction = (letter: string, conf: number) => {
    setConfidence(conf);

    // فلتر التردد: تكرار الثقة المنخفضة يفعّل الإرشاد الاستباقي
    if (conf < MIN_CONFIDENCE) {
      pendingCountRef.current = 0;
      retryCountRef.current += 1;
      if (retryCountRef.current >= 8)
        triggerProactiveMode(tRef.current("live.lowConfidence"));
      return;
    }

    // نضيف الحرف بعد تكراره في قراءات متتالية، ولا نكرره حتى يتغير أو تختفي اليد
    pendingCountRef.current =
      letter === pendingLetterRef.current ? pendingCountRef.current + 1 : 1;
    pendingLetterRef.current = letter;
    if (
      pendingCountRef.current < STABLE_READS ||
      letter === committedLetterRef.current
    )
      return;

    committedLetterRef.current = letter;
    retryCountRef.current = 0;
    if (letter === "space") return finishWord();
    if (letter === "del") return deleteLetter();
    setWord(wordRef.current + letter);
    checkProactiveContext(wordRef.current);
    answer(wordRef.current);
  };

  // عند اختفاء اليد يمكن تكرار نفس الحرف (مثل: لل)، وإذا طال اختفاؤها تنتهي الكلمة
  useEffect(() => {
    if (handVisible || !isDetecting) return;
    committedLetterRef.current = "";
    pendingCountRef.current = 0;
    const timer = setTimeout(finishWord, WORD_GAP_MS);
    return () => clearTimeout(timer);
  }, [handVisible, isDetecting]);

  // ينهي الكلمة الحالية: يصححها لأقرب كلمة معروفة ثم ينطقها
  const finishWord = (chosen?: string) => {
    const text = wordRef.current;
    if (!text || text.endsWith(" ")) return;
    const start = text.lastIndexOf(" ") + 1;
    const word = chosen ?? correctWord(text.slice(start));
    setWord(text.slice(0, start) + word + " ");
    committedLetterRef.current = "";
    if (autoSpeakRef.current) speak(word);
    answer(wordRef.current);
  };

  const addSpace = () => finishWord();

  const deleteLetter = () => {
    const letters = Array.from(wordRef.current);
    letters.pop();
    setWord(letters.join(""));
    committedLetterRef.current = "";
  };

  const clearTranslation = () => {
    setWord("");
    pendingLetterRef.current = "";
    committedLetterRef.current = "";
    setConfidence(null);
    setIsProactive(false);
    retryCountRef.current = 0;
  };

  const resetAll = () => {
    clearTranslation();
    setReplyText(null);
    setInputText("");
    stopSpeaking();
  };

  const checkProactiveContext = (text: string) => {
    const lower = text.toLowerCase();
    const hasStrugglingWord = proactiveKeywords.some((keyword) =>
      lower.includes(keyword),
    );
    if (hasStrugglingWord) {
      retryCountRef.current += 1;
      if (retryCountRef.current >= 2) {
        triggerProactiveMode(tRef.current("assistant.proactiveReason"));
      } else {
        respond(tRef.current("live.struggleOnce"));
      }
    }
  };

  // مساعدة استباقية: تنبيه وإرشاد عند تكرار الثقة المنخفضة أو كلمات الصعوبة
  // (مطابقة كلمات وقواعد بسيطة، مو تحليل بالذكاء الاصطناعي)
  const triggerProactiveMode = (reason: string) => {
    setIsProactive(true);
    setProactiveReason(reason);
    respond(tRef.current("live.struggleRepeat"));
  };

  // المحاور يكتب أو يتكلم، والأفاتار يترجم إلى إشارة
  const handleTextSend = () => {
    const userText = inputText.trim();
    if (!userText) return;
    setInputText("");
    setReplyText(userText);
    // الأفاتار يتهجى النص حرفًا حرفًا بأشكال يد حقيقية من ArASL
    window.dispatchEvent(
      new CustomEvent<SpellRequest>("spellText", {
        detail: { text: userText, signLang },
      }),
    );
    if (autoSpeakRef.current) speak(userText);
  };

  const partialWord = signTranslation.endsWith(" ")
    ? ""
    : (signTranslation.split(" ").pop() ?? "");
  const suggestions = suggestWords(partialWord);

  const statusLabel = !isDetecting
    ? t("live.pressStart")
    : apiError
      ? t("common.serverOffline")
      : handVisible
        ? t("live.translating")
        : t("live.showHand");
  const signLangName = t(`signLang.${signLang}`);

  return (
    <div
      className="flex min-h-dvh w-full flex-col text-white"
      style={{ background: "#1a1230" }}
    >
      {/* header */}
      <div className="relative z-20 flex w-full shrink-0 items-center justify-between px-4 pt-5 pb-3 sm:px-5 md:pt-8 md:pb-4">
        <Link
          to="/modes"
          aria-label={t("common.back")}
          className="grid h-10 w-10 place-items-center rounded-full glass-dark"
        >
          <ChevronRight className="h-4 w-4 ltr:-scale-x-100" />
        </Link>
        <div className="text-center leading-tight">
          <div className="text-[10px] tracking-[0.25em] text-white/50">
            LIVE
          </div>
          <div className="text-sm font-semibold">{t("live.title")}</div>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2">
          <LanguageSwitcher dark />
          <SignLanguagePicker
            compact
            dark
            onChange={() => clearTranslation()}
          />
          <button
            onClick={() => {
              if (autoSpeak) stopSpeaking();
              setAutoSpeak(!autoSpeak);
            }}
            aria-pressed={autoSpeak}
            aria-label={
              autoSpeak ? t("live.autoSpeakOn") : t("live.autoSpeakOff")
            }
            title={autoSpeak ? t("live.autoSpeakOn") : t("live.autoSpeakOff")}
            className={`grid h-10 w-10 place-items-center rounded-full ${autoSpeak ? "grad-purple shadow-soft" : "glass-dark text-white/60"}`}
          >
            {autoSpeak ? (
              <Volume2 className="h-4 w-4" />
            ) : (
              <VolumeX className="h-4 w-4" />
            )}
          </button>
          <button
            onClick={resetAll}
            aria-label={t("common.newChat")}
            title={t("common.newChat")}
            className="grid h-10 w-10 place-items-center rounded-full glass-dark"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* شريط مراقبة الـ Agent */}
      {isProactive && (
        <div className="mx-4 mb-2 flex items-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/20 p-3 text-xs text-amber-200 animate-pulse sm:mx-5">
          <AlertCircle className="h-4 w-4 shrink-0 text-amber-400" />
          <div className="flex-1 text-start">
            <span className="font-bold">{t("assistant.proactiveTitle")}</span>{" "}
            {proactiveReason}
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

      {/* main */}
      <div className="relative z-10 flex flex-1 flex-col gap-4 px-4 pb-4 sm:px-5 md:min-h-0 md:flex-row md:items-stretch md:gap-6 md:pb-5">
        {/* PERSON A: المستخدم يشير والموديل يترجم الحروف */}
        <div className="relative flex flex-col overflow-hidden rounded-3xl glass-dark p-4 shadow-card sm:p-5 md:min-h-0 md:flex-1 md:p-6">
          <div
            className="absolute inset-0 opacity-80"
            style={{
              background:
                "linear-gradient(160deg, oklch(0.32 0.16 290), oklch(0.18 0.13 280))",
            }}
          />

          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-[10px] backdrop-blur">
              <span className="relative grid h-1.5 w-1.5 place-items-center">
                <span
                  className={`absolute inset-0 rounded-full ${isDetecting ? (apiError ? "bg-amber-400" : "animate-ping bg-rose-400") : "bg-green-400"}`}
                />
                <span
                  className={`relative h-1.5 w-1.5 rounded-full ${isDetecting ? (apiError ? "bg-amber-500" : "bg-rose-500") : "bg-green-500"}`}
                />
              </span>
              <span className="font-semibold">{statusLabel}</span>
            </div>
            <div className="text-[10px] text-white/60">{t("live.user")}</div>
          </div>

          <div className="relative mt-2 text-[11px] font-semibold text-white/80">
            {t("signLang.active", { name: signLangName })}
          </div>
          {signLang === "arsl" && apiStatus?.arsl_phrases !== false && (
            <div
              role="radiogroup"
              aria-label={t("live.recogMode")}
              className="relative mt-2 flex w-fit gap-0.5 rounded-full bg-white/10 p-1 text-[11px] font-bold"
            >
              {(["letters", "phrases"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  role="radio"
                  aria-checked={arslMode === m}
                  onClick={() => {
                    setArslMode(m);
                    pendingCountRef.current = 0;
                    committedLetterRef.current = "";
                  }}
                  className={`rounded-full px-3 py-1 transition-all ${arslMode === m ? "grad-purple text-white" : "text-white/60"}`}
                >
                  {t(`live.${m}`)}
                </button>
              ))}
            </div>
          )}
          {signLang === "asl" && (
            <div
              role="radiogroup"
              aria-label={t("live.recogMode")}
              className="relative mt-2 flex w-fit gap-0.5 rounded-full bg-white/10 p-1 text-[11px] font-bold"
            >
              {(["letters", "words"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  role="radio"
                  aria-checked={aslMode === m}
                  onClick={() => {
                    setAslMode(m);
                    signFramesRef.current = [];
                    pendingCountRef.current = 0;
                    committedLetterRef.current = "";
                    setWordHint(null);
                  }}
                  className={`rounded-full px-3 py-1 transition-all ${aslMode === m ? "grad-purple text-white" : "text-white/60"}`}
                >
                  {t(`live.${m}`)}
                </button>
              ))}
            </div>
          )}
          {usingAslWords && holisticLoading && (
            <div className="relative mt-2 text-[11px] text-white/60">
              {t("live.loadingHolistic")}
            </div>
          )}
          {wordHint && (
            <div
              role="status"
              className="relative mt-2 rounded-xl bg-white/10 px-3 py-2 text-[11px] text-white/80"
            >
              {t("live.wordUnsure", { words: wordHint })}
            </div>
          )}
          {cameraError && (
            <div
              role="alert"
              className="relative mt-2 flex items-center gap-2 rounded-xl border border-rose-400/40 bg-rose-500/15 px-3 py-2 text-[11px] text-rose-100"
            >
              <AlertCircle className="h-3.5 w-3.5 shrink-0 text-rose-300" />
              {t("live.cameraDenied")}
            </div>
          )}
          {aslUnavailable && (
            <div
              role="status"
              className="relative mt-2 flex items-center gap-2 rounded-xl border border-amber-400/40 bg-amber-500/15 px-3 py-2 text-[11px] text-amber-100"
            >
              <AlertCircle className="h-3.5 w-3.5 shrink-0 text-amber-300" />
              {usingAslWords
                ? t("signLang.aslWordsNotReady")
                : t("signLang.aslNotReady")}
            </div>
          )}

          <div className="relative mt-3 aspect-[4/3] w-full shrink-0 overflow-hidden rounded-2xl border border-white/15 bg-black/20 md:aspect-auto md:min-h-[260px] md:flex-1">
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className="h-full w-full -scale-x-100 object-cover"
            />
            {isDetecting && (
              <div
                className="absolute inset-x-6 top-4 h-px animate-scan rounded-full"
                style={{
                  background:
                    "linear-gradient(90deg, transparent, oklch(0.85 0.18 295), transparent)",
                }}
              />
            )}
            {!isDetecting && (
              <div className="absolute inset-0 grid place-items-center text-center text-xs text-white/50">
                <div>
                  <Camera
                    className="mx-auto mb-2 h-8 w-8 text-white/30"
                    strokeWidth={1.4}
                  />
                  {lang === "en"
                    ? aslMode === "words"
                      ? t("live.hintAslWords")
                      : t("live.hintAsl")
                    : arslMode === "phrases"
                      ? t("live.hintPhrases")
                      : t("live.hintArsl")}
                </div>
              </div>
            )}
            <div className="absolute end-3 top-3 rounded-xl glass-dark px-3 py-1.5 text-center">
              <div className="text-[9px] text-white/60">
                {t("live.confidence")}
              </div>
              <div className="text-base font-black text-gradient">
                {confidence !== null ? `${Math.round(confidence)}%` : "-"}
              </div>
            </div>
            {isDetecting && partialWord && (
              <div
                dir="auto"
                className="absolute start-3 top-3 max-w-[60%] truncate rounded-2xl grad-purple px-4 py-2 text-2xl font-black shadow-glow"
              >
                {partialWord}
              </div>
            )}
            {askConsent && (
              <CameraConsent
                onAccept={() => {
                  setAskConsent(false);
                  startDetection();
                }}
                onCancel={() => setAskConsent(false)}
              />
            )}
            <button
              onClick={
                isDetecting
                  ? stopDetection
                  : () =>
                      hasCameraConsent()
                        ? startDetection()
                        : setAskConsent(true)
              }
              className={`absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full px-4 py-2 text-xs font-bold shadow-glow transition-all ${isDetecting ? "bg-rose-500 text-white" : "grad-purple text-white"}`}
            >
              {isDetecting ? (
                <>
                  <Pause className="h-3.5 w-3.5" /> {t("live.stop")}
                </>
              ) : (
                <>
                  <Camera className="h-3.5 w-3.5" /> {t("live.start")}
                </>
              )}
            </button>
          </div>

          {/* اقتراحات تكمل الكلمة اللي تتهجاها */}
          <div
            className="relative mt-3 flex min-h-8 flex-wrap items-center justify-center gap-1.5"
            dir="auto"
          >
            {suggestions.length > 0 ? (
              suggestions.map((word) => (
                <button
                  key={word}
                  onClick={() => finishWord(word)}
                  className="rounded-full bg-white/10 px-3 py-1 text-sm font-bold hover:bg-white/20"
                >
                  {word}
                </button>
              ))
            ) : (
              <span className="text-[11px] text-white/45">
                {isDetecting ? t("live.spellHint") : t("live.idleHint")}
              </span>
            )}
          </div>

          <div className="relative mt-3 rounded-2xl bg-white/[0.07] p-3 backdrop-blur sm:p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-[10px] text-white/60">
                <Sparkles className="h-3 w-3 text-primary" />
                <span>{t("live.signText")}</span>
              </div>
              <button
                onClick={() => speak(signTranslation)}
                disabled={!signTranslation.trim()}
                className="flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-1 text-[10px] hover:bg-white/20 disabled:opacity-40"
              >
                <Volume2 className="h-3 w-3" /> {t("common.listen")}
              </button>
            </div>
            <div className="relative mt-2">
              <textarea
                dir="auto"
                aria-label={t("live.signText")}
                value={signTranslation}
                placeholder={t("live.waiting")}
                onChange={(e) => {
                  setWord(e.target.value);
                  checkProactiveContext(e.target.value);
                }}
                rows={2}
                className="w-full resize-none rounded-xl bg-white/[0.04] px-10 py-2 text-start text-lg font-semibold leading-snug text-white outline-none ring-1 ring-white/10 placeholder:text-white/40 focus:ring-primary/50 md:text-xl"
              />
              <button
                onClick={clearTranslation}
                aria-label={t("common.clear")}
                className="absolute end-2 top-2 grid h-6 w-6 place-items-center rounded-full bg-white/10 text-white/70 hover:bg-white/20"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
            <div className="mt-2 flex items-center gap-2">
              <button
                onClick={addSpace}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-white/10 py-2 text-[11px] font-semibold hover:bg-white/20"
              >
                <Space className="h-3.5 w-3.5" /> {t("live.endWord")}
              </button>
              <button
                onClick={deleteLetter}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-white/10 py-2 text-[11px] font-semibold hover:bg-white/20"
              >
                <Delete className="h-3.5 w-3.5 rtl:-scale-x-100" />{" "}
                {t("live.deleteLetter")}
              </button>
            </div>
            <button
              onClick={askFromSigns}
              disabled={!signTranslation.trim() || asking}
              className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-xl grad-purple py-2 text-[12px] font-bold shadow-soft disabled:opacity-40"
            >
              <Send className="h-3.5 w-3.5 rtl:-scale-x-100" />
              {asking ? t("live.asking") : t("live.askAssistant")}
            </button>
          </div>
        </div>

        {/* PERSON B: المحاور والأفاتار */}
        <div
          className="relative flex flex-col overflow-hidden rounded-3xl glass text-foreground shadow-card md:min-h-0 md:flex-1"
          style={{
            background:
              "linear-gradient(160deg, oklch(0.97 0.02 295 / 0.95), oklch(0.93 0.04 280 / 0.9))",
          }}
        >
          <div className="flex flex-1 flex-col p-4 sm:p-5 md:min-h-0 md:p-6">
            <div className="flex items-center justify-between">
              <div
                className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold backdrop-blur transition-all ${isProactive ? "bg-amber-500/20 text-amber-700 animate-pulse" : "bg-primary/10 text-primary"}`}
              >
                <Sparkles className="h-3 w-3" />
                <span>
                  {isProactive ? t("live.proactiveOn") : t("live.toSign")}
                </span>
              </div>
              <div className="text-[10px] text-muted-foreground">
                {t("live.partner")}
              </div>
            </div>

            <div
              className={`relative mt-3 h-64 overflow-hidden rounded-2xl border-2 transition-all sm:h-72 md:h-auto md:min-h-[260px] md:flex-1 ${isProactive ? "border-amber-400 shadow-lg" : "border-transparent"}`}
              style={{
                background:
                  "radial-gradient(ellipse at center top, oklch(0.9 0.06 295), oklch(0.95 0.02 295) 70%)",
              }}
            >
              <AvatarViewer />
              <SpellCaption />
              <div className="absolute end-3 top-3 rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-semibold text-primary backdrop-blur">
                {signLangName}
              </div>
            </div>

            <div
              className={`relative mt-3 rounded-2xl border p-3 shadow-soft backdrop-blur transition-all ${isProactive ? "border-amber-300 bg-amber-50/90" : "border-transparent bg-white/85"}`}
            >
              <textarea
                dir="auto"
                value={shownReply}
                onChange={(e) => setReplyText(e.target.value)}
                rows={3}
                className="w-full resize-none bg-transparent pt-7 text-start text-base font-medium leading-snug text-foreground outline-none"
              />
              <div className="absolute end-2 top-2 flex gap-1">
                <button
                  onClick={() => speak(shownReply)}
                  aria-label={t("common.listen")}
                  className="grid h-6 w-6 place-items-center rounded-full bg-primary/10 text-primary hover:bg-primary/20"
                >
                  <Volume2 className="h-3 w-3" />
                </button>
                <button
                  onClick={() => setReplyText("")}
                  aria-label={t("common.clear")}
                  className="grid h-6 w-6 place-items-center rounded-full bg-foreground/10 text-foreground/70 hover:bg-foreground/20"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            </div>

            <div className="mt-3 flex items-center gap-2 rounded-full bg-white/90 p-2 shadow-soft backdrop-blur">
              {mic.supported && (
                <button
                  onClick={mic.toggle}
                  aria-label={mic.listening ? t("live.micStop") : t("live.mic")}
                  className={`grid h-9 w-9 shrink-0 place-items-center rounded-full transition-all ${mic.listening ? "animate-pulse bg-rose-500 text-white" : "bg-foreground/5 text-foreground/70"}`}
                >
                  {mic.listening ? (
                    <MicOff className="h-4 w-4" />
                  ) : (
                    <Mic className="h-4 w-4" />
                  )}
                </button>
              )}
              <input
                dir="auto"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleTextSend()}
                placeholder={
                  mic.listening ? t("live.speakNow") : t("live.typeToSign")
                }
                className="min-w-0 flex-1 bg-transparent px-1 text-sm text-foreground outline-none placeholder:text-muted-foreground"
              />
              {inputText && (
                <button
                  onClick={() => setInputText("")}
                  aria-label={t("common.clear")}
                  className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-foreground/10 text-foreground/70 hover:bg-foreground/20"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
              <button
                onClick={handleTextSend}
                aria-label={t("common.send")}
                className="grid h-9 w-9 shrink-0 place-items-center rounded-full grad-purple shadow-soft"
              >
                <Send className="h-4 w-4 text-white rtl:-scale-x-100" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
