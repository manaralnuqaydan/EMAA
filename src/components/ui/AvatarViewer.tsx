import { Canvas, useFrame } from "@react-three/fiber";
import { useFBX, OrbitControls } from "@react-three/drei";
import { Suspense, useEffect, useRef } from "react";
import * as THREE from "three";

function AvatarModel() {
  const avatar = useFBX("/avatar.fbx");
  const mixer = useRef<THREE.AnimationMixer | null>(null);

  useEffect(() => {
    if (!avatar) return;

    if (avatar.animations && avatar.animations.length > 0) {
      mixer.current = new THREE.AnimationMixer(avatar);
      const action = mixer.current.clipAction(avatar.animations[0]);
      action.reset();
      action.play();
    }
  }, [avatar]);

  useFrame((_, delta) => {
    if (mixer.current) {
      mixer.current.update(delta);
    }

    const index1 = avatar.getObjectByName("mixamorig6RightHandIndex1");
    const index2 = avatar.getObjectByName("mixamorig6RightHandIndex2");
    const index3 = avatar.getObjectByName("mixamorig6RightHandIndex3");

if (index1) index1.rotation.x = -0.6;
if (index2) index2.rotation.x = -0.6;
if (index3) index3.rotation.x = -0.6;
  });

  return <primitive object={avatar} scale={0.02} position={[0, -1.9, 0]} />;
}

export default function AvatarViewer() {
  return (
    <Canvas camera={{ position: [0, 1, 4], fov: 45 }}>
      <ambientLight intensity={1.2} />
      <directionalLight position={[2, 4, 2]} intensity={1} />
      <Suspense fallback={null}>
        <AvatarModel />
      </Suspense>
      <OrbitControls />
    </Canvas>
  );
}