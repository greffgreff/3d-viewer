import { Vector3 } from "three";

export interface Anchor {
  name: string;
  targets?: `${string}/${string}`[];
  point: Vector3;
}

export interface Model {
  name: string;
  path: string;
  anchors: Anchor[];
}
