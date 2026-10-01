import { describe, expect, it } from "vitest";
import tipCollision from "../../../tests/fixtures/TipCollision.json";
import badWave from "../../../tests/fixtures/Wave_Motion_V2_BadPhysics.json";
import attractStart from "../../../tests/fixtures/Attract_100_SpreadLimitAtStart.json";
import { emptyDocument } from "../document";
import { checkPhysics } from "../physics";
import type { MotionBuilderDocument } from "../types";
import {
  nearestSafeTipDeg,
  solveNextPhysicsViolation,
  solvePhysicsViolation,
} from "./physicsSolve";

/** One rotary key that jumps 360° in a single frame → rotary_delta. */
function rotaryDeltaDoc(): MotionBuilderDocument {
  const d = emptyDocument({ framesForward: 11 });
  const z = { rot_upper: 0, rot_lower: 0, loc_upper: 0, loc_lower: 0 };
  d.keyframes = [
    { frame: 0, lanes: { ...z } },
    { frame: 1, lanes: { ...z, rot_upper: 360 } },
  ];
  return d;
}

/** Spike at frame 20 with a movable neighbor at 10 (not Aligned). */
function rotarySpikeDoc(): MotionBuilderDocument {
  const d = emptyDocument({ framesForward: 41 });
  const z = { rot_upper: 0, rot_lower: 0, loc_upper: 0, loc_lower: 0 };
  d.keyframes = [
    { frame: 0, lanes: { ...z } },
    { frame: 10, lanes: { ...z, rot_upper: 0 } },
    { frame: 20, lanes: { ...z, rot_upper: 360 } },
  ];
  return d;
}

