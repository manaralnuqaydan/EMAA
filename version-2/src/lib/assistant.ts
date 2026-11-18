import { SIGN_API_URL } from "@/lib/arasl";
import type { SignLang, UiLang } from "@/lib/i18n";

export type ChatTurn = { role: "user" | "assistant"; content: string };
// source: claude = رد بالذكاء الاصطناعي، dataset = رد جاهز بدون اتصال، offline = المساعد غير متاح
export type AssistantReply = {
  ar: string;
  en: string;
  sign: string;
  source: "claude" | "dataset" | "offline" | "empty";
};

export async function askAssistant(
  messages: ChatTurn[],
  uiLang: UiLang,
  signLang: SignLang,
): Promise<AssistantReply> {
  const res = await fetch(`${SIGN_API_URL}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      messages: messages.slice(-20),
      ui_lang: uiLang,
      sign_lang: signLang,
    }),
  });
  if (!res.ok) throw new Error(`chat ${res.status}`);
  return res.json();
}

// يخلي الأفاتار يتهجى كلمات الرد بلغة الإشارة المختارة
export function spellOnAvatar(text: string, signLang: SignLang) {
  if (!text.trim()) return;
  window.dispatchEvent(
    new CustomEvent("spellText", { detail: { text, signLang } }),
  );
}
