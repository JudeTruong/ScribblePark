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
    plant: "flower",
    plants: "flower",

    bunny: "rabbit",
    frog: "toad",

    insect: "bug",
    ant: "bug",
    beetle: "bug",
    spider: "bug",

    bee: "butterfly",
    moth: "butterfly",

    fishes: "fish",
  };

  return aliases[value] || value;
}

export default function AnimatedCreation({
  creation,
  highlighted = false,
}) {
  const group = useRef();

  const classification =
    normalizeClassification(creation);

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

    // Reset scale before applying an animation.
    object.scale.set(1, 1, 1);

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
        const hop = Math.max(
          0,
          Math.sin(time * 1.5)
        );

        object.position.set(
          origin.x + Math.sin(time * 0.3) * 0.8,
          origin.y + hop * 0.45,
          origin.z + Math.cos(time * 0.3) * 0.5
        );

        object.scale.y = 1 - hop * 0.08;
        object.rotation.z = 0;

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

      case "snail": {
        object.position.set(
          origin.x + Math.sin(time * 0.2) * 0.7,
          origin.y,
          origin.z + Math.sin(time * 0.1) * 0.2
        );

        object.rotation.z = 0;

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

      case "bird": {
        object.position.set(
          origin.x + Math.cos(time * 0.45) * 4,
          origin.y + 4 + Math.sin(time) * 0.35,
          origin.z + Math.sin(time * 0.45) * 4
        );

        object.rotation.z =
          Math.sin(time * 0.9) * 0.08;

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

      case "duck": {
        object.position.set(
          origin.x + Math.cos(time * 0.25) * 1.2,
          origin.y + 0.18 + Math.sin(time * 1.5) * 0.025,
          origin.z + Math.sin(time * 0.25) * 0.7
        );

        object.rotation.z =
          Math.sin(time * 1.5) * 0.015;

        break;
      }

      case "mushroom": {
        object.position.set(
          origin.x,
          origin.y + Math.abs(Math.sin(time * 1.2)) * 0.05,
          origin.z
        );

        object.rotation.z =
          Math.sin(time * 1.2) * 0.02;

        break;
      }

      case "tree":
      case "bush":
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

  // App.jsx already generates classification-based scale.
  const finalScale = creation.scale ?? 1;

  return (
    <group ref={group}>
      <Flower
        id={creation.id}
        imageUrl={creation.imageUrl}
        name={creation.name}
        classification={classification}
        position={{ x: 0, y: 0, z: 0 }}
        scale={finalScale}
        highlighted={highlighted}
      />
    </group>
  );
}