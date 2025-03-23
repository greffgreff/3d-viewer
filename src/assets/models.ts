import rawModels from "./models.json";
import type { ModelMap } from "../types/3d";
import { Vector3 } from "three";

export const MODELS: ModelMap = Object.fromEntries(
  Object.entries(rawModels).map(([name, model]) => [
    name,
    {
      ...model,
      anchors: Object.fromEntries(
        Object.entries(model.anchors).map(([anchorName, point]) => [
          anchorName,
          new Vector3(...(point as [number, number, number])),
        ])
      ),
    },
  ])
);
