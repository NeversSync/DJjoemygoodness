import {
  COLLISION_BOX_PAIRS,
  clampLinearMm,
  DEFAULT_FPS,
  DEFAULT_LIMITS,
  linearMaxMmForStepper,
} from "../constants";
import { findPillarCollision, isCollisionRisk, tierMaxMm } from "../collision";
import { expandKeyframePositions, groupIdForStepper } from "../document";
import { interpolateForwardPositions, keyDefinesStepper } from "../interpolate";
import { trapezoidMinTimeS } from "../physics";
import type {
  LinearStepper,
  MotionBuilderDocument,
  MotionKeyframe,
  MotionLimits,
  PhysicsViolation,
  RotaryStepper,
  StepperName,
} from "../types";
import { EditError, ensureTimelineFits, keyAt, produce, round3 } from "./produce";
import { setLaneValue, setStepperOverride } from "./keyframes";

export type SolveMode = "scale" | "spread";

const PILLAR_SAFE_FRAC = 0.85;
/** Just under the risk threshold so dense sampling clears. */
const PILLAR_SAFE_MARGIN_MM = 0.05;
const PILLAR_SAFE_ANGLE_FRAC = 0.9;

type SpanNums = {
  prevFrame: number;
  frame: number;
  frameDelta: number;
  dt: number;
  budget: number;
  fps: number;
  prevVal: number;
  endVal: number;
};

function limitsOf(doc: MotionBuilderDocument): Required<MotionLimits> {
  const L = { ...DEFAULT_LIMITS, ...doc.limits } as Required<MotionLimits>;
  L.max_time_scale = Number(L.max_time_scale || 1);
  return L;
}

function spanNums(doc: MotionBuilderDocument, v: PhysicsViolation): SpanNums {
  const L = limitsOf(doc);
  const fps = Number(doc.fps || DEFAULT_FPS);
  const frame = v.frame;
  const prevFrame = v.prev_frame ?? 0;
  const frameDelta = Math.max(1, frame - prevFrame);
  const dt = frameDelta / Math.max(fps, 1);
  const budget = dt * L.max_time_scale;
  let prevVal = 0;
  let endVal = 0;
  if (v.stepper) {
    const prevKf = keyAt(doc, prevFrame);
    const endKf = keyAt(doc, frame);
    if (prevKf) prevVal = expandKeyframePositions(doc, prevKf)[v.stepper];
    if (endKf) endVal = expandKeyframePositions(doc, endKf)[v.stepper];
  }
  return { prevFrame, frame, frameDelta, dt, budget, fps, prevVal, endVal };
}

/** Scale factor ≤1 to bring the span under the violated limit; 1 if already ok / N/A. */
export function scaleRatioForViolation(doc: MotionBuilderDocument, v: PhysicsViolation): number {
  const L = limitsOf(doc);
  const sp = spanNums(doc, v);
  const dist = Math.abs(sp.endVal - sp.prevVal);
  switch (v.code) {
    case "linear_above_max":
    case "linear_below_min":
    case "pillar_collision":
      return 1;
    case "linear_speed": {
      const cap = L.max_linear_speed * L.max_time_scale;
      const speed = sp.dt > 0 ? dist / sp.dt : 0;
      return speed > 1e-9 ? Math.min(1, cap / speed) : 1;
    }
    case "linear_accel_time": {
      const tMin = trapezoidMinTimeS(dist, L.max_linear_speed, L.linear_accel);
      return tMin > 1e-9 ? Math.min(1, sp.budget / tMin) : 1;
    }
    case "rotary_delta": {
      const perFrame = dist / sp.frameDelta;
      return perFrame > 1e-9 ? Math.min(1, L.max_rotary_delta_per_step / perFrame) : 1;
    }
    case "rotary_speed": {
      const cap = L.max_rotary_speed * L.max_time_scale;
      const speed = sp.dt > 0 ? dist / sp.dt : 0;
      return speed > 1e-9 ? Math.min(1, cap / speed) : 1;
    }
    case "rotary_accel_time": {
      const tMin = trapezoidMinTimeS(dist, L.max_rotary_speed, L.rotary_accel);
      return tMin > 1e-9 ? Math.min(1, sp.budget / tMin) : 1;
    }
    default:
      return 1;
  }
}

