import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  Canvas,
  useFrame,
  useThree,
} from "@react-three/fiber";

import {
  OrbitControls,
  PointerLockControls,
} from "@react-three/drei";

import {
  EffectComposer,
  Pixelation,
} from "@react-three/postprocessing";

import * as THREE from "three";

import AnimatedCreation from "./AnimatedCreation";
import InteractionController from "./InteractionController";
import Environment from "./Environment";

const WIDE_POSITION = [0, 11, 24];
const FIRST_PERSON_POSITION = [0, 1.4, 12];
const WORLD_BOUNDARY = 20;
const GROUND_HEIGHT = 1.4;

const CLASS_INFO = {
  flower: {
    label: "Flower",
    description:
      "A flowering plant that can provide pollen and nectar.",
  },

  tree: {
    label: "Tree",
    description:
      "A large plant that provides shelter, food and habitat.",
  },

  bush: {
    label: "Bush",
    description:
      "A dense plant that provides food and cover for small animals.",
  },

  mushroom: {
    label: "Mushroom",
    description:
      "A fungus that helps recycle nutrients in an ecosystem.",
  },

  rabbit: {
    label: "Rabbit",
    description:
      "A herbivore known for powerful hind legs and quick hops.",
  },

  toad: {
    label: "Toad",
    description:
      "An amphibian commonly found around damp habitats and ponds.",
  },

  bug: {
    label: "Bug",
    description:
      "A small invertebrate that crawls through the meadow.",
  },

  snail: {
    label: "Snail",
    description:
      "A slow-moving mollusc with a protective shell.",
  },

  butterfly: {
    label: "Butterfly",
    description:
      "A flying insect that can help pollinate flowering plants.",
  },

  bird: {
    label: "Bird",
    description:
      "A feathered animal that flies above the park.",
  },

  fish: {
    label: "Fish",
    description:
      "An aquatic animal that lives and swims in the pond.",
  },

  duck: {
    label: "Duck",
    description:
      "A water bird capable of swimming, walking and flying.",
  },

  mammal: {
    label: "Mammal",
    description:
      "A warm-blooded park visitor that roams the meadow.",
  },

  fruit: {
    label: "Fruit",
    description:
      "Ripe and hanging from a branch - part of the park's harvest.",
  },

  landfill: {
    label: "Litter",
    description:
      "Not part of the park's ecosystem - this one belongs in the landfill.",
  },
};

function displayCreationName(value, fallback) {
  const name = value?.trim();
  return name && name !== "Unnamed Creation"
    ? name
    : fallback;
}

function displayCreationNumber(creation) {
  if (creation?.isPending) {
    return "#?";
  }

  return `#${creation.id}`;
}

// "teddy bear" -> "Teddy Bear", for the species shown on the card.
function titleCaseLabel(value) {
  return value
    .split(" ")
    .filter(Boolean)
    .map(
      (word) =>
        word.charAt(0).toUpperCase() +
        word.slice(1)
    )
    .join(" ");
}

function normalizeClassification(creation) {
  return (
    creation?.classification ||
    creation?.category ||
    "flower"
  ).toLowerCase();
}

