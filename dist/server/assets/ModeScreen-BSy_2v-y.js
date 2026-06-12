import { jsxs, jsx } from "react/jsx-runtime";
import { ChevronRight, Type, ArrowLeft, Video } from "lucide-react";
import { Link } from "@tanstack/react-router";
const avatarFemale = "/assets/avatar-female-Ce3p794b.png";
const avatarMale = "/assets/avatar-male-Eh7PH795.png";
function ModeScreen() {
  return /* @__PURE__ */ jsxs("div", { className: "relative h-full w-full grad-soft", children: [
    /* @__PURE__ */ jsx(
      "div",
      {
        className: "absolute top-20 -right-20 h-64 w-64 rounded-full opacity-60 blur-3xl",
        style: { background: "radial-gradient(circle, oklch(0.82 0.14 295 / 0.7), transparent 70%)" }
      }
    ),
    /* @__PURE__ */ jsx(
      "div",
      {
        className: "absolute bottom-0 -left-20 h-64 w-64 rounded-full opacity-50 blur-3xl",
        style: { background: "radial-gradient(circle, oklch(0.8 0.1 245 / 0.7), transparent 70%)" }
      }
    ),
    /* @__PURE__ */ jsxs("div", { className: "relative z-10 flex h-full flex-col px-5 pb-8 pt-12", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsx(Link, { to: "/home", className: "grid h-10 w-10 place-items-center rounded-full glass shadow-soft", "aria-label": "رجوع", children: /* @__PURE__ */ jsx(ChevronRight, { className: "h-4 w-4 text-foreground/70" }) }),
        /* @__PURE__ */ jsx("div", { className: "text-sm font-bold", children: "اختر وضع الترجمة" }),
        /* @__PURE__ */ jsx("div", { className: "h-10 w-10" })
      ] }),
      /* @__PURE__ */ jsx("p", { className: "mt-3 text-center text-[11px] text-muted-foreground", children: "كل وضع مصمم لتجربة تواصل مميزة" }),
      /* @__PURE__ */ jsxs("div", { className: "mt-6 flex flex-1 flex-col gap-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "relative overflow-hidden rounded-[28px] glass shadow-card p-5", children: [
          /* @__PURE__ */ jsx(
            "div",
            {
              className: "absolute -top-10 -left-10 h-32 w-32 rounded-full opacity-70 blur-2xl",
              style: { background: "radial-gradient(circle, oklch(0.85 0.15 295 / 0.7), transparent 70%)" }
            }
          ),
          /* @__PURE__ */ jsxs("div", { className: "relative flex gap-4", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
              /* @__PURE__ */ jsxs("div", { className: "inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-[9px] font-bold text-primary", children: [
                /* @__PURE__ */ jsx(Type, { className: "h-3 w-3" }),
                " الوضع الأول"
              ] }),
              /* @__PURE__ */ jsx("h3", { className: "mt-2 text-lg font-black leading-tight", children: "نص إلى لغة إشارة" }),
              /* @__PURE__ */ jsx("p", { className: "mt-1 text-[11px] leading-relaxed text-muted-foreground", children: "اكتب أي نص ودع الأفاتار ثلاثي الأبعاد يترجمه بسلاسة" }),
              /* @__PURE__ */ jsxs(Link, { to: "/camera", className: "mt-3 inline-flex items-center gap-1.5 rounded-full grad-purple px-3.5 py-1.5 text-[11px] font-bold text-white shadow-soft", children: [
                "ابدأ الآن ",
                /* @__PURE__ */ jsx(ArrowLeft, { className: "h-3 w-3" })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "relative h-24 w-24 shrink-0", children: [
              /* @__PURE__ */ jsx(
                "div",
                {
                  className: "absolute inset-0 rounded-3xl opacity-80",
                  style: { background: "linear-gradient(160deg, oklch(0.9 0.08 295), oklch(0.85 0.1 270))" }
                }
              ),
              /* @__PURE__ */ jsx("img", { src: avatarFemale, alt: "", loading: "lazy", width: 200, height: 200, className: "absolute inset-0 h-full w-full object-cover object-top rounded-3xl" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs(
          "div",
          {
            className: "relative overflow-hidden rounded-[28px] shadow-card p-5 text-white",
            style: { background: "linear-gradient(160deg, oklch(0.32 0.15 290), oklch(0.22 0.13 280))" },
            children: [
              /* @__PURE__ */ jsx(
                "div",
                {
                  className: "absolute -bottom-10 -right-10 h-40 w-40 rounded-full opacity-60 blur-2xl",
                  style: { background: "radial-gradient(circle, oklch(0.7 0.25 300 / 0.8), transparent 70%)" }
                }
              ),
              /* @__PURE__ */ jsx("div", { className: "absolute top-3 left-3 rounded-full bg-white/10 px-2 py-0.5 text-[9px] text-white/80 backdrop-blur", children: "LIVE" }),
              /* @__PURE__ */ jsxs("div", { className: "relative flex gap-4", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
                  /* @__PURE__ */ jsxs("div", { className: "inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1 text-[9px] font-bold backdrop-blur", children: [
                    /* @__PURE__ */ jsx(Video, { className: "h-3 w-3" }),
                    " الوضع الثاني"
                  ] }),
                  /* @__PURE__ */ jsx("h3", { className: "mt-2 text-lg font-black leading-tight", children: "إشارة فورية إلى نص وصوت" }),
                  /* @__PURE__ */ jsx("p", { className: "mt-1 text-[11px] leading-relaxed text-white/70", children: "كاميرا مباشرة + ذكاء اصطناعي يترجم لحظيًا" }),
                  /* @__PURE__ */ jsxs(Link, { to: "/chat", className: "mt-3 inline-flex items-center gap-1.5 rounded-full bg-white px-3.5 py-1.5 text-[11px] font-bold text-primary shadow-soft", children: [
                    "جربه ",
                    /* @__PURE__ */ jsx(ArrowLeft, { className: "h-3 w-3" })
                  ] })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "relative h-24 w-24 shrink-0", children: [
                  /* @__PURE__ */ jsx(
                    "div",
                    {
                      className: "absolute inset-0 rounded-3xl",
                      style: { background: "linear-gradient(160deg, oklch(0.4 0.2 290), oklch(0.25 0.15 270))" }
                    }
                  ),
                  /* @__PURE__ */ jsx("img", { src: avatarMale, alt: "", loading: "lazy", width: 200, height: 200, className: "absolute inset-0 h-full w-full object-cover object-top rounded-3xl" })
                ] })
              ] })
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mt-4 flex items-center justify-center gap-1.5", children: [
        /* @__PURE__ */ jsx("span", { className: "h-1.5 w-6 rounded-full bg-primary" }),
        /* @__PURE__ */ jsx("span", { className: "h-1.5 w-1.5 rounded-full bg-foreground/20" }),
        /* @__PURE__ */ jsx("span", { className: "h-1.5 w-1.5 rounded-full bg-foreground/20" })
      ] })
    ] })
  ] });
}
export {
  ModeScreen as M
};