/** Minimum frameDelta needed to clear the violation (spread target). */
export function neededFramesForViolation(doc: MotionBuilderDocument, v: PhysicsViolation): number {
  const L = limitsOf(doc);
  const sp = spanNums(doc, v);
  const dist = Math.abs(sp.endVal - sp.prevVal);
  switch (v.code) {
    case "linear_speed": {
      const cap = L.max_linear_speed * L.max_time_scale;
      return Math.max(sp.frameDelta + 1, Math.ceil((dist / Math.max(cap, 1e-6)) * sp.fps));
    }
    case "linear_accel_time": {
      const tMin = trapezoidMinTimeS(dist, L.max_linear_speed, L.linear_accel);
      return Math.max(sp.frameDelta + 1, Math.ceil(tMin * Math.max(sp.fps, 1)));
    }
    case "rotary_delta":
      return Math.max(sp.frameDelta + 1, Math.ceil(dist / Math.max(L.max_rotary_delta_per_step, 1e-6)));
    case "rotary_speed": {
      const cap = L.max_rotary_speed * L.max_time_scale;
      return Math.max(sp.frameDelta + 1, Math.ceil((dist / Math.max(cap, 1e-6)) * sp.fps));
    }
    case "rotary_accel_time": {
      const tMin = trapezoidMinTimeS(dist, L.max_rotary_speed, L.rotary_accel);
      return Math.max(sp.frameDelta + 1, Math.ceil(tMin * Math.max(sp.fps, 1)));
    }
    default:
      return sp.frameDelta;
  }
}

function writeStepperAt(
  doc: MotionBuilderDocument,
  frame: number,
  stepper: StepperName,
  value: number,
): MotionBuilderDocument {
  const gid = groupIdForStepper(doc, stepper);
  if (gid) {
    const g = doc.groups.find((x) => x.id === gid);
    const kf = keyAt(doc, frame);
    if (kf?.steppers?.[stepper] !== undefined || (g && g.steppers.length === 1)) {
      return setStepperOverride(doc, frame, stepper, value);
    }
    return setLaneValue(doc, frame, gid, value);
  }
  return setStepperOverride(doc, frame, stepper, value);
}

function collisionPair(rot: StepperName) {
  return COLLISION_BOX_PAIRS.find(([r]) => r === rot) as
    | readonly [RotaryStepper, LinearStepper, number]
    | undefined;
}

function safeLinearCapMm(lin: LinearStepper, L: MotionLimits): number {
  return round3(PILLAR_SAFE_FRAC * tierMaxMm(lin, L) - PILLAR_SAFE_MARGIN_MM);
}

function maxSafeDeg(linMm: number, maxExt: number): number {
  const frac = Math.min(0.95, Math.max(0.5, PILLAR_SAFE_FRAC));
  const span = Math.max(1e-6, (1 - frac) * maxExt);
  return 10 + ((maxExt - linMm) / span) * 50;
}

function pyMod(a: number, n: number) {
  return ((a % n) + n) % n;
}

/** Rotate `rotDeg` into the safe tip cone for this depth / phase. */
export function nearestSafeTipDeg(
  rotDeg: number,
  phaseDeg: number,
  linMm: number,
  maxExt: number,
): number {
  const maxSafe = maxSafeDeg(linMm, maxExt) * PILLAR_SAFE_ANGLE_FRAC;
  const mod = pyMod(rotDeg - phaseDeg, 120);
  const dist = Math.min(mod, 120 - mod);
  if (dist <= maxSafe) return rotDeg;
  const targetMod = mod <= 60 ? maxSafe : 120 - maxSafe;
  return round3(rotDeg + (targetMod - mod));
}

