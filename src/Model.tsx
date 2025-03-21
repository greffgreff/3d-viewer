import { useGLTF } from "@react-three/drei";
import {
  Group,
  Vector3,
  ColorRepresentation,
  MeshStandardMaterial,
  Mesh,
  Euler,
} from "three";
import { useEffect, useRef } from "react";

interface ModelProps {
  path: string;
  anchors: Vector3[];
  showAnchors?: boolean;
  color?: ColorRepresentation;
  offset?: Vector3;
  rotate?: Vector3; // rotation in radians
}

export default function Model({
  path,
  anchors,
  showAnchors = false,
  color = "#ffffff",
  offset = new Vector3(0, 0, 0),
  rotate = new Vector3(0, 0, 0),
}: ModelProps) {
  const { scene } = useGLTF(`/models/${path}`);
  const modelRef = useRef<Group>(null);

  useEffect(() => {
    if (!scene) return;

    scene.traverse((obj) => {
      if (obj.type === "Mesh") {
        const mesh = obj as Mesh;
        if (mesh.material && "color" in mesh.material) {
          (mesh.material as MeshStandardMaterial).color.set(color);
        }
      }
    });
  }, [scene, color]);

  return (
    <group
      ref={modelRef}
      position={offset}
      rotation={new Euler(rotate.x, rotate.y, rotate.z)}
    >
      <primitive object={scene} scale={1} />

      {showAnchors &&
        anchors.map((pos, idx) => (
          <mesh key={idx} position={pos}>
            <sphereGeometry args={[1, 16, 16]} />
            <meshBasicMaterial color="aqua" />
          </mesh>
        ))}
    </group>
  );
}
