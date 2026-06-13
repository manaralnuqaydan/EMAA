import { jsxs, jsx } from "react/jsx-runtime";
import { S as SplashScreen } from "./SplashScreen-COVB3NDR.js";
import { H as HomeScreen } from "./HomeScreen-C69g8Z8A.js";
import { M as ModeScreen } from "./ModeScreen-BSy_2v-y.js";
import { C as CameraScreen } from "./CameraScreen-BlfjO6mV.js";
import { C as ChatScreen } from "./ChatScreen-CsbBwS1n.js";
import "lucide-react";
import "@tanstack/react-router";
import "react";
function PhoneFrame({ children, label, caption }) {
  return /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center gap-4", children: [
    /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
      /* @__PURE__ */ jsx("div", { className: "text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground", children: label }),
      caption && /* @__PURE__ */ jsx("div", { className: "mt-1 text-sm text-foreground/70", children: caption })
    ] }),
    /* @__PURE__ */ jsx(
      "div",
      {
        className: "relative shrink-0",
        style: { width: 320, height: 660 },
        children: /* @__PURE__ */ jsx(
          "div",
          {
            className: "absolute inset-0 rounded-[52px] p-[10px]",
            style: {
              background: "linear-gradient(160deg, #2a2238, #0e0a1a)",
              boxShadow: "0 40px 80px -30px oklch(0.3 0.15 290 / 0.55), inset 0 0 0 1px oklch(1 0 0 / 0.08)"
            },
            children: /* @__PURE__ */ jsxs("div", { className: "relative h-full w-full overflow-hidden rounded-[44px] bg-background", children: [
              /* @__PURE__ */ jsx("div", { className: "pointer-events-none absolute left-1/2 top-2 z-50 h-6 w-28 -translate-x-1/2 rounded-full bg-black" }),
              /* @__PURE__ */ jsxs("div", { className: "pointer-events-none absolute inset-x-0 top-0 z-40 flex h-9 items-center justify-between px-6 text-[10px] font-semibold text-foreground/80", children: [
                /* @__PURE__ */ jsx("span", { children: "9:41" }),
                /* @__PURE__ */ jsx("span", { className: "opacity-0", children: "." })
              ] }),
              /* @__PURE__ */ jsx("div", { className: "relative h-full w-full overflow-hidden", dir: "rtl", children })
            ] })
          }
        )
      }
    )
  ] });
}
const screens = [{
  id: "splash",
  label: "01 · Splash",
  caption: "افتتاحية تطبيق إيماء",
  Component: SplashScreen
}, {
  id: "home",
  label: "02 · Home",
  caption: "الشاشة الرئيسية",
  Component: HomeScreen
}, {
  id: "mode",
  label: "03 · Modes",
  caption: "اختيار وضع الترجمة",
  Component: ModeScreen
}, {
  id: "camera",
  label: "04 · Live Translate",
  caption: "الترجمة الفورية بالكاميرا",
  Component: CameraScreen
}, {
  id: "chat",
  label: "05 · AI Chat",
  caption: "محادثة ذكية مع AI",
  Component: ChatScreen
}];
function Overview() {
  return /* @__PURE__ */ jsxs("div", { className: "relative min-h-dvh w-full overflow-x-hidden", children: [
    /* @__PURE__ */ jsxs("div", { className: "pointer-events-none fixed inset-0 -z-10", children: [
      /* @__PURE__ */ jsx("div", { className: "absolute inset-0 grad-soft" }),
      /* @__PURE__ */ jsx("div", { className: "absolute -top-32 left-1/4 h-[500px] w-[500px] rounded-full opacity-50 blur-3xl", style: {
        background: "radial-gradient(circle, oklch(0.82 0.14 295 / 0.6), transparent 70%)"
      } }),
      /* @__PURE__ */ jsx("div", { className: "absolute top-1/3 -right-32 h-[500px] w-[500px] rounded-full opacity-40 blur-3xl", style: {
        background: "radial-gradient(circle, oklch(0.82 0.1 245 / 0.6), transparent 70%)"
      } })
    ] }),
    /* @__PURE__ */ jsxs("header", { className: "px-6 pt-24 text-center", children: [
      /* @__PURE__ */ jsxs("div", { className: "mx-auto inline-flex items-center gap-2 rounded-full glass px-3 py-1.5 shadow-soft", children: [
        /* @__PURE__ */ jsx("span", { className: "h-2 w-2 rounded-full bg-primary" }),
        /* @__PURE__ */ jsx("span", { className: "text-[11px] font-semibold tracking-wide text-foreground/70", children: "EEMAA · Design Concept 2026" })
      ] }),
      /* @__PURE__ */ jsx("h1", { className: "mt-5 text-4xl font-black leading-tight md:text-6xl", children: /* @__PURE__ */ jsx("span", { className: "text-gradient", children: "إيماء" }) }),
      /* @__PURE__ */ jsx("p", { className: "mt-3 text-base font-medium text-foreground/80", children: "تواصل بلا حدود · نحو عالم أكثر شمولاً" })
    ] }),
    /* @__PURE__ */ jsxs("section", { className: "mx-auto mt-12 max-w-7xl px-4 pb-24", children: [
      /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 place-items-center", children: screens.map((s) => /* @__PURE__ */ jsx(PhoneFrame, { label: s.label, caption: s.caption, children: /* @__PURE__ */ jsx(s.Component, {}) }, s.id)) }),
      /* @__PURE__ */ jsx("footer", { className: "mt-20 text-center text-[11px] text-muted-foreground", children: "© 2026 إيماء" })
    ] })
  ] });
}
export {
  Overview as component
};