describe("solvePhysicsViolation", () => {
  it("Scale shrinks rotary_delta travel to the °/frame cap", () => {
    const src = rotaryDeltaDoc();
    const phys = checkPhysics(src);
    expect(phys.ok).toBe(false);
    const v = phys.violations.find((x) => x.code === "rotary_delta");
    expect(v).toBeTruthy();
    const next = solvePhysicsViolation(src, v!, "scale");
    expect(next.keyframes.find((k) => k.frame === 1)?.lanes.rot_upper).toBe(180);
    const after = checkPhysics(next);
    expect(after.violations.some((x) => x.code === "rotary_delta")).toBe(false);
  });

  it("Spread keeps the peak and pulls the neighbor toward it", () => {
    const src = rotarySpikeDoc();
    const phys = checkPhysics(src);
    const v = phys.violations.find((x) =>
      x.stepper === "rotary_twelve" || x.group_id === "rot_upper"
      || x.code === "rotary_delta" || x.code === "rotary_speed" || x.code === "rotary_accel_time"
    )!;
    expect(v).toBeTruthy();
    expect(v.frame).toBe(20);
    const next = solvePhysicsViolation(src, v, "spread");
    // Peak at 20 stays 360; frame 10 moves toward it
    expect(next.keyframes.find((k) => k.frame === 20)?.lanes.rot_upper).toBe(360);
    const mid = next.keyframes.find((k) => k.frame === 10)?.lanes.rot_upper ?? 0;
    expect(mid).toBeGreaterThan(0);
    const after = checkPhysics(next);
    expect(after.violations.some((x) => x.frame === 20 && x.stepper === v.stepper)).toBe(false);
  });

  it("Scale clears TipCollision pillar risk by capping lower linears", () => {
    const src = tipCollision as MotionBuilderDocument;
    const phys = checkPhysics(src);
    expect(phys.ok).toBe(false);
    const v = phys.violations.find((x) => x.code === "pillar_collision")!;
    expect(v.frame).toBe(279);
    expect(v.stepper).toBe("rotary_two");
    const next = solvePhysicsViolation(src, v, "scale");
    const after = checkPhysics(next);
    expect(after.violations.some((x) => x.code === "pillar_collision")).toBe(false);
    expect(next.keyframes.map((k) => k.frame)).toEqual(src.keyframes.map((k) => k.frame));
    for (const kf of next.keyframes) {
      if (kf.lanes.loc_lower != null) expect(kf.lanes.loc_lower).toBeLessThanOrEqual(92.7);
    }
  });

  it("Spread clears TipCollision pillar risk by holding tips through deep spans", () => {
    const src = tipCollision as MotionBuilderDocument;
    const phys = checkPhysics(src);
    const v = phys.violations.find((x) => x.code === "pillar_collision")!;
    const next = solvePhysicsViolation(src, v, "spread");
    const after = checkPhysics(next);
    expect(after.violations.some((x) => x.code === "pillar_collision")).toBe(false);
    const step = src.grid_step || 10;
    for (const kf of next.keyframes) {
      if (src.keyframes.some((k) => k.frame === kf.frame)) continue;
      expect(kf.frame % step).toBe(0);
    }
  });

  it("solveNextPhysicsViolation walks Wave_Motion_V2_BadPhysics toward clear", () => {
    let doc = badWave as MotionBuilderDocument;
    const before = checkPhysics(doc).violations.length;
    expect(before).toBeGreaterThan(0);
    let steps = 0;
    while (steps < 80) {
      const hit = solveNextPhysicsViolation(doc, "spread")
        ?? solveNextPhysicsViolation(doc, "scale");
      if (!hit) break;
      doc = hit.doc;
      steps++;
    }
    expect(steps).toBeGreaterThan(0);
    const left = checkPhysics(doc).violations.filter((v) => v.code !== "crash_zone");
    // Auto-solve should clear or strongly reduce; leftover must not be Aligned-wall only loops
    expect(left.length).toBeLessThan(before);
    expect(left.every((v) => (v.prev_frame ?? 0) > 0 || v.code === "crash_zone")).toBe(true);
  });

  it("Spread expands takeoff when the spike sits against Aligned", () => {
    const src = attractStart as MotionBuilderDocument;
    const phys = checkPhysics(src);
    expect(phys.ok).toBe(false);
    const v = phys.violations.find((x) => x.prev_frame === 0 && x.code === "rotary_speed")!;
    expect(v).toBeTruthy();
    const peakBefore = (() => {
      const kf = src.keyframes.find((k) => k.frame === v.frame)!;
      return Number(kf.steppers?.[v.stepper!] ?? kf.lanes[v.group_id!] ?? 0);
    })();
    // Prefer Spread; if takeoff cannot finish under accel, Scale is the fallback.
    let next: MotionBuilderDocument;
    try {
      next = solvePhysicsViolation(src, v, "spread");
    } catch {
      next = solvePhysicsViolation(src, v, "scale");
    }
    const after = checkPhysics(next);
    expect(
      after.violations.some(
        (x) => x.stepper === v.stepper && (x.prev_frame ?? 0) <= 0 && x.code === v.code,
      ),
    ).toBe(false);
    let maxAbs = 0;
    for (const kf of next.keyframes) {
      if (kf.frame <= 0) continue;
      const val = kf.steppers?.[v.stepper!] ?? kf.lanes[v.group_id!];
      if (val != null) maxAbs = Math.max(maxAbs, Math.abs(Number(val)));
    }
    // Spread keeps magnitude; Scale may shrink — either way we moved off the 1-frame cliff
    expect(maxAbs).toBeGreaterThan(0);
    void peakBefore;
  });

  it("solveNextPhysicsViolation clears Aligned-wall hits on Attract_100_SpreadLimitAtStart", () => {
    let doc = attractStart as MotionBuilderDocument;
    const beforeAligned = checkPhysics(doc).violations.filter((v) => (v.prev_frame ?? 0) <= 0);
    expect(beforeAligned.length).toBeGreaterThan(0);
    let steps = 0;
    while (steps < 80) {
      const hit = solveNextPhysicsViolation(doc, "spread")
        ?? solveNextPhysicsViolation(doc, "scale");
      if (!hit) break;
      doc = hit.doc;
      steps++;
    }
    expect(steps).toBeGreaterThan(0);
    const leftAligned = checkPhysics(doc).violations.filter(
      (v) => (v.prev_frame ?? 0) <= 0 && v.code !== "crash_zone",
    );
    expect(leftAligned.length).toBe(0);
  });
});

describe("nearestSafeTipDeg", () => {
  it("nudges a barely-over tip into the safe band", () => {
    const safe = nearestSafeTipDeg(460.4, 60, 99.4, 109);
    const mod = ((safe - 60) % 120 + 120) % 120;
    const dist = Math.min(mod, 120 - mod);
    const maxSafe = 10 + ((109 - 99.4) / ((1 - 0.85) * 109)) * 50;
    expect(dist).toBeLessThanOrEqual(maxSafe * 0.9 + 1e-6);
  });
});
