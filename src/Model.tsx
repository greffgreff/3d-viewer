import type { Model as ModelType } from "./types/3d";
import { useEffect, useRef, ReactNode, useMemo } from "react";
import { useGLTF } from "@react-three/drei";
import {
  Group,
  Vector3,
  ColorRepresentation,
  MeshStandardMaterial,
  Mesh,
  Euler,
} from "three";
import { SkeletonUtils } from "three-stdlib";

interface ModelProps {
  model: ModelType;
  showAnchors?: boolean;
  color?: ColorRepresentation;
  offset?: Vector3;
  rotate?: Vector3;
  children?: ReactNode;
}

export default function Model({
  model,
  showAnchors = false,
  color = "#ffffff",
  offset = new Vector3(0, 0, 0),
  rotate = new Vector3(0, 0, 0),
  children,
}: ModelProps) {
  const { scene } = useGLTF(model.path);

  // Deep clone scene
  const clonedScene = useMemo(() => SkeletonUtils.clone(scene), [scene]);

  const modelRef = useRef<Group>(null);

  useEffect(() => {
    if (!clonedScene) return;

    clonedScene.traverse((obj) => {
      if (obj instanceof Mesh) {
        const mesh = obj as Mesh;

        // Clone the material to avoid sharing
        if (mesh.material) {
          mesh.material = mesh.material.clone();
        }

        if ("color" in mesh.material) {
          (mesh.material as MeshStandardMaterial).color.set(color);
        }
      }
    });
  }, [clonedScene, color]);

  return (
    <group
      ref={modelRef}
      position={offset}
      rotation={new Euler(rotate.x, rotate.y, rotate.z)}
    >
      <primitive object={clonedScene} scale={1} />
      {showAnchors &&
        model.anchors.map((anchor, idx) => (
          <mesh key={idx} position={anchor.point}>
            <sphereGeometry args={[1, 16, 16]} />
            <meshBasicMaterial color="aqua" />
          </mesh>
        ))}
      {children}
    </group>
  );
}
