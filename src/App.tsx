import "./App.css";
import { OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import Shelf from "./Shelf";

export default function App() {
  return (
    <Canvas orthographic camera={{ position: [45, 100, -150], zoom: 2 }}>
      <OrbitControls />

      <ambientLight intensity={5} />
      <directionalLight intensity={4} position={[5, 10, 10]} />
      <directionalLight intensity={4} position={[5, 10, -10]} />

      <Shelf levelCount={7} color="white" />
    </Canvas>
  );
}
