import { useEffect, useState, type ReactNode } from "react";
import { Pause, Play, RotateCcw } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { SPEEDS, type SpellControl, type SpellState } from "./AvatarViewer";

const control = (detail: SpellControl) =>
  window.dispatchEvent(new CustomEvent("spellControl", { detail }));

/** شريط تحت الأفاتار: الحرف اللي يأشّره الحين + إيقاف/متابعة/إعادة/سرعة،
 * والحروف اللي ما لها شكل يد تظهر باهتة مع تنبيه بدل ما نخترع إشارة */
export default function SpellCaption({
  dark = false,
  idle,
}: {
  dark?: boolean;
  idle?: ReactNode;
}) {
  const { t, signLang } = useI18n();
  const [state, setState] = useState<SpellState | null>(null);
  const [speed, setSpeed] = useState(1);

  useEffect(() => {
    const onState = (e: Event) => {
      const s = (e as CustomEvent<SpellState>).detail;
      setState(s.status === "idle" ? null : s);
      setSpeed(s.speed);
    };
    window.addEventListener("spellState", onState);
    return () => window.removeEventListener("spellState", onState);
  }, []);

  if (!state) return <>{idle}</>;

  const { tokens, index, status, question: q } = state;
  const letters = tokens.filter((tk) => tk.ch !== " ");
  const missing = letters.filter((tk) => !tk.ok).length;
  const box = dark ? "bg-black/55 text-white" : "bg-white/85 text-foreground";
  const btn = dark
    ? "bg-white/15 hover:bg-white/25"
    : "bg-primary/10 text-primary hover:bg-primary/20";

  return (
    <div
      className={`absolute inset-x-3 bottom-3 rounded-2xl px-3 py-2 backdrop-blur ${box}`}
    >
      <div
        dir={signLang === "arsl" ? "rtl" : "ltr"}
        className="flex flex-wrap justify-center gap-0.5 text-xl font-black"
        aria-live="polite"
      >
        {tokens.map((tk, i) => (
          <span
            key={i}
            className={
              !tk.ok
                ? "opacity-30 underline decoration-dotted"
                : i === index
                  ? "scale-125 text-primary transition-transform"
                  : i < index
                    ? "opacity-80"
                    : "opacity-30"
            }
          >
            {tk.ch === " " ? " " : tk.ch}
          </span>
        ))}
      </div>
      {(missing > 0 || q) && (
        <div className="mt-1 text-center text-[10px] opacity-75">
          {missing === letters.length && missing > 0
            ? t("avatar.noShapes", { lang: t(`signLang.${signLang}`) })
            : missing > 0
              ? t("avatar.unsupported")
              : t(q === "wh" ? "avatar.whQuestion" : "avatar.yesnoQuestion")}
        </div>
      )}
      <div className="mt-1.5 flex items-center justify-center gap-1.5 text-[10px]">
        <button
          onClick={() =>
            control({ cmd: status === "paused" ? "resume" : "pause" })
          }
          aria-label={t(status === "paused" ? "avatar.resume" : "avatar.pause")}
          title={t(status === "paused" ? "avatar.resume" : "avatar.pause")}
          className={`grid h-7 w-7 place-items-center rounded-full ${btn}`}
        >
          {status === "paused" ? (
            <Play className="h-3.5 w-3.5" />
          ) : (
            <Pause className="h-3.5 w-3.5" />
          )}
        </button>
        <button
          onClick={() => control({ cmd: "replay" })}
          aria-label={t("avatar.replay")}
          title={t("avatar.replay")}
          className={`grid h-7 w-7 place-items-center rounded-full ${btn}`}
        >
          <RotateCcw className="h-3.5 w-3.5" />
        </button>
        <span className="ms-1 opacity-70">{t("avatar.speed")}</span>
        {SPEEDS.map((s) => (
          <button
            key={s}
            onClick={() => control({ cmd: "speed", value: s })}
            aria-pressed={speed === s}
            className={`rounded-full px-2 py-1 font-semibold ${speed === s ? "bg-primary text-white" : btn}`}
          >
            {s}×
          </button>
        ))}
      </div>
    </div>
  );
}
