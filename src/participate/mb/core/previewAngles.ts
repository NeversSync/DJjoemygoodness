import { BOX_LANES } from "./constants";
import type { StepperName } from "./types";

/** Radial clock angle for each box (math radians; 12 o'clock = −π/2). */
export const CLOCK_ANGLE: Record<string, number> = {
  "12 o'clock": -Math.PI / 2,
  "2 o'clock": -Math.PI / 2 + Math.PI / 3,
  "4 o'clock": -Math.PI / 2 + (2 * Math.PI) / 3,
  "6 o'clock": Math.PI / 2,
  "8 o'clock": -Math.PI / 2 + (4 * Math.PI) / 3,
  "10 o'clock": -Math.PI / 2 + (5 * Math.PI) / 3,
  center: 0,
};

const LOWER = new Set(["2 o'clock", "6 o'clock", "10 o'clock"]);

/**
 * Tip direction at 0° motor for a box (matches OutlinePreview triangles).
 * Lower-tier tips face inward (+π on radial); upper face outward; center tips down.
 */
export function alignedTipAngle(box: string, radialOut: number = CLOCK_ANGLE[box] ?? 0): number {
  if (box === "center") return Math.PI / 2;
  if (LOWER.has(box)) return radialOut + Math.PI;
  return radialOut;
}

/** Canvas tip angle (radians) for a motor at `motorDeg` absolute degrees. */
export function tipAngleForMotor(box: string, motorDeg: number): number {
  return alignedTipAngle(box) + (motorDeg * Math.PI) / 180;
}

export function boxForStepper(stepper: StepperName): string | null {
  for (const [box, steppers] of BOX_LANES) {
    if (steppers.includes(stepper)) return box;
  }
  return null;
}

/** Home tip angle (radians) for a stepper at 0° — use as dial pointer offset. */
export function dialHomeAngleRad(stepper: StepperName): number {
  const box = boxForStepper(stepper);
  if (!box) return -Math.PI / 2; // 12 o'clock default
  return alignedTipAngle(box);
}
