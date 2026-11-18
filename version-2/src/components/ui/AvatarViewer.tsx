import type { SignLang } from "@/lib/i18n";
import { Suspense, useEffect, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useFBX } from "@react-three/drei";
import * as THREE from "three";
import {
  LETTER_MS,
  questionType,
  solveLetter,
  splitLetters,
  type Handshapes,
  type QuestionType,
  type SpellToken,
} from "@/lib/fingerspell";

type Pose = Map<string, THREE.Quaternion>;

// أول 40% من وقت كل حرف انتقال ناعم من الوضعية السابقة، والباقي ثبات عشان الحرف يتقرأ
const TRANSITION = 0.4;
const smooth = (x: number) => {
  const u = THREE.MathUtils.clamp(x, 0, 1);
  return u * u * (3 - 2 * u);
};

// يمزج وضعيتين (نفس العظام) بنسبة t
function mixPose(a: Pose, b: Pose, t: number): Pose {
  const out: Pose = new Map();
  b.forEach((q, n) => out.set(n, (a.get(n) ?? q).clone().slerp(q, t)));
  return out;
}

// تعابير الوجه للسؤال (non-manual markers): سؤال بأداة استفهام = حواجب منخفضة،
// سؤال نعم/لا = حواجب مرفوعة. هذا موثّق في ASL، وفي لغة الإشارة السعودية يحتاج مراجعة من أصم
const BROWS: Record<Exclude<QuestionType, null>, Record<string, number>> = {
  wh: { browDownLeft: 0.6, browDownRight: 0.6 },
  yesno: { browInnerUp: 0.7, browOuterUpLeft: 0.55, browOuterUpRight: 0.55 },
};
const BROW_KEYS = [
  "browDownLeft",
  "browDownRight",
  "browInnerUp",
  "browOuterUpLeft",
  "browOuterUpRight",
];

export const SPEEDS = [0.5, 0.75, 1] as const;
export type SpellState = {
  status: "playing" | "paused" | "idle";
  speed: number;
  tokens: SpellToken[];
  index: number;
  question: QuestionType;
};
export type SpellControl =
  | { cmd: "pause" }
  | { cmd: "resume" }
  | { cmd: "replay" }
  | { cmd: "speed"; value: number };

const blockedLegTracks = [
  "leftupleg",
  "rightupleg",
  "leftleg",
  "rightleg",
  "leftfoot",
  "rightfoot",
  "lefttoebase",
  "righttoebase",
  "lefttoe",
  "righttoe",
];

function isLegTrack(trackName: string) {
  const name = trackName.toLowerCase();
  return blockedLegTracks.some((word) => name.includes(word));
}

// وضعية وقوف طبيعية (الذراعان للأسفل) بدل وضعية T
function applyRestPose(avatar: THREE.Object3D) {
  const pose: [string, number, number, number][] = [
    ["LeftArm", 1.45, 0, 0.15],
    ["RightArm", 1.45, 0, -0.15],
    ["LeftForeArm", 0.25, 0, 0],
    ["RightForeArm", 0.25, 0, 0],
  ];
  pose.forEach(([name, x, y, z]) => {
    const bone = avatar.getObjectByName(name);
    if (bone) {
      bone.rotation.x += x;
      bone.rotation.y += y;
      bone.rotation.z += z;
    }
  });
}

