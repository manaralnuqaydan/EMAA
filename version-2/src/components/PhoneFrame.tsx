import { ReactNode } from "react";
import { useI18n } from "@/lib/i18n";

interface Props {
  children: ReactNode;
  label: string;
  caption?: string;
}

export function PhoneFrame({ children, label, caption }: Props) {
  const { dir } = useI18n();
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="text-center">
        <div className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">{label}</div>
        {caption && <div className="mt-1 text-sm text-foreground/70">{caption}</div>}
      </div>
      <div
        className="relative shrink-0"
        style={{ width: 320, height: 660 }}
      >
        {/* Phone shell */}
        <div
          className="absolute inset-0 rounded-[52px] p-[10px]"
          style={{
            background: "linear-gradient(160deg, #2a2238, #0e0a1a)",
            boxShadow:
              "0 40px 80px -30px oklch(0.3 0.15 290 / 0.55), inset 0 0 0 1px oklch(1 0 0 / 0.08)",
          }}
        >
          <div className="relative h-full w-full overflow-hidden rounded-[44px] bg-background">
            {/* Notch */}
            <div className="pointer-events-none absolute left-1/2 top-2 z-50 h-6 w-28 -translate-x-1/2 rounded-full bg-black" />
            {/* Status bar */}
            <div className="pointer-events-none absolute inset-x-0 top-0 z-40 flex h-9 items-center justify-between px-6 text-[10px] font-semibold text-foreground/80">
              <span>9:41</span>
              <span className="opacity-0">.</span>
            </div>
            {/* Screen content */}
            <div className="relative h-full w-full overflow-hidden" dir={dir}>
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
