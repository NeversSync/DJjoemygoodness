import {
  COLLISION_BOX_PAIRS,
  clampLinearMm,
  DEFAULT_FPS,
  DEFAULT_LIMITS,
  linearMaxMmForStepper,
  stepperKind,
} from "../constants";
import { findPillarCollision, isCollisionRisk, tierMaxMm } from "../collision";
import { expandKeyframePositions, groupIdForStepper } from "../document";
import { interpolateForwardPositions, keyDefinesStepper } from "../interpolate";
import { checkPhysics, trapezoidMinTimeS } from "../physics";
import type {
  LinearStepper,
  MotionBuilderDocument,
  MotionKeyframe,
  MotionLimits,
  PhysicsViolation,
  RotaryStepper,
  StepperName,
} from "../types";
import { EditError, keyAt, round3 } from "./produce";
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

/** Frames that already author this stepper — Spread never invents new ones. */
function existingDefiningFrames(doc: MotionBuilderDocument, stepper: StepperName): number[] {
  return doc.keyframes.filter((k) => keyDefinesStepper(doc, k, stepper)).map((k) => k.frame);
}

function writeExistingOnly(
  doc: MotionBuilderDocument,
  stepper: StepperName,
  frame: number,
  value: number,
): MotionBuilderDocument {
  const kf = keyAt(doc, frame);
  if (!kf || !keyDefinesStepper(doc, kf, stepper)) return doc;
  return tryWriteStepperAt(doc, frame, stepper, value);
}

/** Stable id for All-loop dedupe. */
export function violationFingerprint(v: PhysicsViolation): string {
  return `${v.code}|${v.frame}|${v.prev_frame ?? ""}|${v.stepper ?? ""}`;
}

/** Lane/override snapshot so we can detect no-op solves. */
function stepperValueFingerprint(doc: MotionBuilderDocument, stepper: StepperName): string {
  return existingDefiningFrames(doc, stepper)
    .map((f) => {
      const kf = keyAt(doc, f)!;
      return `${f}:${round3(expandKeyframePositions(doc, kf)[stepper])}`;
    })
    .join(",");
}

/**
 * Hold the tip on one lattice-safe angle through a deep-linear span.
 * Only rewrites existing defining keys covering that span (brackets included).
 */
