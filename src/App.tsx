import { useEffect, Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import { Vector3 } from "three";
import Model from "./Model";
import { MODELS } from "./assets/models";
import "./App.css";

export default function App() {
  useEffect(() => {
    Object.values(MODELS).forEach((model) => useGLTF.preload(model.path));
  }, []);

  const panelPart = MODELS["back_panel"];
  const standPart = MODELS["stand"];
  const legPart = MODELS["leg"];
  const consolePart = MODELS["console"];

  // Stands
  const leftStandOffset = new Vector3().subVectors(
    panelPart.anchors["bottom_left"],
    standPart.anchors["bottom_back_panel"]
  );
  const rightStandOffset = new Vector3().subVectors(
    panelPart.anchors["bottom_right"],
    standPart.anchors["bottom_back_panel"]
  );

  // Consoles
  const NUM_CONSOLES = 10;

  // 1. Extract and sort actual anchor points by Y
  const consoleAnchors = Object.entries(standPart.anchors)
    .filter(([key]) => key.startsWith("console_"))
    .map(([key, point]) => ({ name: key, point: new Vector3().copy(point) }))
    .sort((a, b) => a.point.y - b.point.y);

  // 2. Evenly select N anchor points from the sorted list
  const totalAnchors = consoleAnchors.length;
  const step = totalAnchors / (NUM_CONSOLES + 1);

  const selectedConsoleAnchors = Array.from(
    { length: NUM_CONSOLES },
    (_, i) => {
      const index = Math.round((i + 1) * step); // skip first and last
      return consoleAnchors[Math.min(index, totalAnchors - 1)];
    }
  );

  // 3. Compute offset for each shelf using its selected anchor
  const leftConsoleOffsets = selectedConsoleAnchors.map(({ point }) =>
    new Vector3().addVectors(
      leftStandOffset,
      new Vector3().subVectors(point, consolePart.anchors["stand"])
    )
  );

  // Legs
  const leftLegOffset = new Vector3().addVectors(
    leftStandOffset,
    new Vector3().subVectors(standPart.anchors["leg"], legPart.anchors["stand"])
  );
  const rightLegOffset = new Vector3().addVectors(
    rightStandOffset,
    new Vector3().subVectors(standPart.anchors["leg"], legPart.anchors["stand"])
  );

  return (
    <Canvas orthographic camera={{ position: [0, 75, 150], zoom: 50 }}>
      <ambientLight intensity={5} />
      <directionalLight intensity={4} position={[5, 10, 10]} />
      <directionalLight intensity={4} position={[5, 10, -10]} />

      <Suspense fallback={null}>
        {/* <Model model={panelPart} /> */}
        <Model model={legPart} offset={leftLegOffset} />
        {/* <Model model={legPart} offset={rightLegOffset} /> */}
        <Model model={standPart} offset={leftStandOffset} />
        {/* <Model model={standPart} offset={rightStandOffset} /> */}
        {leftConsoleOffsets.map((offset, idx) => (
          <Model key={`console-${idx}`} model={consolePart} offset={offset} />
        ))}
      </Suspense>

      <OrbitControls />
    </Canvas>
  );
}