function AvatarModel({ action: currentAction }: { action?: string }) {
  const avatar = useFBX("/avatar.fbx");
  const mixer = useRef<THREE.AnimationMixer | null>(null);
  const action = useRef<THREE.AnimationAction | null>(null);
  const pendingPlay = useRef(false);
  const restPose = useRef<Map<string, THREE.Quaternion>>(new Map());
  const faces = useRef<THREE.Mesh[]>([]);
  // كل لغة إشارة لها أشكال يد منفصلة، وما نخلطهم أبدًا
  const shapes = useRef<Record<SignLang, Handshapes>>({ arsl: {}, asl: {} });
  // تهجئة: وضعية لكل حرف + ساعة خاصة (تتوقف مع الإيقاف وتتأثر بالسرعة)
  const spelling = useRef<{
    from: Pose[];
    to: Pose[];
    dip: boolean[]; // حرف مكرر: اليد ترتخي شوي بينهم عشان يبان أنه حرفين
    tokens: SpellToken[];
    clock: number;
    shown: number;
    question: QuestionType;
  } | null>(null);
  const lastRequest = useRef<SpellRequest | null>(null);
  const paused = useRef(false);
  const speed = useRef(1);
  const brows = useRef<Record<string, number>>({});

  const emitState = () => {
    const sp = spelling.current;
    window.dispatchEvent(
      new CustomEvent<SpellState>("spellState", {
        detail: {
          status: sp ? (paused.current ? "paused" : "playing") : "idle",
          speed: speed.current,
          tokens: sp?.tokens ?? [],
          index: sp?.shown ?? -1,
          question: sp?.question ?? null,
        },
      }),
    );
  };

  const play = () => {
    if (action.current) {
      action.current.reset();
      action.current.play();
    } else {
      pendingPlay.current = true;
    }
  };

  useEffect(() => {
    if (!avatar) return;
    avatar.traverse((object: THREE.Object3D) => {
      object.frustumCulled = false;
      if ((object as THREE.Mesh).isMesh) {
        object.castShadow = true;
        object.receiveShadow = true;
        // خريطة الشفافية في الملف تجعل الوجه شفافًا فيظهر الشماغ من خلفه، فنلغيها
        const material = (object as THREE.Mesh)
          .material as THREE.MeshPhongMaterial;
        if (object.name === "Head_Mesh" && material.alphaMap) {
          material.alphaMap = null;
          material.transparent = false;
          material.depthWrite = true;
          material.needsUpdate = true;
        }
      }
    });
    if (!avatar.userData.restPoseApplied) {
      applyRestPose(avatar);
      avatar.userData.restPoseApplied = true;
    }
    faces.current = [];
    avatar.traverse((o) => {
      const mesh = o as THREE.Mesh;
      if (mesh.morphTargetDictionary && mesh.morphTargetInfluences)
        faces.current.push(mesh);
    });
    avatar.traverse((o) => {
      // الملف فيه نسخ مكررة بنفس الاسم، ونعتمد أول نسخة (نفس اللي يرجعها getObjectByName)
      if (
        (o as THREE.Bone).isBone &&
        o.name.startsWith("Right") &&
        !restPose.current.has(o.name)
      )
        restPose.current.set(o.name, o.quaternion.clone());
    });

    if (avatar.animations && avatar.animations.length > 0) {
      mixer.current = new THREE.AnimationMixer(avatar);
      const clip = avatar.animations[0].clone();
      clip.tracks = clip.tracks.filter((track) => !isLegTrack(track.name));
      action.current = mixer.current.clipAction(clip);
      action.current.setLoop(THREE.LoopOnce, 1);
      // بعد انتهاء الإشارة يرجع الأفاتار لوضعية الوقوف
      mixer.current.addEventListener("finished", () => action.current?.stop());

      if (pendingPlay.current) {
        pendingPlay.current = false;
        play();
      }
    }

    return () => {
      if (mixer.current) {
        mixer.current.stopAllAction();
        mixer.current = null;
      }
      action.current = null;
    };
  }, [avatar]);

  useEffect(() => {
    window.addEventListener("playAvatar", play);
    return () => window.removeEventListener("playAvatar", play);
  }, []);

  useEffect(() => {
    // أشكال اليد العربية (ArASL) والإنجليزية (ASL) إذا موجودة
    const files: [SignLang, string][] = [
      ["arsl", "handshapes_ar"],
      ["asl", "handshapes_en"],
    ];
    for (const [lang, file] of files) {
      fetch(`/data/${file}.json`)
        .then((res) => res.json())
        .then((data: Handshapes) => (shapes.current[lang] = data))
        .catch(() => {});
    }

    // يتهجى النص حرفًا حرفًا بأشكال يد مأخوذة من صور حقيقية
    const start = (req: SpellRequest) => {
      const langShapes = shapes.current[req.signLang];
      const tokens = splitLetters(req.text ?? "", langShapes);
      if (!tokens.length) return;
      lastRequest.current = req;
      action.current?.stop();
      const names = [...restPose.current.keys()];
      const bone = (n: string) => avatar.getObjectByName(n)!;
      const current: Pose = new Map(
        names.map((n) => [n, bone(n).quaternion.clone()]),
      );
      const sway = avatar.rotation.y;
      avatar.rotation.y = 0;
      const rest = restPose.current;
      const to: Pose[] = [];
      let last: Pose = rest;
      for (const tk of tokens) {
        if (tk.ch === " ")
          to.push(mixPose(last, rest, 0.4)); // مسافة بين كلمتين: اليد ترتخي
        else if (!tk.ok)
          to.push(mixPose(last, rest, 0.7)); // حرف بدون شكل يد: ما نخترع إشارة
        else {
          last = solveLetter(avatar, langShapes[tk.ch].landmarks, rest);
          to.push(last);
        }
      }
      current.forEach((q, n) => bone(n).quaternion.copy(q));
      avatar.rotation.y = sway;
      // يضمن نفس العظام في كل وضعية (العظام اللي ما تتحرك تبقى على وضعية الوقوف)
      const full = (p: Pose): Pose =>
        new Map([...rest].map(([n, q]) => [n, (p.get(n) ?? q).clone()]));
      const toFull = to.map(full);
      const from = [full(current), ...toFull.slice(0, -1)];
      spelling.current = {
        from,
        to: toFull,
        dip: tokens.map(
          (tk, i) =>
            i > 0 && tk.ok && tk.ch !== " " && tk.ch === tokens[i - 1].ch,
        ),
        tokens,
        clock: 0,
        shown: -1,
        question: req.question ?? questionType(req.text ?? ""),
      };
      paused.current = false;
      emitState();
    };
    const spell = (e: Event) => {
      const detail = (e as CustomEvent<string | SpellRequest>).detail;
      start(
        typeof detail === "string"
          ? { text: detail, signLang: "arsl" }
          : detail,
      );
    };
    const control = (e: Event) => {
      const c = (e as CustomEvent<SpellControl>).detail;
      if (c.cmd === "pause" && spelling.current) paused.current = true;
      else if (c.cmd === "resume") paused.current = false;
      else if (c.cmd === "replay" && lastRequest.current)
        start(lastRequest.current);
      else if (c.cmd === "speed") speed.current = c.value;
      emitState();
    };
    window.addEventListener("spellText", spell);
    window.addEventListener("spellControl", control);
    return () => {
      window.removeEventListener("spellText", spell);
      window.removeEventListener("spellControl", control);
    };
  }, [avatar]);

  useEffect(() => {
    if (currentAction === "signing" || currentAction === "proactive_alert")
      play();
  }, [currentAction]);

  useFrame(({ clock }, delta) => {
    if (mixer.current) mixer.current.update(delta);
    const sp = spelling.current;
    if (sp) {
      if (!paused.current) sp.clock += delta * 1000 * speed.current;
      const n = sp.to.length;
      const i = Math.floor(sp.clock / LETTER_MS);
      const u = (sp.clock - i * LETTER_MS) / LETTER_MS; // 0..1 داخل الحرف
      let pose: Pose;
      if (i < n) {
        const k = smooth(u / TRANSITION);
        if (sp.dip[i]) {
          // حرف مكرر: نرتخي للنص ثم نرجع لنفس الشكل
          const dipPose = mixPose(sp.from[i], restPose.current, 0.3);
          pose =
            k < 0.5
              ? mixPose(sp.from[i], dipPose, smooth(k * 2))
              : mixPose(dipPose, sp.to[i], smooth(k * 2 - 1));
        } else pose = mixPose(sp.from[i], sp.to[i], k);
      } else {
        // بعد آخر حرف: رجوع ناعم لوضعية الوقوف
        const k = smooth((sp.clock - n * LETTER_MS) / (LETTER_MS * 0.8));
        pose = mixPose(sp.to[n - 1], restPose.current, k);
        if (k >= 1) spelling.current = null;
      }
      pose.forEach((q, name) =>
        avatar.getObjectByName(name)!.quaternion.copy(q),
      );
      const shown = Math.min(i, n);
      if (shown !== sp.shown) {
        // الشاشة تعرض الحرف اللي يأشّره الأفاتار الحين
        sp.shown = shown;
        window.dispatchEvent(
          new CustomEvent("spellProgress", {
            detail: {
              letters: sp.tokens.map((tk) => tk.ch),
              supported: sp.tokens.map((tk) => tk.ok),
              index: shown,
            },
          }),
        );
        emitState();
      }
      if (!spelling.current) emitState();
    }
    // تعابير السؤال تظهر أثناء التهجئة فقط
    const want: Record<string, number> = spelling.current?.question
      ? BROWS[spelling.current.question]
      : {};
    for (const k of BROW_KEYS) {
      const cur = brows.current[k] ?? 0;
      brows.current[k] = cur + ((want[k] ?? 0) - cur) * Math.min(1, delta * 6);
    }
    // حركة تنفّس خفيفة وهو واقف عشان ما يبان جامد
    const t = clock.elapsedTime;
    avatar.rotation.y = Math.sin(t * 0.6) * 0.05;

    // الوجه: رمش طبيعي، ابتسامة خفيفة، وحركة الفم مع الصوت
    const blinkPhase = t % 4.2;
    const blink =
      blinkPhase < 0.15 ? Math.sin((blinkPhase / 0.15) * Math.PI) : 0;
    const talking =
      typeof window !== "undefined" && window.speechSynthesis?.speaking;
    const mouth = talking
      ? 0.18 + 0.22 * Math.abs(Math.sin(t * 11) * Math.sin(t * 4.3))
      : 0;
    const face: Record<string, number> = {
      eyeBlinkLeft: blink,
      eyeBlinkRight: blink,
      mouthSmile: 0.18,
      jawOpen: mouth,
      viseme_aa: mouth * 0.8,
      viseme_O: talking ? 0.25 * Math.abs(Math.sin(t * 6.1)) : 0,
      ...brows.current,
    };
    for (const mesh of faces.current) {
      for (const [name, value] of Object.entries(face)) {
        const i = mesh.morphTargetDictionary![name];
        if (i !== undefined) {
          const cur = mesh.morphTargetInfluences![i];
          mesh.morphTargetInfluences![i] = name.startsWith("eyeBlink")
            ? value
            : cur + (value - cur) * Math.min(1, delta * 18);
        }
      }
    }
  });

  return <primitive object={avatar} scale={0.017} position={[0, -2.0, 0]} />;
}

