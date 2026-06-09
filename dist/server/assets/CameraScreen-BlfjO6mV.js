import { jsxs, jsx } from "react/jsx-runtime";
import { ChevronRight, Hand, Sparkles, X, Volume2, Pause } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useState } from "react";
function CameraScreen() {
  const [arabicText, setArabicText] = useState("مرحبًا، كيف يمكنني مساعدتك اليوم؟");
  const [englishText, setEnglishText] = useState("Hello, how can I help you today?");
  return /* @__PURE__ */ jsxs(
    "div",
    {
      className: "flex h-dvh w-full flex-col overflow-hidden text-white",
      style: { background: "linear-gradient(170deg, #1a1230 0%, #0a0617 100%)" },
      children: [
        /* @__PURE__ */ jsxs("div", { className: "relative z-20 flex w-full shrink-0 items-center justify-between px-5 pt-6 md:pt-8 pb-4", children: [
          /* @__PURE__ */ jsx(Link, { to: "/modes", "aria-label": "رجوع", className: "grid h-10 w-10 place-items-center rounded-full glass-dark", children: /* @__PURE__ */ jsx(ChevronRight, { className: "h-4 w-4" }) }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 rounded-full glass-dark px-3 py-1.5", children: [
            /* @__PURE__ */ jsxs("span", { className: "relative grid h-2 w-2 place-items-center", children: [
              /* @__PURE__ */ jsx("span", { className: "absolute inset-0 animate-ping rounded-full bg-rose-400/70" }),
              /* @__PURE__ */ jsx("span", { className: "relative h-2 w-2 rounded-full bg-rose-500" })
            ] }),
            /* @__PURE__ */ jsx("span", { className: "text-[10px] font-semibold", children: "جاري التحليل" })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "grid h-10 w-10 place-items-center rounded-full glass-dark text-[10px]", children: "AR" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "relative z-10 flex flex-1 flex-col gap-5 overflow-hidden px-5 md:flex-row md:items-stretch md:gap-6 md:pb-5", children: [
          /* @__PURE__ */ jsxs("div", { className: "relative flex flex-1 flex-col items-center justify-center rounded-3xl glass-dark p-5 md:p-8 overflow-hidden", children: [
            /* @__PURE__ */ jsx(
              "div",
              {
                className: "absolute inset-x-0 top-0 h-full",
                style: { background: "radial-gradient(ellipse at center top, oklch(0.5 0.22 295 / 0.55), transparent 70%)" }
              }
            ),
            /* @__PURE__ */ jsx(
              "div",
              {
                className: "absolute bottom-6 h-40 w-40 rounded-full opacity-70 blur-3xl",
                style: { background: "radial-gradient(circle, oklch(0.7 0.28 300 / 0.6), transparent 70%)" }
              }
            ),
            /* @__PURE__ */ jsxs("div", { className: "relative z-10 flex flex-col items-center gap-3 text-white/80", children: [
              /* @__PURE__ */ jsx("div", { className: "grid h-20 w-20 place-items-center rounded-full grad-purple shadow-glow", children: /* @__PURE__ */ jsx(Hand, { className: "h-10 w-10", strokeWidth: 1.5 }) }),
              /* @__PURE__ */ jsx("div", { className: "text-[11px] tracking-[0.25em] text-white/60", children: "3D AVATAR" }),
              /* @__PURE__ */ jsx("div", { className: "text-[10px] text-white/40", children: "سيتم عرض الأفاتار الحي هنا" })
            ] }),
            /* @__PURE__ */ jsx(
              "div",
              {
                className: "absolute inset-x-12 top-4 h-px animate-scan rounded-full",
                style: { background: "linear-gradient(90deg, transparent, oklch(0.85 0.18 295), transparent)" }
              }
            ),
            /* @__PURE__ */ jsxs("div", { className: "absolute right-3 top-3 rounded-2xl glass-dark px-3 py-2 text-right", children: [
              /* @__PURE__ */ jsx("div", { className: "text-[9px] text-white/60", children: "دقة التعرف" }),
              /* @__PURE__ */ jsx("div", { className: "text-base font-black text-gradient", children: "97%" })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "relative flex flex-1 flex-col justify-center rounded-3xl glass-dark p-5 md:p-8 shadow-card overflow-hidden", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 text-[10px] text-white/60", children: [
                /* @__PURE__ */ jsx(Sparkles, { className: "h-3 w-3 text-primary" }),
                /* @__PURE__ */ jsx("span", { children: "الترجمة الفورية" })
              ] }),
              /* @__PURE__ */ jsx("span", { className: "text-[9px] text-white/40", children: "الآن" })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "relative mt-4 rounded-2xl bg-white/[0.04] p-3 ring-1 ring-white/10 focus-within:ring-primary/50", children: [
              /* @__PURE__ */ jsx(
                "textarea",
                {
                  dir: "rtl",
                  value: arabicText,
                  onChange: (e) => setArabicText(e.target.value),
                  rows: 2,
                  className: "w-full resize-none bg-transparent text-right text-2xl font-bold leading-relaxed text-white outline-none md:text-3xl"
                }
              ),
              /* @__PURE__ */ jsx(
                "button",
                {
                  type: "button",
                  onClick: () => {
                    setArabicText("");
                    setEnglishText("");
                  },
                  "aria-label": "مسح",
                  className: "absolute left-2 top-2 grid h-7 w-7 place-items-center rounded-full bg-white/10 text-white/70 hover:bg-white/20",
                  children: /* @__PURE__ */ jsx(X, { className: "h-3.5 w-3.5" })
                }
              ),
              /* @__PURE__ */ jsx(
                "textarea",
                {
                  dir: "ltr",
                  value: englishText,
                  onChange: (e) => setEnglishText(e.target.value),
                  rows: 1,
                  className: "mt-2 w-full resize-none bg-transparent text-right text-sm text-white/55 outline-none md:text-base"
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "mt-6 flex items-center justify-between", children: [
              /* @__PURE__ */ jsx("div", { className: "flex items-center gap-1", children: [3, 5, 7, 4, 6, 8, 5, 3, 6, 4, 7, 5].map((h, i) => /* @__PURE__ */ jsx(
                "span",
                {
                  className: "w-0.5 rounded-full",
                  style: { height: h * 2, background: "linear-gradient(180deg, oklch(0.8 0.2 300), oklch(0.7 0.18 250))" }
                },
                i
              )) }),
              /* @__PURE__ */ jsxs("button", { className: "flex items-center gap-2 rounded-full grad-purple px-5 py-2.5 text-xs font-bold shadow-glow md:text-sm", children: [
                /* @__PURE__ */ jsx(Volume2, { className: "h-4 w-4" }),
                " تشغيل الصوت"
              ] })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "relative z-20 flex w-full shrink-0 items-center justify-center gap-5 px-5 pb-6 pt-4", children: [
          /* @__PURE__ */ jsx("button", { className: "grid h-12 w-12 place-items-center rounded-full glass-dark", children: /* @__PURE__ */ jsx(Volume2, { className: "h-5 w-5" }) }),
          /* @__PURE__ */ jsx("button", { className: "grid h-16 w-16 place-items-center rounded-full bg-white text-deep shadow-glow", children: /* @__PURE__ */ jsx(Pause, { className: "h-6 w-6 fill-current" }) }),
          /* @__PURE__ */ jsx("button", { className: "grid h-12 w-12 place-items-center rounded-full glass-dark text-[10px] font-bold", children: "حفظ" })
        ] })
      ]
    }
  );
}
export {
  CameraScreen as C
};
