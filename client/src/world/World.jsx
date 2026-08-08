import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import Environment from "./Environment";
import Flower from "./Flower";

export default function World({ creations = [] }) {
  return (
    <div style={{ width: "100%", height: "100vh" }}>
      <Canvas
        shadows
        camera={{ position: [0, 5, 10], fov: 45 }}
      >
        <Environment />

        {creations.map((creation) => (
          <Flower
            key={creation.id}
            imageUrl={creation.imageUrl}
            position={creation.position}
            scale={creation.scale}
            name={creation.name}
          />
        ))}

        <OrbitControls
          target={[0, 1, 0]}
          enablePan={false}
          minDistance={5}
          maxDistance={14}
        />
      </Canvas>
    </div>
  );
}