// لقطة نصف علوية تتكيف مع شكل الإطار (جوال طولي أو شاشة عريضة):
// الرأس واليد المتهجية دايمًا داخل الصورة، وأسفل الإطار فاضي لشريط الحروف
const FRAME = { top: 1.12, bottom: -0.3, width: 1.3, captionShare: 0.28 };
function Framing() {
  const { camera, size } = useThree();
  useEffect(() => {
    const cam = camera as THREE.PerspectiveCamera;
    const tan = Math.tan(THREE.MathUtils.degToRad(cam.fov / 2));
    const aspect = size.width / Math.max(size.height, 1);
    const view = Math.max(
      (FRAME.top - FRAME.bottom) / (1 - FRAME.captionShare),
      FRAME.width / aspect,
    );
    const centerY = FRAME.top + 0.05 - view / 2;
    cam.position.set(0, centerY, view / 2 / tan);
    cam.lookAt(0, centerY, 0);
    cam.updateProjectionMatrix();
  }, [camera, size]);
  return null;
}

export default function AvatarViewer({
  currentAction,
}: {
  currentAction?: string;
}) {
  return (
    <Canvas
      camera={{ position: [0, 0.3, 2.7], fov: 40 }}
      gl={{ preserveDrawingBuffer: true }}
    >
      <ambientLight intensity={1.1} />
      <directionalLight position={[2, 4, 3]} intensity={1.1} />
      <directionalLight
        position={[-3, 2, -2]}
        intensity={0.4}
        color="#c4b5fd"
      />
      <Framing />
      <Suspense fallback={null}>
        <AvatarModel action={currentAction} />
      </Suspense>
    </Canvas>
  );
}

// طلب تهجئة: النص ولغة الإشارة اللي يتهجى بها
// question: يدويًا، وإلا نستنتجه من علامة الاستفهام في النص
export type SpellRequest = {
  text: string;
  signLang: SignLang;
  question?: QuestionType;
};
