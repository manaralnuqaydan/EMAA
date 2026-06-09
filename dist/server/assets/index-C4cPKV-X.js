import { jsx } from "react/jsx-runtime";
import { useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { S as ScreenStage } from "./ScreenStage-D8rYxUhZ.js";
import { S as SplashScreen } from "./SplashScreen-COVB3NDR.js";
function Index() {
  const navigate = useNavigate();
  useEffect(() => {
    const t = setTimeout(() => navigate({
      to: "/home"
    }), 2600);
    return () => clearTimeout(t);
  }, [navigate]);
  return /* @__PURE__ */ jsx(ScreenStage, { label: "01 · Splash", caption: "شاشة البداية", children: /* @__PURE__ */ jsx(SplashScreen, {}) });
}
export {
  Index as component
};
