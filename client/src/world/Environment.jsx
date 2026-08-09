import { ContactShadows, Sky, Text } from "@react-three/drei";
import {
  LANDFILL_CENTRE,
  LANDFILL_RADIUS,
} from "../utils/landfill";
import { PONDS, WALKING_HILLS } from "./worldLayout";

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
      position={[
        position[0],
        position[1] - 0.12 * scale,
        position[2],
      ]}
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

function SmallHill({ hill }) {
  return (
    <mesh
      position={[hill.x, -hill.height * 0.68, hill.z]}
      scale={[hill.width, hill.height, hill.depth]}
      receiveShadow
      raycast={() => null}
    >
      <sphereGeometry args={[1, 28, 16]} />
      <meshStandardMaterial
        color={hill.color}
        roughness={1}
        flatShading
      />
    </mesh>
  );
}

function GrassTuft({ position, scale = 1, golden = false }) {
  const blades = [
    [-0.18, 0.34, -0.25],
    [-0.08, 0.48, -0.12],
    [0, 0.56, 0],
    [0.1, 0.45, 0.14],
    [0.2, 0.32, 0.26],
  ];

  return (
    <group position={position} scale={scale}>
      {blades.map(([offset, height, lean], index) => (
        <mesh
          key={index}
          position={[offset, height / 2, Math.abs(offset) * 0.18]}
          rotation={[0, index * 0.32, lean]}
          raycast={() => null}
        >
          <coneGeometry args={[0.045, height, 4]} />
          <meshStandardMaterial
            color={
              golden
                ? index % 2 ? "#9c9f54" : "#b0ad5e"
                : index % 2 ? "#4f7f48" : "#638f50"
            }
            roughness={1}
          />
        </mesh>
      ))}
    </group>
  );
}

