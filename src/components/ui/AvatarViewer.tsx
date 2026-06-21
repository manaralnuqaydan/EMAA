import { Canvas, useFrame } from "@react-three/fiber";
import { useFBX, OrbitControls } from "@react-three/drei";
import { Suspense, useEffect, useRef } from "react";
import * as THREE from "three";

type AvatarModelProps = {
  shouldPlay: boolean;
  onAnimationEnd: () => void;
};

function AvatarModel({ shouldPlay, onAnimationEnd }: AvatarModelProps) {
  const avatar = useFBX("/avatar.fbx");
  const mixer = useRef<THREE.AnimationMixer | null>(null);
  const action = useRef<THREE.AnimationAction | null>(null);

  useEffect(() => {
    if (!avatar || !avatar.animations || avatar.animations.length === 0) return;
    mixer.current = new THREE.AnimationMixer(avatar);
    action.current = mixer.current.clipAction(avatar.animations[0]);
    action.current.setLoop(THREE.LoopOnce, 1);
    action.current.clampWhenFinished = true;

    mixer.current.addEventListener("finished", onAnimationEnd);
    return () => {
      mixer.current?.removeEventListener("finished", onAnimationEnd);
    };
  }, [avatar]);

  useEffect(() => {
    if (shouldPlay && action.current) {
      action.current.reset();
      action.current.play();
    }
  }, [shouldPlay]);

  useFrame((_, delta) => {
    mixer.current?.update(delta);
  });

  return (
    <primitive object={avatar} scale={0.02} position={[0, -1.9, 0]} />
  );
}

type AvatarViewerProps = {
  shouldPlay?: boolean;
  onAnimationEnd?: () => void;
};

export default function AvatarViewer({ shouldPlay = false, onAnimationEnd = () => {} }: AvatarViewerProps) {
  return (
    <div className="w-full h-full">
      <Canvas
        style={{ width: "100%", height: "100%" }}
        camera={{ position: [0, 1, 5], fov: 50 }}
      >
        <ambientLight intensity={2} />
        <directionalLight position={[5, 5, 5]} />
        <Suspense fallback={null}>
          <AvatarModel shouldPlay={shouldPlay} onAnimationEnd={onAnimationEnd} />
        </Suspense>
        <OrbitControls />
      </Canvas>
    </div>
  );
}
