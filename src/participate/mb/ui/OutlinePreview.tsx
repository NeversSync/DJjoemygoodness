import { useEffect, useRef } from "react";
import styled from "styled-components";
import {
  BOX_LANES, COLLISION_BOX_PAIRS, DEFAULT_LIMITS,
  MAX_MOTOR_MM_LOWER, MAX_MOTOR_MM_UPPER, UPPER_BOXES,
} from "../core/constants";
import { isCollisionRisk, tierMaxMm } from "../core/collision";
import { groupIdForStepper, normalizeGroupColor } from "../core/document";
import { positionsAt } from "../core/preview";
import { CLOCK_ANGLE, alignedTipAngle } from "../core/previewAngles";
import { spanViolationsAtFrame } from "../core/physics";
import type {
  MotionBuilderDocument, MotionLimits, PhysicsViolation,
  StepperName, StepperPositions,
} from "../core/types";
import { useEditor } from "../state/EditorContext";
import { Panel } from "./Panel";

/** Frames of slack around a violation span so scrubbing still shows the alert. */
const VICINITY_PAD = 8;

function colorForStepper(doc: MotionBuilderDocument, stepper: StepperName | undefined, fallback = 0): string {
  if (!stepper) return normalizeGroupColor(null, fallback);
  const id = groupIdForStepper(doc, stepper);
  const gi = id ? doc.groups.findIndex((g) => g.id === id) : -1;
  if (gi < 0) return normalizeGroupColor(null, fallback);
  return normalizeGroupColor(doc.groups[gi]!.color, gi);
}

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const n = Number.parseInt(full, 16);
  if (!Number.isFinite(n)) return [255, 200, 120];
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  const R = r / 255, G = g / 255, B = b / 255;
  const max = Math.max(R, G, B), min = Math.min(R, G, B);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  const h = max === R
    ? ((G - B) / d + (G < B ? 6 : 0)) / 6
    : max === G
      ? ((B - R) / d + 2) / 6
      : ((R - G) / d + 4) / 6;
  return [h, s, l];
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  if (s < 1e-6) {
    const v = Math.round(l * 255);
    return [v, v, v];
  }
  const hue2rgb = (p: number, q: number, t: number) => {
    let T = t;
    if (T < 0) T += 1;
    if (T > 1) T -= 1;
    if (T < 1 / 6) return p + (q - p) * 6 * T;
    if (T < 1 / 2) return q;
    if (T < 2 / 3) return p + (q - p) * (2 / 3 - T) * 6;
    return p;
  };
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  return [
    Math.round(hue2rgb(p, q, h + 1 / 3) * 255),
    Math.round(hue2rgb(p, q, h) * 255),
    Math.round(hue2rgb(p, q, h - 1 / 3) * 255),
  ];
}

/** Pulse lightness inside the same hue (brighter ↔ darker). */
function pulseHue(hex: string, tSec: number, rateHz = 2.4, amp = 0.28): string {
  const [r, g, b] = hexToRgb(hex);
  const [h, s, l] = rgbToHsl(r, g, b);
  const wave = Math.sin(tSec * rateHz * Math.PI * 2);
  const nextL = Math.max(0.12, Math.min(0.88, l + wave * amp));
  const [nr, ng, nb] = hslToRgb(h, Math.min(1, Math.max(s, 0.55)), nextL);
  return `rgb(${nr},${ng},${nb})`;
}

function withAlpha(cssColor: string, a: number): string {
  if (cssColor.startsWith("#")) {
    const [r, g, b] = hexToRgb(cssColor);
    return `rgba(${r},${g},${b},${a})`;
  }
  const m = cssColor.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
  if (m) return `rgba(${m[1]},${m[2]},${m[3]},${a})`;
  return cssColor;
}

function radialDist(hubMm: number, maxMm: number, ringR: number): number {
  const inward = Math.max(0, Math.min(1, hubMm / Math.max(1e-6, maxMm)));
  return ringR * (1 - inward * 0.55);
}

function linearExtents(samples: number[] | undefined): { minMm: number; maxMm: number } {
  if (!samples?.length) return { minMm: 0, maxMm: 0 };
  let minMm = samples[0]!, maxMm = samples[0]!;
  for (let i = 1; i < samples.length; i++) {
    const v = samples[i]!;
    if (v < minMm) minMm = v;
    if (v > maxMm) maxMm = v;
  }
  return { minMm, maxMm };
}

