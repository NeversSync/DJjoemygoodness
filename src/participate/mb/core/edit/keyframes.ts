import { averageLanesFromSurrounding } from "../interpolate";
import {
  clampLinearMm,
  clampRotaryJump,
  linearMaxMmForGroup,
  linearMaxMmForStepper,
} from "../constants";
import type { MotionBuilderDocument, StepperName } from "../types";
import { EditError, ensureTimelineFits, keyAt, lastFrame, produce, round3 } from "./produce";

/** Previous authored sample on `laneId` strictly before `frame` (0 if none). */
export function prevLaneValue(doc: MotionBuilderDocument, frame: number, laneId: string): number {
  let best = 0;
  let bestFrame = -1;
  for (const kf of doc.keyframes) {
    if (kf.frame >= frame) break;
    if (kf.lanes?.[laneId] === undefined) continue;
    if (kf.frame > bestFrame) {
      bestFrame = kf.frame;
      best = Number(kf.lanes[laneId] ?? 0);
    }
  }
  return best;
}

/** Previous authored stepper override (or group lane) before `frame`. */
export function prevStepperValue(
  doc: MotionBuilderDocument,
  frame: number,
  stepper: StepperName,
): number {
  let best = 0;
  let bestFrame = -1;
  for (const kf of doc.keyframes) {
    if (kf.frame >= frame) break;
    const ov = kf.steppers?.[stepper];
    if (ov !== undefined) {
      if (kf.frame > bestFrame) {
        bestFrame = kf.frame;
        best = Number(ov);
      }
      continue;
    }
    // Fall back to group lane that owns this stepper
    const g = doc.groups.find((x) => x.steppers.includes(stepper));
    if (g && kf.lanes?.[g.id] !== undefined && kf.frame > bestFrame) {
      bestFrame = kf.frame;
      best = Number(kf.lanes[g.id] ?? 0);
    }
  }
  return best;
}

function ensureKeyAt(draft: MotionBuilderDocument, frame: number): void {
  if (keyAt(draft, frame)) return;
  draft.keyframes.push({ frame, lanes: averageLanesFromSurrounding(draft, frame), steppers: {} });
  draft.keyframes.sort((a, b) => a.frame - b.frame);
}

/**
 * Set the inclusive last frame. Extending seeds a key every grid step;
 * cropping averages an end key from neighbours and drops later keys.
 */
export function setEndFrame(doc: MotionBuilderDocument, endInclusive: number): MotionBuilderDocument {
  const end = Math.max(1, Math.round(endInclusive));
  if (end + 1 === doc.frames_forward) return doc;
  const step = Math.max(1, doc.grid_step || 10);
  return produce(doc, (d) => {
    const extending = end + 1 > d.frames_forward;
    const start = extending
      ? Math.max(step, Math.ceil((d.frames_forward - 1) / step) * step)
      : Math.ceil(Math.max(0, end - step * 4) / step) * step;
    d.frames_forward = end + 1;
    for (let f = start; f < end; f += step) ensureKeyAt(d, f);
    ensureKeyAt(d, end);
    d.keyframes = d.keyframes.filter((k) => k.frame <= end);
  });
}

function nextFreeFrame(doc: MotionBuilderDocument, preferred: number): number | null {
  const ff = Math.max(2, doc.frames_forward);
  const used = new Set(doc.keyframes.map((k) => k.frame));
  const f = Math.max(0, Math.min(ff - 1, Math.round(preferred)));
  if (!used.has(f)) return f;
  for (let d = 1; d < ff; d++) {
    if (f + d < ff && !used.has(f + d)) return f + d;
    if (f - d >= 0 && !used.has(f - d)) return f - d;
  }
  return null;
}

/** Add a key one grid step after `afterFrame` (nearest free slot), averaged from neighbours. */
export function addKeyframe(doc: MotionBuilderDocument, afterFrame: number) {
  const frame = nextFreeFrame(doc, afterFrame + (doc.grid_step || 10));
  if (frame === null) throw new EditError("No free frame slot for a new keyframe");
  return { doc: produce(doc, (d) => ensureKeyAt(d, frame)), frame };
}

/** Replace one lane at each frame with the average of its neighbours (frame 0 locked). */
export const averageLaneAt = (doc: MotionBuilderDocument, frames: number[], laneId: string) =>
  produce(doc, (d) => {
    for (const f of frames.filter((x) => x > 0)) {
      const kf = keyAt(d, f);
      if (kf && kf.lanes[laneId] !== undefined) {
        kf.lanes[laneId] = round3(averageLanesFromSurrounding(d, f)[laneId] ?? 0);
      }
    }
  });

