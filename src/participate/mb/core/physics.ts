import { ALL_LINEAR_STEPPERS, ALL_STEPPERS, DEFAULT_FPS, DEFAULT_LIMITS, stepperKind } from "./constants";
import { findPillarCollision, tierMaxMm } from "./collision";
import { ensureAlignedFrame0, expandKeyframePositions, groupIdForStepper, normalizeGroupColor } from "./document";
import { interpolateForwardPositions, keyDefinesStepper } from "./interpolate";
import { pyFixed as f, pyFloat } from "./pyformat";
import type {
  MotionBuilderDocument,
  MotionLimits,
  PhysicsResult,
  PhysicsViolation,
  StepperName,
  StepperPositions,
  ViolationCode,
  LinearStepper,
} from "./types";

/** Minimum seconds to cover |distance| under vmax + symmetric accel/decel. */
export function trapezoidMinTimeS(distance: number, vmax: number, accel: number): number {
  const dist = Math.abs(distance);
  if (dist < 1e-9) return 0;
  const v = Math.max(vmax, 1e-6);
  const a = Math.max(accel, 1e-6);
  const dAcc = (v * v) / (2 * a);
  return dist <= 2 * dAcc ? 2 * Math.sqrt(dist / a) : 2 * (v / a) + (dist - 2 * dAcc) / v;
}

/** Max |distance| reachable in `timeSec` under vmax + symmetric accel/decel. */
export function trapezoidMaxDist(timeSec: number, vmax: number, accel: number): number {
  const t = Math.max(0, timeSec);
  if (t < 1e-9) return 0;
  const v = Math.max(vmax, 1e-6);
  const a = Math.max(accel, 1e-6);
  const tRamp = v / a;
  // Triangle profile: accel then immediately decel (never reaches vmax).
  if (t < 2 * tRamp) {
    const half = t / 2;
    return a * half * half;
  }
  // Trapezoid: accel to vmax, cruise, then decel.
  return v * v / a + v * (t - 2 * tRamp);
}

const floorPct = (ratio: number) => Math.max(1, Math.floor((ratio * 100) / 5) * 5);
const scaleOrSpread = (pct: number, noun: string, needed: number, frameDelta: number) =>
  `scale down to ~${pct}% ${noun}, or spread over ≥${needed} frames (now ${frameDelta})`;

type RecOpts = { distance: number; tMin: number; budget: number; fps: number; frameDelta: number; noun: string };

export function recommendScaleOrSpread({ distance, tMin, budget, fps, frameDelta, noun }: RecOpts): string {
  if (tMin <= budget * 1.01 || Math.abs(distance) < 1e-6) return "";
  const needed = Math.max(frameDelta + 1, Math.ceil(tMin * Math.max(fps, 1)));
  return scaleOrSpread(floorPct(budget / tMin), noun, needed, frameDelta);
}

type Span = { frame: number; prev: number; frameDelta: number; dt: number; budget: number; fps: number };
type Row = { stepper: StepperName | null; code: ViolationCode; message: string; recommendation?: string; prevFrame?: number | null };

function makeViolation(doc: MotionBuilderDocument, frame: number, prevFrame: number | null, row: Row): PhysicsViolation {
  const recommendation = row.recommendation || null;
  return {
    frame, prev_frame: prevFrame, stepper: row.stepper, group_id: groupIdForStepper(doc, row.stepper),
    code: row.code, message: row.message, recommendation,
    display: recommendation ? `${row.message} — recc: ${recommendation}` : row.message,
  };
}

function spanFor(prev: number, frame: number, fps: number, L: Required<MotionLimits>): Span {
  const frameDelta = Math.max(1, frame - prev);
  const dt = frameDelta / Math.max(fps, 1);
  return { frame, prev, frameDelta, dt, budget: dt * L.max_time_scale, fps };
}

