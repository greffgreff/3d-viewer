import { useEffect, Suspense } from "react";
import { useGLTF } from "@react-three/drei";
import { ColorRepresentation, Vector3 } from "three";
import { MODELS } from "./assets/models";
import Model from "./Model";

interface ShelfProps {
  levelCount: number;
  color?: ColorRepresentation;
  offset?: Vector3;
}

export default function Shelf({ levelCount, color }: ShelfProps) {
  useEffect(() => {
    Object.values(MODELS).forEach((model) => useGLTF.preload(model.path));
  }, []);

  const panelPart = MODELS["back_panel"];
  const standPart = MODELS["stand"];
  const legPart = MODELS["leg"];
  const consolePart = MODELS["console"];
  const baseBoardPart = MODELS["base_board"];
  const levelPart = MODELS["level"];

  // Back panels
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
  const consoleAnchors: Record<string, Vector3> = Object.fromEntries(
    Object.entries(standPart.anchors).filter(([key]) =>
      key.startsWith("console_")
    )
  );
  const consoleSpacing = Math.round(
    Object.entries(consoleAnchors).length / levelCount
  );
  const selectedConsoleAnchors: Record<string, Vector3> = Object.fromEntries(
    Array.from(
      { length: levelCount },
      (_, i) => `console_${(i + 1) * consoleSpacing - 1}`
    )
      .filter((key) => key in consoleAnchors)
      .map((key) => [key, consoleAnchors[key]])
  );

  const leftConsoleOffsets = Object.entries(selectedConsoleAnchors).map(
    ([, anchor]) => {
      const offset = new Vector3().addVectors(
        leftStandOffset,
        new Vector3().subVectors(anchor, consolePart.anchors["stand"])
      );
      return { offset, consolePart };
    }
  );
  const rightConsoleOffsets = Object.entries(selectedConsoleAnchors).map(
    ([, anchor]) => {
      const offset = new Vector3().addVectors(
        rightStandOffset,
        new Vector3().subVectors(anchor, consolePart.anchors["stand"])
      );
      return { offset, consolePart };
    }
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

  // Base level
  const baseLevelOffset = new Vector3().addVectors(
    leftLegOffset,
    new Vector3().subVectors(
      legPart.anchors["level"],
      levelPart.anchors["console_left"]
    )
  );

  // Base board
  const baseBoardOffset = new Vector3().addVectors(
    leftLegOffset,
    new Vector3().subVectors(
      legPart.anchors["base_board"],
      baseBoardPart.anchors["top_right"]
    )
  );

  // Levels
  const levelOffset = leftConsoleOffsets.map(({ offset, consolePart }) =>
    new Vector3().addVectors(
      offset,
      new Vector3().subVectors(
        consolePart.anchors["level"],
        levelPart.anchors["console_left"]
      )
    )
  );

  return (
    <Suspense fallback={null}>
      {/* Back panels */}
      {panelOffsets.map((offset, i) => (
        <Model key={i} model={panelPart} offset={offset} color={color} />
      ))}

      {/* Legs */}
      <Model model={legPart} offset={leftLegOffset} color={color} />
      <Model model={legPart} offset={rightLegOffset} color={color} />

      {/* Stands */}
      <Model model={standPart} offset={leftStandOffset} color={color} />
      <Model model={standPart} offset={rightStandOffset} color={color} />

      {/* Consoles */}
      {leftConsoleOffsets.map(({ offset }, i) => (
        <Model key={i} model={consolePart} offset={offset} color={color} />
      ))}
      {rightConsoleOffsets.map(({ offset }, i) => (
        <Model key={i} model={consolePart} offset={offset} color={color} />
      ))}

      {/* Base level */}
      <Model model={levelPart} offset={baseLevelOffset} />

      {/* Base board */}
      <Model model={baseBoardPart} offset={baseBoardOffset} />

      {/* Levels */}
      {levelOffset.map((offset, i) => (
        <Model key={i} model={levelPart} offset={offset} />
      ))}
    </Suspense>
  );
}