function FallenLog({ position, rotation = 0, scale = 1 }) {
  return (
    <group position={position} rotation={[0, rotation, 0]} scale={scale}>
      <mesh
        position={[0, 0.22, 0]}
        rotation={[0, 0, Math.PI / 2]}
        castShadow
      >
        <cylinderGeometry args={[0.22, 0.27, 2.4, 9]} />
        <meshStandardMaterial color="#75523b" roughness={1} />
      </mesh>
      <mesh position={[-1.21, 0.22, 0]} rotation={[0, Math.PI / 2, 0]}>
        <circleGeometry args={[0.22, 9]} />
        <meshStandardMaterial color="#a37a50" roughness={1} />
      </mesh>
      <mesh position={[0.35, 0.44, 0]} scale={[0.55, 0.12, 0.28]}>
        <sphereGeometry args={[1, 10, 6]} />
        <meshStandardMaterial color="#668e4f" roughness={1} />
      </mesh>
    </group>
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
          <sphereGeometry args={[size, 12, 8]} />

          <meshStandardMaterial
            color="#fff1dd"
            roughness={1}
            emissive="#ffdab8"
            emissiveIntensity={0.08}
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

const GROUND_PATCHES = [
  [-9, -3, 3.8, 2.1, 0.25, "#83aa5f"],
  [-7, 8, 3.1, 1.7, -0.35, "#9fc477"],
  [-3, -10, 4.4, 2.2, 0.15, "#7fa65d"],
  [-2, 4, 2.8, 1.5, 0.55, "#a2c67a"],
  [3, 8, 3.5, 1.8, -0.2, "#86ad63"],
  [8, -7, 3.7, 2, 0.4, "#9bc071"],
  [12, 1, 2.8, 1.4, -0.5, "#7da45b"],
  [-12, 4, 3.2, 1.6, 0.2, "#a0bd70"],
  [0, 13, 4.5, 2.3, -0.1, "#82a85e"],
  [5, -13, 4, 2.1, 0.35, "#9abe70"],
  [-14, -8, 4.8, 2.5, -0.25, "#6f9651"],
  [14, 10, 4.2, 2.2, 0.3, "#719952"],
  [-25, 12, 6.5, 3.4, -0.2, "#9fc477"],
  [-31, 3, 5.8, 3.1, 0.35, "#8db468"],
  [7, 29, 7.5, 3.8, -0.3, "#a4b96c"],
  [20, 25, 6.2, 3.2, 0.25, "#98ad62"],
  [29, 10, 7, 3.4, -0.4, "#779f59"],
  [27, -12, 6.8, 3.5, 0.2, "#729851"],
  [17, -29, 7.2, 3.6, -0.15, "#83a85c"],
  [-8, -31, 7.5, 3.8, 0.3, "#759d55"],
  [-29, -20, 6.5, 3.3, -0.25, "#86aa61"],
];

const REGION_PATCHES = [
  [-24, 12, 12, 8, -0.15, "#96bd70"],
  [24, -12, 13, 9, 0.25, "#6f9855"],
  [10, 27, 14, 8, -0.1, "#9caf64"],
  [-18, -27, 12, 7, 0.2, "#7ca158"],
];

const WORN_PATCHES = [
  [-5, -1, 1.6, 0.7, 0.25],
  [-1.5, 0.5, 1.25, 0.55, -0.15],
  [2, 0.9, 1.45, 0.6, 0.2],
  [4.5, 1.25, 1.15, 0.5, -0.1],
  [8.5, 5.5, 1.5, 0.65, 0.45],
];

const GRASS_TUFTS = [
  [-8.5, -4.5, 0.7],
  [-6.5, 8.5, 0.85],
  [-3, 5.5, 0.65],
  [-1, -9, 0.75],
  [2.5, 7.5, 0.8],
  [4, -7.5, 0.65],
  [8.5, -6, 0.8],
  [10.5, 7, 0.7],
  [-10.5, 3.5, 0.75],
  [0.5, 11, 0.7],
  [-28, 9, 0.9],
  [-22, 18, 0.8],
  [-15, 29, 0.9],
  [8, 31, 0.85],
  [20, 24, 0.9],
  [30, 12, 0.85],
  [27, -16, 0.95],
  [15, -30, 0.8],
  [-10, -33, 0.9],
  [-29, -18, 0.85],
  [-34, 13, 0.7],
  [-30, 19, 0.75],
  [-25, 7, 0.68],
  [-20, 13, 0.82],
  [-17, 22, 0.72],
  [-7, 27, 0.78],
  [1, 25, 0.72],
  [6, 34, 0.8],
  [13, 27, 0.68],
  [19, 32, 0.76],
  [25, 20, 0.72],
  [33, 15, 0.82],
  [35, 2, 0.74],
  [31, -8, 0.78],
  [24, -20, 0.72],
  [18, -34, 0.8],
  [5, -28, 0.7],
  [-2, -36, 0.76],
  [-18, -25, 0.72],
  [-33, -10, 0.8],
];

function GroundDetails() {
  return (
    <group>
      {REGION_PATCHES.map(([x, z, width, depth, rotation, color], index) => (
        <mesh
          key={`region-patch-${index}`}
          position={[x, 0.007 + index * 0.0001, z]}
          rotation={[-Math.PI / 2, 0, rotation]}
          scale={[width, depth, 1]}
          receiveShadow
          raycast={() => null}
        >
          <circleGeometry args={[1, 20]} />
          <meshStandardMaterial color={color} roughness={1} />
        </mesh>
      ))}

      {GROUND_PATCHES.map(([x, z, width, depth, rotation, color], index) => (
        <mesh
          key={`grass-patch-${index}`}
          position={[x, 0.009 + index * 0.0001, z]}
          rotation={[-Math.PI / 2, 0, rotation]}
          scale={[width, depth, 1]}
          receiveShadow
          raycast={() => null}
        >
          <circleGeometry args={[1, 12]} />
          <meshStandardMaterial color={color} roughness={1} />
        </mesh>
      ))}

      {WORN_PATCHES.map(([x, z, width, depth, rotation], index) => (
        <mesh
          key={`worn-patch-${index}`}
          position={[x, 0.012 + index * 0.0001, z]}
          rotation={[-Math.PI / 2, 0, rotation]}
          scale={[width, depth, 1]}
          receiveShadow
          raycast={() => null}
        >
          <circleGeometry args={[1, 10]} />
          <meshStandardMaterial color="#b7b273" roughness={1} />
        </mesh>
      ))}

      {GRASS_TUFTS.map(([x, z, scale], index) => (
        <GrassTuft
          key={`grass-tuft-${index}`}
          position={[x, 0.025, z]}
          scale={scale}
          golden={z > 20 && x > -5}
        />
      ))}
    </group>
  );
}

function Pond({ pond }) {
  const lilyPads = [
    { position: [-1.6, 0.09, -0.4], scale: 0.35 },
    { position: [0.3, 0.09, 0.7], scale: 0.28 },
    { position: [1.5, 0.09, -0.3], scale: 0.4 },
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

  const submergedStones = [
    [-1.8, -0.7, 0.42],
    [-0.4, 1.25, 0.3],
    [1.15, 0.65, 0.36],
    [2, -0.9, 0.28],
  ];

  const ripples = [
    [-1.2, -0.2, 0.5],
    [0.9, 0.85, 0.38],
    [1.65, -0.8, 0.3],
  ];

  return (
    <group
      position={[pond.x, 0.02, pond.z]}
      scale={[pond.scale, 1, pond.scale]}
    >
      {/* Darker pond bed gives the transparent water visible depth. */}
      <mesh
        position={[0, 0.012, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        scale={[1.35, 1, 1]}
        receiveShadow
        raycast={() => null}
      >
        <circleGeometry args={[3.04, 64]} />
        <meshStandardMaterial color="#477f78" roughness={1} />
      </mesh>

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
        position={[0, 0.2, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        scale={[1.35, 1, 1]}
        renderOrder={3}
        raycast={() => null}
      >
        <circleGeometry args={[3.1, 64]} />

        <meshPhysicalMaterial
          color="#65b9c2"
          transparent
          opacity={0.48}
          roughness={0.12}
          metalness={0}
          clearcoat={1}
          clearcoatRoughness={0.12}
          depthWrite={false}
        />
      </mesh>

      {/* Water highlight */}
      <mesh
        position={[-0.5, 0.205, -0.2]}
        rotation={[-Math.PI / 2, 0, 0]}
        scale={[1.4, 1, 0.8]}
      >
        <circleGeometry args={[1.8, 48]} />

        <meshBasicMaterial
          color="#a4e2df"
          transparent
          opacity={0.18}
          depthWrite={false}
        />
      </mesh>

      {/* Submerged stones remain visible through the shallow water. */}
      {submergedStones.map(([x, z, scale], index) => (
        <mesh
          key={`submerged-stone-${index}`}
          position={[x, 0.08, z]}
          scale={[scale * 1.25, scale * 0.45, scale]}
          rotation={[0.1, index * 0.9, -0.08]}
          raycast={() => null}
        >
          <dodecahedronGeometry args={[0.6, 0]} />
          <meshStandardMaterial
            color={index % 2 ? "#668f85" : "#72998e"}
            roughness={0.9}
          />
        </mesh>
      ))}

      {/* Soft ripple rings help the transparent surface read as water. */}
      {ripples.map(([x, z, scale], index) => (
        <mesh
          key={`pond-ripple-${index}`}
          position={[x, 0.212 + index * 0.001, z]}
          rotation={[-Math.PI / 2, 0, index * 0.45]}
          scale={[scale * 1.4, scale, 1]}
          renderOrder={4}
          raycast={() => null}
        >
          <ringGeometry args={[0.72, 0.82, 28]} />
          <meshBasicMaterial
            color="#d8f4ec"
            transparent
            opacity={0.28}
            depthWrite={false}
          />
        </mesh>
      ))}

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

function DistantTree({ position, scale }) {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.6, 0]}>
        <cylinderGeometry args={[0.09, 0.14, 1.2, 6]} />
        <meshStandardMaterial color="#72513d" />
      </mesh>

      <mesh position={[0, 1.55, 0]}>
        <coneGeometry args={[0.65, 1.8, 7]} />

        <meshStandardMaterial
          color="#456f4b"
          roughness={1}
          flatShading
        />
      </mesh>

      <mesh position={[0, 2.15, 0]}>
        <coneGeometry args={[0.48, 1.4, 7]} />

        <meshStandardMaterial
          color="#557f50"
          roughness={1}
          flatShading
        />
      </mesh>
    </group>
  );
}

function Landfill() {
  return (
    <group
      position={[
        LANDFILL_CENTRE.x,
        0,
        LANDFILL_CENTRE.z,
      ]}
    >
      {/* Bare dirt floor of the dump. */}
      <mesh
        position={[0, 0.012, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
      >
        <circleGeometry
          args={[LANDFILL_RADIUS, 48]}
        />

        <meshStandardMaterial
          color="#8a7f6b"
          roughness={1}
        />
      </mesh>

      {/* Darker scuffed centre. */}
      <mesh
        position={[0.3, 0.014, -0.2]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <circleGeometry
          args={[LANDFILL_RADIUS * 0.6, 32]}
        />

        <meshStandardMaterial
          color="#7a6f5c"
          roughness={1}
        />
      </mesh>

      {/* Signpost, facing the meadow. */}
      <group
        position={[
          LANDFILL_RADIUS * 0.55,
          0,
          LANDFILL_RADIUS * 0.72,
        ]}
        rotation={[0, Math.PI * 0.22, 0]}
      >
        <mesh position={[0, 0.62, 0]} castShadow>
          <cylinderGeometry
            args={[0.075, 0.09, 1.24, 8]}
          />

          <meshStandardMaterial
            color="#8a6a45"
            roughness={0.9}
          />
        </mesh>

        <mesh position={[0, 1.32, 0]} castShadow>
          <boxGeometry
            args={[1.65, 0.62, 0.09]}
          />

          <meshStandardMaterial
            color="#c8a06a"
            roughness={0.85}
          />
        </mesh>

        <Text
          position={[0, 1.32, 0.055]}
          fontSize={0.26}
          color="#4a3823"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0}
        >
          LANDFILL
        </Text>
      </group>

      {/* Scattered rubble. */}
      <mesh
        position={[-1.1, 0.16, 0.5]}
        castShadow
      >
        <dodecahedronGeometry args={[0.2, 0]} />

        <meshStandardMaterial
          color="#9b958a"
          roughness={0.95}
        />
      </mesh>

      <mesh
        position={[0.45, 0.13, -1.15]}
        castShadow
      >
        <dodecahedronGeometry args={[0.15, 0]} />

        <meshStandardMaterial
          color="#8c8579"
          roughness={0.95}
        />
      </mesh>

      <mesh
        position={[-0.7, 0.12, -0.9]}
        castShadow
      >
        <dodecahedronGeometry args={[0.13, 0]} />

        <meshStandardMaterial
          color="#a39c90"
          roughness={0.95}
        />
      </mesh>

      <mesh
        position={[1.2, 0.15, 0.15]}
        castShadow
      >
        <dodecahedronGeometry args={[0.17, 0]} />

        <meshStandardMaterial
          color="#9b958a"
          roughness={0.95}
        />
      </mesh>
    </group>
  );
}

function SettingSun() {
  return (
    <mesh position={[-42, 14, -66]}>
      <sphereGeometry args={[4.2, 32, 24]} />

      <meshBasicMaterial
        color="#ffd078"
        toneMapped={false}
      />
    </mesh>
  );
}

/*
 * Trees form a complete ring around the meadow.
 * The radius varies slightly so the line does not look artificial.
 */
const DISTANT_TREES = Array.from({ length: 150 }, (_, index) => {
  const angle = (index / 150) * Math.PI * 2;
  const radius = 49 + (index % 6) * 0.8;

  return {
    position: [
      Math.cos(angle) * radius,
      0,
      Math.sin(angle) * radius,
    ],
    scale: 0.75 + (index % 4) * 0.12,
  };
});

/*
 * Hills form a larger ring behind the distant trees.
 */
const HORIZON_HILLS = Array.from({ length: 22 }, (_, index) => {
  const angle = (index / 22) * Math.PI * 2;
  const radius = 66 + (index % 3) * 2.5;

  const colours = [
    "#82945e",
    "#687f54",
    "#718454",
    "#929b61",
  ];

  return {
    position: [
      Math.cos(angle) * radius,
      -6 - (index % 2) * 0.8,
      Math.sin(angle) * radius,
    ],
    rotation: [0, angle + Math.PI / 2, 0],
    scale: [
      15 + (index % 4) * 1.8,
      7 + (index % 3),
      10 + (index % 2) * 1.5,
    ],
    color: colours[index % colours.length],
  };
});

/*
 * Clouds form a ring above the entire environment.
 */
const SURROUNDING_CLOUDS = Array.from(
  { length: 18 },
  (_, index) => {
    const angle = (index / 18) * Math.PI * 2;
    const radius = 48 + (index % 3) * 6;

    return {
      position: [
        Math.cos(angle) * radius,
        13 + (index % 4) * 2,
        Math.sin(angle) * radius,
      ],
      scale: 1.4 + (index % 3) * 0.4,
    };
  }
);

export default function Environment() {
  return (
    <>
      {/* Golden-hour atmosphere */}
      <color attach="background" args={["#efad7d"]} />
      <fog attach="fog" args={["#eab586", 58, 135]} />

      <Sky
        distance={450000}
        sunPosition={[-20, 4, -25]}
        turbidity={10}
        rayleigh={2}
        mieCoefficient={0.008}
        mieDirectionalG={0.85}
      />

      <SettingSun />

      {/* Lighting */}
      <hemisphereLight
        args={["#ffd9b0", "#65784d", 1.3]}
      />

      <directionalLight
        position={[-34, 22, -28]}
        intensity={3.5}
        color="#ffb65c"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={0.5}
        shadow-camera-far={130}
        shadow-camera-left={-58}
        shadow-camera-right={58}
        shadow-camera-top={58}
        shadow-camera-bottom={-58}
        shadow-bias={-0.0002}
      />

      <ambientLight intensity={0.45} color="#ffd5b0" />

      {/* Large outer meadow */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[58, 160]} />

        <meshStandardMaterial
          color="#769d57"
          roughness={1}
        />
      </mesh>

      {/* Lighter inner meadow */}
      <mesh
        position={[0, 0.006, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
      >
        <circleGeometry args={[46, 160]} />

        <meshStandardMaterial
          color="#91b968"
          roughness={1}
        />
      </mesh>

      <GroundDetails />

      {/* Low rolling mounds break up the walkable meadow without walls. */}
      <group>
        {WALKING_HILLS.map((hill, index) => (
          <SmallHill key={`walking-hill-${index}`} hill={hill} />
        ))}
      </group>

      {/* Complete hill ring */}
      <group>
        {HORIZON_HILLS.map((hill, index) => (
          <mesh
            key={index}
            position={hill.position}
            rotation={hill.rotation}
            scale={hill.scale}
            receiveShadow
          >
            <sphereGeometry args={[1, 24, 16]} />

            <meshStandardMaterial
              color={hill.color}
              roughness={1}
              flatShading
            />
          </mesh>
        ))}
      </group>

      {/* Complete distant forest ring */}
      <group>
        {DISTANT_TREES.map((tree, index) => (
          <DistantTree
            key={index}
            position={tree.position}
            scale={tree.scale}
          />
        ))}
      </group>

      {/* Ponds share their layout with the creature spawning system. */}
      {PONDS.map((pond) => (
        <Pond key={pond.id} pond={pond} />
      ))}

      {/* Larger foreground trees */}
      <Tree position={[-11, 0, -7]} scale={1.5} />
      <Tree
        position={[-10, 0, 5]}
        scale={1.15}
        color="#619a59"
      />
      <Tree position={[-6, 0, -11]} scale={1.25} />
      <Tree position={[11, 0, -8]} scale={1.4} />
      <Tree
        position={[12, 0, 6]}
        scale={1.05}
        color="#8abe6c"
      />
      <Tree position={[2, 0, -12]} scale={1.2} />

      {/* Additional trees behind the starting camera */}
      <Tree position={[-8, 0, 12]} scale={1.25} />
      <Tree position={[0, 0, 14]} scale={1.1} />
      <Tree position={[9, 0, 12]} scale={1.3} />

      {/* Woodland edge in the east and south */}
      <Tree position={[24, 0, -8]} scale={1.55} color="#5e9255" />
      <Tree position={[29, 0, -15]} scale={1.35} color="#6a9e5b" />
      <Tree position={[21, 0, -22]} scale={1.45} />
      <Tree position={[11, 0, -31]} scale={1.3} color="#629457" />
      <Tree position={[-3, 0, -35]} scale={1.5} />
      <Tree position={[-19, 0, -29]} scale={1.35} color="#719f5d" />

      {/* Sparse trees framing the flower and golden fields */}
      <Tree position={[-32, 0, 6]} scale={1.25} color="#79a965" />
      <Tree position={[-29, 0, 22]} scale={1.4} />
      <Tree position={[-16, 0, 33]} scale={1.3} color="#6b9d59" />
      <Tree position={[5, 0, 36]} scale={1.35} />
      <Tree position={[23, 0, 29]} scale={1.25} color="#83ad68" />
      <Tree position={[34, 0, 11]} scale={1.45} />

      {/* Bushes around the meadow */}
      <Bush position={[-8, 0, -6]} scale={1.1} />
      <Bush position={[-10, 0, 1]} scale={0.9} />
      <Bush position={[10, 0, -7]} scale={1} />
      <Bush position={[11, 0, 8]} scale={0.85} />
      <Bush position={[-5, 0, 10]} scale={0.8} />
      <Bush position={[4, 0, -10]} scale={0.9} />
      <Bush position={[5, 0, 12]} scale={0.85} />
      <Bush position={[-11, 0, 8]} scale={0.9} />
      <Bush position={[-25, 0, 15]} scale={1.05} />
      <Bush position={[-34, 0, -4]} scale={0.95} />
      <Bush position={[25, 0, -4]} scale={1.15} />
      <Bush position={[31, 0, -19]} scale={1} />
      <Bush position={[16, 0, -32]} scale={0.9} />
      <Bush position={[18, 0, 27]} scale={1} />

      {/* Mossy fallen timber gives the woodland a quieter identity. */}
      <FallenLog position={[25, 0, -18]} rotation={0.35} scale={1.05} />
      <FallenLog position={[14, 0, -34]} rotation={-0.55} scale={0.85} />

      {/* Rocks */}
      <Rock position={[-7, 0.35, 5]} scale={1} />
      <Rock position={[-4, 0.25, -7]} scale={0.7} />
      <Rock position={[10, 0.3, 8]} scale={0.85} />
      <Rock position={[1, 0.22, -9]} scale={0.6} />
      <Rock
        position={[-10, 0.25, -2]}
        scale={0.75}
        color="#979b98"
      />
      <Rock position={[-24, 0.28, 24]} scale={0.8} />
      <Rock position={[18, 0.3, 31]} scale={0.85} color="#9ba094" />
      <Rock position={[30, 0.38, -9]} scale={1.05} />
      <Rock position={[-16, 0.3, -31]} scale={0.9} color="#92998f" />

      {/* Decorative flowers */}
      <TinyFlower position={[-7, 0, 2]} color="#f8b9ce" />
      <TinyFlower position={[-5, 0, 7]} color="#fff1a8" />
      <TinyFlower position={[-2, 0, -8]} color="#c8b7f4" />
      <TinyFlower position={[9, 0, -4]} color="#f7c2d4" />
      <TinyFlower position={[11, 0, 3]} color="#f8e193" />
      <TinyFlower position={[2, 0, 9]} color="#c8b7f4" />

      {/* Wildflower field in the north-west glade */}
      <TinyFlower position={[-31, 0, 12]} color="#f7bfd2" />
      <TinyFlower position={[-28, 0, 17]} color="#fff1a8" />
      <TinyFlower position={[-25, 0, 9]} color="#c8b7f4" />
      <TinyFlower position={[-22, 0, 15]} color="#f4d0a7" />
      <TinyFlower position={[-19, 0, 8]} color="#f7bfd2" />
      <TinyFlower position={[-17, 0, 19]} color="#fff1a8" />
      <TinyFlower position={[-27, 0, 5]} color="#d7c7f7" />
      <TinyFlower position={[-21, 0, 23]} color="#f4b8c9" />

      {/* A few blooms blend the glade back into the central meadow */}
      <TinyFlower position={[-14, 0, 12]} color="#fff1a8" />
      <TinyFlower position={[-11, 0, 17]} color="#c8b7f4" />
      <TinyFlower position={[-7, 0, 21]} color="#f7c2d4" />

      {/* Landfill in the back-left corner */}
      <Landfill />

      {/* Complete cloud ring */}
      <group>
        {SURROUNDING_CLOUDS.map((cloud, index) => (
          <Cloud
            key={index}
            position={cloud.position}
            scale={cloud.scale}
          />
        ))}
      </group>

      <ContactShadows
        position={[0, 0.02, 0]}
        opacity={0.32}
        scale={92}
        blur={2.5}
        far={24}
        resolution={512}
        color="#473d2e"
      />
    </>
  );
}
