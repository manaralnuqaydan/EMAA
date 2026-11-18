import { Suspense, useEffect, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useFBX } from "@react-three/drei";
import * as THREE from "three";
import {
  LETTER_MS,
  solveLetter,
  splitLetters,
  type Handshapes,
} from "@/lib/fingerspell";

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
  const shapes = useRef<Handshapes>({});
  // تهجئة: قائمة وضعيات (وضعية لكل حرف) ووقت بدايتها
  const spelling = useRef<{
    poses: Map<string, THREE.Quaternion>[];
    letters: string[];
    start: number;
    shown: number;
  } | null>(null);

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
    for (const file of ["handshapes_ar", "handshapes_en"]) {
      fetch(`/data/${file}.json`)
        .then((res) => res.json())
        .then((data: Handshapes) => Object.assign(shapes.current, data))
        .catch(() => {});
    }

    // يتهجى النص حرفًا حرفًا بأشكال يد مأخوذة من صور حقيقية
    const spell = (e: Event) => {
      const letters = splitLetters(
        (e as CustomEvent<string>).detail ?? "",
        shapes.current,
      );
      if (!letters.length) return;
      action.current?.stop();
      const saved = new Map(
        [...restPose.current.keys()].map((n) => [
          n,
          avatar.getObjectByName(n)!.quaternion.clone(),
        ]),
      );
      const sway = avatar.rotation.y;
      avatar.rotation.y = 0;
      let last = restPose.current;
      const poses = letters.map((l) => {
        if (l !== " ")
          last = solveLetter(
            avatar,
            shapes.current[l].landmarks,
            restPose.current,
          );
        return last;
      });
      saved.forEach((q, n) => avatar.getObjectByName(n)!.quaternion.copy(q));
      avatar.rotation.y = sway;
      spelling.current = {
        poses,
        letters,
        start: performance.now(),
        shown: -1,
      };
    };
    window.addEventListener("spellText", spell);
    return () => window.removeEventListener("spellText", spell);
  }, [avatar]);

  useEffect(() => {
    if (currentAction === "signing" || currentAction === "proactive_alert")
      play();
  }, [currentAction]);

  useFrame(({ clock }, delta) => {
    if (mixer.current) mixer.current.update(delta);
    const spell = spelling.current;
    if (spell) {
      const i = Math.floor((performance.now() - spell.start) / LETTER_MS);
      const target = spell.poses[i] ?? restPose.current;
      if (i !== spell.shown) {
        // الشاشة تعرض الحرف اللي يأشّره الأفاتار الحين
        spell.shown = i;
        window.dispatchEvent(
          new CustomEvent("spellProgress", {
            detail: { letters: spell.letters, index: i },
          }),
        );
      }
      const blend = 1 - Math.exp(-delta * 14);
      let settled = true;
      target.forEach((q, n) => {
        const b = avatar.getObjectByName(n)!;
        b.quaternion.slerp(q, blend);
        if (b.quaternion.angleTo(q) > 0.01) settled = false;
      });
      if (i >= spell.poses.length && settled) spelling.current = null;
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

export default function AvatarViewer({
  currentAction,
}: {
  currentAction?: string;
}) {
  return (
    <Canvas
      camera={{ position: [0, 0, 3.8], fov: 40 }}
      gl={{ preserveDrawingBuffer: true }}
    >
      <ambientLight intensity={1.1} />
      <directionalLight position={[2, 4, 3]} intensity={1.1} />
      <directionalLight
        position={[-3, 2, -2]}
        intensity={0.4}
        color="#c4b5fd"
      />
      <Suspense fallback={null}>
        <AvatarModel action={currentAction} />
      </Suspense>
    </Canvas>
  );
}
