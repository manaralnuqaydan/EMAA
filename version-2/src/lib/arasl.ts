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

// عنوان خادم الموديلات؛ في النشر نحدده بـ VITE_SIGN_API_URL وقت البناء
export const SIGN_API_URL: string =
  import.meta.env.VITE_SIGN_API_URL ?? "http://localhost:8000";

// أقل نسبة ثقة لقبول الحرف، وعدد القراءات المتتالية المطلوبة لتثبيته
export const MIN_CONFIDENCE = 60;
export const STABLE_READS = 2;
export const PREDICT_INTERVAL_MS = 400;

// إذا اختفت اليد هذه المدة تنتهي الكلمة وتنطق
export const WORD_GAP_MS = 1200;

// كلمات شائعة نقترحها أثناء التهجئة ونصحح عليها الكلمة إذا اختلف حرف واحد
export const COMMON_WORDS = [
  "السلام",
  "عليكم",
  "سلام",
  "مرحبا",
  "اهلا",
  "شكرا",
  "عفوا",
  "نعم",
  "لا",
  "انا",
  "انت",
  "هو",
  "هي",
  "نحن",
  "اسمي",
  "اسمك",
  "كيف",
  "حالك",
  "بخير",
  "الحمد",
  "لله",
  "ماذا",
  "متى",
  "اين",
  "لماذا",
  "من",
  "هل",
  "اريد",
  "احتاج",
  "مساعدة",
  "ساعدني",
  "ماء",
  "اكل",
  "طعام",
  "بيت",
  "مدرسة",
  "عمل",
  "طبيب",
  "مستشفى",
  "صيدلية",
  "دواء",
  "الم",
  "مريض",
  "تعبان",
  "سيارة",
  "طريق",
  "اليوم",
  "بكرة",
  "امس",
  "الان",
  "وقت",
  "ساعة",
  "صباح",
  "مساء",
  "ليل",
  "ام",
  "اب",
  "اخ",
  "اخت",
  "صديق",
  "عائلة",
  "حب",
  "سعيد",
  "حزين",
  "جميل",
  "كبير",
  "صغير",
  "جديد",
  "رقم",
  "جوال",
  "هاتف",
  "موعد",
  "تمام",
  "طيب",
  "اسف",
  "لو",
  "سمحت",
  "تفضل",
  "مع",
  "السلامة",
];

const editDistance = (a: string[], b: string[]) => {
  const d = Array.from({ length: a.length + 1 }, (_, i) => [
    i,
    ...Array(b.length).fill(0),
  ]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++)
      d[i][j] = Math.min(
        d[i - 1][j] + 1,
        d[i][j - 1] + 1,
        d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1),
      );
  return d[a.length][b.length];
};

// كلمات إنجليزية شائعة لوضع ASL
export const EN_WORDS = [
  "hello",
  "hi",
  "thanks",
  "thank",
  "you",
  "please",
  "sorry",
  "yes",
  "no",
  "help",
  "me",
  "my",
  "name",
  "what",
  "where",
  "when",
  "how",
  "who",
  "why",
  "need",
  "want",
  "water",
  "food",
  "eat",
  "drink",
  "doctor",
  "hospital",
  "pharmacy",
  "medicine",
  "pain",
  "sick",
  "home",
  "school",
  "work",
  "friend",
  "family",
  "mother",
  "father",
  "good",
  "bad",
  "love",
  "happy",
  "sad",
  "today",
  "tomorrow",
  "now",
  "time",
  "phone",
  "call",
  "emergency",
  "bathroom",
  "money",
  "car",
  "go",
  "come",
  "stop",
  "wait",
  "again",
  "understand",
  "deaf",
];

// إذا الكلمة حروفها لاتينية نستخدم القائمة الإنجليزية
const wordsFor = (word: string) =>
  /^[a-z]/i.test(word) ? EN_WORDS : COMMON_WORDS;

export const suggestWords = (prefix: string, limit = 4) =>
  prefix
    ? wordsFor(prefix)
        .filter((w) => w.startsWith(prefix) && w !== prefix)
        .slice(0, limit)
    : [];

// يصحح الكلمة لأقرب كلمة معروفة إذا كان الفرق حرفًا واحدًا فقط
export const correctWord = (word: string) => {
  const words = wordsFor(word);
  if (words.includes(word) || Array.from(word).length < 3) return word;
  const match = words.find(
    (w) => editDistance(Array.from(w), Array.from(word)) === 1,
  );
  return match ?? word;
};
