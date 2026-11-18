import { ShieldCheck } from "lucide-react";
import { useI18n } from "@/lib/i18n";

const KEY = "emaa.cameraConsent";

export function hasCameraConsent() {
  try {
    return localStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
}

/** تنبيه الخصوصية قبل أول تشغيل للكاميرا: وش يطلع من الجهاز، ووش حدود الترجمة */
export default function CameraConsent({
  onAccept,
  onCancel,
}: {
  onAccept: () => void;
  onCancel: () => void;
}) {
  const { t } = useI18n();
  const accept = () => {
    try {
      localStorage.setItem(KEY, "1");
    } catch {
      // التخزين مقفل: نسأل مرة ثانية الجلسة الجاية
    }
    onAccept();
  };
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="consent-title"
      className="absolute inset-0 z-20 flex flex-col justify-center gap-2 overflow-y-auto rounded-2xl bg-black/85 p-4 text-[11px] leading-relaxed text-white backdrop-blur"
    >
      <div
        id="consent-title"
        className="flex items-center gap-1.5 text-sm font-bold"
      >
        <ShieldCheck className="h-4 w-4 text-primary" />
        {t("privacy.title")}
      </div>
      <p>{t("privacy.camera")}</p>
      <p>{t("privacy.assistant")}</p>
      <p className="text-amber-200">{t("privacy.limits")}</p>
      <div className="mt-1 flex flex-wrap gap-2">
        <button
          onClick={accept}
          className="rounded-full grad-purple px-4 py-2 text-xs font-bold"
        >
          {t("privacy.agree")}
        </button>
        <button
          onClick={onCancel}
          className="rounded-full bg-white/15 px-4 py-2 text-xs hover:bg-white/25"
        >
          {t("privacy.cancel")}
        </button>
      </div>
    </div>
  );
}
