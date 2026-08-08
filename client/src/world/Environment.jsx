import { ContactShadows, Sky } from "@react-three/drei";

function Tree({ position, scale = 1, color = "#76ad62" }) {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.65, 0]} castShadow>
        <cylinderGeometry args={[0.14, 0.22, 1.3, 8]} />
        <meshStandardMaterial color="#8b6045" roughness={1} />
      </mesh>

      <mesh position={[0, 1.55, 0]} castShadow>
        <icosahedronGeometry args={[0.72, 1]} />
        <meshStandardMaterial color={color} roughness={0.9} />
      </mesh>

      <mesh position={[-0.35, 1.35, 0.08]} castShadow>
        <icosahedronGeometry args={[0.48, 1]} />
        <meshStandardMaterial color="#8abe6c" roughness={0.9} />
      </mesh>

      <mesh position={[0.35, 1.35, 0]} castShadow>
        <icosahedronGeometry args={[0.5, 1]} />
        <meshStandardMaterial color="#68a25a" roughness={0.9} />
      </mesh>
    </group>
  );
}

function Bush({ position, scale = 1, color = "#6ca95c" }) {
  return (
    <group position={position} scale={scale}>
      <mesh position={[-0.32, 0.3, 0]} castShadow>
        <icosahedronGeometry args={[0.48, 1]} />
        <meshStandardMaterial color={color} roughness={1} />
      </mesh>

      <mesh position={[0.15, 0.4, 0.05]} castShadow>
        <icosahedronGeometry args={[0.58, 1]} />
        <meshStandardMaterial color="#7fba68" roughness={1} />
      </mesh>

      <mesh position={[0.55, 0.27, 0]} castShadow>
        <icosahedronGeometry args={[0.4, 1]} />
        <meshStandardMaterial color="#5f9954" roughness={1} />
      </mesh>
    </group>
  );
}

function Rock({ position, scale = 1, color = "#aaa9a4" }) {
  return (
    <mesh
      position={position}
      scale={[scale, scale * 0.65, scale]}
      rotation={[0.1, 0.35, -0.08]}
      castShadow
      receiveShadow
    >
      <dodecahedronGeometry args={[0.5, 0]} />
      <meshStandardMaterial color={color} roughness={1} flatShading />
    </mesh>
  );
}

function Cloud({ position, scale = 1 }) {
  return (
    <group position={position} scale={scale}>
      {[
        [-0.7, 0, 0, 0.65],
        [0, 0.15, 0, 0.85],
        [0.75, 0, 0, 0.6],
        [0.2, -0.15, 0, 0.75],
      ].map(([x, y, z, size], index) => (
        <mesh key={index} position={[x, y, z]}>
          <sphereGeometry args={[size, 16, 12]} />
          <meshStandardMaterial
            color="#fffdf7"
            roughness={1}
            emissive="#fff8e8"
            emissiveIntensity={0.1}
          />
        </mesh>
      ))}
    </group>
  );
}

function TinyFlower({ position, color = "#fff1a8" }) {
  return (
    <group position={position} scale={0.22}>
      <mesh position={[0, 0.6, 0]}>
        <cylinderGeometry args={[0.06, 0.07, 1.2, 6]} />
        <meshStandardMaterial color="#4f8b50" />
      </mesh>

      {[0, 1, 2, 3, 4].map((petal) => {
        const angle = (petal / 5) * Math.PI * 2;

        return (
          <mesh
            key={petal}
            position={[
              Math.cos(angle) * 0.3,
              1.25 + Math.sin(angle) * 0.3,
              0,
            ]}
          >
            <sphereGeometry args={[0.22, 8, 6]} />
            <meshStandardMaterial color={color} />
          </mesh>
        );
      })}

      <mesh position={[0, 1.25, 0.12]}>
        <sphereGeometry args={[0.18, 8, 6]} />
        <meshStandardMaterial color="#e6a84c" />
      </mesh>
    </group>
  );
}

