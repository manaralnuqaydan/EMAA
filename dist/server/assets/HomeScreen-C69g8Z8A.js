import { jsxs, jsx } from "react/jsx-runtime";
import { Sparkles, Camera, Home, MessageCircle } from "lucide-react";
import { Link } from "@tanstack/react-router";
function HomeScreen() {
  return /* @__PURE__ */ jsxs("div", { className: "relative h-full w-full grad-soft", children: [
    /* @__PURE__ */ jsx(
      "div",
      {
        className: "absolute -top-16 -left-12 h-56 w-56 rounded-full opacity-60 blur-3xl",
        style: { background: "radial-gradient(circle, oklch(0.85 0.12 295 / 0.7), transparent 70%)" }
      }
    ),
    /* @__PURE__ */ jsx(
      "div",
      {
        className: "absolute top-40 -right-16 h-56 w-56 rounded-full opacity-50 blur-3xl",
        style: { background: "radial-gradient(circle, oklch(0.82 0.1 245 / 0.7), transparent 70%)" }
      }
    ),
    /* @__PURE__ */ jsx(
      "div",
      {
        className: "absolute bottom-32 left-8 h-32 w-32 rounded-full opacity-40 blur-2xl",
        style: { background: "radial-gradient(circle, oklch(0.8 0.14 310 / 0.7), transparent 70%)" }
      }
    ),
    /* @__PURE__ */ jsxs("div", { className: "relative z-10 flex h-full flex-col px-6 pb-24 pt-12", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center", children: [
        /* @__PURE__ */ jsx("div", { className: "text-3xl font-light tracking-[0.02em] text-gradient leading-none", style: { fontWeight: 300 }, children: "إيماء" }),
        /* @__PURE__ */ jsx("div", { className: "mt-2 text-[10px] tracking-[0.35em] text-muted-foreground/80 uppercase", children: "Eemaa" })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "mt-6 flex justify-center", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 rounded-full glass px-3.5 py-1.5 shadow-soft", children: [
        /* @__PURE__ */ jsxs("span", { className: "relative grid h-2 w-2 place-items-center", children: [
          /* @__PURE__ */ jsx("span", { className: "absolute inset-0 animate-ping rounded-full bg-emerald-400/60" }),
          /* @__PURE__ */ jsx("span", { className: "relative h-2 w-2 rounded-full bg-emerald-500" })
        ] }),
        /* @__PURE__ */ jsx("span", { className: "text-[11px] font-medium text-foreground/80", children: "الذكاء الاصطناعي جاهز" }),
        /* @__PURE__ */ jsx(Sparkles, { className: "h-3 w-3 text-primary" })
      ] }) }),
      /* @__PURE__ */ jsxs("div", { className: "flex flex-1 flex-col items-center justify-center gap-8", children: [
        /* @__PURE__ */ jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsx(
            "div",
            {
              className: "absolute -inset-8 rounded-full blur-3xl opacity-70",
              style: { background: "radial-gradient(circle, oklch(0.7 0.25 300 / 0.75), transparent 65%)" }
            }
          ),
          /* @__PURE__ */ jsx("div", { className: "absolute -inset-3 animate-pulse-glow rounded-full" }),
          /* @__PURE__ */ jsxs(
            Link,
            {
              to: "/modes",
              "aria-label": "فتح وضع الترجمة",
              className: "relative grid h-44 w-44 place-items-center rounded-full text-white shadow-glow grad-purple",
              children: [
                /* @__PURE__ */ jsx("div", { className: "absolute inset-2 rounded-full border border-white/30" }),
                /* @__PURE__ */ jsx("div", { className: "absolute inset-5 rounded-full border border-white/15" }),
                /* @__PURE__ */ jsx(Camera, { className: "h-14 w-14 drop-shadow-lg", strokeWidth: 1.3 })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
          /* @__PURE__ */ jsxs("h2", { className: "text-[26px] font-light tracking-tight text-foreground", style: { fontWeight: 300, letterSpacing: "-0.01em" }, children: [
            /* @__PURE__ */ jsx("span", { className: "font-semibold text-gradient", children: "نفهمك" }),
            /* @__PURE__ */ jsx("span", { className: "mx-2 text-foreground/40", children: "…" }),
            /* @__PURE__ */ jsx("span", { className: "text-foreground/85", children: "بدون صوت" })
          ] }),
          /* @__PURE__ */ jsx("p", { className: "mt-3 text-[11px] tracking-[0.18em] text-muted-foreground", children: "اضغط للتفعيل · ترجمة فورية" })
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "absolute inset-x-5 bottom-5", children: /* @__PURE__ */ jsxs("div", { className: "glass shadow-card flex items-center justify-center gap-3 rounded-3xl px-2 py-3", children: [
        /* @__PURE__ */ jsxs(
          Link,
          {
            to: "/",
            className: "relative flex flex-col items-center gap-1 px-6 py-1",
            "aria-label": "الرئيسية",
            children: [
              /* @__PURE__ */ jsx("div", { className: "absolute -top-1 h-1 w-6 rounded-full grad-purple" }),
              /* @__PURE__ */ jsx(Home, { className: "h-5 w-5 text-primary", strokeWidth: 2.2 }),
              /* @__PURE__ */ jsx("span", { className: "text-[9px] font-semibold text-primary", children: "الرئيسية" })
            ]
          }
        ),
        /* @__PURE__ */ jsx("div", { className: "w-px h-6 bg-white/10" }),
        /* @__PURE__ */ jsxs(
          Link,
          {
            to: "/quick-scenarios",
            className: "relative flex flex-col items-center gap-1 px-6 py-1",
            "aria-label": "أسئلة شائعة",
            children: [
              /* @__PURE__ */ jsx(MessageCircle, { className: "h-5 w-5 text-white/60 hover:text-primary transition-colors", strokeWidth: 2.2 }),
              /* @__PURE__ */ jsx("span", { className: "text-[9px] font-semibold text-white/60", children: "أسئلة" })
            ]
          }
        )
      ] }) })
    ] })
  ] });
}
export {
  HomeScreen as H
};
