import { ReactNode } from "react";
import { useI18n } from "@/lib/i18n";

interface Props {
  children: ReactNode;
  label?: string;
  caption?: string;
}

export function ScreenStage({ children }: Props) {
  const { dir } = useI18n();
  return (
    <div className="h-dvh w-full overflow-x-hidden overflow-y-auto" dir={dir}>
      {children}
    </div>
  );
}