function FirstPersonController({ active }) {
  const { camera } = useThree();

  const keys = useRef({});
  const verticalPosition = useRef(GROUND_HEIGHT);
  const verticalVelocity = useRef(0);
  const grounded = useRef(true);
  const bobTime = useRef(0);

  useEffect(() => {
    if (!active) return;

    camera.position.set(...FIRST_PERSON_POSITION);
    camera.rotation.order = "YXZ";
    camera.lookAt(0, GROUND_HEIGHT, 0);

    verticalPosition.current = GROUND_HEIGHT;
    verticalVelocity.current = 0;
    grounded.current = true;
    bobTime.current = 0;

    function handleKeyDown(event) {
      keys.current[event.code] = true;

      if (
        event.code === "Space" &&
        grounded.current &&
        !event.repeat
      ) {
        verticalVelocity.current = 5;
        grounded.current = false;
      }

      if (
        event.code === "Space" ||
        event.code.startsWith("Arrow")
      ) {
        event.preventDefault();
      }
    }

    function handleKeyUp(event) {
      keys.current[event.code] = false;
    }

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    window.addEventListener(
      "keyup",
      handleKeyUp
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown
      );

      window.removeEventListener(
        "keyup",
        handleKeyUp
      );

      keys.current = {};
    };
  }, [active, camera]);

  useFrame((_, delta) => {
    if (!active) return;

    const safeDelta = Math.min(delta, 0.1);
    const movementSpeed = 4.5;
    const gravity = 12;

    const movement = new THREE.Vector3();
    const forward = new THREE.Vector3();

    camera.getWorldDirection(forward);

    // Ignore camera tilt while moving.
    forward.y = 0;
    forward.normalize();

    const right = new THREE.Vector3()
      .crossVectors(forward, camera.up)
      .normalize();

    if (
      keys.current.KeyW ||
      keys.current.ArrowUp
    ) {
      movement.add(forward);
    }

    if (
      keys.current.KeyS ||
      keys.current.ArrowDown
    ) {
      movement.sub(forward);
    }

    if (
      keys.current.KeyD ||
      keys.current.ArrowRight
    ) {
      movement.add(right);
    }

    if (
      keys.current.KeyA ||
      keys.current.ArrowLeft
    ) {
      movement.sub(right);
    }

    const isWalking =
      movement.lengthSq() > 0;

    if (isWalking) {
      movement
        .normalize()
        .multiplyScalar(
          movementSpeed * safeDelta
        );

      camera.position.x += movement.x;
      camera.position.z += movement.z;
    }

    // Jumping and gravity.
    verticalVelocity.current -=
      gravity * safeDelta;

    verticalPosition.current +=
      verticalVelocity.current * safeDelta;

    if (
      verticalPosition.current <=
      GROUND_HEIGHT
    ) {
      verticalPosition.current =
        GROUND_HEIGHT;

      verticalVelocity.current = 0;
      grounded.current = true;
    }

    // Subtle walking bob.
    let headBob = 0;

    if (isWalking && grounded.current) {
      bobTime.current += safeDelta * 10;

      headBob =
        Math.sin(bobTime.current) * 0.045;
    } else {
      bobTime.current = 0;
    }

    camera.position.y =
      verticalPosition.current + headBob;

    // Keep the player inside the world.
    const distanceFromCentre = Math.hypot(
      camera.position.x,
      camera.position.z
    );

    if (
      distanceFromCentre >
      WORLD_BOUNDARY
    ) {
      const angle = Math.atan2(
        camera.position.z,
        camera.position.x
      );

      camera.position.x =
        Math.cos(angle) * WORLD_BOUNDARY;

      camera.position.z =
        Math.sin(angle) * WORLD_BOUNDARY;
    }
  });

  return null;
}

function CameraTransition({ mode, onComplete }) {
  const { camera } = useThree();
  const transition = useRef(null);

  useEffect(() => {
    if (mode === "wide") {
      camera.position.set(...WIDE_POSITION);
      camera.rotation.order = "XYZ";
      camera.rotation.set(0, 0, 0);
      camera.lookAt(0, 1, 0);
      transition.current = null;
      return;
    }

    if (mode !== "entering" && mode !== "exiting") {
      transition.current = null;
      return;
    }

    const targetPosition = new THREE.Vector3(
      ...(mode === "entering" ? FIRST_PERSON_POSITION : WIDE_POSITION)
    );
    const targetCamera = camera.clone();
    targetCamera.position.copy(targetPosition);
    targetCamera.rotation.order = mode === "entering" ? "YXZ" : "XYZ";
    targetCamera.lookAt(0, mode === "entering" ? GROUND_HEIGHT : 1, 0);

    transition.current = {
      elapsed: 0,
      duration: mode === "entering" ? 1.35 : 1.1,
      startPosition: camera.position.clone(),
      startQuaternion: camera.quaternion.clone(),
      targetPosition,
      targetQuaternion: targetCamera.quaternion.clone(),
      mode,
    };
  }, [mode, camera]);

  useFrame((_, delta) => {
    const current = transition.current;
    if (!current) return;

    current.elapsed += Math.min(delta, 0.1);
    const progress = Math.min(current.elapsed / current.duration, 1);
    const eased = progress * progress * (3 - 2 * progress);

    camera.position.lerpVectors(
      current.startPosition,
      current.targetPosition,
      eased
    );
    camera.quaternion.slerpQuaternions(
      current.startQuaternion,
      current.targetQuaternion,
      eased
    );

    if (progress === 1) {
      const completedMode = current.mode;
      transition.current = null;
      onComplete(completedMode);
    }
  });

  return null;
}

