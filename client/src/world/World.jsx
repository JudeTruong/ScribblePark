import { useEffect, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import AnimatedCreation from "./AnimatedCreation";
import {
  OrbitControls,
  PointerLockControls,
} from "@react-three/drei";
import {
  EffectComposer,
  Pixelation,
} from "@react-three/postprocessing";
import * as THREE from "three";

import Environment from "./Environment";


const WIDE_POSITION = [0, 11, 24];
const FIRST_PERSON_POSITION = [0, 1.4, 12];
const WORLD_BOUNDARY = 20;
const GROUND_HEIGHT = 1.4;

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

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);

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

    // Ignore vertical camera tilt while moving.
    forward.y = 0;
    forward.normalize();

    const right = new THREE.Vector3()
      .crossVectors(forward, camera.up)
      .normalize();

    if (keys.current.KeyW || keys.current.ArrowUp) {
      movement.add(forward);
    }

    if (keys.current.KeyS || keys.current.ArrowDown) {
      movement.sub(forward);
    }

    if (keys.current.KeyD || keys.current.ArrowRight) {
      movement.add(right);
    }

    if (keys.current.KeyA || keys.current.ArrowLeft) {
      movement.sub(right);
    }

    const isWalking = movement.lengthSq() > 0;

    if (isWalking) {
      movement
        .normalize()
        .multiplyScalar(movementSpeed * safeDelta);

      camera.position.x += movement.x;
      camera.position.z += movement.z;
    }

    // Gravity and jumping.
    verticalVelocity.current -= gravity * safeDelta;

    verticalPosition.current +=
      verticalVelocity.current * safeDelta;

    if (verticalPosition.current <= GROUND_HEIGHT) {
      verticalPosition.current = GROUND_HEIGHT;
      verticalVelocity.current = 0;
      grounded.current = true;
    }

    // Subtle camera bob while walking.
    let headBob = 0;

    if (isWalking && grounded.current) {
      bobTime.current += safeDelta * 10;
      headBob = Math.sin(bobTime.current) * 0.045;
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

    if (distanceFromCentre > WORLD_BOUNDARY) {
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

function CameraReset({ mode }) {
  const { camera } = useThree();

  useEffect(() => {
    if (mode !== "wide") return;

    camera.position.set(...WIDE_POSITION);
    camera.rotation.order = "XYZ";
    camera.rotation.set(0, 0, 0);
    camera.lookAt(0, 1, 0);
  }, [mode, camera]);

  return null;
}

export default function World({ creations = [] }) {
  const [mode, setMode] = useState("wide");
  const canvasElement = useRef(null);

  const firstPerson = mode === "firstPerson";

  function enterFirstPerson() {
    setMode("firstPerson");

    if (canvasElement.current) {
      const lockRequest =
        canvasElement.current.requestPointerLock();

      if (lockRequest?.catch) {
        lockRequest.catch((error) => {
          console.error("Could not lock pointer:", error);
        });
      }
    }
  }

  function returnToWideView() {
    setMode("wide");

    if (document.pointerLockElement) {
      document.exitPointerLock();
    }
  }

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100vh",
        overflow: "hidden",
      }}
    >
      {/* Screen controls */}
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
            WASD to move · Mouse to look · Space to jump · Esc for wide view
          </div>
        ) : (
          <button
            type="button"
            onClick={enterFirstPerson}
            style={buttonStyle}
          >
            Enter Meadow
          </button>
        )}
      </div>

      <Canvas
        shadows
        dpr={[1, 1.5]}
        onCreated={({ gl }) => {
          canvasElement.current = gl.domElement;
        }}
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.05,
        }}
        camera={{
          position: WIDE_POSITION,
          fov: 45,
          near: 0.1,
          far: 150,
        }}
      >
        {/* Complete environment */}
        <Environment />

        {/* User-created PNG flowers */}
        {creations.map((creation) => (
        <AnimatedCreation
            key={creation.id}
            creation={creation}
        />
        ))}

        <CameraReset mode={mode} />

        <FirstPersonController active={firstPerson} />

        <PointerLockControls
          enabled={firstPerson}
          onUnlock={returnToWideView}
        />

        <OrbitControls
          enabled={!firstPerson}
          target={[0, 1, 0]}
          enablePan={false}
          enableDamping
          dampingFactor={0.06}
          minDistance={12}
          maxDistance={35}
          minPolarAngle={Math.PI / 4.5}
          maxPolarAngle={Math.PI / 2.15}
        />

        {/* Pixelates the entire 3D scene */}
        <EffectComposer multisampling={0}>
          <Pixelation granularity={1} />
        </EffectComposer>
      </Canvas>
    </div>
  );
}

const buttonStyle = {
  border: "none",
  borderRadius: "999px",
  padding: "12px 20px",
  background: "#fffdf4",
  color: "#315638",
  fontSize: "15px",
  fontWeight: "700",
  cursor: "pointer",
  boxShadow: "0 6px 20px rgba(42, 74, 45, 0.22)",
};

const instructionsStyle = {
  padding: "8px 12px",
  borderRadius: "10px",
  background: "rgba(255, 253, 244, 0.88)",
  color: "#315638",
  fontSize: "13px",
  boxShadow: "0 4px 14px rgba(42, 74, 45, 0.14)",
};