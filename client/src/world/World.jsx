import { useEffect, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import Environment from "./Environment";
import Flower from "./Flower";

const WIDE_POSITION = [0, 5.5, 11];
const FIRST_PERSON_POSITION = [0, 1.4, 6];

function FirstPersonController({ active }) {
  const { camera, gl } = useThree();
  const keys = useRef({});
  const dragging = useRef(false);
  const previousMouse = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (!active) return;

    camera.position.set(...FIRST_PERSON_POSITION);
    camera.rotation.order = "YXZ";
    camera.lookAt(0, 1.4, 0);

    function handleKeyDown(event) {
      keys.current[event.code] = true;
    }

    function handleKeyUp(event) {
      keys.current[event.code] = false;
    }

    function handleMouseDown(event) {
      if (event.button !== 0) return;

      dragging.current = true;
      previousMouse.current = {
        x: event.clientX,
        y: event.clientY,
      };
    }

    function handleMouseUp() {
      dragging.current = false;
    }

    function handleMouseMove(event) {
      if (!dragging.current) return;

      const movementX = event.clientX - previousMouse.current.x;
      const movementY = event.clientY - previousMouse.current.y;

      previousMouse.current = {
        x: event.clientX,
        y: event.clientY,
      };

      camera.rotation.y -= movementX * 0.003;
      camera.rotation.x -= movementY * 0.003;

      camera.rotation.x = THREE.MathUtils.clamp(
        camera.rotation.x,
        -Math.PI / 2.4,
        Math.PI / 2.4
      );
    }

    const canvas = gl.domElement;

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mousedown", handleMouseDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mousedown", handleMouseDown);

      keys.current = {};
      dragging.current = false;
    };
  }, [active, camera, gl]);

  useFrame((_, delta) => {
    if (!active) return;

    const speed = 3.5;
    const movement = new THREE.Vector3();

    const forward = new THREE.Vector3();
    camera.getWorldDirection(forward);
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

    if (movement.lengthSq() > 0) {
      movement.normalize().multiplyScalar(speed * delta);
      camera.position.add(movement);
    }

    // Keep the camera at eye height.
    camera.position.y = 1.4;

    // Keep the player inside the meadow.
    const distanceFromCentre = Math.hypot(
      camera.position.x,
      camera.position.z
    );

    if (distanceFromCentre > 7.2) {
      const angle = Math.atan2(camera.position.z, camera.position.x);

      camera.position.x = Math.cos(angle) * 7.2;
      camera.position.z = Math.sin(angle) * 7.2;
    }
  });

  return null;
}

function CameraReset({ mode }) {
  const { camera } = useThree();

  useEffect(() => {
    if (mode === "wide") {
      camera.position.set(...WIDE_POSITION);
      camera.rotation.set(0, 0, 0);
      camera.lookAt(0, 1, 0);
    }
  }, [mode, camera]);

  return null;
}

export default function World({ creations = [] }) {
  const [mode, setMode] = useState("wide");
  const firstPerson = mode === "firstPerson";

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100vh",
      }}
    >
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
          <>
            <button
              type="button"
              onClick={() => setMode("wide")}
              style={buttonStyle}
            >
              Wide View
            </button>

            <div style={instructionsStyle}>
              WASD to move · Hold and drag to look
            </div>
          </>
        ) : (
          <button
            type="button"
            onClick={() => setMode("firstPerson")}
            style={buttonStyle}
          >
            Enter Meadow
          </button>
        )}
      </div>

      <Canvas
        shadows
        dpr={[1, 1.5]}
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.05,
        }}
        camera={{
          position: WIDE_POSITION,
          fov: 42,
          near: 0.1,
          far: 100,
        }}
      >
        <Environment />

        {creations.map((creation) => (
          <Flower
            key={creation.id}
            imageUrl={creation.imageUrl}
            name={creation.name}
            position={creation.position}
            scale={creation.scale}
          />
        ))}

        <CameraReset mode={mode} />
        <FirstPersonController active={firstPerson} />

        <OrbitControls
          enabled={!firstPerson}
          target={[0, 1, 0]}
          enablePan={false}
          enableDamping
          dampingFactor={0.06}
          minDistance={6}
          maxDistance={14}
          minPolarAngle={Math.PI / 4.5}
          maxPolarAngle={Math.PI / 2.15}
          minAzimuthAngle={-Math.PI / 3}
          maxAzimuthAngle={Math.PI / 3}
        />
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