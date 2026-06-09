<<<<<<< HEAD
import { Camera, Home, Sparkles, MessageCircle } from "lucide-react";
=======
import { Camera, Home, Sparkles } from "lucide-react";
>>>>>>> ee05a7642465a63dc5ad9e5c9adf55d316ccb8d7
import { Link } from "@tanstack/react-router";

export function HomeScreen() {
  return (
    <div className="relative h-full w-full grad-soft">
      {/* floating shapes */}
      <div className="absolute -top-16 -left-12 h-56 w-56 rounded-full opacity-60 blur-3xl"
        style={{ background: "radial-gradient(circle, oklch(0.85 0.12 295 / 0.7), transparent 70%)" }} />
      <div className="absolute top-40 -right-16 h-56 w-56 rounded-full opacity-50 blur-3xl"
        style={{ background: "radial-gradient(circle, oklch(0.82 0.1 245 / 0.7), transparent 70%)" }} />
      <div className="absolute bottom-32 left-8 h-32 w-32 rounded-full opacity-40 blur-2xl"
        style={{ background: "radial-gradient(circle, oklch(0.8 0.14 310 / 0.7), transparent 70%)" }} />

      <div className="relative z-10 flex h-full flex-col px-6 pb-24 pt-12">
<<<<<<< HEAD
        {/* header */}
=======
        {/* header — minimal, only wordmark */}
>>>>>>> ee05a7642465a63dc5ad9e5c9adf55d316ccb8d7
        <div className="flex flex-col items-center">
          <div className="text-3xl font-light tracking-[0.02em] text-gradient leading-none" style={{ fontWeight: 300 }}>
            إيماء
          </div>
          <div className="mt-2 text-[10px] tracking-[0.35em] text-muted-foreground/80 uppercase">Eemaa</div>
        </div>

        {/* AI ready chip */}
        <div className="mt-6 flex justify-center">
          <div className="flex items-center gap-2 rounded-full glass px-3.5 py-1.5 shadow-soft">
            <span className="relative grid h-2 w-2 place-items-center">
              <span className="absolute inset-0 animate-ping rounded-full bg-emerald-400/60" />
              <span className="relative h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            <span className="text-[11px] font-medium text-foreground/80">الذكاء الاصطناعي جاهز</span>
            <Sparkles className="h-3 w-3 text-primary" />
          </div>
        </div>

        {/* central CTA */}
        <div className="flex flex-1 flex-col items-center justify-center gap-8">
          <div className="relative">
            <div className="absolute -inset-8 rounded-full blur-3xl opacity-70"
              style={{ background: "radial-gradient(circle, oklch(0.7 0.25 300 / 0.75), transparent 65%)" }} />
            <div className="absolute -inset-3 animate-pulse-glow rounded-full" />
            <Link
              to="/modes"
              aria-label="فتح وضع الترجمة"
              className="relative grid h-44 w-44 place-items-center rounded-full text-white shadow-glow grad-purple"
            >
              <div className="absolute inset-2 rounded-full border border-white/30" />
              <div className="absolute inset-5 rounded-full border border-white/15" />
              <Camera className="h-14 w-14 drop-shadow-lg" strokeWidth={1.3} />
            </Link>
          </div>

          <div className="text-center">
            <h2 className="text-[26px] font-light tracking-tight text-foreground" style={{ fontWeight: 300, letterSpacing: "-0.01em" }}>
              <span className="font-semibold text-gradient">نفهمك</span>
              <span className="mx-2 text-foreground/40">…</span>
              <span className="text-foreground/85">بدون صوت</span>
            </h2>
            <p className="mt-3 text-[11px] tracking-[0.18em] text-muted-foreground">
              اضغط للتفعيل · ترجمة فورية
            </p>
          </div>
        </div>

<<<<<<< HEAD
        {/* bottom nav — الرئيسية يمين، الدعم يسار */}
        <div className="absolute inset-x-5 bottom-5">
          <div className="glass shadow-card flex items-center justify-center gap-1 rounded-3xl px-2 py-3">

            {/* الرئيسية — يمين */}
=======
        {/* bottom nav — only Home */}
        <div className="absolute inset-x-5 bottom-5">
          <div className="glass shadow-card flex items-center justify-center rounded-3xl px-2 py-3">
>>>>>>> ee05a7642465a63dc5ad9e5c9adf55d316ccb8d7
            <Link
              to="/"
              className="relative flex flex-col items-center gap-1 px-6 py-1"
              aria-label="الرئيسية"
            >
              <div className="absolute -top-1 h-1 w-6 rounded-full grad-purple" />
              <Home className="h-5 w-5 text-primary" strokeWidth={2.2} />
              <span className="text-[9px] font-semibold text-primary">الرئيسية</span>
            </Link>
<<<<<<< HEAD

            <div className="w-px h-6 bg-foreground/10" />

            {/* الدعم — يسار */}
            <Link
              to="/quick-scenarios"
              className="relative flex flex-col items-center gap-1 px-6 py-1"
              aria-label="الدعم"
            >
              <div className="absolute -top-1 h-1 w-6 rounded-full grad-purple" />
              <MessageCircle className="h-5 w-5 text-primary" strokeWidth={2.2} />
              <span className="text-[9px] font-semibold text-primary">الدعم</span>
            </Link>

=======
>>>>>>> ee05a7642465a63dc5ad9e5c9adf55d316ccb8d7
          </div>
        </div>
      </div>
    </div>
  );
}
