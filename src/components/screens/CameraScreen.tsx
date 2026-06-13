import { Volume2, Pause, ChevronRight, Sparkles, Hand, X } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useState } from "react";

export function CameraScreen() {
  const [arabicText, setArabicText] = useState("مرحبًا، كيف يمكنني مساعدتك اليوم؟");
  const [englishText, setEnglishText] = useState("Hello, how can I help you today?");
  
  // 1. التعديل الجديد: إضافة State لحفظ نسبة الثقة (Confidence) وتعيين قيمة افتراضية لها
  const [confidence, setConfidence] = useState<number | null>(null);

  return (
    <div className="flex h-dvh w-full flex-col overflow-hidden text-white"
      style={{ background: "linear-gradient(170deg, #1a1230 0%, #0a0617 100%)" }}>
      {/* header */}
      <div className="relative z-20 flex w-full shrink-0 items-center justify-between px-5 pt-6 md:pt-8 pb-4">
        <Link to="/modes" aria-label="رجوع" className="grid h-10 w-10 place-items-center rounded-full glass-dark">
          <ChevronRight className="h-4 w-4" />
        </Link>
        <div className="flex items-center gap-1.5 rounded-full glass-dark px-3 py-1.5">
          <span className="relative grid h-2 w-2 place-items-center">
            <span className="absolute inset-0 animate-ping rounded-full bg-rose-400/70" />
            <span className="relative h-2 w-2 rounded-full bg-rose-500" />
          </span>
          <span className="text-[10px] font-semibold">جاري التحليل</span>
        </div>
        <div className="grid h-10 w-10 place-items-center rounded-full glass-dark text-[10px]">AR</div>
      </div>

      {/* main content — side by side on desktop */}
      <div className="relative z-10 flex flex-1 flex-col gap-5 overflow-hidden px-5 md:flex-row md:items-stretch md:gap-6 md:pb-5">

        {/* camera / avatar box */}
        <div className="relative flex flex-1 flex-col items-center justify-center rounded-3xl glass-dark p-5 md:p-8 overflow-hidden">
          {/* glow */}
          <div className="absolute inset-x-0 top-0 h-full"
            style={{ background: "radial-gradient(ellipse at center top, oklch(0.5 0.22 295 / 0.55), transparent 70%)" }} />
          <div className="absolute bottom-6 h-40 w-40 rounded-full opacity-70 blur-3xl"
            style={{ background: "radial-gradient(circle, oklch(0.7 0.28 300 / 0.6), transparent 70%)" }} />

          <div className="relative z-10 flex flex-col items-center gap-3 text-white/80">
            <div className="grid h-20 w-20 place-items-center rounded-full grad-purple shadow-glow">
              <Hand className="h-10 w-10" strokeWidth={1.5} />
            </div>
            <div className="text-[11px] tracking-[0.25em] text-white/60">3D AVATAR</div>
            <div className="text-[10px] text-white/40">سيتم عرض الأفاتار الحي هنا</div>
          </div>

          {/* scan line */}
          <div className="absolute inset-x-12 top-4 h-px animate-scan rounded-full"
            style={{ background: "linear-gradient(90deg, transparent, oklch(0.85 0.18 295), transparent)" }} />

          {/* confidence chip */}
          <div className="absolute right-3 top-3 rounded-2xl glass-dark px-3 py-2 text-right">
            <div className="text-[9px] text-white/60">دقة التعرف</div>
            {/* 2. التعديل الجديد: عرض النسبة الحقيقية المقربة إذا وجدت، أو عرض شرطة في حال لم يبدأ التنبؤ بعد */}
            <div className="text-base font-black text-gradient">
              {confidence !== null ? `${Math.round(confidence)}%` : "-"}
            </div>
          </div>
        </div>

        {/* translation box */}
        <div className="relative flex flex-1 flex-col justify-center rounded-3xl glass-dark p-5 md:p-8 shadow-card overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-[10px] text-white/60">
              <Sparkles className="h-3 w-3 text-primary" />
              <span>الترجمة الفورية</span>
            </div>
            <span className="text-[9px] text-white/40">الآن</span>
          </div>

          <div className="relative mt-4 rounded-2xl bg-white/[0.04] p-3 ring-1 ring-white/10 focus-within:ring-primary/50">
            <textarea
              dir="rtl"
              value={arabicText}
              onChange={(e) => setArabicText(e.target.value)}
              rows={2}
              className="w-full resize-none bg-transparent text-right text-2xl font-bold leading-relaxed text-white outline-none md:text-3xl"
            />
            <button
              type="button"
              onClick={() => { setArabicText(""); setEnglishText(""); setConfidence(null); }}
              aria-label="مسح"
              className="absolute left-2 top-2 grid h-7 w-7 place-items-center rounded-full bg-white/10 text-white/70 hover:bg-white/20"
            >
              <X className="h-3.5 w-3.5" />
            </button>
            <textarea
              dir="ltr"
              value={englishText}
              onChange={(e) => setEnglishText(e.target.value)}
              rows={1}
              className="mt-2 w-full resize-none bg-transparent text-right text-sm text-white/55 outline-none md:text-base"
            />
          </div>

          <div className="mt-6 flex items-center justify-between">
            <div className="flex items-center gap-1">
              {[3, 5, 7, 4, 6, 8, 5, 3, 6, 4, 7, 5].map((h, i) => (
                <span key={i} className="w-0.5 rounded-full"
                  style={{ height: h * 2, background: "linear-gradient(180deg, oklch(0.8 0.2 300), oklch(0.7 0.18 250))" }} />
              ))}
            </div>
            <button className="flex items-center gap-2 rounded-full grad-purple px-5 py-2.5 text-xs font-bold shadow-glow md:text-sm">
              <Volume2 className="h-4 w-4" /> تشغيل الصوت
            </button>
          </div>
        </div>
      </div>

      {/* bottom controls — full width */}
      <div className="relative z-20 flex w-full shrink-0 items-center justify-center gap-5 px-5 pb-6 pt-4">
        <button className="grid h-12 w-12 place-items-center rounded-full glass-dark">
          <Volume2 className="h-5 w-5" />
        </button>
        <button className="grid h-16 w-16 place-items-center rounded-full bg-white text-deep shadow-glow">
          <Pause className="h-6 w-6 fill-current" />
        </button>
        <button className="grid h-12 w-12 place-items-center rounded-full glass-dark text-[10px] font-bold">حفظ</button>
      </div>
    </div>
  );
}