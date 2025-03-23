import { useState } from "react";
import { useGLTF } from "@react-three/drei";
import {
  Group,
  Vector3,
  ColorRepresentation,
  MeshStandardMaterial,
  Mesh,
  Euler,
  Material,
} from "three";
import { SkeletonUtils } from "three-stdlib";
import { useEffect, useRef, ReactNode, useMemo } from "react";
import type { NamedModel } from "./types/3d";

interface ModelProps {
  model: NamedModel;
  showAnchors?: boolean;
  color?: ColorRepresentation;
  hoverColor?: ColorRepresentation;
  offset?: Vector3;
  rotate?: Vector3;
  children?: ReactNode;
}

export default function Model({
  model,
  showAnchors = false,
  color = "#ffffff",
  hoverColor = "#ffcc00",
  offset = new Vector3(0, 0, 0),
  rotate = new Vector3(0, 0, 0),
  children,
}: ModelProps) {
  const { scene } = useGLTF(model.path);
  const clonedScene = useMemo(() => SkeletonUtils.clone(scene), [scene]);
  const modelRef = useRef<Group>(null);

  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    if (!clonedScene) return;

    clonedScene.traverse((obj) => {
      if (obj instanceof Mesh) {
        const mesh = obj as Mesh;

        // Clone material(s)
        if (mesh.material) {
          if (Array.isArray(mesh.material)) {
            mesh.material = mesh.material.map((m) => m.clone()) as Material[];
          } else {
            mesh.material = mesh.material.clone();
          }

          if (!Array.isArray(mesh.material) && "color" in mesh.material) {
            const baseColor = hovered ? hoverColor : color;
            (mesh.material as MeshStandardMaterial).color.set(baseColor);
          }
        }
      }
    });
  }, [clonedScene, color, hovered]);

  return (
    <group
      ref={modelRef}
      position={offset}
      rotation={new Euler(rotate.x, rotate.y, rotate.z)}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
      }}
      onPointerOut={() => setHovered(false)}
    >
      <primitive object={clonedScene} scale={1} />

      {showAnchors &&
        Object.entries(model.anchors).map(([anchorName, point]) => (
          <mesh key={anchorName} position={point}>
            <sphereGeometry args={[2, 16, 16]} />
            <meshBasicMaterial color="aqua" />
          </mesh>
        ))}

      {children}
    </group>
  );
}
