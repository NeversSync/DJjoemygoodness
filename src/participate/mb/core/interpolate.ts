import { ALL_STEPPERS } from "./constants";
import { ensureAlignedFrame0, expandKeyframePositions } from "./document";
import type { ForwardTrajectory, MotionBuilderDocument, MotionKeyframe, StepperName } from "./types";

const byFrame = (kfs: readonly MotionKeyframe[]) => [...kfs].sort((a, b) => a.frame - b.frame);

/** True when this key authors a value for stepper `s` (lane or override). */
export function keyDefinesStepper(
  doc: MotionBuilderDocument,
  kf: MotionKeyframe,
  s: StepperName,
): boolean {
  if (kf.steppers?.[s] !== undefined) return true;
  const g = doc.groups.find((x) => x.steppers.includes(s));
  return !!g && kf.lanes?.[g.id] !== undefined;
}

/** Nearest authored keyframes strictly before / after `frame`. */
export function surroundingKeyframes(doc: MotionBuilderDocument, frame: number) {
  let prev: MotionKeyframe | null = null;
  let next: MotionKeyframe | null = null;
  for (const kf of byFrame(doc.keyframes)) {
    if (kf.frame < frame) prev = kf;
    else if (kf.frame > frame) { next = kf; break; }
  }
  return { prev, next };
}

/** Lane value at `frame` from nearest keys that still define that lane. */
export function laneValueFromSurrounding(
  doc: MotionBuilderDocument,
  frame: number,
  laneId: string,
): number {
  let prev: MotionKeyframe | null = null;
  let next: MotionKeyframe | null = null;
  for (const kf of byFrame(doc.keyframes)) {
    if (kf.lanes?.[laneId] === undefined) continue;
    if (kf.frame < frame) prev = kf;
    else if (kf.frame > frame) { next = kf; break; }
  }
  if (!prev && !next) return 0;
  if (!prev) return Number(next!.lanes[laneId]);
  if (!next) return Number(prev.lanes[laneId]);
  const t = (frame - prev.frame) / Math.max(1, next.frame - prev.frame);
  const a = Number(prev.lanes[laneId]);
  const b = Number(next.lanes[laneId]);
  return a + (b - a) * t;
}

/** Lane values at `frame`: lerp between neighbours, hold after the last key. */
export function averageLanesFromSurrounding(doc: MotionBuilderDocument, frame: number): Record<string, number> {
  const ids = doc.groups.map((g) => g.id);
  return Object.fromEntries(ids.map((id) => [id, laneValueFromSurrounding(doc, frame, id)]));
}

/** Dense per-frame absolute positions for frames 0..frames_forward-1. */
export function interpolateForwardPositions(input: MotionBuilderDocument): ForwardTrajectory {
  const doc = ensureAlignedFrame0(input);
  const ff = doc.frames_forward;
  const lerp = doc.interpolate ?? true;
  const keys = byFrame(doc.keyframes);
  const out = Object.fromEntries(ALL_STEPPERS.map((s) => [s, new Array<number>(ff).fill(0)])) as ForwardTrajectory;

  for (const s of ALL_STEPPERS) {
    const defined: [number, number][] = [];
    for (const kf of keys) {
      if (!keyDefinesStepper(doc, kf, s)) continue;
      defined.push([kf.frame, expandKeyframePositions(doc, kf)[s]]);
    }
    if (!defined.length) continue;

    for (let i = 0; i < defined.length - 1; i++) {
      const [f0, p0] = defined[i]!;
      const [f1, p1] = defined[i + 1]!;
      const span = Math.max(1, f1 - f0);
      for (let f = f0; f <= f1 && f < ff; f++) {
        out[s][f] = lerp ? p0 + (p1 - p0) * ((f - f0) / span) : (f === f1 ? p1 : p0);
      }
    }
    const last = defined.at(-1)!;
    for (let f = Math.max(0, last[0]); f < ff; f++) out[s][f] = last[1];
    for (const [frame, pos] of defined) {
      if (frame >= 0 && frame < ff) out[s][frame] = pos;
    }
  }
  for (const s of ALL_STEPPERS) out[s][0] = 0;
  return out;
}
