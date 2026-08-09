import { useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

function findCreationId(object) {
  let current = object;

  while (current) {
    if (current.userData?.creationId !== undefined) {
      return current.userData.creationId;
    }

    current = current.parent;
  }

  return null;
}

export default function InteractionController({
  active,
  onTargetChange,
}) {
  const { camera, scene } = useThree();

  const raycaster = useMemo(
    () => new THREE.Raycaster(),
    []
  );

  const centre = useMemo(
    () => new THREE.Vector2(0, 0),
    []
  );

  const previousTarget = useRef(null);

  useFrame(() => {
    if (!active) {
      if (previousTarget.current !== null) {
        previousTarget.current = null;
        onTargetChange(null);
      }

      return;
    }

    raycaster.far = 6;
    raycaster.setFromCamera(centre, camera);

    const intersections = raycaster.intersectObjects(
      scene.children,
      true
    );

    let targetId = null;

    for (const intersection of intersections) {
      const creationId = findCreationId(
        intersection.object
      );

      if (creationId !== null) {
        targetId = creationId;
        break;
      }
    }

    if (targetId !== previousTarget.current) {
      previousTarget.current = targetId;
      onTargetChange(targetId);
    }
  });

  return null;
}