function holdTipThroughSpan(
  doc: MotionBuilderDocument,
  rot: RotaryStepper,
  _phase: number,
  from: number,
  to: number,
  holdDeg: number,
): MotionBuilderDocument {
  const defining = existingDefiningFrames(doc, rot);
  if (!defining.length) return doc;
  let lo = defining[0]!;
  let hi = defining.at(-1)!;
  for (const f of defining) {
    if (f <= from) lo = f;
    if (f >= to) {
      hi = f;
      break;
    }
    hi = f;
  }
  let out = doc;
  for (const f of defining) {
    if (f < lo || f > hi || f <= 0) continue;
    out = writeExistingOnly(out, rot, f, holdDeg);
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

/** Max |Δvalue| this span can carry under the violated limit (current dt / frames). */
export function maxSpanDistForViolation(doc: MotionBuilderDocument, v: PhysicsViolation): number {
  const L = limitsOf(doc);
  const sp = spanNums(doc, v);
  return maxDistForCode(v.code, sp.frameDelta, sp.dt, sp.budget, L);
}

function maxDistForCode(
  code: PhysicsViolation["code"],
  frameDelta: number,
  dt: number,
  budget: number,
  L: Required<MotionLimits>,
): number {
  switch (code) {
    case "linear_speed":
      return L.max_linear_speed * L.max_time_scale * dt;
    case "rotary_speed":
      return L.max_rotary_speed * L.max_time_scale * dt;
    case "rotary_delta":
      return L.max_rotary_delta_per_step * frameDelta;
    case "linear_accel_time":
      return maxDistForTrapezoidBudget(budget, L.max_linear_speed, L.linear_accel);
    case "rotary_accel_time":
      return maxDistForTrapezoidBudget(budget, L.max_rotary_speed, L.rotary_accel);
    default:
      return Number.POSITIVE_INFINITY;
  }
}

/** Tightest |Δ| allowed across a frame span for this stepper's motion limits. */
function maxDistAcrossSpan(
  doc: MotionBuilderDocument,
  stepper: StepperName,
  frameDelta: number,
): number {
  const L = limitsOf(doc);
  const fps = Number(doc.fps || DEFAULT_FPS);
  const dt = frameDelta / Math.max(fps, 1);
  const budget = dt * L.max_time_scale;
  if (stepperKind(stepper) === "linear") {
    return Math.min(
      maxDistForCode("linear_speed", frameDelta, dt, budget, L),
      maxDistForCode("linear_accel_time", frameDelta, dt, budget, L),
    );
  }
  return Math.min(
    maxDistForCode("rotary_speed", frameDelta, dt, budget, L),
    maxDistForCode("rotary_delta", frameDelta, dt, budget, L),
    maxDistForCode("rotary_accel_time", frameDelta, dt, budget, L),
  );
}

/** Largest |distance| with trapezoidMinTimeS(dist, vmax, a) ≤ budget. */
function maxDistForTrapezoidBudget(budget: number, vmax: number, accel: number): number {
  if (budget <= 1e-9) return 0;
  let lo = 0;
  let hi = Math.max(vmax * budget * 4, 1);
  for (let i = 0; i < 40; i++) {
    if (trapezoidMinTimeS(hi, vmax, accel) <= budget) hi *= 2;
    else break;
  }
  for (let i = 0; i < 48; i++) {
    const mid = (lo + hi) / 2;
    if (trapezoidMinTimeS(mid, vmax, accel) <= budget) lo = mid;
    else hi = mid;
  }
  return lo;
}

function valueAtStepper(doc: MotionBuilderDocument, frame: number, stepper: StepperName): number {
  const kf = keyAt(doc, frame);
  if (kf && keyDefinesStepper(doc, kf, stepper)) {
    return expandKeyframePositions(doc, kf)[stepper];
  }
  let prev = doc.keyframes[0]!;
  let next: MotionKeyframe | null = null;
  for (const k of doc.keyframes) {
    if (!keyDefinesStepper(doc, k, stepper)) continue;
    if (k.frame <= frame) prev = k;
    if (k.frame >= frame && !next) next = k;
  }
  const a = expandKeyframePositions(doc, prev)[stepper];
  if (!next || next.frame === prev.frame) return a;
  const b = expandKeyframePositions(doc, next)[stepper];
  const t = (frame - prev.frame) / (next.frame - prev.frame);
  return a + (b - a) * t;
}

/**
 * When the spike sits against Aligned (frame 0), neighbors cannot move left.
 * Reshape existing keys after 0 onto a legal takeoff ramp that preserves peak
 * magnitude — never inserts new keyframes.
 */
function spreadTakeoffFromAligned(
  doc: MotionBuilderDocument,
  v: PhysicsViolation,
): MotionBuilderDocument {
  if (!v.stepper) throw new EditError("No stepper on this violation to spread");
  const stepper = v.stepper;
  const sp = spanNums(doc, v);
  if (sp.prevFrame > 0) {
    throw new EditError("Takeoff spread is only for spikes against Aligned");
  }
  const peakVal = sp.endVal;
  if (Math.abs(peakVal) < 1e-9) {
    throw new EditError("Nothing to spread — already at Aligned");
  }

  const frames = existingDefiningFrames(doc, stepper).filter((f) => f > 0);
  if (!frames.length) throw new EditError("Spread needs existing keys after Aligned — try Scale");

  // Walk existing spans from 0 until cumulative travel capacity can hold |peakVal|.
  let capacity = 0;
  let landIdx = -1;
  let prevF = 0;
  for (let i = 0; i < frames.length; i++) {
    const f = frames[i]!;
    capacity += maxDistAcrossSpan(doc, stepper, Math.max(1, f - prevF));
    if (capacity >= Math.abs(peakVal) - 1e-6) {
      landIdx = i;
      break;
    }
    prevF = f;
  }
  if (landIdx < 0) {
    throw new EditError("Not enough existing keys to spread takeoff — try Scale");
  }
  // Prefer landing at/after the original peak frame when capacity allows.
  const peakIdx = frames.indexOf(sp.frame);
  if (peakIdx > landIdx) landIdx = peakIdx;

  const landFrame = frames[landIdx]!;
  let out = doc;
  for (let i = 0; i <= landIdx; i++) {
    const f = frames[i]!;
    const t = f / landFrame;
    out = writeExistingOnly(out, stepper, f, round3(peakVal * t));
  }
  out = writeExistingOnly(out, stepper, landFrame, peakVal);

  const still = checkPhysics(out).violations.find(
    (x) => x.stepper === stepper && (x.prev_frame ?? 0) <= 0 && canSpread(x.code),
  );
  if (still) {
    throw new EditError("Spread takeoff could not clear Aligned span — try Scale");
  }
  return out;
}

/**
 * Spread motion limits: keep the offending peak, then walk neighboring
 * *existing* keys toward it (left then right). No new keyframes.
 */
function chainPullTowardPeak(
  doc: MotionBuilderDocument,
  v: PhysicsViolation,
): MotionBuilderDocument {
  if (!v.stepper) throw new EditError("No stepper on this violation to spread");
  const stepper = v.stepper;
  const sp = spanNums(doc, v);
  const dist = Math.abs(sp.endVal - sp.prevVal);
  const maxDist = maxSpanDistForViolation(doc, v);
  if (dist <= maxDist + 1e-6) {
    throw new EditError("Nothing to spread — already within limits");
  }

  if (sp.prevFrame <= 0) {
    return spreadTakeoffFromAligned(doc, v);
  }

  const peakFrame = sp.frame;
  const peakVal = sp.endVal;
  const all = existingDefiningFrames(doc, stepper);
  let peakIdx = all.indexOf(peakFrame);
  if (peakIdx < 0) {
    peakIdx = all.findIndex((f) => f >= peakFrame);
    if (peakIdx < 0) peakIdx = all.length - 1;
  }
  if (peakIdx < 0) throw new EditError("Spread could not locate peak frame");

  // Wave along existing keys only (± a handful of authored samples).
  const WAVE_KEYS = 8;
  const lo = Math.max(0, peakIdx - WAVE_KEYS);
  const hi = Math.min(all.length - 1, peakIdx + WAVE_KEYS);
  const frames = all.slice(lo, hi + 1);
  const localPeakIdx = frames.indexOf(all[peakIdx]!);
  if (localPeakIdx < 0) throw new EditError("Spread could not locate peak frame");

  const vals = new Map<number, number>();
  for (const f of frames) {
    vals.set(f, f === peakFrame ? peakVal : valueAtStepper(doc, f, stepper));
  }
  vals.set(peakFrame, peakVal);

  const pullToward = (fromIdx: number, toIdx: number) => {
    const fFrom = frames[fromIdx]!;
    const fTo = frames[toIdx]!;
    if (fFrom <= 0) return false;
    const frameDelta = Math.max(1, Math.abs(fTo - fFrom));
    const cap = maxDistAcrossSpan(doc, stepper, frameDelta);
    const a = vals.get(fFrom)!;
    const b = vals.get(fTo)!;
    const gap = Math.abs(b - a);
    if (gap <= cap + 1e-6) return false;
    const sign = Math.sign(b - a) || 1;
    let next = round3(b - sign * cap);
    // Don't lift the first key after Aligned past what 0→thatFrame can carry.
    if (frames[0] === 0 || (fromIdx === 0 && all[0] === 0)) {
      const firstMovable = frames.find((f) => f > 0);
      if (firstMovable === fFrom) {
        const capFrom0 = maxDistAcrossSpan(doc, stepper, Math.max(1, fFrom));
        if (Math.abs(next) > capFrom0 + 1e-6) {
          next = round3(Math.sign(next || 1) * capFrom0);
        }
      }
    }
    vals.set(fFrom, next);
    return true;
  };

  let moved = false;
  for (let i = localPeakIdx - 1; i >= 0; i--) {
    if (pullToward(i, i + 1)) moved = true;
  }
  for (let i = localPeakIdx + 1; i < frames.length; i++) {
    if (pullToward(i, i - 1)) moved = true;
  }
  if (!moved) {
    throw new EditError("Spread needs a movable key beside this spike — try Scale");
  }

  let out = doc;
  for (const f of frames) {
    if (f <= 0) continue;
    out = writeExistingOnly(out, stepper, f, vals.get(f)!);
  }
  out = writeExistingOnly(out, stepper, peakFrame, peakVal);

  if (stepperValueFingerprint(out, stepper) === stepperValueFingerprint(doc, stepper)) {
    throw new EditError("Spread made no change — try Scale");
  }
  return out;
}

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
  return chainPullTowardPeak(doc, v);
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

/**
 * Apply Scale/Spread to the first solvable violation. Returns null when
 * physics is already ok, or when no remaining hit can be fixed with `mode`.
 * Pass `attempted` to skip fingerprints already tried in a Spread/Scale All run.
 */
export function solveNextPhysicsViolation(
  doc: MotionBuilderDocument,
  mode: SolveMode,
  attempted?: Set<string>,
): { doc: MotionBuilderDocument; violation: PhysicsViolation } | null {
  const phys = checkPhysics(doc);
  if (phys.ok) return null;
  for (const v of phys.violations) {
    if (mode === "scale" && !canScale(v.code)) continue;
    if (mode === "spread" && !canSpread(v.code)) continue;
    const fp = violationFingerprint(v);
    if (attempted?.has(fp)) continue;
    try {
      const next = solvePhysicsViolation(doc, v, mode);
      if (v.stepper && stepperValueFingerprint(next, v.stepper) === stepperValueFingerprint(doc, v.stepper)) {
        attempted?.add(fp);
        continue;
      }
      return { doc: next, violation: v };
    } catch (e) {
      if (e instanceof EditError) {
        attempted?.add(fp);
        continue;
      }
      throw e;
    }
  }
  return null;
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