export default function World({
  creations = [],
}) {
  const [mode, setMode] =
    useState("wide");

  const [targetedId, setTargetedId] =
    useState(null);

  const [
    inspectedCreation,
    setInspectedCreation,
  ] = useState(null);

  const canvasElement = useRef(null);

  const firstPerson =
    mode === "firstPerson";

  const entering = mode === "entering";
  const exiting = mode === "exiting";
  const transitioning = entering || exiting;
  const pointerControlsActive = entering || firstPerson;

  const targetedCreation = useMemo(
    () =>
      creations.find(
        (creation) =>
          creation.id === targetedId
      ) ?? null,
    [creations, targetedId]
  );

  const handleTargetChange =
    useCallback((id) => {
      setTargetedId(id);
    }, []);

  function enterFirstPerson() {
    setMode("entering");
    setTargetedId(null);
    setInspectedCreation(null);

    if (canvasElement.current) {
      const lockRequest =
        canvasElement.current.requestPointerLock();

      if (lockRequest?.catch) {
        lockRequest.catch((error) => {
          console.error(
            "Could not lock pointer:",
            error
          );
        });
      }
    }
  }

  function returnToWideView() {
    if (mode === "wide" || mode === "exiting") return;

    setMode("exiting");
    setTargetedId(null);
    setInspectedCreation(null);

    if (document.pointerLockElement) {
      document.exitPointerLock();
    }
  }

  const handleTransitionComplete = useCallback((completedMode) => {
    if (completedMode === "entering") {
      setMode("firstPerson");
    } else if (completedMode === "exiting") {
      setMode("wide");
    }
  }, []);

  useEffect(() => {
    function handleInspect(event) {
      if (
        event.code !== "KeyE" ||
        !firstPerson ||
        event.repeat
      ) {
        return;
      }

      // If a card is open, E closes it.
      if (inspectedCreation) {
        setInspectedCreation(null);
        return;
      }

      // Otherwise, inspect the targeted creation.
      if (targetedCreation) {
        setInspectedCreation(
          targetedCreation
        );
      }
    }

    window.addEventListener(
      "keydown",
      handleInspect
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleInspect
      );
    };
  }, [
    firstPerson,
    targetedCreation,
    inspectedCreation,
  ]);

  const inspectedClassification =
    inspectedCreation
      ? normalizeClassification(
          inspectedCreation
        )
      : "flower";

  const inspectedBaseInfo =
    CLASS_INFO[inspectedClassification] ??
    {
      label: inspectedClassification,
      description:
        "A user-created resident of ScribblePark.",
    };

  // The classifier often knows the species ("cat") even though we map it
  // to a broader category ("mammal") to decide how it moves. Show the
  // specific label when we have it, and keep the category's description.
  const inspectedSpecies =
    typeof inspectedCreation?.type === "string"
      ? inspectedCreation.type.trim().toLowerCase()
      : "";

  const inspectedInfo =
    inspectedSpecies &&
    inspectedSpecies !== inspectedClassification
      ? {
          label: titleCaseLabel(inspectedSpecies),
          description: inspectedBaseInfo.description,
        }
      : {
          ...inspectedBaseInfo,
          label: titleCaseLabel(
            inspectedBaseInfo.label
          ),
        };

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100vh",
        overflow: "hidden",
      }}
    >
      {/* View controls */}
      <div
        style={{
          position: "absolute",
          top: 20,
          left: 20,
          zIndex: 10,
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          gap: 10,
        }}
      >
        {firstPerson ? (
          <div style={instructionsStyle}>
            WASD to move · Mouse to look ·
            Space to jump · Esc for wide view
          </div>
        ) : mode === "wide" ? (
          <button
            type="button"
            onClick={enterFirstPerson}
            style={buttonStyle}
          >
            Enter Meadow
          </button>
        ) : null}
      </div>

      <Canvas
        shadows
        dpr={[1, 1.5]}
        onCreated={({ gl }) => {
          canvasElement.current =
            gl.domElement;
        }}
        gl={{
          antialias: true,
          toneMapping:
            THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.05,
        }}
        camera={{
          position: WIDE_POSITION,
          fov: 45,
          near: 0.1,
          far: 150,
        }}
      >
        <Environment />

        {/* Animated user drawings */}
        {creations.map((creation) => (
          <AnimatedCreation
            key={creation.id}
            creation={creation}
            highlighted={
              firstPerson &&
              creation.id === targetedId
            }
          />
        ))}

        <CameraTransition
          mode={mode}
          onComplete={handleTransitionComplete}
        />

        <FirstPersonController
          active={firstPerson}
        />

        {/* Detects the creation under the crosshair */}
        <InteractionController
          active={firstPerson}
          onTargetChange={
            handleTargetChange
          }
        />

        <PointerLockControls
          enabled={pointerControlsActive}
          onUnlock={returnToWideView}
        />

        <OrbitControls
          enabled={mode === "wide"}
          target={[0, 1, 0]}
          enablePan={false}
          enableDamping
          dampingFactor={0.06}
          minDistance={12}
          maxDistance={35}
          minPolarAngle={
            Math.PI / 4.5
          }
          maxPolarAngle={
            Math.PI / 2.15
          }
        />

        {/* Pixelation effect */}
        <EffectComposer multisampling={0}>
          <Pixelation granularity={4} />
        </EffectComposer>
      </Canvas>

      {transitioning && (
        <div style={transitionOverlayStyle}>
          <div style={transitionLabelStyle}>
            {entering
              ? "Entering the meadow…"
              : "Returning to overview…"}
          </div>
        </div>
      )}

      {/* First-person crosshair */}
      {firstPerson && (
        <div style={crosshairStyle}>
          +
        </div>
      )}

      {/* Interaction prompt */}
      {firstPerson &&
        targetedCreation &&
        !inspectedCreation && (
          <div
            style={
              interactionPromptStyle
            }
          >
            Press E to inspect
          </div>
        )}

      {/* Classification information card */}
      {inspectedCreation && (
        <div style={informationCardStyle}>
          <div style={classLabelStyle}>
            {displayCreationNumber(inspectedCreation)} · {inspectedInfo.label}
          </div>

          <h2
            style={{
              margin: "4px 0 8px",
            }}
          >
            {displayCreationName(
              inspectedCreation.name ||
                inspectedCreation.creatorName,
              "Unnamed"
            )}
          </h2>

          <p
            style={{
              margin: 0,
              lineHeight: 1.5,
            }}
          >
            {inspectedInfo.description}
          </p>

          <div style={closeTextStyle}>
            Press E to close
          </div>
        </div>
      )}
    </div>
  );
}

