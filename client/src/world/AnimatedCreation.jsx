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

    // Reset the transform so every classification owns its full pose.
    object.scale.set(1, 1, 1);
    object.rotation.set(0, 0, 0);

    switch (classification) {
      case "rabbit": {
        const hopCycle = Math.sin(time * 2.8);
        const hop = Math.max(0, hopCycle);
        const travel = time * 0.35;

        object.position.set(
          origin.x + Math.sin(travel) * 1.35,
          origin.y + hop * 0.75,
          origin.z + Math.sin(travel * 2) * 0.55
        );

        object.scale.set(
          1 + hop * 0.04,
          1 - hop * 0.08,
          1
        );
        object.rotation.z = -Math.cos(time * 2.8) * hop * 0.09;

        break;
      }

      case "toad": {
        const hop = Math.max(0, Math.sin(time * 1.65));
        const travel = time * 0.22;

        object.position.set(
          origin.x + Math.sin(travel) * 0.75,
          origin.y + hop * 0.5,
          origin.z + Math.cos(travel) * 0.45
        );

        object.scale.set(
          1 + (1 - hop) * 0.06,
          1 - (1 - hop) * 0.09,
          1
        );

        break;
      }

      case "bug": {
        const scuttle = time * 1.35;

        object.position.set(
          origin.x + Math.sin(scuttle) * 0.8,
          origin.y + Math.abs(Math.sin(time * 8)) * 0.015,
          origin.z + Math.sin(scuttle * 2.3) * 0.32
        );

        object.rotation.z = Math.sin(time * 11) * 0.035;

        break;
      }

      case "snail": {
        const glide = time * 0.18;

        object.position.set(
          origin.x + Math.sin(glide) * 0.65,
          origin.y + Math.sin(time * 1.4) * 0.008,
          origin.z + Math.sin(glide * 0.55) * 0.18
        );

        object.scale.y = 1 + Math.sin(time * 1.4) * 0.018;

        break;
      }

      case "butterfly": {
        const flight = time * 0.95;
        const flutter = Math.sin(time * 10);

        object.position.set(
          origin.x + Math.sin(flight) * 1.5,
          origin.y + 1.65 + Math.sin(time * 2.8) * 0.38,
          origin.z + Math.sin(flight * 2) * 0.65
        );

        object.scale.x = 1 + Math.abs(flutter) * 0.12;
        object.rotation.z = flutter * 0.1;

        break;
      }

      case "bird": {
        const orbit = time * 0.42;

        object.position.set(
          origin.x + Math.cos(orbit) * 3.8,
          origin.y + 3.8 + Math.sin(time * 0.9) * 0.32,
          origin.z + Math.sin(orbit) * 3.1
        );

        object.rotation.z = -Math.sin(orbit) * 0.13;
        object.scale.y = 1 + Math.sin(time * 5.5) * 0.035;

        break;
      }

      case "fish": {
        const swim = time * 0.75;

        object.position.set(
          origin.x + Math.cos(swim) * 1.35,
          origin.y + 0.12 + Math.sin(time * 2.2) * 0.045,
          origin.z + Math.sin(swim) * 0.7
        );

        object.rotation.z = Math.sin(time * 3.2) * 0.045;
        object.scale.x = 1 + Math.sin(time * 4.5) * 0.035;

        break;
      }

      case "duck": {
        const paddle = time * 0.28;

        object.position.set(
          origin.x + Math.cos(paddle) * 1.15,
          origin.y + 0.18 + Math.sin(time * 1.8) * 0.03,
          origin.z + Math.sin(paddle) * 0.68
        );

        object.rotation.z = Math.sin(time * 1.8) * 0.018;

        break;
      }

      case "mushroom": {
        const pulse = (Math.sin(time * 1.4) + 1) / 2;

        object.position.set(
          origin.x,
          origin.y + pulse * 0.055,
          origin.z
        );

        object.scale.set(
          1 + pulse * 0.035,
          1 - pulse * 0.025,
          1
        );
        object.rotation.z = Math.sin(time * 1.4) * 0.018;

        break;
      }

      case "tree": {
        object.position.set(origin.x, origin.y, origin.z);
        object.rotation.z = Math.sin(time * 0.65) * 0.022;
        object.scale.x = 1 + Math.sin(time * 0.65 + 0.8) * 0.012;

        break;
      }

      case "bush": {
        object.position.set(
          origin.x,
          origin.y + Math.abs(Math.sin(time * 2.6)) * 0.018,
          origin.z
        );
        object.rotation.z =
          Math.sin(time * 2.6) * 0.025 +
          Math.sin(time * 5.1) * 0.01;
        object.scale.x = 1 + Math.sin(time * 2.6) * 0.025;

        break;
      }

      case "flower": {
        const breeze = Math.sin(time * 1.35);

        object.position.set(origin.x, origin.y, origin.z);
        object.rotation.z = breeze * 0.045;
        object.scale.set(
          1 + Math.sin(time * 0.7) * 0.018,
          1 + Math.sin(time * 0.7) * 0.03,
          1
        );

        break;
      }

      default: {
        object.position.set(
          origin.x,
          origin.y,
          origin.z
        );

        object.rotation.z = Math.sin(time * 1.3) * 0.035;

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
        name={creation.name || creation.creatorName}
        classification={classification}
        position={{ x: 0, y: 0, z: 0 }}
        scale={finalScale}
        highlighted={highlighted}
      />
    </group>
  );
}
