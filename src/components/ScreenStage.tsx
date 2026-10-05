import { ReactNode } from "react";

interface Props {
  children: ReactNode;
  label?: string;
  caption?: string;
}

export function ScreenStage({ children }: Props) {
  return (
    <div className="h-dvh w-full overflow-x-hidden overflow-y-auto" dir="rtl">
      {children}
    </div>
  );
}
