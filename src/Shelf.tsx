import { useEffect, Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import { ColorRepresentation, Vector3 } from "three";
import { MODELS } from "./assets/models";
import Model from "./Model";

interface ShelfProps {
  levels: number;
  color?: ColorRepresentation;
  offset?: Vector3;
}

export default function Shelf({ levels, color, offset }: ShelfProps) {
  useEffect(() => {
    Object.values(MODELS).forEach((model) => useGLTF.preload(model.path));
  }, []);

  const panelPart = MODELS["back_panel"];
  const standPart = MODELS["stand"];
  const legPart = MODELS["leg"];
  const consolePart = MODELS["console"];

  // Panels
  const panelCount = 5;

  const panelOffsets: Vector3[] = [];
  const panelHeight = panelPart.anchors["top_left"].y;

  for (let i = 0; i < panelCount; i++) {
    if (i === 0) {
      panelOffsets.push(new Vector3(0, 0, 0));
    } else {
      const previous = panelOffsets[i - 1];
      panelOffsets.push(previous.clone().add(new Vector3(0, panelHeight, 0)));
    }
  }

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
  const consoleCount = levels;

  const consoleAnchors: Record<string, Vector3> = Object.fromEntries(
    Object.entries(standPart.anchors).filter(([key]) =>
      key.startsWith("console_")
    )
  );
  const consoleSpacing = Math.round(
    Object.entries(consoleAnchors).length / (consoleCount + 1)
  );
  const selectedConsoleAnchors: Record<string, Vector3> = Object.fromEntries(
    Array.from(
      { length: consoleCount },
      (_, i) => `console_${(i + 1) * consoleSpacing - 1}`
    )
      .filter((key) => key in consoleAnchors)
      .map((key) => [key, consoleAnchors[key]])
  );

  const leftConsoleOffsets = Object.entries(selectedConsoleAnchors).map(
    ([, anchor]) =>
      new Vector3().addVectors(
        leftStandOffset,
        new Vector3().subVectors(anchor, consolePart.anchors["stand"])
      )
  );
  const rightConsoleOffsets = Object.entries(selectedConsoleAnchors).map(
    ([, anchor]) =>
      new Vector3().addVectors(
        rightStandOffset,
        new Vector3().subVectors(anchor, consolePart.anchors["stand"])
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
        {panelOffsets.map((offset, i) => (
          <Model
            key={`console-${i}`}
            model={panelPart}
            offset={offset}
            color={color}
          />
        ))}
        <Model model={panelPart} />
        <Model model={legPart} offset={leftLegOffset} color={color} />
        <Model model={legPart} offset={rightLegOffset} color={color} />
        <Model model={standPart} offset={leftStandOffset} color={color} />
        <Model model={standPart} offset={rightStandOffset} color={color} />
        {leftConsoleOffsets.map((offset, i) => (
          <Model
            key={`console-${i}`}
            model={consolePart}
            offset={offset}
            color={color}
          />
        ))}
        {rightConsoleOffsets.map((offset, i) => (
          <Model
            key={`console-${i}`}
            model={consolePart}
            offset={offset}
            color={color}
          />
        ))}
      </Suspense>

      <OrbitControls />
    </Canvas>
  );
}
