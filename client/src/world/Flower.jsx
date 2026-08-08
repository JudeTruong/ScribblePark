import { Billboard, useTexture } from "@react-three/drei";
import * as THREE from "three";

export default function Flower({
  imageUrl,
  position,
  scale = 1,
}) {
  const texture = useTexture(imageUrl);

  texture.colorSpace = THREE.SRGBColorSpace;
  texture.magFilter = THREE.NearestFilter;
  texture.minFilter = THREE.NearestFilter;

  return (
    <Billboard
      position={[position.x, 0.65 * scale, position.z]}
      follow
    >
      <mesh scale={scale}>
        <planeGeometry args={[1.3, 1.3]} />

        <meshStandardMaterial
          map={texture}
          transparent
          alphaTest={0.1}
          side={THREE.DoubleSide}
        />
      </mesh>
    </Billboard>
  );
}