function linearRows(s: StepperName, val: number, prevVal: number, sp: Span, L: Required<MotionLimits>): Row[] {
  const rows: Row[] = [];
  const spanTxt = `span ${sp.prev}→${sp.frame} = ${sp.frameDelta}fr / ${f(sp.dt, 3)}s`;
  if (val < L.min_linear_mm - 0.05) {
    rows.push({ stepper: s, code: "linear_below_min", message: `${s}=${f(val, 2)} mm below MIN`,
      recommendation: "raise this keyframe travel to ≥0 mm" });
  }
  const tierMax = tierMaxMm(s as LinearStepper, L);
  if (val > tierMax + 0.05) {
    rows.push({ stepper: s, code: "linear_above_max", message: `${s}=${f(val, 2)} mm exceeds max ${pyFloat(tierMax)}`,
      recommendation: `cap travel at ≤${f(tierMax, 0)} mm` });
  }
  const dist = Math.abs(val - prevVal);
  const speed = sp.dt > 0 ? dist / sp.dt : 0;
  const cap = L.max_linear_speed * L.max_time_scale;
  if (speed > cap * 1.01) {
    const needed = Math.max(sp.frameDelta + 1, Math.ceil((dist / Math.max(cap, 1e-6)) * sp.fps));
    rows.push({ stepper: s, code: "linear_speed",
      message: `${s} needs ${f(speed, 1)} mm/s (cap ${f(cap, 1)} with time_scale≤${pyFloat(L.max_time_scale)}; ${spanTxt})`,
      recommendation: scaleOrSpread(floorPct(cap / Math.max(speed, 1e-6)), "travel", needed, sp.frameDelta) });
    return rows;
  }
  const tMin = trapezoidMinTimeS(dist, L.max_linear_speed, L.linear_accel);
  if (tMin > sp.budget * 1.01) {
    rows.push({ stepper: s, code: "linear_accel_time",
      message: `${s} needs ${f(tMin, 3)}s for ${f(dist, 1)} mm @ ${f(L.max_linear_speed, 0)} mm/s / ` +
        `${f(L.linear_accel, 0)} mm/s² (${spanTxt} budget ${f(sp.budget, 3)}s)`,
      recommendation: recommendScaleOrSpread({ distance: dist, tMin, budget: sp.budget, fps: sp.fps,
        frameDelta: sp.frameDelta, noun: "travel" }) });
  }
  return rows;
}

/** Rotary travel is authored absolute (no ±180 wrap) so multi-turn moves score honestly. */
function rotaryRows(s: StepperName, val: number, prevVal: number, sp: Span, L: Required<MotionLimits>): Row[] {
  const travel = Math.abs(val - prevVal);
  const perFrame = travel / sp.frameDelta;
  const speed = sp.dt > 0 ? travel / sp.dt : 0;
  const cap = L.max_rotary_speed * L.max_time_scale;
  const maxDelta = L.max_rotary_delta_per_step;
  if (perFrame > maxDelta * 1.01) {
    const needed = Math.max(sp.frameDelta + 1, Math.ceil(travel / Math.max(maxDelta, 1e-6)));
    return [{ stepper: s, code: "rotary_delta",
      message: `${s} travels ${f(travel, 1)}° across ${sp.frameDelta} frames (${f(perFrame, 1)}°/frame; ` +
        `max ${f(maxDelta, 0)}°/frame); span ${sp.prev}→${sp.frame} (${f(sp.dt, 3)}s)`,
      recommendation: scaleOrSpread(floorPct(maxDelta / Math.max(perFrame, 1e-6)), "rotation", needed, sp.frameDelta) }];
  }
  if (speed > cap * 1.01) {
    const needed = Math.max(sp.frameDelta + 1, Math.ceil((travel / Math.max(cap, 1e-6)) * sp.fps));
    return [{ stepper: s, code: "rotary_speed",
      message: `${s} needs ${f(speed, 1)} deg/s (cap ${f(cap, 1)} with time_scale≤${pyFloat(L.max_time_scale)}; ` +
        `Δ${f(travel, 1)}° over ${sp.frameDelta}fr / ${f(sp.dt, 3)}s span ${sp.prev}→${sp.frame})`,
      recommendation: scaleOrSpread(floorPct(cap / Math.max(speed, 1e-6)), "rotation", needed, sp.frameDelta) }];
  }
  const tMin = trapezoidMinTimeS(travel, L.max_rotary_speed, L.rotary_accel);
  if (tMin <= sp.budget * 1.01) return [];
  return [{ stepper: s, code: "rotary_accel_time",
    message: `${s} needs ${f(tMin, 3)}s for ${f(travel, 1)}° @ ${f(L.max_rotary_speed, 0)} deg/s / ` +
      `${f(L.rotary_accel, 0)} deg/s² (span ${sp.prev}→${sp.frame} = ${sp.frameDelta}fr / ${f(sp.dt, 3)}s budget ${f(sp.budget, 3)}s)`,
    recommendation: recommendScaleOrSpread({ distance: travel, tMin, budget: sp.budget, fps: sp.fps,
      frameDelta: sp.frameDelta, noun: "rotation" }) }];
}

