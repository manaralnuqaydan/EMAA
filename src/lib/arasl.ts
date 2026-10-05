// الحروف الـ32 التي يتعرف عليها موديل ArASL
export const ARASL_LETTERS = [
  "ا",
  "ب",
  "ت",
  "ث",
  "ج",
  "ح",
  "خ",
  "د",
  "ذ",
  "ر",
  "ز",
  "س",
  "ش",
  "ص",
  "ض",
  "ط",
  "ظ",
  "ع",
  "غ",
  "ف",
  "ق",
  "ك",
  "ل",
  "م",
  "ن",
  "ه",
  "و",
  "ي",
  "ى",
  "ة",
  "ال",
  "لا",
];

export const SIGN_API_URL = "http://localhost:8000";

// أقل نسبة ثقة لقبول الحرف، وعدد القراءات المتتالية المطلوبة لتثبيته
export const MIN_CONFIDENCE = 60;
export const STABLE_READS = 2;
export const PREDICT_INTERVAL_MS = 400;
