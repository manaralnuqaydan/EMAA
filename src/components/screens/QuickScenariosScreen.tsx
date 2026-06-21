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

  // ✅ الحين نرسل السؤال مع الـ navigation
  const handleSelectQuestion = (question: string) => {
    navigate({
      to: "/chat",
      search: { question, category: selectedCategory ?? "" },
    });
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
