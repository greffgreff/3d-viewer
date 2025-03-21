import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import { useState, useEffect, Suspense } from "react";
import "./App.css";

// Auto-load all `.gltf` and `.glb` files from the public models folder
const models = Object.keys(
  import.meta.glob("/public/models/*.{gltf,glb}", { eager: true })
).map((path) => path.replace("/public/models/", ""));

function Model({ path }: { path: string }) {
  const { scene } = useGLTF(`/models/${path}`);

  return <primitive object={scene} scale={1} dispose={null} />;
}

export default function App() {
  const [selectedModel, setSelectedModel] = useState<string | null>(null);

  useEffect(() => {
    if (models.length > 0) {
      models.forEach((model) => useGLTF.preload(`/models/${model}`)); // Preload models
      setSelectedModel(models[0]); // Default to first model
    }
  }, []);

  return (
    <>
      <div className="model-list">
        {models.map((model) => (
          <button
            key={model}
            className={model === selectedModel ? "selected" : ""}
            onClick={() => setSelectedModel(model)}
          >
            {model.replace(".gltf", "").replace(".glb", "")}
          </button>
        ))}
      </div>

      <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 5, 5]} />

        {/* Ensure previous model unmounts when switching */}
        <Suspense fallback={null}>
          {selectedModel && <Model key={selectedModel} path={selectedModel} />}
        </Suspense>

        <OrbitControls />
      </Canvas>
    </>
  );
}
