import { Suspense, useEffect, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useFBX } from "@react-three/drei";
import * as THREE from "three";

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
    if (currentAction === "signing" || currentAction === "proactive_alert")
      play();
  }, [currentAction]);

  useFrame(({ clock }, delta) => {
    if (mixer.current) mixer.current.update(delta);
    // حركة تنفّس خفيفة وهو واقف عشان ما يبان جامد
    avatar.rotation.y = Math.sin(clock.elapsedTime * 0.6) * 0.05;
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
