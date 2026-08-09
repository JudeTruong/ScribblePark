import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import Flower from "./Flower";

function createPhase(id) {
  return (
    String(id)
      .split("")
      .reduce(
        (total, character) =>
          total + character.charCodeAt(0),
        0
      ) * 0.17
  );
}

function normalizeClassification(creation) {
  const value = (
    creation.classification ||
    creation.category ||
    "flower"
  ).toLowerCase();

  const aliases = {
    flowers: "flower",
    bunny: "rabbit",
    frog: "toad",
    insect: "bug",
    butterflies: "butterfly",
  };

  return aliases[value] || value;
}

export default function AnimatedCreation({ creation }) {
  const group = useRef();

  const classification = normalizeClassification(creation);

  const phase = useMemo(
    () => createPhase(creation.id),
    [creation.id]
  );

  const origin = useMemo(
    () => ({
      x: creation.position?.x ?? 0,
      y: creation.position?.y ?? 0,
      z: creation.position?.z ?? 0,
    }),
    [
      creation.position?.x,
      creation.position?.y,
      creation.position?.z,
    ]
  );

  useFrame(({ clock }) => {
    if (!group.current) return;

    const time = clock.elapsedTime + phase;
    const object = group.current;

    switch (classification) {
      case "rabbit": {
        const hop = Math.max(
          0,
          Math.sin(time * 2.4)
        );

        object.position.set(
          origin.x + Math.sin(time * 0.45) * 1.2,
          origin.y + hop * 0.7,
          origin.z + Math.cos(time * 0.45) * 0.7
        );

        object.rotation.z =
          -Math.cos(time * 2.4) * hop * 0.08;

        break;
      }

      case "toad": {
        const hopCycle = Math.sin(time * 1.5);
        const hop = Math.max(0, hopCycle);

        object.position.set(
          origin.x + Math.sin(time * 0.3) * 0.8,
          origin.y + hop * 0.45,
          origin.z + Math.cos(time * 0.3) * 0.5
        );

        object.scale.y = 1 - hop * 0.08;
        break;
      }

      case "bug": {
        object.position.set(
          origin.x + Math.sin(time * 1.2) * 0.9,
          origin.y,
          origin.z + Math.sin(time * 2.4) * 0.35
        );

        object.rotation.z =
          Math.sin(time * 5) * 0.025;

        break;
      }

      case "butterfly": {
        object.position.set(
          origin.x + Math.sin(time * 1.1) * 1.6,
          origin.y + 1.8 + Math.sin(time * 3) * 0.35,
          origin.z + Math.cos(time * 0.8) * 1
        );

        object.rotation.z =
          Math.sin(time * 7) * 0.12;

        break;
      }

      case "fish": {
        object.position.set(
          origin.x + Math.cos(time * 0.7) * 1.5,
          origin.y + 0.15 + Math.sin(time * 2) * 0.05,
          origin.z + Math.sin(time * 0.7) * 0.8
        );

        object.rotation.z =
          Math.sin(time * 1.4) * 0.04;

        break;
      }

      case "flower":
      default: {
        object.position.set(
          origin.x,
          origin.y,
          origin.z
        );

        object.rotation.z =
          Math.sin(time * 1.3) * 0.035;

        break;
      }
    }
  });

  const classScale = {
    flower: 1,
    rabbit: 0.85,
    toad: 0.65,
    bug: 0.35,
    butterfly: 0.55,
    fish: 0.65,
  };

  const finalScale =
    (creation.scale ?? 1) *
    (classScale[classification] ?? 1);

  return (
    <group ref={group}>
      <Flower
        imageUrl={creation.imageUrl}
        name={creation.name}
        position={{ x: 0, y: 0, z: 0 }}
        scale={finalScale}
      />
    </group>
  );
}