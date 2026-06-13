import { Canvas, useFrame } from "@react-three/fiber";
import { useFBX, OrbitControls } from "@react-three/drei";
import { Suspense, useEffect, useRef } from "react";
import * as THREE from "three";

function AvatarModel() {
  const avatar = useFBX("/avatar.fbx");

  const mixer = useRef<THREE.AnimationMixer | null>(null);

  useEffect(() => {
    if (!avatar || !avatar.animations || avatar.animations.length === 0) return;

    mixer.current = new THREE.AnimationMixer(avatar);

    const action = mixer.current.clipAction(avatar.animations[0]);
    action.reset();
    action.play(); //  تشغيل الحركة تلقائي
  }, [avatar]);

  useFrame((_, delta) => {
    mixer.current?.update(delta);
  });

  return (
    <primitive
      object={avatar}
      scale={0.02}
      position={[0, -1.9, 0]}
    />
  );
}

export default function AvatarViewer() {
  return (
    <div className="w-full h-full">
      <Canvas
        style={{ width: "100%", height: "100%" }}
        camera={{ position: [0, 1, 5], fov: 50 }}
      >
        <ambientLight intensity={2} />
        <directionalLight position={[5, 5, 5]} />

        <Suspense fallback={null}>
          <AvatarModel />
        </Suspense>

        <OrbitControls />
      </Canvas>
    </div>
  );
}