import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import { useState, useEffect, Suspense } from "react";
import { Vector3 } from "three";
import "./App.css";
import Model from "./Model";

interface ModelData {
  path: string;
  anchors: Vector3[];
}

export default function App() {
  const [models, setModels] = useState<ModelData[]>([]);
  const [selectedModel, setSelectedModel] = useState<ModelData | null>(null);

  useEffect(() => {
    fetch("/anchors.json")
      .then((res) => res.json())
      .then((data: ModelData[]) => {
        data.forEach((model) => useGLTF.preload(`/models/${model.path}`));
        setModels(data);
        setSelectedModel(data[0]);
      });
  }, []);

  return (
    <>
      <div className="model-list">
        {models.map((model) => (
          <button
            key={model.path}
            className={model.path === selectedModel?.path ? "selected" : ""}
            onClick={() => setSelectedModel(model)}
          >
            {model.path.replace(".glb", "").replace(".gltf", "")}
          </button>
        ))}
      </div>

      <Canvas camera={{ position: [0, 0, 150], fov: 45 }}>
        <ambientLight intensity={5} />
        <directionalLight intensity={2} position={[5, 5, 5]} />

        <Suspense fallback={null}>
          {selectedModel && (
            <Model
              color="white"
              key={selectedModel.path}
              path={selectedModel.path}
              anchors={selectedModel.anchors}
              showAnchors
            />
          )}
        </Suspense>

        <OrbitControls />
      </Canvas>
    </>
  );
}
