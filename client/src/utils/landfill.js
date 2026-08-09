// Shared landfill geometry.
//
// Imported by App.jsx (to place litter) and Environment.jsx (to draw the
// ground patch and the sign), so the pile and the sign can never drift
// apart. Change the numbers here and both move together.
//
// World notes for anyone tuning this:
//   - inner meadow is a circle of radius 20 centred on the origin
//   - the player cannot walk further than radius 20 (WORLD_BOUNDARY)
//   - ordinary land creatures scatter across x/z in [-12, 12]
//   - the pond sits at (6, 2)
//
// The landfill sits in the back-left, far enough out that it reads as its
// own place rather than part of the meadow, but pulled in so its whole
// footprint (and its sign) stay inside the radius-20 walkable world.
// Ordinary land creatures actively avoid it, so it stays litter-only.

export const LANDFILL_CENTRE = { x: -12, z: -11.1 };

export const LANDFILL_RADIUS = 2.6;

// True when a point falls inside the dump, so ordinary land creatures can
// avoid spawning in the rubbish.
export function isInsideLandfill(x, z) {
  const dx = x - LANDFILL_CENTRE.x;
  const dz = z - LANDFILL_CENTRE.z;

  return dx ** 2 + dz ** 2 < LANDFILL_RADIUS ** 2;
}
