import { Vector3 } from "three";

export interface NamedModel {
  path: string;
  anchors: Record<string, Vector3>;
}

export type ModelMap = Record<string, NamedModel>;
