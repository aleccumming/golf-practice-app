export type MissDirection = "straight" | "push" | "right" | "slice" | "hook" | "left" | "pull";

// Left-handed layout: push/pull and hook/slice are mirrored relative to a
// right-handed golfer (e.g. a lefty's push starts left, not right), while
// plain left/right stay pinned to their physical side.
export const WEDGE_ORDER: Exclude<MissDirection, "straight">[] = [
  "pull",
  "right",
  "hook",
  "slice",
  "left",
  "push",
];

export const WEDGE_LABELS: Record<Exclude<MissDirection, "straight">, string> = {
  push: "PUSH",
  right: "RIGHT",
  slice: "SLICE",
  hook: "HOOK",
  left: "LEFT",
  pull: "PULL",
};

const WEDGE_DEGREES = 60;
const DEFAULT_CENTER_RADIUS_RATIO = 0.28;

/** Degrees clockwise from 12 o'clock (top = target line), range [0, 360). */
export function angleFromCenter(dx: number, dy: number): number {
  let deg = Math.atan2(dx, -dy) * (180 / Math.PI);
  if (deg < 0) deg += 360;
  return deg;
}

export function pointToMissDirection(
  x: number,
  y: number,
  cx: number,
  cy: number,
  radius: number,
  centerRadiusRatio: number = DEFAULT_CENTER_RADIUS_RATIO
): MissDirection {
  const dx = x - cx;
  const dy = y - cy;
  const dist = Math.hypot(dx, dy);
  if (dist <= radius * centerRadiusRatio) return "straight";

  const angle = angleFromCenter(dx, dy);
  const index = Math.floor(angle / WEDGE_DEGREES) % WEDGE_ORDER.length;
  return WEDGE_ORDER[index];
}

/** Returns the [startDeg, endDeg) boundaries for a wedge, for drawing arcs. */
export function wedgeBounds(direction: Exclude<MissDirection, "straight">): [number, number] {
  const index = WEDGE_ORDER.indexOf(direction);
  return [index * WEDGE_DEGREES, (index + 1) * WEDGE_DEGREES];
}

/** SVG point on a circle of given radius centered at (cx, cy) at `deg` clockwise from top. */
export function polarToPoint(cx: number, cy: number, radius: number, deg: number): { x: number; y: number } {
  const rad = (deg * Math.PI) / 180;
  return { x: cx + radius * Math.sin(rad), y: cy - radius * Math.cos(rad) };
}
