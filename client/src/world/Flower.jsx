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
  texture.generateMipmaps = false;

  return (
    <group position={[position.x, 0, position.z]}>
      {/* Small grounding shadow */}
      <mesh
        position={[0, 0.015, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        scale={scale}
      >
        <circleGeometry args={[0.32, 24]} />
        <meshBasicMaterial
          color="#365e35"
          transparent
          opacity={0.22}
          depthWrite={false}
        />
      </mesh>

      {/* User drawing */}
      <Billboard position={[0, 0.75 * scale, 0]} follow>
        <mesh scale={scale}>
          <planeGeometry args={[1.5, 1.5]} />

          <meshBasicMaterial
            map={texture}
            transparent
            alphaTest={0.05}
            side={THREE.DoubleSide}
            toneMapped={false}
          />
        </mesh>
      </Billboard>
    </group>
  );
}