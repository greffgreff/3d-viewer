import type { Model as ModelType } from "./types/3d";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import { useEffect, Suspense } from "react";
import { Vector3 } from "three";
import Model from "./Model";
import rawModels from "./assets/models.json";
import "./App.css";

// @ts-ignore
const MODELS: ModelType[] = rawModels.map((model) => ({
  ...model,
  anchors: model.anchors.map((anchor) => ({
    ...anchor,
    point: new Vector3(...(anchor.point as [number, number, number])),
  })),
}));

export default function App() {
  useEffect(() => {
    MODELS.forEach((model) => useGLTF.preload(model.path));
  }, []);

  const panel = MODELS.find((m) => m.name.toLowerCase() === "back_panel")!;
  const leg = MODELS.find((m) => m.name.toLowerCase() === "leg")!;

  const leftLegOffset = new Vector3().subVectors(
    panel.anchors.find((a) => a.name === "bottom_left")!.point,
    leg.anchors.find((a) => a.name === "back_panel")!.point
  );
  const rightLegOffset = new Vector3().subVectors(
    panel.anchors.find((a) => a.name === "bottom_right")!.point,
    leg.anchors.find((a) => a.name === "back_panel")!.point
  );

  return (
    <Canvas camera={{ position: [0, 75, 150], fov: 45 }}>
      <ambientLight intensity={5} />
      <directionalLight intensity={2} position={[5, 0, 5]} />

      <Suspense fallback={null}>
        <Model model={panel} />
        <Model model={leg} offset={leftLegOffset} color="orange" />
        <Model model={leg} offset={rightLegOffset} color="pink" />
      </Suspense>

      <OrbitControls />
    </Canvas>
  );
}