function crashZoneRow(pos: StepperPositions, L: Required<MotionLimits>): Row[] {
  const deep = ALL_LINEAR_STEPPERS.filter((s) => pos[s] > tierMaxMm(s, L) * 0.85);
  if (deep.length < 5) return [];
  return [{ stepper: null, code: "crash_zone",
    message: `${deep.length} linears near max extension — reduce travel or stagger groups`,
    recommendation: "pull ≥1 linear group back under ~85% extension before this frame, or stagger deep moves" }];
}

/** Pose at a key with deleted lanes held from their last authored value (not zero). */
function heldPoseAt(
  doc: MotionBuilderDocument,
  kfs: MotionBuilderDocument["keyframes"],
  atIdx: number,
): StepperPositions {
  const at = kfs[atIdx]!;
  const held = expandKeyframePositions(doc, at);
  for (const s of ALL_STEPPERS) {
    if (keyDefinesStepper(doc, at, s)) continue;
    for (let i = atIdx; i >= 0; i--) {
      if (!keyDefinesStepper(doc, kfs[i]!, s)) continue;
      held[s] = expandKeyframePositions(doc, kfs[i]!)[s];
      break;
    }
  }
  return held;
}

export function sortViolationsByGroupOrder(doc: MotionBuilderDocument, rows: PhysicsViolation[]): PhysicsViolation[] {
  const order = new Map(doc.groups.map((g, i) => [g.id, i]));
  const colors = new Map(doc.groups.map((g, i) => [g.id, normalizeGroupColor(g.color, i)]));
  const rank = (v: PhysicsViolation) => order.get(v.group_id ?? "") ?? 10_000;
  const cmp = (a: string, b: string) => (a < b ? -1 : a > b ? 1 : 0);
  return rows
    .map((v) => (v.group_id && !v.color ? { ...v, color: colors.get(v.group_id) } : { ...v }))
    .sort((a, b) => rank(a) - rank(b) || a.frame - b.frame || cmp(a.stepper ?? "", b.stepper ?? ""));
}

const fail = (doc: MotionBuilderDocument, frame: number, rows: PhysicsViolation[]): PhysicsResult =>
  ({ ok: false, break_frame: frame, violations: sortViolationsByGroupOrder(doc, rows), checked_keyframes: frame });

/**
 * Walk authored keyframes against hardware limits; stops at the first failing span.
 * Per-stepper spans skip time stops that no longer define that stepper (lane delete),
 * so a deleted center key at frame 539 does not read as 0° and invent a huge jump.
 */