function violationNearPlayhead(v: PhysicsViolation, playFrame: number): boolean {
  const a = v.prev_frame ?? v.frame;
  const lo = Math.min(a, v.frame) - VICINITY_PAD;
  const hi = Math.max(a, v.frame) + VICINITY_PAD;
  return playFrame >= lo && playFrame <= hi;
}

/** Prefer the span under the playhead (not only the global Physics break). */
function alertsNearPlayhead(doc: MotionBuilderDocument, playFrame: number): PhysicsViolation[] {
  const span = spanViolationsAtFrame(doc, playFrame);
  return span.filter((v) => violationNearPlayhead(v, playFrame));
}

/** Live pillar risk at the playhead (independent of Physics early-break history). */
function livePillarRotaries(pos: StepperPositions, limits: MotionLimits): Set<StepperName> {
  const L = { ...DEFAULT_LIMITS, ...limits } as Required<MotionLimits>;
  const out = new Set<StepperName>();
  for (const [rot, lin, phase] of COLLISION_BOX_PAIRS) {
    const maxExt = tierMaxMm(lin, L);
    if (isCollisionRisk(pos[rot], pos[lin], phase, maxExt)) out.add(rot);
  }
  return out;
}

type BoxAlert = { rotary: boolean; linear: boolean; pillar: boolean };

function alertsForBox(
  steppers: readonly StepperName[],
  nearby: PhysicsViolation[],
  pillarRotaries: Set<StepperName>,
): BoxAlert {
  const rot = steppers.find((s) => s.startsWith("rotary_"));
  const lin = steppers.find((s) => s.startsWith("linear_"));
  const alert: BoxAlert = { rotary: false, linear: false, pillar: false };
  if (rot && pillarRotaries.has(rot)) alert.pillar = true;
  for (const v of nearby) {
    if (v.code === "pillar_collision" && v.stepper === rot) alert.pillar = true;
    if (v.code === "crash_zone" && lin) alert.linear = true;
    if (!v.stepper) continue;
    if (v.stepper === rot && v.code.startsWith("rotary")) alert.rotary = true;
    if (v.stepper === lin && v.code.startsWith("linear")) alert.linear = true;
  }
  return alert;
}

/** Lane warning pulse rate; tip collision pulses 60% faster. */
const LANE_PULSE_HZ = 2.4;
const TIP_PULSE_HZ = LANE_PULSE_HZ * 1.6;

type Pt = [number, number];

/**
 * Isolate one triangle vertex as a parallelogram/diamond:
 * tip → mid(tip,A) → centroid → mid(tip,B).
 */
function tipThirdQuad(tip: Pt, a: Pt, b: Pt): [Pt, Pt, Pt, Pt] {
  const midTipA: Pt = [(tip[0] + a[0]) / 2, (tip[1] + a[1]) / 2];
  const midTipB: Pt = [(tip[0] + b[0]) / 2, (tip[1] + b[1]) / 2];
  const centroid: Pt = [(tip[0] + a[0] + b[0]) / 3, (tip[1] + a[1] + b[1]) / 3];
  return [tip, midTipA, centroid, midTipB];
}

/** Harsh magenta cycle (dark ↔ hot) for a colliding tip third. */
function harshMagenta(tSec: number): string {
  const wave = (Math.sin(tSec * TIP_PULSE_HZ * Math.PI * 2) + 1) / 2;
  const r = Math.round(70 + wave * 185);
  const g = Math.round(wave * 12);
  const b = Math.round(90 + wave * 165);
  return `rgb(${r},${g},${b})`;
}

/** Draw the broken tip third — warning pulse, not a celebratory burst. */
function drawBrokenTip(
  ctx: CanvasRenderingContext2D,
  tip: Pt, a: Pt, b: Pt,
  tSec: number,
) {
  const [p0, p1, p2, p3] = tipThirdQuad(tip, a, b);
  const wave = (Math.sin(tSec * TIP_PULSE_HZ * Math.PI * 2) + 1) / 2;
  const col = harshMagenta(tSec);
  ctx.beginPath();
  ctx.moveTo(p0[0], p0[1]);
  ctx.lineTo(p1[0], p1[1]);
  ctx.lineTo(p2[0], p2[1]);
  ctx.lineTo(p3[0], p3[1]);
  ctx.closePath();
  ctx.fillStyle = withAlpha(col, 0.45 + wave * 0.45);
  ctx.strokeStyle = col;
  ctx.lineWidth = 1.75 + wave * 1.25;
  ctx.fill();
  ctx.stroke();
}

/** Desktop / Graph-focus Preview can fill the right rail up to 2× the classic 280px stage. */
export const DESKTOP_PREVIEW_MAX = 560;

