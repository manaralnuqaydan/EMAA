import { jsxs, jsx } from "react/jsx-runtime";
import { Link } from "@tanstack/react-router";
import { S as SplashScreen } from "./SplashScreen-COVB3NDR.js";
function SplashRoute() {
  return /* @__PURE__ */ jsxs("div", { className: "relative min-h-dvh w-full", dir: "rtl", children: [
    /* @__PURE__ */ jsx(SplashScreen, {}),
    /* @__PURE__ */ jsx(Link, { to: "/", className: "fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full glass-dark px-5 py-2 text-xs text-white/80 backdrop-blur", children: "العودة للعرض" })
  ] });
}
export {
  SplashRoute as component
};