export const removeKeys = (doc: MotionBuilderDocument, frames: number[]) =>
  produce(doc, (d) => {
    const drop = new Set(frames.filter((f) => f > 0));
    d.keyframes = d.keyframes.filter((k) => !drop.has(k.frame));
  });

/**
 * Delete `laneId` nodes at `frames` (other lanes keep their keys). Drops the
 * time stop only when a key has no lanes and no stepper overrides left.
 * Frame 0 is never touched.
 */
export function deleteLaneAt(
  doc: MotionBuilderDocument,
  frames: number[],
  laneId: string,
): MotionBuilderDocument {
  return produce(doc, (d) => {
    const members = new Set(d.groups.find((g) => g.id === laneId)?.steppers ?? []);
    const drop = new Set(frames.filter((f) => f > 0));
    for (const kf of d.keyframes) {
      if (!drop.has(kf.frame) || kf.lanes[laneId] === undefined) continue;
      delete kf.lanes[laneId];
      if (kf.steppers) {
        for (const s of members) delete kf.steppers[s];
        if (!Object.keys(kf.steppers).length) delete kf.steppers;
      }
    }
    d.keyframes = d.keyframes.filter((k) =>
      k.frame === 0
      || Object.keys(k.lanes).length > 0
      || Object.keys(k.steppers ?? {}).length > 0);
  });
}

/** Write a lane value, creating an averaged key if needed. Returns false for non-zero frame 0. */
export function writeLane(d: MotionBuilderDocument, frame: number, laneId: string, value: number): boolean {
  const f = Math.max(0, Math.round(frame));
  if (f === 0 && Math.abs(value) > 1e-6) return false;
  ensureTimelineFits(d, f);
  ensureKeyAt(d, f);
  const kf = keyAt(d, f)!;
  let v = round3(value);
  const g = d.groups.find((x) => x.id === laneId);
  if (g?.kind === "linear") {
    const maxMm = linearMaxMmForGroup(g, d.limits);
    const minMm = d.limits.min_linear_mm ?? 0;
    v = round3(clampLinearMm(v, maxMm, minMm));
  } else if (g?.kind === "rotary") {
    v = round3(clampRotaryJump(prevLaneValue(d, f, laneId), v));
  }
  kf.lanes[laneId] = v;
  const members = d.groups.find((x) => x.id === laneId)?.steppers ?? [];
  for (const s of members) delete kf.steppers?.[s];
  return true;
}

export const setLaneValue = (doc: MotionBuilderDocument, frame: number, laneId: string, value: number) =>
  produce(doc, (d) => {
    if (!writeLane(d, frame, laneId, value)) throw new EditError("Frame 0 stays Aligned (all zeros)");
  });

/** Per-motor override for motors outside any lockstep group. */
export const setStepperOverride = (doc: MotionBuilderDocument, frame: number, stepper: StepperName, value: number) =>
  produce(doc, (d) => {
    if (frame === 0) throw new EditError("Frame 0 stays Aligned (all zeros)");
    ensureTimelineFits(d, frame);
    ensureKeyAt(d, frame);
    const kf = keyAt(d, frame)!;
    let v = round3(value);
    if (String(stepper).startsWith("linear_")) {
      v = round3(clampLinearMm(v, linearMaxMmForStepper(stepper, d.limits), d.limits.min_linear_mm ?? 0));
    } else if (String(stepper).startsWith("rotary_")) {
      v = round3(clampRotaryJump(prevStepperValue(d, frame, stepper), v));
    }
    kf.steppers = { ...kf.steppers, [stepper]: v };
  });

export const nudgeLane = (doc: MotionBuilderDocument, frames: number[], laneId: string, delta: number) =>
  produce(doc, (d) => {
    for (const f of frames.filter((x) => x > 0)) {
      const kf = keyAt(d, f);
      if (kf && kf.lanes[laneId] !== undefined) {
        writeLane(d, f, laneId, Number(kf.lanes[laneId] ?? 0) + delta);
      }
    }
  });

export function moveKeyframe(doc: MotionBuilderDocument, from: number, to: number): MotionBuilderDocument {
  const target = Math.max(1, Math.min(lastFrame(doc), Math.round(to)));
  if (from === 0) throw new EditError("Frame 0 is locked to Aligned");
  if (target !== from && keyAt(doc, target)) throw new EditError(`Frame ${target} is occupied`);
  return produce(doc, (d) => {
    const kf = keyAt(d, from);
    if (kf) kf.frame = target;
  });
}