/** Snap tip to the nearest phase lattice center (safest angle at any depth). */
export function nearestLatticeTipDeg(rotDeg: number, phaseDeg: number): number {
  const mod = pyMod(rotDeg - phaseDeg, 120);
  const delta = mod <= 60 ? -mod : 120 - mod;
  return round3(rotDeg + delta);
}

function definingKeysAround(
  doc: MotionBuilderDocument,
  frame: number,
  stepper: StepperName,
): { prev: MotionKeyframe; next: MotionKeyframe } {
  let prev = doc.keyframes[0]!;
  let next = doc.keyframes.at(-1)!;
  let sawNext = false;
  for (const kf of doc.keyframes) {
    if (!keyDefinesStepper(doc, kf, stepper)) continue;
    if (kf.frame <= frame) prev = kf;
    if (kf.frame >= frame && !sawNext) {
      next = kf;
      sawNext = true;
    }
  }
  return { prev, next };
}

function lastAuthoredFrame(doc: MotionBuilderDocument): number {
  return doc.keyframes.at(-1)?.frame ?? 0;
}

function deepLinearSpans(samples: number[], thresh: number): { from: number; to: number }[] {
  const spans: { from: number; to: number }[] = [];
  let start: number | null = null;
  for (let f = 0; f < samples.length; f++) {
    if (samples[f]! >= thresh) {
      if (start == null) start = f;
    } else if (start != null) {
      spans.push({ from: start, to: f - 1 });
      start = null;
    }
  }
  if (start != null) spans.push({ from: start, to: samples.length - 1 });
  return spans;
}

function tryWriteStepperAt(
  doc: MotionBuilderDocument,
  frame: number,
  stepper: StepperName,
  value: number,
): MotionBuilderDocument {
  if (frame <= 0) return doc;
  try {
    return writeStepperAt(doc, frame, stepper, value);
  } catch (e) {
    if (e instanceof EditError) return doc;
    throw e;
  }
}

/**
 * Hold the tip on one lattice-safe angle through a deep-linear span so
 * interpolation cannot sweep across the pillar. Bounds snap out to the
 * document grid so new keys stay GCode-friendly.
 */
function holdTipThroughSpan(
  doc: MotionBuilderDocument,
  rot: RotaryStepper,
  _phase: number,
  from: number,
  to: number,
  holdDeg: number,
): MotionBuilderDocument {
  const step = Math.max(1, doc.grid_step || 10);
  const lo = Math.max(0, Math.floor(from / step) * step);
  const hi = Math.ceil(to / step) * step;
  let out = doc;
  const frames = new Set<number>();
  for (let f = lo; f <= hi; f += step) frames.add(f);
  for (const kf of doc.keyframes) {
    if (kf.frame < lo || kf.frame > hi) continue;
    if (!keyDefinesStepper(doc, kf, rot)) continue;
    frames.add(kf.frame);
  }
  for (const f of [...frames].sort((a, b) => a - b)) {
    out = tryWriteStepperAt(out, f, rot, holdDeg);
  }
  return out;
}

function capLinearKeys(
  doc: MotionBuilderDocument,
  lin: LinearStepper,
  cap: number,
  fromFrame: number,
  toFrame: number,
): MotionBuilderDocument {
  let out = doc;
  for (const kf of doc.keyframes) {
    if (kf.frame < fromFrame || kf.frame > toFrame) continue;
    if (!keyDefinesStepper(out, kf, lin)) continue;
    const val = expandKeyframePositions(out, kf)[lin];
    if (val > cap) out = writeStepperAt(out, kf.frame, lin, cap);
  }
  return out;
}