const buttonStyle = {
  border: "2px solid #4d6b3b",
  borderRadius: "8px",
  padding: "10px 16px",
  background: "#fffdf4",
  color: "#315638",
  fontSize: "14px",
  fontWeight: "700",
  cursor: "pointer",
};

const instructionsStyle = {
  padding: "8px 12px",
  borderRadius: "8px",
  background: "#fffdf4",
  color: "#315638",
  fontSize: "13px",
  border: "2px solid #4d6b3b",
};

const transitionOverlayStyle = {
  position: "absolute",
  inset: 0,
  zIndex: 25,
  display: "grid",
  placeItems: "end center",
  paddingBottom: "54px",
  pointerEvents: "none",
  background:
    "radial-gradient(circle at center, transparent 48%, rgba(36, 58, 38, 0.18) 100%)",
};

const transitionLabelStyle = {
  padding: "10px 16px",
  border: "2px solid rgba(255, 255, 255, 0.9)",
  borderRadius: "999px",
  background: "rgba(49, 75, 53, 0.86)",
  color: "white",
  fontSize: "13px",
  fontWeight: "700",
  letterSpacing: "0.02em",
  boxShadow: "0 8px 24px rgba(25, 45, 29, 0.22)",
};

const crosshairStyle = {
  position: "absolute",
  left: "50%",
  top: "50%",
  zIndex: 30,
  transform:
    "translate(-50%, -50%)",
  color: "white",
  fontSize: "26px",
  fontWeight: "700",
  textShadow:
    "0 2px 5px rgba(0,0,0,0.7)",
  pointerEvents: "none",
};

const interactionPromptStyle = {
  position: "absolute",
  left: "50%",
  bottom: "80px",
  zIndex: 30,
  transform: "translateX(-50%)",
  padding: "10px 16px",
  borderRadius: "8px",
  background: "#314b35",
  color: "white",
  fontWeight: "700",
  border: "2px solid #fff",
  pointerEvents: "none",
};

const informationCardStyle = {
  position: "absolute",
  right: "24px",
  bottom: "24px",
  zIndex: 40,
  width: "290px",
  padding: "20px",
  border: "2px solid #fff",
  borderRadius: "10px",
  background: "#314b35",
  color: "white",
  boxShadow: "0 8px 20px rgba(0,0,0,0.2)",
  pointerEvents: "none",
};

const classLabelStyle = {
  color: "#d8edc8",
  fontSize: "11px",
  fontWeight: "800",
  letterSpacing: "0.14em",
  textTransform: "uppercase",
};

const closeTextStyle = {
  marginTop: "14px",
  color: "#d8edc8",
  fontSize: "12px",
  fontWeight: "700",
};
