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

function AvatarModel() {
  const avatar = useFBX("/avatar.fbx");
  const mixer = useRef<THREE.AnimationMixer | null>(null);

  useEffect(() => {
    if (!avatar) return;

    avatar.traverse((object: any) => {
      object.frustumCulled = false;

      if (object.isMesh) {
        object.castShadow = true;
        object.receiveShadow = true;
      }
    });

    if (avatar.animations && avatar.animations.length > 0) {
      mixer.current = new THREE.AnimationMixer(avatar);

      const clip = avatar.animations[0].clone();

      // نحذف حركة الرجلين فقط من الأنيميشن، بدون لمس الحوض أو الجسم
      clip.tracks = clip.tracks.filter((track) => {
        return !isLegTrack(track.name);
      });

      const action = mixer.current.clipAction(clip);
      action.reset();
      action.setLoop(THREE.LoopRepeat, Infinity);
      action.play();
    }

    return () => {
      if (mixer.current) {
        mixer.current.stopAllAction();
        mixer.current = null;
      }
    };
  }, [avatar]);

  useFrame((_, delta) => {
    if (mixer.current) {
      mixer.current.update(delta);
    }

    // تعديل بسيط للأصابع
    const fingerBones = [
      "mixamorig6RightHandIndex1",
      "mixamorig6RightHandIndex2",
      "mixamorig6RightHandIndex3",
      "mixamorigRightHandIndex1",
      "mixamorigRightHandIndex2",
      "mixamorigRightHandIndex3",
    ];

    fingerBones.forEach((boneName) => {
      const bone = avatar.getObjectByName(boneName);
      if (bone) {
        bone.rotation.x = -0.6;
      }
    });
  });

  return <primitive object={avatar} scale={0.017} position={[0, -1.55, 0]} />;
}

export default function AvatarViewer() {
  return (
    <Canvas camera={{ position: [0, 1, 5], fov: 45 }}>
      <ambientLight intensity={1.2} />
      <directionalLight position={[2, 4, 2]} intensity={1} />
      <Suspense fallback={null}>
        <AvatarModel />
      </Suspense>
    </Canvas>
  );
}