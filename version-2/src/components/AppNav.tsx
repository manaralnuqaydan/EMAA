import { Link, useLocation } from "@tanstack/react-router";
import { LayoutGrid } from "lucide-react";

const items = [
  { to: "/home", num: "02", label: "Home" },
  { to: "/modes", num: "03", label: "Modes" },
  { to: "/chat", num: "04", label: "AI Chat" },
  { to: "/camera", num: "05", label: "Live" },
] as const;

export function AppNav() {
  const { pathname } = useLocation();
  // Hide on splash entry
  if (pathname === "/") return null;

  return (
    <div
      dir="ltr"
      className="fixed top-3 left-1/2 z-[100] -translate-x-1/2 w-[min(96vw,640px)]"
    >
      <div className="glass shadow-card rounded-2xl px-2 py-2 flex items-center gap-1 overflow-x-auto">
        <Link
          to="/overview"
          className="flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-[11px] font-semibold text-foreground/70 hover:bg-white/40 shrink-0"
          activeProps={{ className: "bg-white/60 text-primary" }}
        >
          <LayoutGrid className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Overview</span>
        </Link>
        <div className="h-5 w-px bg-foreground/10 mx-0.5" />
        {items.map((it) => (
          <Link
            key={it.to}
            to={it.to}
            className="flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-[11px] font-medium text-foreground/70 hover:bg-white/40 shrink-0 transition-colors"
            activeProps={{ className: "grad-purple text-white shadow-soft" }}
          >
            <span className="text-[9px] opacity-70 tabular-nums">{it.num}</span>
            <span>{it.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
