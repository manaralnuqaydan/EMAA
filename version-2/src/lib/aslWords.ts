// كلمات ASL: نجمع نقاط MediaPipe Holistic (أعلى الجسم + اليدين) لكل لقطة،
// وبعد ما تنزل اليد نرسل الحركة كاملة (32 لقطة) للموديل. نفس ترتيب asl_citizen_extract.py.

export const SEQ_FRAMES = 32;
export const POSE_IDS = [0, 11, 12, 13, 14, 15, 16, 23, 24];
export const MIN_SIGN_FRAMES = 8; // أقل حركة نقبلها
export const SIGN_END_MS = 500; // اختفاء اليدين هذه المدة يعني انتهت الإشارة

type Point = { x: number; y: number; z: number };
export type HolisticResults = {
  poseLandmarks?: Point[];
  rightHandLandmarks?: Point[];
  leftHandLandmarks?: Point[];
};

export function holisticFrame(r: HolisticResults): number[] {
  const out: number[] = [];
  for (const i of POSE_IDS) {
    const p = r.poseLandmarks?.[i];
    out.push(p?.x ?? 0, p?.y ?? 0, p?.z ?? 0);
  }
  for (const hand of [r.rightHandLandmarks, r.leftHandLandmarks]) {
    for (let i = 0; i < 21; i++) {
      const p = hand?.[i];
      out.push(p?.x ?? 0, p?.y ?? 0, p?.z ?? 0);
    }
  }
  return out;
}

export function hasHands(r: HolisticResults) {
  return !!(r.rightHandLandmarks || r.leftHandLandmarks);
}

// يوزع الحركة على 32 لقطة بالتساوي مثل التدريب
export function resampleSequence(frames: number[][]): number[][] {
  const n = frames.length;
  return Array.from(
    { length: SEQ_FRAMES },
    (_, i) => frames[Math.round((i * (n - 1)) / (SEQ_FRAMES - 1))],
  );
}

let holisticLoad: Promise<void> | null = null;
export function loadHolisticScript() {
  holisticLoad ??= new Promise<void>((resolve, reject) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((window as any).Holistic) return resolve();
    const s = document.createElement("script");
    s.src =
      "https://cdn.jsdelivr.net/npm/@mediapipe/holistic@0.5.1675471629/holistic.js";
    s.crossOrigin = "anonymous";
    s.onload = () => resolve();
    s.onerror = () => {
      holisticLoad = null;
      reject(new Error("holistic"));
    };
    document.head.appendChild(s);
  });
  return holisticLoad;
}
