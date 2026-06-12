import { ChevronLeft, ChevronRight, MessageCircle } from "lucide-react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";

export function QuickScenariosScreen() {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories = [
    { id: "bank", name: "البنك", color: "#4c1d95" },
    { id: "telecom", name: "الاتصالات", color: "#5b21b6" },
    { id: "hospital", name: "المستشفى", color: "#6d28d9" },
    { id: "shop", name: "متجر إلكتروني", color: "#7c3aed" },
  ];

  const questions: Record<string, string[]> = {
    bank: [
      "أبي فتح حساب",
      "أستفسر عن رصيدي",
      "أبي شيك",
      "أستفسر عن الفائدة",
      "أبي تحويل أموال",
    ],
    telecom: [
      "أبي شحن رصيد",
      "أستفسر عن الفاتورة",
      "أبي عرض خاص",
      "أبي تغيير الرقم",
      "أبي إلغاء الخدمة",
    ],
    hospital: [
      "أبي موعد كشف",
      "أستفسر عن النتائج",
      "أحتاج وصفة دواء",
      "أستفسر عن الفاتورة",
      "أبي تحويلة تخصصي",
    ],
    shop: [
      "أستفسر عن المنتج",
      "أبي أرجع المنتج",
      "أين طلبيتي؟",
      "أحتاج كود خصم",
      "أستفسر عن الشحن",
    ],
  };
  const scenarioAgents: Record<
  string,
  {
    agentName: string;
    systemPrompt: string;
  }
> = {
  bank: {
    agentName: "مساعد البنك - إيماء",
    systemPrompt: `
أنت مساعد ذكي من منصة إيماء مخصص للصم والبكم داخل سيناريو البنك.

مهمتك:
- مساعدة المستخدم في الخدمات البنكية بلغة عربية بسيطة.
- اجعل الجمل قصيرة وواضحة.
- اشرح الخطوات واحدة واحدة.
- لا تطلب الرقم السري.
- لا تطلب رمز التحقق OTP.
- لا تنفذ عمليات مالية حقيقية.
- إذا ضاعت البطاقة، وجّه المستخدم لإيقافها فورًا من التطبيق أو التواصل مع البنك.

الخدمات:
- فتح حساب.
- الاستعلام عن الرصيد.
- طلب شيك.
- الاستفسار عن الفائدة.
- تحويل الأموال.

طريقة الرد:
أعطِ الرد بصيغة مناسبة للصم والبكم.
استخدم كلمات واضحة قابلة للتحويل إلى لغة إشارة.
`
  },

  telecom: {
    agentName: "مساعد الاتصالات - إيماء",
    systemPrompt: `
أنت مساعد ذكي من منصة إيماء مخصص للصم والبكم داخل سيناريو الاتصالات.

مهمتك:
- مساعدة المستخدم في الرصيد، الفواتير، العروض، الرقم، والخدمات.
- استخدم لغة سهلة ومباشرة.
- اسأل سؤالًا واحدًا فقط إذا احتجت معلومة.
- لا تطلب رمز التحقق.
- لا تعد المستخدم بتفعيل خدمة إلا إذا كانت المعلومة مؤكدة.

الخدمات:
- شحن رصيد.
- الاستعلام عن الفاتورة.
- العروض الخاصة.
- تغيير الرقم.
- إلغاء الخدمة.

طريقة الرد:
ردود قصيرة، مرتبة، ومناسبة للتحويل إلى لغة إشارة.
`
  },

  hospital: {
    agentName: "مساعد المستشفى - إيماء",
    systemPrompt: `
أنت مساعد إداري ذكي من منصة إيماء مخصص للصم والبكم داخل سيناريو المستشفى.

مهمتك:
- مساعدة المستخدم في المواعيد، النتائج، الوصفات، الفواتير، والتحويلات.
- لا تشخص الأمراض.
- لا تصرف أدوية.
- لا تعطي قرارًا طبيًا نهائيًا.
- إذا كانت الحالة طارئة مثل صعوبة تنفس، ألم صدر، نزيف شديد، أو فقدان وعي، وجّه المستخدم للطوارئ فورًا.

الخدمات:
- موعد كشف.
- نتائج التحاليل.
- وصفة دواء.
- فاتورة.
- تحويلة تخصصي.

طريقة الرد:
استخدم جمل قصيرة وواضحة تناسب الصم والبكم.
`
  },

  shop: {
    agentName: "مساعد المتجر الإلكتروني - إيماء",
    systemPrompt: `
أنت مساعد ذكي من منصة إيماء مخصص للصم والبكم داخل سيناريو متجر إلكتروني.

مهمتك:
- مساعدة المستخدم في المنتجات، الاسترجاع، الطلبات، الخصومات، والشحن.
- لا تخترع رقم تتبع.
- لا تؤكد توفر منتج إذا لم تكن البيانات موجودة.
- اشرح الخطوات بطريقة سهلة.

الخدمات:
- الاستفسار عن المنتج.
- إرجاع المنتج.
- تتبع الطلب.
- كود خصم.
- الشحن.

طريقة الرد:
رد مختصر، واضح، وخطوة بخطوة.
`
  }
};
const handleSelectQuestion = (question: string) => {
  if (!selectedCategory) return;

  const category = categories.find((c) => c.id === selectedCategory);
  const agent = scenarioAgents[selectedCategory];

  if (!agent) return;

  const selectedScenario = {
    categoryId: selectedCategory,
    categoryName: category?.name ?? "",
    question,
    agentName: agent.agentName,
    systemPrompt: agent.systemPrompt,
    responseFormat: {
      text: "الرد العربي المبسط",
      sign_steps: ["كلمات", "قصيرة", "مناسبة", "للإشارة"],
      intent: "نوع الطلب"
    }
  };

  localStorage.setItem("selectedScenario", JSON.stringify(selectedScenario));

  navigate({ to: "/chat" });
};

  return (
    <div
      className="flex h-dvh w-full flex-col overflow-hidden text-white"
      style={{ background: "linear-gradient(170deg, #1a1230 0%, #0a0617 100%)" }}
    >
      {/* Header */}
      <div className="relative z-20 flex w-full shrink-0 items-center justify-between px-5 pt-6 pb-4">
        <Link
          to="/home"
          className="grid h-10 w-10 place-items-center rounded-full glass-dark"
        >
          <ChevronRight className="h-4 w-4" />
        </Link>
        <div className="text-center">
          <div className="text-[10px] tracking-[0.25em] text-white/50">QUICK</div>
          <div className="text-sm font-semibold">أسئلة شائعة</div>
        </div>
        <div className="grid h-10 w-10 place-items-center rounded-full glass-dark text-[10px]">
          AI
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-1 flex-col px-5 pb-5 gap-3 items-center justify-center">
        {!selectedCategory ? (
          <div className="flex flex-col gap-3 w-full items-center">
            <div className="text-center mb-2 mt-[-40px]">
              <h2 className="text-lg font-bold">اختر الجهة</h2>
              <p className="text-xs text-white/50">لعرض الأسئلة الشائعة</p>
            </div>
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className="relative overflow-hidden rounded-2xl p-4 transition-all hover:scale-105 w-3/4"
                style={{
                  background: `linear-gradient(135deg, ${category.color}, ${category.color}99)`,
                }}
              >
                <div className="flex items-center justify-between">
                  <ChevronLeft className="h-5 w-5" />
                  <span className="text-lg font-bold text-center flex-1">{category.name}</span>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-3 w-full items-center">
            <div className="flex items-center justify-between w-3/4 mb-4">
              <button
                onClick={() => setSelectedCategory(null)}
                className="grid h-8 w-8 place-items-center rounded-full bg-white/10 hover:bg-white/20"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
              <h2 className="text-lg font-bold text-center flex-1">
                {categories.find((c) => c.id === selectedCategory)?.name}
              </h2>
              <p className="text-xs text-white/50">اختر السؤال</p>
            </div>
            {questions[selectedCategory]?.map((question, index) => (
              <button
                key={index}
                onClick={() => handleSelectQuestion(question)}
                className="relative overflow-hidden rounded-2xl p-4 transition-all hover:scale-105 w-3/4"
                style={{
                  background: "linear-gradient(135deg, #4c1d95, #4c1d9599)",
                }}
              >
                <div className="flex items-center gap-3">
                  <MessageCircle className="h-5 w-5 shrink-0 text-white/70" />
                  <span className="font-semibold text-base text-right flex-1">{question}</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
