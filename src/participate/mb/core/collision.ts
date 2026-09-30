import { COLLISION_BOX_PAIRS, linearMaxMmForStepper } from "./constants";
import { pyFixed } from "./pyformat";
import type { ForwardTrajectory, LinearStepper, MotionLimits } from "./types";

const pyMod = (a: number, n: number) => ((a % n) + n) % n;

/**
 * True when a box tip risks hitting the center column. Below
 * `safeFrac * maxExtension` any angle is safe; above it the safe angle
 * narrows from ±60° to ±10° at full extension.
 */
export function isCollisionRisk(rotDeg: number, linMm: number, phaseDeg: number, maxExtension: number, safeFrac = 0.85): boolean {
  if (maxExtension <= 0) return false;
  const frac = Math.min(0.95, Math.max(0.5, safeFrac));
  if (linMm < frac * maxExtension) return false;
  const span = Math.max(1e-6, (1 - frac) * maxExtension);
  const maxSafe = 10 + ((maxExtension - linMm) / span) * 50;
  const mod = pyMod(rotDeg - phaseDeg, 120);
  return Math.min(mod, 120 - mod) > maxSafe;
}

export function tierMaxMm(stepper: LinearStepper, limits: MotionLimits): number {
  return linearMaxMmForStepper(stepper, limits);
}

export type PillarHit = { frame: number; rotary: string; message: string };

/** First dense-sampled frame where any tier box tip risks the pillar. */
export function findPillarCollision(forward: ForwardTrajectory, limits: MotionLimits): PillarHit | null {
  const ff = forward.rotary_twelve.length;
  for (let frame = 0; frame < ff; frame++) {
    for (const [rot, lin, phase] of COLLISION_BOX_PAIRS) {
      const r = forward[rot][frame]!;
      const l = forward[lin][frame]!;
      const maxExt = tierMaxMm(lin, limits);
      if (!isCollisionRisk(r, l, phase, maxExt)) continue;
      const pct = (100 * l) / Math.max(maxExt, 1e-6);
      return {
        frame, rotary: rot,
        message: `${rot}/${lin} tip risks center column at frame ${frame}: rot=${pyFixed(r, 1)}° ` +
          `lin=${pyFixed(l, 1)}mm (${pyFixed(pct, 0)}% of ${pyFixed(maxExt, 0)}mm tier max, phase=${pyFixed(phase, 0)}°)`,
      };
    }
  }
  return null;
}
