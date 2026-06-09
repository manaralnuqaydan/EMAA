import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { createRootRouteWithContext, useRouter, Link, Outlet, HeadContent, Scripts, createFileRoute, lazyRouteComponent, createRouter } from "@tanstack/react-router";
import { jsx, jsxs } from "react/jsx-runtime";
const appCss = "/assets/styles-eZS2AHCN.css";
function NotFoundComponent() {
  return /* @__PURE__ */ jsx("div", { className: "flex min-h-dvh items-center justify-center bg-background px-4", children: /* @__PURE__ */ jsxs("div", { className: "max-w-md text-center", children: [
    /* @__PURE__ */ jsx("h1", { className: "text-7xl font-bold text-foreground", children: "404" }),
    /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: "الصفحة غير موجودة" }),
    /* @__PURE__ */ jsx(Link, { to: "/", className: "mt-6 inline-flex rounded-full grad-purple px-5 py-2 text-sm text-primary-foreground", children: "العودة للرئيسية" })
  ] }) });
}
function ErrorComponent({ error, reset }) {
  console.error(error);
  const router = useRouter();
  return /* @__PURE__ */ jsx("div", { className: "flex min-h-dvh items-center justify-center bg-background px-4 text-center", children: /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsx("h1", { className: "text-xl font-semibold", children: "حدث خطأ" }),
    /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: error.message }),
    /* @__PURE__ */ jsx("button", { onClick: () => {
      router.invalidate();
      reset();
    }, className: "mt-6 rounded-full grad-purple px-5 py-2 text-sm text-primary-foreground", children: "إعادة المحاولة" })
  ] }) });
}
const Route$8 = createRootRouteWithContext()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "إيماء — تواصل بلا حدود" },
      { name: "description", content: "تطبيق إيماء للترجمة الفورية للغة الإشارة العربية بالذكاء الاصطناعي" },
      { property: "og:title", content: "إيماء — تواصل بلا حدود" },
      { name: "twitter:title", content: "إيماء — تواصل بلا حدود" },
      { property: "og:description", content: "تطبيق إيماء للترجمة الفورية للغة الإشارة العربية بالذكاء الاصطناعي" },
      { name: "twitter:description", content: "تطبيق إيماء للترجمة الفورية للغة الإشارة العربية بالذكاء الاصطناعي" },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/245f5583-ee9b-4481-8f22-9471e6f1c806/id-preview-fac256df--435bac59-1d84-4aee-86fd-1c34de8ed6e3.lovable.app-1779564273436.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/245f5583-ee9b-4481-8f22-9471e6f1c806/id-preview-fac256df--435bac59-1d84-4aee-86fd-1c34de8ed6e3.lovable.app-1779564273436.png" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:type", content: "website" }
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700;800;900&display=swap" }
    ]
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent
});
function RootShell({ children }) {
  return /* @__PURE__ */ jsxs("html", { lang: "ar", dir: "rtl", children: [
    /* @__PURE__ */ jsx("head", { children: /* @__PURE__ */ jsx(HeadContent, {}) }),
    /* @__PURE__ */ jsxs("body", { children: [
      children,
      /* @__PURE__ */ jsx(Scripts, {})
    ] })
  ] });
}
function RootComponent() {
  const { queryClient } = Route$8.useRouteContext();
  return /* @__PURE__ */ jsx(QueryClientProvider, { client: queryClient, children: /* @__PURE__ */ jsx("main", { children: /* @__PURE__ */ jsx(Outlet, {}) }) });
}
const $$splitComponentImporter$7 = () => import("./splash-BxskQa4B.js");
const Route$7 = createFileRoute("/splash")({
  component: lazyRouteComponent($$splitComponentImporter$7, "component")
});
const $$splitComponentImporter$6 = () => import("./quick-scenarios-CRShsuOA.js");
const Route$6 = createFileRoute("/quick-scenarios")({
  component: lazyRouteComponent($$splitComponentImporter$6, "component")
});
const $$splitComponentImporter$5 = () => import("./overview-Bc1QxhzK.js");
const Route$5 = createFileRoute("/overview")({
  component: lazyRouteComponent($$splitComponentImporter$5, "component")
});
const $$splitComponentImporter$4 = () => import("./modes-BUInoW_L.js");
const Route$4 = createFileRoute("/modes")({
  component: lazyRouteComponent($$splitComponentImporter$4, "component")
});
const $$splitComponentImporter$3 = () => import("./home-D0nUfnZV.js");
const Route$3 = createFileRoute("/home")({
  component: lazyRouteComponent($$splitComponentImporter$3, "component")
});
const $$splitComponentImporter$2 = () => import("./chat-uDLtHQA1.js");
const Route$2 = createFileRoute("/chat")({
  component: lazyRouteComponent($$splitComponentImporter$2, "component")
});
const $$splitComponentImporter$1 = () => import("./camera-BZBdVFlr.js");
const Route$1 = createFileRoute("/camera")({
  component: lazyRouteComponent($$splitComponentImporter$1, "component")
});
const $$splitComponentImporter = () => import("./index-C4cPKV-X.js");
const Route = createFileRoute("/")({
  component: lazyRouteComponent($$splitComponentImporter, "component")
});
const SplashRoute = Route$7.update({
  id: "/splash",
  path: "/splash",
  getParentRoute: () => Route$8
});
const QuickScenariosRoute = Route$6.update({
  id: "/quick-scenarios",
  path: "/quick-scenarios",
  getParentRoute: () => Route$8
});
const OverviewRoute = Route$5.update({
  id: "/overview",
  path: "/overview",
  getParentRoute: () => Route$8
});
const ModesRoute = Route$4.update({
  id: "/modes",
  path: "/modes",
  getParentRoute: () => Route$8
});
const HomeRoute = Route$3.update({
  id: "/home",
  path: "/home",
  getParentRoute: () => Route$8
});
const ChatRoute = Route$2.update({
  id: "/chat",
  path: "/chat",
  getParentRoute: () => Route$8
});
const CameraRoute = Route$1.update({
  id: "/camera",
  path: "/camera",
  getParentRoute: () => Route$8
});
const IndexRoute = Route.update({
  id: "/",
  path: "/",
  getParentRoute: () => Route$8
});
const rootRouteChildren = {
  IndexRoute,
  CameraRoute,
  ChatRoute,
  HomeRoute,
  ModesRoute,
  OverviewRoute,
  QuickScenariosRoute,
  SplashRoute
};
const routeTree = Route$8._addFileChildren(rootRouteChildren)._addFileTypes();
const getRouter = () => {
  const queryClient = new QueryClient();
  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0
  });
  return router;
};
export {
  getRouter
};
