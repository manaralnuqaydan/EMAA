import * as THREE from "three";

// شكل اليد لكل حرف: 21 نقطة (MediaPipe world landmarks) من صور حقيقية، طالعة من model/handshapes.py
export type Handshapes = Record<string, { landmarks: number[][] }>;

const FINGERS: [string, number[]][] = [
  ["Thumb", [1, 2, 3, 4]],
  ["Index", [5, 6, 7, 8]],
  ["Middle", [9, 10, 11, 12]],
  ["Ring", [13, 14, 15, 16]],
  ["Pinky", [17, 18, 19, 20]],
];

// مكان اليد أثناء التهجئة نسبةً لطول الذراع: قدام الصدر جهة اليمين
const HAND_TARGET = { inward: 0.12, down: 0.42, forward: 0.55 };

export const LETTER_MS = 750;

const v = (p: number[]) => new THREE.Vector3(-p[0], -p[1], -p[2]);

// إطار الكف: عرض الكف (من الخنصر للسبابة)، اتجاه الأصابع، والعمودي على الكف
function frame(
  wrist: THREE.Vector3,
  index: THREE.Vector3,
  middle: THREE.Vector3,
  pinky: THREE.Vector3,
) {
  const up = middle.clone().sub(wrist).normalize();
  const across = index.clone().sub(pinky);
  across.sub(up.clone().multiplyScalar(across.dot(up))).normalize();
  const normal = new THREE.Vector3().crossVectors(across, up);
  return new THREE.Matrix4().makeBasis(across, up, normal);
}

const worldPos = (o: THREE.Object3D) => o.getWorldPosition(new THREE.Vector3());

function setWorldQuaternion(bone: THREE.Object3D, q: THREE.Quaternion) {
  const parent = bone.parent!.getWorldQuaternion(new THREE.Quaternion());
  bone.quaternion.copy(parent.invert().multiply(q));
  bone.updateMatrixWorld(true);
}

// IK بسيط لعظمتين: يحرك الكتف والكوع عشان الرسغ يوصل للنقطة المطلوبة، والكوع جهة الأسفل والخارج
function reachArm(avatar: THREE.Object3D) {
  const upper = avatar.getObjectByName("RightArm")!;
  const fore = avatar.getObjectByName("RightForeArm")!;
  const hand = avatar.getObjectByName("RightHand")!;
  const S = worldPos(upper),
    E = worldPos(fore),
    W = worldPos(hand);
  const a = S.distanceTo(E),
    b = E.distanceTo(W),
    L = a + b;
  const outward =
    Math.sign(S.x - worldPos(avatar.getObjectByName("Spine2")!).x) || -1;
  const T = S.clone().add(
    new THREE.Vector3(
      -outward * HAND_TARGET.inward * L,
      -HAND_TARGET.down * L,
      HAND_TARGET.forward * L,
    ),
  );
  const pole = S.clone().add(
    new THREE.Vector3(outward * 0.4 * L, -L, -0.1 * L),
  );

  const toT = T.clone().sub(S);
  const d = Math.min(toT.length(), L * 0.999);
  const angle = Math.acos(
    THREE.MathUtils.clamp((a * a + d * d - b * b) / (2 * a * d), -1, 1),
  );
  const n = new THREE.Vector3()
    .crossVectors(toT, pole.clone().sub(S))
    .normalize();
  const dirE = toT.clone().normalize().applyAxisAngle(n, angle);
  const elbow = S.clone().add(dirE.clone().multiplyScalar(a));

  let turn = new THREE.Quaternion().setFromUnitVectors(
    E.clone().sub(S).normalize(),
    dirE,
  );
  setWorldQuaternion(
    upper,
    turn.multiply(upper.getWorldQuaternion(new THREE.Quaternion())),
  );
  const now = worldPos(hand).sub(worldPos(fore)).normalize();
  const wrist = S.clone().add(toT.clone().normalize().multiplyScalar(d));
  turn = new THREE.Quaternion().setFromUnitVectors(
    now,
    wrist.sub(elbow).normalize(),
  );
  setWorldQuaternion(
    fore,
    turn.multiply(fore.getWorldQuaternion(new THREE.Quaternion())),
  );
}

/** يحسب وضعية الذراع واليد والأصابع لحرف واحد ويرجعها كـ quaternions محلية لكل عظمة */
export function solveLetter(
  avatar: THREE.Object3D,
  landmarks: number[][],
  bind: Map<string, THREE.Quaternion>,
) {
  const bone = (name: string) => avatar.getObjectByName(name)!;
  const names = [
    "RightArm",
    "RightForeArm",
    "RightHand",
    ...FINGERS.flatMap(([f]) => [1, 2, 3].map((i) => `RightHand${f}${i}`)),
  ];
  names.forEach((n) => bone(n).quaternion.copy(bind.get(n)!));
  avatar.updateMatrixWorld(true);
  reachArm(avatar);

  // 1) دوران الرسغ: نطابق إطار كف الأفاتار مع إطار الكف في الصورة
  const lm = landmarks.map(v);
  const hand = bone("RightHand");
  const target = frame(lm[0], lm[5], lm[9], lm[17]);
  const current = frame(
    worldPos(hand),
    worldPos(bone("RightHandIndex1")),
    worldPos(bone("RightHandMiddle1")),
    worldPos(bone("RightHandPinky1")),
  );
  const delta = new THREE.Quaternion().setFromRotationMatrix(
    target.multiply(current.invert()),
  );
  setWorldQuaternion(
    hand,
    delta.multiply(hand.getWorldQuaternion(new THREE.Quaternion())),
  );

  // 2) كل عظمة إصبع تلف عشان اتجاهها يطابق اتجاه نفس العقلة في الصورة
  for (const [finger, ids] of FINGERS) {
    for (let i = 1; i <= 3; i++) {
      const b = bone(`RightHand${finger}${i}`);
      // الملف يكرر كل عظمة كابن لنفسها (نسخة لكل mesh)، فنتجاوز النسخ ونأخذ العقلة التالية
      const child = b.children.find(
        (c) => (c as THREE.Bone).isBone && c.name !== b.name,
      );
      if (!child) continue;
      const now = worldPos(child).sub(worldPos(b)).normalize();
      const want = lm[ids[i]]
        .clone()
        .sub(lm[ids[i - 1]])
        .normalize();
      const turn = new THREE.Quaternion().setFromUnitVectors(now, want);
      setWorldQuaternion(
        b,
        turn.multiply(b.getWorldQuaternion(new THREE.Quaternion())),
      );
    }
  }
  return new Map(names.map((n) => [n, bone(n).quaternion.clone()]));
}

/** يقسم النص لحروف: عربي ArASL (ال و لا حرف واحد) أو إنجليزي ASL */
export function splitLetters(text: string, shapes: Handshapes) {
  const out: string[] = [];
  const chars = Array.from(
    text.replace(/[أإآ]/g, "ا").replace(/ؤ/g, "و").replace(/ئ/g, "ي"),
  );
  for (let i = 0; i < chars.length; i++) {
    const pair = chars[i] + (chars[i + 1] ?? "");
    if (shapes[pair]) {
      out.push(pair);
      i++;
    } else if (shapes[chars[i]]) out.push(chars[i]);
    else if (shapes[chars[i].toUpperCase()]) out.push(chars[i].toUpperCase());
    else if (chars[i] === " ") out.push(" ");
  }
  return out;
}