/** Scale tip collision: pull the paired linear just under the safe extension. */
function scalePillarCollision(doc: MotionBuilderDocument, v: PhysicsViolation): MotionBuilderDocument {
  if (!v.stepper) throw new EditError("No rotary on this tip collision");
  const pair = collisionPair(v.stepper);
  if (!pair) throw new EditError("Unknown tip / box pair for Scale");
  const [, lin] = pair;
  const L = limitsOf(doc);
  const cap = safeLinearCapMm(lin, L);
  const hit = v.frame;
  const { prev, next } = definingKeysAround(doc, hit, lin);

  let out = capLinearKeys(doc, lin, cap, prev.frame, next.frame);
  if (findPillarCollision(interpolateForwardPositions(out), L)) {
    out = capLinearKeys(out, lin, cap, 0, lastAuthoredFrame(out));
  }
  if (findPillarCollision(interpolateForwardPositions(out), L)) {
    throw new EditError("Scale could not clear tip collision — try Spread (rotate tip)");
  }
  return out;
}

/**
 * Spread tip collision: while linears are in the risk band, hold tips on the
 * nearest phase-lattice center so the path cannot sweep across the pillar.
 */
function spreadPillarCollision(doc: MotionBuilderDocument, v: PhysicsViolation): MotionBuilderDocument {
  if (!v.stepper) throw new EditError("No rotary on this tip collision");
  const seed = collisionPair(v.stepper);
  if (!seed) throw new EditError("Unknown tip / box pair for Spread");
  const L = limitsOf(doc);
  const gid = groupIdForStepper(doc, v.stepper);
  const pairs = COLLISION_BOX_PAIRS.filter(([rot]) =>
    gid ? groupIdForStepper(doc, rot) === gid : rot === v.stepper);

  let out = doc;
  let edited = false;
  // Prefer the reported pair first; siblings share the rotary lane under lockstep.
  for (const [rot, lin, phase] of [seed, ...pairs.filter((p) => p !== seed)]) {
    if (edited && !findPillarCollision(interpolateForwardPositions(out), L)) break;
    const forward = interpolateForwardPositions(out);
    const maxExt = tierMaxMm(lin, L);
    const spans = deepLinearSpans(forward[lin], PILLAR_SAFE_FRAC * maxExt);
    for (const sp of spans) {
      const entry = forward[rot][sp.from];
      if (entry == null) continue;
      const hold = nearestLatticeTipDeg(entry, phase);
      out = holdTipThroughSpan(out, rot, phase, sp.from, sp.to, hold);
      edited = true;
    }
  }

  if (!edited) {
    const [rot, lin, phase] = seed;
    const forward = interpolateForwardPositions(doc);
    const r = forward[rot]?.[v.frame];
    const l = forward[lin]?.[v.frame];
    if (r == null || l == null) throw new EditError("Missing pose at tip-collision frame");
    const maxExt = tierMaxMm(lin, L);
    if (!isCollisionRisk(r, l, phase, maxExt)) {
      throw new EditError("Nothing to spread — tip already clear at this frame");
    }
    const hold = nearestLatticeTipDeg(r, phase);
    const { prev, next } = definingKeysAround(doc, v.frame, rot);
    out = holdTipThroughSpan(doc, rot, phase, prev.frame, next.frame, hold);
  }

  if (findPillarCollision(interpolateForwardPositions(out), L)) {
    throw new EditError("Spread could not clear tip collision — try Scale (pull linear back)");
  }
  return out;
}

function scaleViolation(doc: MotionBuilderDocument, v: PhysicsViolation): MotionBuilderDocument {
  if (v.code === "crash_zone") {
    throw new EditError("Scale cannot auto-fix crash zone — stagger or pull linears manually");
  }
  if (v.code === "pillar_collision") return scalePillarCollision(doc, v);
  if (!v.stepper) throw new EditError("No stepper on this violation to scale");

  const L = limitsOf(doc);
  const sp = spanNums(doc, v);
  const s = v.stepper;

  if (v.code === "linear_above_max") {
    const maxMm = tierMaxMm(s as Parameters<typeof tierMaxMm>[0], L);
    return writeStepperAt(doc, v.frame, s, clampLinearMm(sp.endVal, maxMm, L.min_linear_mm ?? 0));
  }
  if (v.code === "linear_below_min") {
    return writeStepperAt(doc, v.frame, s, clampLinearMm(sp.endVal, linearMaxMmForStepper(s, L), L.min_linear_mm ?? 0));
  }

  const ratio = scaleRatioForViolation(doc, v);
  if (ratio >= 0.999) throw new EditError("Nothing to scale — already within limits");
  const next = round3(sp.prevVal + (sp.endVal - sp.prevVal) * ratio);
  return writeStepperAt(doc, v.frame, s, next);
}