export default function Environment() {
  return (
    <>
      <color attach="background" args={["#bfe5f5"]} />
      <fog attach="fog" args={["#cceaf4", 18, 34]} />

      <Sky
        distance={450000}
        sunPosition={[5, 8, 4]}
        inclination={0.55}
        azimuth={0.18}
      />

      {/* Soft overall light */}
      <hemisphereLight
        args={["#dff5ff", "#789557", 1.8]}
      />

      {/* Warm sunlight */}
      <directionalLight
        position={[-5, 10, 6]}
        intensity={2.8}
        color="#fff1d2"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={0.5}
        shadow-camera-far={30}
        shadow-camera-left={-12}
        shadow-camera-right={12}
        shadow-camera-top={12}
        shadow-camera-bottom={-12}
        shadow-bias={-0.0002}
      />

      {/* Meadow floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[9, 96]} />
        <meshStandardMaterial
          color="#82bd69"
          roughness={1}
        />
      </mesh>

      {/* Soft inner grass variation */}
      <mesh
        position={[0, 0.006, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
      >
        <circleGeometry args={[6.5, 64]} />
        <meshStandardMaterial color="#91c978" roughness={1} />
      </mesh>

      {/* Background hills */}
      <mesh position={[-6, -1.4, -6]} scale={[5.5, 2.4, 3.2]}>
        <sphereGeometry args={[1, 24, 16]} />
        <meshStandardMaterial color="#9ccb80" roughness={1} />
      </mesh>

      <mesh position={[5.5, -1.5, -7]} scale={[6, 2.7, 3.5]}>
        <sphereGeometry args={[1, 24, 16]} />
        <meshStandardMaterial color="#77ad68" roughness={1} />
      </mesh>

      <mesh position={[0, -1.8, -10]} scale={[8, 3, 4]}>
        <sphereGeometry args={[1, 24, 16]} />
        <meshStandardMaterial color="#a7d28b" roughness={1} />
      </mesh>

      {/* Trees around the outside */}
      <Tree position={[-6.2, 0, -3.5]} scale={1.25} />
      <Tree position={[-5.3, 0, 2.4]} scale={0.9} color="#619a59" />
      <Tree position={[5.8, 0, -4]} scale={1.1} />
      <Tree position={[6.2, 0, 1.8]} scale={0.8} color="#8abe6c" />

      {/* Bushes */}
      <Bush position={[-4.5, 0, -3]} scale={0.9} />
      <Bush position={[4.6, 0, -2.8]} scale={0.8} />
      <Bush position={[-5.6, 0, 0]} scale={0.65} />
      <Bush position={[5.5, 0, 0.6]} scale={0.7} />

      {/* Rocks */}
      <Rock position={[-3.8, 0.3, 2.6]} scale={0.85} />
      <Rock position={[3.9, 0.24, 2.2]} scale={0.65} color="#979b98" />
      <Rock position={[4.8, 0.18, -1]} scale={0.5} />

      {/* Small decorative flowers at edges */}
      <TinyFlower position={[-4, 0, 0.5]} color="#f8b9ce" />
      <TinyFlower position={[-3.5, 0, 2.8]} color="#fff1a8" />
      <TinyFlower position={[3.3, 0, 2.7]} color="#c8b7f4" />
      <TinyFlower position={[4.1, 0, 0.4]} color="#f7c2d4" />
      <TinyFlower position={[-2.8, 0, -3]} color="#f8e193" />

      {/* Distant clouds */}
      <Cloud position={[-7, 7, -15]} scale={1.4} />
      <Cloud position={[7, 6, -17]} scale={1.1} />

      {/* Soft grounding shadows */}
      <ContactShadows
        position={[0, 0.02, 0]}
        opacity={0.28}
        scale={18}
        blur={2.5}
        far={8}
        resolution={512}
        color="#47653e"
      />
    </>
  );
}