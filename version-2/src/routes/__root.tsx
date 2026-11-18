import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";

import appCss from "../styles.css?url";
import { I18nProvider, PRELOAD_LANG_SCRIPT, useI18n } from "@/lib/i18n";


function NotFoundComponent() {
  const { t } = useI18n();
  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <p className="mt-2 text-sm text-muted-foreground">{t("notFound.text")}</p>
        <Link to="/" className="mt-6 inline-flex rounded-full grad-purple px-5 py-2 text-sm text-primary-foreground">
          {t("notFound.home")}
        </Link>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  const { t } = useI18n();
  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-4 text-center">
      <div>
        <h1 className="text-xl font-semibold">{t("error.title")}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
        <button onClick={() => { router.invalidate(); reset(); }} className="mt-6 rounded-full grad-purple px-5 py-2 text-sm text-primary-foreground">
          {t("error.retry")}
        </button>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
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
      { property: "og:type", content: "website" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700;800;900&display=swap" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: PRELOAD_LANG_SCRIPT }} />
        <HeadContent />
      </head>
      <body>
        <I18nProvider>{children}</I18nProvider>
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>

      <main><Outlet /></main>
    </QueryClientProvider>
  );
}

