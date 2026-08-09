// Shared decorative terrain footprints. Environment renders these mounds,
// while App uses the same geometry to keep new creations from spawning
// inside them.
export const WALKING_HILLS = [
  { x: -25, z: -3, width: 7.5, depth: 5.2, height: 1.15, color: "#82a85f" },
  { x: -17, z: 27, width: 8.5, depth: 5.8, height: 1.35, color: "#9ab96c" },
  { x: 17, z: 24, width: 9, depth: 6, height: 1.25, color: "#94a861" },
  { x: 30, z: 4, width: 7.5, depth: 5.4, height: 1.2, color: "#719854" },
  { x: 22, z: -27, width: 8.5, depth: 5.6, height: 1.3, color: "#779d55" },
  { x: -9, z: -32, width: 8, depth: 5.2, height: 1.1, color: "#789e57" },
];

export function isInsideWalkingHill(x, z, padding = 0.8) {
  return WALKING_HILLS.some((hill) => {
    const normalizedX = (x - hill.x) / (hill.width + padding);
    const normalizedZ = (z - hill.z) / (hill.depth + padding);

    return normalizedX ** 2 + normalizedZ ** 2 < 1;
  });
}

export function getWalkingHillHeight(x, z) {
  let height = 0;

  for (const hill of WALKING_HILLS) {
    const normalizedX = (x - hill.x) / hill.width;
    const normalizedZ = (z - hill.z) / hill.depth;
    const distanceSquared = normalizedX ** 2 + normalizedZ ** 2;

    if (distanceSquared < 1) {
      const falloff = 1 - distanceSquared;
      height = Math.max(
        height,
        hill.height * 0.32 * falloff * falloff
      );
    }
  }

  return height;
}
