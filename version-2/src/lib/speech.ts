import { useCallback, useEffect, useRef, useState } from "react";

// العربي ينطق بصوت عربي، وغيره بصوت إنجليزي
export function speechLang(text: string) {
  return /[\u0600-\u06FF]/.test(text) ? "ar-SA" : "en-US";
}

// نطق النص عبر Web Speech API بلغة النص نفسه
export function speak(text: string) {
  if (
    typeof window === "undefined" ||
    !("speechSynthesis" in window) ||
    !text.trim()
  )
    return;
  const synth = window.speechSynthesis;
  synth.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  const lang = speechLang(text);
  utterance.lang = lang;
  utterance.rate = 0.95;
  const voice =
    synth.getVoices().find((v) => v.lang === lang) ??
    synth.getVoices().find((v) => v.lang.startsWith(lang.slice(0, 2)));
  if (voice) utterance.voice = voice;
  synth.speak(utterance);
}

export function stopSpeaking() {
  if (typeof window !== "undefined" && "speechSynthesis" in window)
    window.speechSynthesis.cancel();
}

type Recognition = {
  lang: string;
  interimResults: boolean;
  onresult:
    | ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void)
    | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
  start: () => void;
  stop: () => void;
};

// تحويل الكلام إلى نص (يعمل في Chrome و Edge و Safari)
export function useSpeechToText(
  onText: (text: string) => void,
  lang: "ar-SA" | "en-US" = "ar-SA",
) {
  const [listening, setListening] = useState(false);
  const [supported, setSupported] = useState(false);
  const recognitionRef = useRef<Recognition | null>(null);
  const onTextRef = useRef(onText);
  onTextRef.current = onText;

  useEffect(() => {
    const w = window as unknown as Record<string, new () => Recognition>;
    const Ctor = w.SpeechRecognition ?? w.webkitSpeechRecognition;
    if (!Ctor) return;
    const recognition = new Ctor();
    recognition.lang = lang;
    recognition.interimResults = false;
    recognition.onresult = (e) => onTextRef.current(e.results[0][0].transcript);
    recognition.onend = () => setListening(false);
    recognition.onerror = () => setListening(false);
    recognitionRef.current = recognition;
    setSupported(true);
    return () => recognition.stop();
  }, [lang]);

  const toggle = useCallback(() => {
    const recognition = recognitionRef.current;
    if (!recognition) return;
    if (listening) {
      recognition.stop();
    } else {
      recognition.start();
      setListening(true);
    }
  }, [listening]);

  return { listening, supported, toggle };
}

export function downloadText(filename: string, text: string) {
  const url = URL.createObjectURL(
    new Blob([text], { type: "text/plain;charset=utf-8" }),
  );
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