const Stage = styled.div<{ $fill?: boolean; $desktopGrow?: boolean }>`
  width: ${({ $fill, $desktopGrow }) =>
    ($fill || $desktopGrow ? "100%" : "min(100%, 220px)")};
  max-width: ${({ $fill, $desktopGrow }) =>
    ($fill ? "none" : $desktopGrow ? `${DESKTOP_PREVIEW_MAX}px` : "none")};
  aspect-ratio: 1 / 1;
  margin: 0 auto;
  flex: 0 0 auto;
  align-self: center;
  border-radius: 8px;
  overflow: hidden;
  box-sizing: border-box;
  ${({ $fill, $desktopGrow }) => !$fill && !$desktopGrow && `
    @media (min-width: 1281px) {
      width: min(100%, 280px);
    }
    @media (orientation: landscape) and (max-height: 850px) {
      width: min(100%, 168px);
    }
  `}
`;
const Canvas = styled.canvas`
  display: block;
  width: 100%;
  height: 100%;
`;

export function OutlinePreview() {
  const { state, forward } = useEditor();
  const ref = useRef<HTMLCanvasElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const fillStage = state.prefs.tabletLayout === "preview";
  /** Desktop / Graph focus: track the right rail (up to DESKTOP_PREVIEW_MAX). */
  const desktopGrow =
    state.prefs.tabletLayout === "auto" || state.prefs.tabletLayout === "graph";
  const doc = state.doc;
  const playFrame = state.playFrame;

  useEffect(() => {
    const cvs = ref.current;
    const stage = stageRef.current;
    if (!cvs || !stage) return;
    const ctx = cvs.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    const nearby = alertsNearPlayhead(doc, playFrame);
    const pos0 = positionsAt(forward, playFrame);
    const pillarRotaries = livePillarRotaries(pos0, doc.limits);
    const animate = nearby.length > 0 || pillarRotaries.size > 0;

    const draw = (tSec: number) => {
      const dpr = Math.min(2, devicePixelRatio || 1);
      const sz = Math.max(64, Math.round(stage.clientWidth || 168));
      cvs.width = Math.round(sz * dpr);
      cvs.height = Math.round(sz * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, sz, sz);
      ctx.fillStyle = "#0d1118";
      ctx.fillRect(0, 0, sz, sz);
      const cx = sz / 2, cy = sz / 2, ringR = sz * 0.38, triR = sz * 0.09;
      ctx.strokeStyle = "rgba(255,255,255,0.12)";
      ctx.beginPath(); ctx.arc(cx, cy, ringR, 0, Math.PI * 2); ctx.stroke();

      const pos = positionsAt(forward, playFrame);

      // Pass 1 — linear rails (loud glow + pulse when that linear is the offender)
      for (const [box, steppers] of BOX_LANES) {
        if (box === "center") continue;
        const linName = steppers.find((s) => s.startsWith("linear_"));
        if (!linName) continue;
        const ang = CLOCK_ANGLE[box] ?? 0;
        const alert = alertsForBox(steppers, nearby, pillarRotaries);
        const base = colorForStepper(doc, linName, 2);
        const linColor = alert.linear ? pulseHue(base, tSec, 3.0, 0.42) : base;
        const maxMotor = UPPER_BOXES.has(box) ? MAX_MOTOR_MM_UPPER : MAX_MOTOR_MM_LOWER;
        const { minMm, maxMm } = linearExtents(forward[linName]);
        const rOuter = radialDist(minMm, maxMotor, ringR);
        const rInner = radialDist(maxMm, maxMotor, ringR);
        const cos = Math.cos(ang), sin = Math.sin(ang);
        // Full travel track (always visible even when Blank_solo stays at 0 mm)
        const rTrackOut = radialDist(0, maxMotor, ringR);
        const rTrackIn = radialDist(maxMotor, maxMotor, ringR);
        ctx.lineCap = "round";
        ctx.strokeStyle = withAlpha(linColor, 0.18);
        ctx.lineWidth = Math.max(2, sz * 0.01);
        ctx.beginPath();
        ctx.moveTo(cx + cos * rTrackOut, cy + sin * rTrackOut);
        ctx.lineTo(cx + cos * rTrackIn, cy + sin * rTrackIn);
        ctx.stroke();

        let r0 = Math.max(rOuter, rInner);
        let r1 = Math.min(rOuter, rInner);
        // Stationary / all-zero: expand past the triangle body so the extent is readable
        if (Math.abs(r0 - r1) < triR * 1.1) {
          const mid = (r0 + r1) / 2;
          const half = Math.max(triR * 1.15, sz * 0.04);
          r0 = mid + half;
          r1 = mid - half;
        }
        const x0 = cx + cos * r0, y0 = cy + sin * r0;
        const x1 = cx + cos * r1, y1 = cy + sin * r1;
        if (alert.linear) {
          ctx.strokeStyle = withAlpha(linColor, 0.35);
          ctx.lineWidth = Math.max(10, sz * 0.055);
          ctx.beginPath();
          ctx.moveTo(x0, y0);
          ctx.lineTo(x1, y1);
          ctx.stroke();
        }
        ctx.strokeStyle = linColor;
        ctx.lineWidth = Math.max(2.5, sz * 0.014) * (alert.linear ? 2.4 : 1);
        ctx.beginPath();
        ctx.moveTo(x0, y0);
        ctx.lineTo(x1, y1);
        ctx.stroke();
        const ux = -cos, uy = -sin;
        const aw = Math.max(2.5, sz * 0.014) * (alert.linear ? 1.6 : 1);
        ctx.fillStyle = linColor;
        ctx.beginPath();
        ctx.moveTo(x1 + ux * aw * 0.7, y1 + uy * aw * 0.7);
        ctx.lineTo(x1 - uy * aw, y1 + ux * aw);
        ctx.lineTo(x1 + uy * aw, y1 - ux * aw);
        ctx.closePath();
        ctx.fill();
      }

      // Pass 2 — triangles; colliding tip gets a harsh-magenta tip-third overlay
      for (const [box, steppers] of BOX_LANES) {
        const isCenter = box === "center";
        const ang = CLOCK_ANGLE[box] ?? 0;
        const rotName = steppers.find((s) => s.startsWith("rotary_"));
        const linName = steppers.find((s) => s.startsWith("linear_"));
        const alert = alertsForBox(steppers, nearby, pillarRotaries);
        const base = colorForStepper(doc, rotName, 0);
        const rotColor = alert.rotary ? pulseHue(base, tSec, LANE_PULSE_HZ, 0.28) : base;
        const maxMm = UPPER_BOXES.has(box) ? MAX_MOTOR_MM_UPPER : (isCenter ? 1 : MAX_MOTOR_MM_LOWER);
        const hubMm = linName ? pos[linName] : 0;
        const dist = isCenter ? 0 : radialDist(hubMm, maxMm, ringR);
        const bx = cx + Math.cos(ang) * dist;
        const by = cy + Math.sin(ang) * dist;

        const motorDeg = rotName ? pos[rotName] : 0;
        const tipAngle = alignedTipAngle(box, ang) + (motorDeg * Math.PI) / 180;
        const verts = [0, 1, 2].map((i) => {
          const a = tipAngle + (i * 2 * Math.PI) / 3;
          return [bx + Math.cos(a) * triR, by + Math.sin(a) * triR] as Pt;
        });
        ctx.beginPath();
        ctx.moveTo(verts[0]![0], verts[0]![1]);
        verts.slice(1).forEach(([vx, vy]) => ctx.lineTo(vx, vy));
        ctx.closePath();
        const fillA = isCenter ? 0.42 : 0.4;
        ctx.fillStyle = withAlpha(rotColor, alert.rotary ? Math.min(0.9, fillA + 0.3) : fillA);
        ctx.strokeStyle = rotColor;
        ctx.lineWidth = Math.max(1.25, sz * 0.008) * (alert.rotary ? 1.5 : 1);
        ctx.fill(); ctx.stroke();

        if (alert.pillar) {
          drawBrokenTip(ctx, verts[0]!, verts[1]!, verts[2]!, tSec);
        }

        ctx.fillStyle = "#6d6";
        ctx.beginPath(); ctx.arc(verts[0]![0], verts[0]![1], Math.max(2.5, sz * 0.012), 0, Math.PI * 2); ctx.fill();
      }
    };

    const loop = (now: number) => {
      draw(now / 1000);
      if (animate) raf = requestAnimationFrame(loop);
    };
    draw(performance.now() / 1000);
    if (animate) raf = requestAnimationFrame(loop);

    const ro = new ResizeObserver(() => draw(performance.now() / 1000));
    ro.observe(stage);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [playFrame, forward, doc]);

  return (
    <Panel title="Preview" help="preview" area="preview">
      <Stage ref={stageRef} className="preview-stage" $fill={fillStage} $desktopGrow={desktopGrow}>
        <Canvas ref={ref} />
      </Stage>
    </Panel>
  );
}
