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

function Bush({ position, scale = 1 }) {
  return (
    <group position={position} scale={scale}>
      <mesh position={[-0.32, 0.3, 0]} castShadow>
        <icosahedronGeometry args={[0.48, 1]} />
        <meshStandardMaterial color="#6ca95c" roughness={1} />
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
      <meshStandardMaterial
        color={color}
        roughness={1}
        flatShading
      />
    </mesh>
  );
}

function Cloud({ position, scale = 1 }) {
  const cloudParts = [
    [-0.7, 0, 0, 0.65],
    [0, 0.15, 0, 0.85],
    [0.75, 0, 0, 0.6],
    [0.2, -0.15, 0, 0.75],
  ];

  return (
    <group position={position} scale={scale}>
      {cloudParts.map(([x, y, z, size], index) => (
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

function Pond() {
  const lilyPads = [
    { position: [-1.6, 0.04, -0.4], scale: 0.35 },
    { position: [0.3, 0.04, 0.7], scale: 0.28 },
    { position: [1.5, 0.04, -0.3], scale: 0.4 },
  ];

  const edgeRocks = [
    [-3.4, 0.18, -0.6, 0.65],
    [-2.7, 0.15, 1.4, 0.5],
    [-1, 0.13, 2.1, 0.45],
    [1.3, 0.14, 2, 0.5],
    [3.1, 0.16, 1, 0.6],
    [3.5, 0.13, -0.8, 0.45],
    [2.1, 0.14, -2, 0.5],
    [-1.4, 0.13, -2.1, 0.4],
  ];

  const reeds = [
    [-2.5, -1.5],
    [-2.25, -1.6],
    [-2, -1.5],
    [2.3, 1.25],
    [2.55, 1.35],
    [2.8, 1.2],
  ];

  return (
    <group position={[6, 0.02, 2]}>
      {/* Shore */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        scale={[1.35, 1, 1]}
        receiveShadow
      >
        <ringGeometry args={[3.05, 3.65, 64]} />
        <meshStandardMaterial color="#c4b382" roughness={1} />
      </mesh>

      {/* Water */}
      <mesh
        position={[0, 0.025, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        scale={[1.35, 1, 1]}
      >
        <circleGeometry args={[3.1, 64]} />
        <meshPhysicalMaterial
          color="#65b9c2"
          transparent
          opacity={0.9}
          roughness={0.18}
          metalness={0}
          clearcoat={0.8}
          clearcoatRoughness={0.2}
        />
      </mesh>

      {/* Water highlight */}
      <mesh
        position={[-0.5, 0.04, -0.2]}
        rotation={[-Math.PI / 2, 0, 0]}
        scale={[1.4, 1, 0.8]}
      >
        <circleGeometry args={[1.8, 48]} />
        <meshBasicMaterial
          color="#a4e2df"
          transparent
          opacity={0.3}
          depthWrite={false}
        />
      </mesh>

      {/* Lily pads */}
      {lilyPads.map((pad, index) => (
        <mesh
          key={index}
          position={pad.position}
          rotation={[-Math.PI / 2, 0, index * 0.7]}
          scale={[pad.scale * 1.3, pad.scale, 1]}
        >
          <circleGeometry args={[1, 20]} />
          <meshStandardMaterial color="#4f9a62" roughness={1} />
        </mesh>
      ))}

      {/* Pond rocks */}
      {edgeRocks.map(([x, y, z, scale], index) => (
        <mesh
          key={index}
          position={[x, y, z]}
          scale={[scale, scale * 0.6, scale]}
          rotation={[0.1, index * 0.8, -0.08]}
          castShadow
          receiveShadow
        >
          <dodecahedronGeometry args={[0.6, 0]} />
          <meshStandardMaterial
            color={index % 2 ? "#9a9b8f" : "#aaa897"}
            roughness={1}
            flatShading
          />
        </mesh>
      ))}

      {/* Reeds */}
      {reeds.map(([x, z], index) => (
        <group key={index} position={[x, 0, z]}>
          <mesh position={[0, 0.45, 0]}>
            <cylinderGeometry args={[0.025, 0.035, 0.9, 6]} />
            <meshStandardMaterial color="#518459" />
          </mesh>

          <mesh position={[0, 0.95, 0]}>
            <capsuleGeometry args={[0.06, 0.2, 4, 8]} />
            <meshStandardMaterial color="#795f3f" />
          </mesh>
        </group>
      ))}
    </group>
  );
}

export default function Environment() {
  return (
    <>
      <color attach="background" args={["#bfe5f5"]} />
      <fog attach="fog" args={["#cceaf4", 28, 55]} />

      <Sky
        distance={450000}
        sunPosition={[5, 8, 4]}
        inclination={0.55}
        azimuth={0.18}
      />

      <hemisphereLight args={["#dff5ff", "#789557", 1.8]} />

      <directionalLight
        position={[-8, 14, 8]}
        intensity={2.8}
        color="#fff1d2"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={0.5}
        shadow-camera-far={45}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
        shadow-bias={-0.0002}
      />

      {/* Large meadow */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[16, 128]} />
        <meshStandardMaterial color="#82bd69" roughness={1} />
      </mesh>

      {/* Inner grass */}
      <mesh
        position={[0, 0.006, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
      >
        <circleGeometry args={[13.5, 96]} />
        <meshStandardMaterial color="#91c978" roughness={1} />
      </mesh>

      {/* Distant hills */}
      <mesh position={[-12, -2.5, -13]} scale={[10, 4, 6]}>
        <sphereGeometry args={[1, 24, 16]} />
        <meshStandardMaterial color="#9ccb80" roughness={1} />
      </mesh>

      <mesh position={[11, -2.7, -15]} scale={[11, 4.5, 7]}>
        <sphereGeometry args={[1, 24, 16]} />
        <meshStandardMaterial color="#77ad68" roughness={1} />
      </mesh>

      <mesh position={[0, -3, -19]} scale={[14, 5, 8]}>
        <sphereGeometry args={[1, 24, 16]} />
        <meshStandardMaterial color="#a7d28b" roughness={1} />
      </mesh>

      <Pond />

      {/* Trees around the perimeter */}
      <Tree position={[-11, 0, -7]} scale={1.5} />
      <Tree position={[-10, 0, 5]} scale={1.15} color="#619a59" />
      <Tree position={[-6, 0, -11]} scale={1.25} />
      <Tree position={[11, 0, -8]} scale={1.4} />
      <Tree position={[12, 0, 6]} scale={1.05} color="#8abe6c" />
      <Tree position={[2, 0, -12]} scale={1.2} />

      {/* Bushes */}
      <Bush position={[-8, 0, -6]} scale={1.1} />
      <Bush position={[-10, 0, 1]} scale={0.9} />
      <Bush position={[10, 0, -7]} scale={1} />
      <Bush position={[11, 0, 8]} scale={0.85} />
      <Bush position={[-5, 0, 10]} scale={0.8} />
      <Bush position={[4, 0, -10]} scale={0.9} />

      {/* Scattered rocks */}
      <Rock position={[-7, 0.35, 5]} scale={1} />
      <Rock position={[-4, 0.25, -7]} scale={0.7} />
      <Rock position={[10, 0.3, 8]} scale={0.85} />
      <Rock position={[1, 0.22, -9]} scale={0.6} />
      <Rock
        position={[-10, 0.25, -2]}
        scale={0.75}
        color="#979b98"
      />

      {/* Decorative edge flowers */}
      <TinyFlower position={[-7, 0, 2]} color="#f8b9ce" />
      <TinyFlower position={[-5, 0, 7]} color="#fff1a8" />
      <TinyFlower position={[-2, 0, -8]} color="#c8b7f4" />
      <TinyFlower position={[9, 0, -4]} color="#f7c2d4" />
      <TinyFlower position={[11, 0, 3]} color="#f8e193" />
      <TinyFlower position={[2, 0, 9]} color="#c8b7f4" />

      {/* Clouds */}
      <Cloud position={[-11, 10, -24]} scale={1.8} />
      <Cloud position={[10, 9, -27]} scale={1.5} />
      <Cloud position={[0, 12, -32]} scale={1.2} />

      <ContactShadows
        position={[0, 0.02, 0]}
        opacity={0.25}
        scale={32}
        blur={2.5}
        far={12}
        resolution={512}
        color="#47653e"
      />
    </>
  );
}