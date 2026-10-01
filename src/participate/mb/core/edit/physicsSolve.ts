import { clampLinearMm, DEFAULT_FPS, DEFAULT_LIMITS, linearMaxMmForStepper } from "../constants";
import { tierMaxMm } from "../collision";
import { expandKeyframePositions, groupIdForStepper } from "../document";
import { trapezoidMinTimeS } from "../physics";
import type {
  MotionBuilderDocument,
  MotionLimits,
  PhysicsViolation,
  StepperName,
} from "../types";
import { EditError, ensureTimelineFits, keyAt, produce, round3 } from "./produce";
import { setLaneValue, setStepperOverride } from "./keyframes";

export type SolveMode = "scale" | "spread";

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
      return 1; // absolute clamp, not travel scale
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

function scaleViolation(doc: MotionBuilderDocument, v: PhysicsViolation): MotionBuilderDocument {
  if (v.code === "crash_zone" || v.code === "pillar_collision") {
    throw new EditError("Scale cannot auto-fix crash/pillar — edit Preview or stagger linears");
  }
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
  if (
    v.code === "linear_above_max"
    || v.code === "linear_below_min"
    || v.code === "crash_zone"
    || v.code === "pillar_collision"
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
  return code !== "crash_zone" && code !== "pillar_collision";
}

/** True when Spread is a sensible option for this code. */
export function canSpread(code: PhysicsViolation["code"]): boolean {
  return (
    code === "linear_speed"
    || code === "linear_accel_time"
    || code === "rotary_delta"
    || code === "rotary_speed"
    || code === "rotary_accel_time"
  );
}