/** Next grid-aligned frame at least `prev + needed` away (preserves GCode grid). */
export function gridSpreadTarget(prevFrame: number, needed: number, gridStep: number): number {
  const step = Math.max(1, gridStep);
  const dur = Math.max(step, Math.ceil(needed / step) * step);
  return prevFrame + dur;
}

/**
 * Keep every keyframe's time (esp. grid stops). Reshape this lane's vertical
 * values along a linear ramp from prev→end over the minimum grid-aligned
 * duration that clears the limit — minimum viable solution without retiming.
 */
function spreadViolation(doc: MotionBuilderDocument, v: PhysicsViolation): MotionBuilderDocument {
  if (v.code === "pillar_collision") return spreadPillarCollision(doc, v);
  if (
    v.code === "linear_above_max"
    || v.code === "linear_below_min"
    || v.code === "crash_zone"
  ) {
    throw new EditError("Spread cannot fix absolute travel / crash — use Scale or edit values");
  }
  if (!v.stepper) throw new EditError("No stepper on this violation to spread");

  const sp = spanNums(doc, v);
  const needed = neededFramesForViolation(doc, v);
  if (needed <= sp.frameDelta) {
    throw new EditError("Nothing to spread — already enough frames");
  }

  const step = Math.max(1, doc.grid_step || 10);
  const targetFrame = gridSpreadTarget(sp.prevFrame, needed, step);
  const span = targetFrame - sp.prevFrame;
  if (span <= 0) throw new EditError("Nothing to spread — already enough frames");

  const framesToWrite = new Set<number>();
  for (let f = sp.prevFrame + step; f <= targetFrame; f += step) framesToWrite.add(f);
  for (const kf of doc.keyframes) {
    if (kf.frame > sp.prevFrame && kf.frame <= targetFrame) framesToWrite.add(kf.frame);
  }
  framesToWrite.add(sp.frame);
  framesToWrite.add(targetFrame);

  let next = doc;
  const sorted = [...framesToWrite].sort((a, b) => a - b);
  for (const f of sorted) {
    const t = (f - sp.prevFrame) / span;
    const val = round3(sp.prevVal + (sp.endVal - sp.prevVal) * t);
    next = writeStepperAt(next, f, v.stepper, val);
  }
  return produce(next, (d) => {
    d.interpolate = true;
    ensureTimelineFits(d, targetFrame);
  });
}

/**
 * Apply Scale or Spread for one physics violation. Throws EditError when
 * the mode cannot help — callers map that to a status message (Undo-safe: no partial edit).
 */
export function solvePhysicsViolation(
  doc: MotionBuilderDocument,
  v: PhysicsViolation,
  mode: SolveMode,
): MotionBuilderDocument {
  return mode === "scale" ? scaleViolation(doc, v) : spreadViolation(doc, v);
}

/** True when Scale is a sensible option for this code. */
export function canScale(code: PhysicsViolation["code"]): boolean {
  return code !== "crash_zone";
}

/** True when Spread is a sensible option for this code. */
export function canSpread(code: PhysicsViolation["code"]): boolean {
  return (
    code === "linear_speed"
    || code === "linear_accel_time"
    || code === "rotary_delta"
    || code === "rotary_speed"
    || code === "rotary_accel_time"
    || code === "pillar_collision"
  );
}