export function checkPhysics(input: MotionBuilderDocument): PhysicsResult {
  const doc = ensureAlignedFrame0(input);
  const L = { ...DEFAULT_LIMITS, ...doc.limits } as Required<MotionLimits>;
  L.max_time_scale = Number(L.max_time_scale || 1);
  const fps = Number(doc.fps || DEFAULT_FPS);
  const kfs = doc.keyframes;

  const lastFrame: Partial<Record<StepperName, number>> = {};
  const lastVal: Partial<Record<StepperName, number>> = {};
  const origin = expandKeyframePositions(doc, kfs[0]!);
  for (const s of ALL_STEPPERS) {
    lastFrame[s] = kfs[0]!.frame;
    lastVal[s] = origin[s];
  }

  for (let ki = 1; ki < kfs.length; ki++) {
    const kf = kfs[ki]!;
    const pos = expandKeyframePositions(doc, kf);
    const rows: Row[] = [];
    for (const s of ALL_STEPPERS) {
      if (!keyDefinesStepper(doc, kf, s)) continue;
      const prev = lastFrame[s] ?? 0;
      const prevPos = lastVal[s] ?? 0;
      const sp = spanFor(prev, kf.frame, fps, L);
      const local = (stepperKind(s) === "linear" ? linearRows : rotaryRows)(s, pos[s], prevPos, sp, L);
      for (const r of local) rows.push({ ...r, prevFrame: prev });
      lastFrame[s] = kf.frame;
      lastVal[s] = pos[s];
    }
    rows.push(...crashZoneRow(heldPoseAt(doc, kfs, ki), L));
    if (rows.length) {
      return fail(doc, kf.frame, rows.map((r) =>
        makeViolation(doc, kf.frame, r.prevFrame ?? null, r)));
    }
  }

  const hit = findPillarCollision(interpolateForwardPositions(doc), L);
  if (hit) {
    return fail(doc, hit.frame, [makeViolation(doc, hit.frame, null, { stepper: hit.rotary as StepperName,
      code: "pillar_collision", message: hit.message,
      recommendation: "reduce linear extension and/or rotate the tip away from the pillar before this frame" })]);
  }
  return { ok: true, break_frame: null, violations: [], checked_keyframes: kfs.at(-1)?.frame ?? 0 };
}

/**
 * Violations for the authored span that contains `frame`.
 * Sparse-aware: each stepper uses its own previous/next defining keys.
 */
export function spanViolationsAtFrame(input: MotionBuilderDocument, frame: number): PhysicsViolation[] {
  const doc = ensureAlignedFrame0(input);
  const L = { ...DEFAULT_LIMITS, ...doc.limits } as Required<MotionLimits>;
  L.max_time_scale = Number(L.max_time_scale || 1);
  const fps = Number(doc.fps || DEFAULT_FPS);
  const kfs = doc.keyframes;
  if (kfs.length < 2) return [];

  const rows: PhysicsViolation[] = [];
  for (const s of ALL_STEPPERS) {
    let prev = kfs[0]!;
    let next: (typeof kfs)[number] | null = null;
    for (const kf of kfs) {
      if (!keyDefinesStepper(doc, kf, s)) continue;
      if (kf.frame <= frame) prev = kf;
      if (kf.frame > frame) { next = kf; break; }
    }
    if (!next || prev.frame === next.frame) continue;
    if (!keyDefinesStepper(doc, prev, s)) continue;
    const prevPos = expandKeyframePositions(doc, prev)[s];
    const pos = expandKeyframePositions(doc, next)[s];
    const sp = spanFor(prev.frame, next.frame, fps, L);
    const local = (stepperKind(s) === "linear" ? linearRows : rotaryRows)(s, pos, prevPos, sp, L);
    rows.push(...local.map((r) => makeViolation(doc, next.frame, prev.frame, r)));
  }

  let atIdx = 0;
  for (let i = 0; i < kfs.length; i++) {
    if (kfs[i]!.frame <= frame) atIdx = i;
    else break;
  }
  rows.push(...crashZoneRow(heldPoseAt(doc, kfs, atIdx), L)
    .map((r) => makeViolation(doc, kfs[atIdx]!.frame, null, r)));
  return sortViolationsByGroupOrder(doc, rows);
}
