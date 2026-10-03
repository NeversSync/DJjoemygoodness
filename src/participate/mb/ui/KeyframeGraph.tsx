import { useCallback, useEffect, useRef, useState } from "react";
import styled, { css, keyframes } from "styled-components";
import { normalizeGroupColor } from "../core/document";
import { clampLinearMm, DEFAULT_LIMITS, linearMaxMmForGroup } from "../core/constants";
import { moveGroupToTop } from "../core/edit/groups";
import {
  applyDeltaToLinkedLanes, deleteLanesLinked, linkedLanes, nudgeLanesLinked, setLaneValueLinked,
  setLaneValueThroughEnd,
} from "../core/edit/workingGroup";
import { trapezoidMaxDist } from "../core/physics";
import type { MotionBuilderDocument, MotionGroup, MotionKeyframe } from "../core/types";
import { useEditor } from "../state/EditorContext";
import type { GraphTool } from "../state/editor";
import { addKey, averageSelection, copy, deleteSelection, paste, quantizeKeys, selectAll } from "../state/commands";
import { Panel, Row, Check } from "./Panel";
import { PrecisionEditModal, type PrecisionEditPayload } from "./PrecisionEditModal";

const PRECISION_IDLE_MS = 2000;
const round1 = (n: number) => Math.round(n * 10) / 10;

const quantizeGlow = keyframes`
  0%, 100% { box-shadow: 0 0 0 1px rgba(79, 195, 247, 0.55); }
  50% { box-shadow: 0 0 0 3px rgba(79, 195, 247, 0.85); }
`;
const QuantizeBtn = styled.button<{ $lit?: boolean }>`
  ${({ $lit, theme }) => $lit && css`
    color: ${theme.bg};
    background: ${theme.accent};
    border-color: ${theme.accent};
    font-weight: 700;
    animation: ${quantizeGlow} 1.2s ease-in-out infinite;
  `}
`;

/** Canvas fills leftover panel height; chrome above/below stays put.
 *  `$tall` ≈ 2× plot area for Graph focus (buttons unchanged). */
const Wrap = styled.div<{ $tall?: boolean }>`
  position: relative;
  overflow: hidden;
  flex: 1 1 0;
  min-height: ${({ $tall }) => ($tall ? "240px" : "120px")};
  max-height: ${({ $tall }) => ($tall ? "min(90dvh, 1200px)" : "min(71dvh, 612px)")};
  width: 100%;
  @media (orientation: landscape) and (max-height: 850px) {
    max-height: ${({ $tall }) => ($tall ? "min(82dvh, 816px)" : "min(65dvh, 408px)")};
    min-height: ${({ $tall }) => ($tall ? "280px" : "140px")};
  }
`;
const ZoomBar = styled.div`
  display: flex; flex-wrap: wrap; gap: 6px; align-items: center;
  flex-shrink: 0;
  button { min-width: 40px; min-height: 32px; padding: 0 8px; font-size: 0.85rem; }
  span { color: #8d9ab3; font-size: 0.8rem; margin: 0 2px; }
`;
const HintRow = styled.div`
  font-size: 0.75rem;
  color: #8d9ab3;
  flex-shrink: 0;
  line-height: 1.3;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;
const Canvas = styled.canvas<{ $cursor?: string }>`
  display: block;
  width: 100%;
  height: 100%;
  touch-action: none;
  cursor: ${({ $cursor }) => $cursor ?? "default"};
  outline: none;
  &:focus-visible { box-shadow: inset 0 0 0 2px rgba(79, 195, 247, 0.45); }
`;
const ToolPick = styled.div`
  display: inline-flex;
  align-items: stretch;
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 6px;
  overflow: hidden;
  flex-shrink: 0;
`;
const ToolBtn = styled.button<{ $on?: boolean }>`
  min-height: 32px !important;
  min-width: 0 !important;
  padding: 0 8px !important;
  font-size: 0.75rem !important;
  font-weight: ${({ $on }) => ($on ? 700 : 500)};
  border: none !important;
  border-radius: 0 !important;
  border-right: 1px solid ${({ theme }) => theme.border} !important;
  color: ${({ $on, theme }) => ($on ? "#000" : theme.muted)};
  background: ${({ $on, theme }) => ($on ? theme.accent : "transparent")};
  &:last-child { border-right: none !important; }
`;

const Swatch = styled.span<{ $color: string }>`
  display: inline-block;
  width: 14px;
  height: 14px;
  border-radius: 3px;
  flex-shrink: 0;
  background: ${({ $color }) => $color};
  border: 1px solid rgba(255, 255, 255, 0.35);
  box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.25);
`;
const LanePick = styled.div`
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 6px;
`;
const LaneBtn = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-width: 140px;
  max-width: min(280px, 70vw);
  justify-content: flex-start;
  text-align: left;
`;
const LaneMenu = styled.ul`
  position: absolute;
  z-index: 20;
  top: calc(100% + 4px);
  left: 0;
  margin: 0;
  padding: 4px;
  list-style: none;
  min-width: 100%;
  max-height: min(50dvh, 280px);
  overflow-y: auto;
  background: ${({ theme }) => theme.panel};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.45);
`;
const LaneOpt = styled.button<{ $active: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  text-align: left;
  border: none;
  border-radius: 6px;
  background: ${({ $active }) => $active ? "rgba(79,195,247,0.2)" : "transparent"};
  &:hover { background: rgba(79,195,247,0.12); }
`;

/** Custom lane menu so each option can show its graph color swatch. */
function LanePicker({
  groups, value, onChange, workingGroup,
}: {
  groups: MotionGroup[];
  value: string;
  onChange: (id: string) => void;
  workingGroup: string[];
}) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const active = groups.find((g) => g.id === value) ?? groups[0];
  const activeColor = normalizeGroupColor(active?.color, Math.max(0, groups.findIndex((g) => g.id === value)));
  const wgSet = new Set(workingGroup);
  const linkedActive = wgSet.has(value) && workingGroup.length > 1;

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: PointerEvent) => {
      if (root.current && !root.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("pointerdown", onDoc);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDoc);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <LanePick ref={root}>
      <span>Edit lane</span>
      <LaneBtn type="button" aria-haspopup="listbox" aria-expanded={open}
        aria-label={`Edit lane: ${active?.label ?? value}`}
        onClick={() => setOpen((o) => !o)}>
        <Swatch $color={activeColor} aria-hidden />
        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {active?.label ?? value}
        </span>
        {linkedActive && (
          <span style={{ fontSize: "0.7rem", color: "#4fc3f7", flexShrink: 0 }}
            title={`${workingGroup.length} lanes in Working Group`}>
            ⛓{workingGroup.length}
          </span>
        )}
      </LaneBtn>
      {open && (
        <LaneMenu role="listbox" aria-label="Edit lane">
          {groups.map((g, i) => {
            const color = normalizeGroupColor(g.color, i);
            const selected = g.id === value;
            const linked = wgSet.has(g.id);
            return (
              <li key={g.id} role="none">
                <LaneOpt type="button" role="option" aria-selected={selected} $active={selected}
                  onClick={() => { onChange(g.id); setOpen(false); }}>
                  <Swatch $color={color} aria-hidden />
                  <span>{g.label}</span>
                  {linked && <span style={{ marginLeft: "auto", fontSize: "0.7rem", color: "#4fc3f7" }}>link</span>}
                </LaneOpt>
              </li>
            );
          })}
        </LaneMenu>
      )}
    </LanePick>
  );
}

type Zoom = { x0: number; x1: number; y0: number; y1: number };
const ZOOM0: Zoom = { x0: 0, x1: 1, y0: 0, y1: 1 };
const PAD = { l: 44, r: 12, t: 14, b: 28 };
const NODE_R = 6;
const NODE_HIT = 14;

function laneRange(
  kfs: MotionKeyframe[],
  lane: string,
  extra: number[] = [],
): { lo: number; hi: number } {
  let lo = Infinity, hi = -Infinity;
  for (const kf of kfs) {
    if (kf.lanes?.[lane] === undefined) continue;
    const v = kf.lanes[lane] ?? 0;
    lo = Math.min(lo, v); hi = Math.max(hi, v);
  }
  for (const v of extra) {
    if (!Number.isFinite(v)) continue;
    lo = Math.min(lo, v); hi = Math.max(hi, v);
  }
  if (!Number.isFinite(lo)) { lo = 0; hi = 1; }
  if (Math.abs(hi - lo) < 1e-6) { lo -= 1; hi += 1; }
  const pad = (hi - lo) * 0.12;
  return { lo: lo - pad, hi: hi + pad };
}

/** 1–2–5×10ⁿ step so grid lines land on readable ° / mm values. */
function niceStep(span: number, targetCount = 5): number {
  if (!(span > 0) || !Number.isFinite(span)) return 1;
  const raw = span / Math.max(1, targetCount);
  const pow = 10 ** Math.floor(Math.log10(raw));
  const n = raw / pow;
  const nice = n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10;
  return nice * pow;
}

/** Value ticks in [lo, hi] for the active-lane axis (shared by grid + labels). */
function valueTicks(lo: number, hi: number, targetCount = 5): number[] {
  const step = niceStep(hi - lo, targetCount);
  const start = Math.ceil((lo - step * 1e-9) / step) * step;
  const ticks: number[] = [];
  for (let v = start; v <= hi + step * 1e-6; v += step) {
    const t = Math.round(v / step) * step;
    if (ticks.length && Math.abs(ticks[ticks.length - 1]! - t) < step * 1e-6) continue;
    ticks.push(t);
    if (ticks.length > 24) break;
  }
  return ticks;
}

function formatTick(v: number): string {
  const a = Math.abs(v);
  if (a >= 100 || (a >= 1 && Math.abs(v - Math.round(v)) < 1e-6)) return String(Math.round(v));
  if (a >= 0.1) return v.toFixed(1);
  return v.toFixed(2);
}

function clampZoom(z: Zoom): Zoom {
  const m = 0.02;
  let { x0, x1, y0, y1 } = z;
  x0 = Math.max(0, Math.min(1, x0)); x1 = Math.max(0, Math.min(1, x1));
  y0 = Math.max(0, Math.min(1, y0)); y1 = Math.max(0, Math.min(1, y1));
  if (x1 - x0 < m) { const c = (x0 + x1) / 2; x0 = Math.max(0, c - m / 2); x1 = Math.min(1, x0 + m); }
  if (y1 - y0 < m) { const c = (y0 + y1) / 2; y0 = Math.max(0, c - m / 2); y1 = Math.min(1, y0 + m); }
  return { x0, x1, y0, y1 };
}

function zoomAxis(z: Zoom, axis: "x" | "y", inward: boolean): Zoom {
  const fac = inward ? 0.15 : -0.25;
  if (axis === "x") {
    const span = z.x1 - z.x0;
    return clampZoom({ ...z, x0: z.x0 + span * fac, x1: z.x1 - span * fac });
  }
  const span = z.y1 - z.y0;
  return clampZoom({ ...z, y0: z.y0 + span * fac, y1: z.y1 - span * fac });
}

/** Shift the visible window; keeps span and clamps to [0,1]. */
function panZoom(z: Zoom, dx: number, dy: number): Zoom {
  const sx = z.x1 - z.x0, sy = z.y1 - z.y0;
  let x0 = z.x0 + dx * sx, y0 = z.y0 + dy * sy;
  x0 = Math.max(0, Math.min(1 - sx, x0));
  y0 = Math.max(0, Math.min(1 - sy, y0));
  return { x0, x1: x0 + sx, y0, y1: y0 + sy };
}

/** Zoom both axes toward a plot-normalized point (0–1). fac < 1 zooms in. */
function zoomToward(z: Zoom, ax: number, ay: number, fac: number): Zoom {
  const a = Math.max(0, Math.min(1, ax));
  const b = Math.max(0, Math.min(1, ay));
  const sx = (z.x1 - z.x0) * fac;
  const sy = (z.y1 - z.y0) * fac;
  const cx = z.x0 + a * (z.x1 - z.x0);
  const cy = z.y0 + b * (z.y1 - z.y0);
  return clampZoom({
    x0: cx - a * sx, x1: cx - a * sx + sx,
    y0: cy - b * sy, y1: cy - b * sy + sy,
  });
}

function makeLayout(w: number, h: number, ff: number, z: Zoom) {
  return {
    w, h, plotW: w - PAD.l - PAD.r, plotH: h - PAD.t - PAD.b, ff,
    vf0: z.x0 * Math.max(1, ff - 1), vf1: z.x1 * Math.max(1, ff - 1),
    vy0: z.y0, vy1: z.y1,
  };
}
type Layout = ReturnType<typeof makeLayout>;

const fToX = (f: number, L: Layout) => PAD.l + ((f - L.vf0) / Math.max(1e-6, L.vf1 - L.vf0)) * L.plotW;
const xToF = (x: number, L: Layout) =>
  L.vf0 + ((x - PAD.l) / Math.max(1, L.plotW)) * (L.vf1 - L.vf0);
const vToY = (v: number, L: Layout, r: { lo: number; hi: number }) => {
  const v0 = r.lo + (r.hi - r.lo) * L.vy0, v1 = r.lo + (r.hi - r.lo) * L.vy1;
  return PAD.t + (1 - (v - v0) / Math.max(1e-6, v1 - v0)) * L.plotH;
};
const yToV = (y: number, L: Layout, r: { lo: number; hi: number }) => {
  const v0 = r.lo + (r.hi - r.lo) * L.vy0, v1 = r.lo + (r.hi - r.lo) * L.vy1;
  return v0 + (1 - (y - PAD.t) / Math.max(1, L.plotH)) * (v1 - v0);
};

/** CSS cursor from inline SVG (hotspot + system fallback). */
function svgCursor(svg: string, hx: number, hy: number, fallback: string): string {
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}") ${hx} ${hy}, ${fallback}`;
}

const CURSOR_POINTER = svgCursor(
  `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
    <path fill="#fff" stroke="#111" stroke-width="1.25"
      d="M4 3l1 22 6.2-6.2 4.3 10.2 3.2-1.4-4.4-10.3L22 14z"/>
  </svg>`,
  4, 3, "default",
);

const CURSOR_PENCIL = svgCursor(
  `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
    <path fill="#ffd54f" stroke="#111" stroke-width="1.2"
      d="M26.5 8.2l-3.7-3.7a1.6 1.6 0 0 0-2.3 0L6.2 18.8l-.8 5.6 5.6-.8L26.5 10.5a1.6 1.6 0 0 0 0-2.3z"/>
    <path fill="#8d6e63" stroke="#111" stroke-width="1" d="M6.2 18.8l-.8 5.6 5.6-.8"/>
    <path fill="#fff3e0" stroke="#111" stroke-width="1" d="M20.5 6.5l4 4"/>
  </svg>`,
  5, 27, "crosshair",
);

const CURSOR_ERASER = svgCursor(
  `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
    <path fill="#f48fb1" stroke="#111" stroke-width="1.2"
      d="M12 6.5l10.5 10.5-7.2 7.2H8.2L4.5 20.7z"/>
    <path fill="#fce4ec" stroke="#111" stroke-width="1"
      d="M12 6.5l3.8 3.8-10.5 10.4L4.5 20.7z"/>
    <path stroke="#111" stroke-width="1.5" stroke-linecap="round" d="M4 28h18"/>
  </svg>`,
  8, 26, "cell",
);

const GRAPH_TOOLS: { id: GraphTool; label: string; title: string; cursor: string }[] = [
  { id: "pointer", label: "Pointer", title: "Select and drag nodes (V)", cursor: CURSOR_POINTER },
  { id: "pencil", label: "Pencil", title: "Draw keyframe waves on the Edit lane (B)", cursor: CURSOR_PENCIL },
  { id: "eraser", label: "Eraser", title: "Delete Edit-lane nodes under the cursor (E)", cursor: CURSOR_ERASER },
];

/** True when keystrokes should go to a text field, not graph shortcuts. */
function isTypingTarget(t: EventTarget | null): boolean {
  if (!(t instanceof HTMLElement)) return false;
  if (t instanceof HTMLInputElement || t instanceof HTMLTextAreaElement || t instanceof HTMLSelectElement) {
    return true;
  }
  if (t.isContentEditable) return true;
  return !!t.closest("input, textarea, select, [contenteditable='true']");
}

function graphToolFromKey(e: KeyboardEvent): GraphTool | null {
  // Prefer e.code so layout / caps-lock quirks don't break V/B/E.
  const code = e.code;
  if (code === "KeyV") return "pointer";
  if (code === "KeyB") return "pencil";
  if (code === "KeyE") return "eraser";
  const key = e.key.toLowerCase();
  if (key === "v") return "pointer";
  if (key === "b") return "pencil";
  if (key === "e") return "eraser";
  return null;
}

/** Fill samples along a stroke segment (dense for short spans, grid-step for long). */
function addPencilSegment(
  samples: Map<number, number>,
  prevFrame: number | null,
  prevVal: number | null,
  frame: number,
  value: number,
  gridStep: number,
) {
  const f1 = Math.round(frame);
  if (f1 <= 0) return;
  const v1 = round1(value);
  if (prevFrame == null || prevVal == null) {
    samples.set(f1, v1);
    return;
  }
  const f0 = Math.round(prevFrame);
  if (f0 === f1) {
    samples.set(f1, v1);
    return;
  }
  const lo = Math.min(f0, f1);
  const hi = Math.max(f0, f1);
  const span = hi - lo;
  const step = span > 60 ? Math.max(1, gridStep) : 1;
  for (let f = lo; f <= hi; f += step) {
    if (f <= 0) continue;
    const t = (f - f0) / (f1 - f0);
    samples.set(f, round1(prevVal + (v1 - prevVal) * t));
  }
  samples.set(f1, v1);
}

type DragState =
  | {
      kind: "drag";
      frame: number;
      frames: number[];
      /** Primary lane start values by frame. */
      startVals: Record<number, number>;
      /** Baseline values for every linked lane: laneId → frame → value. */
      startValsByLane: Record<string, Record<number, number>>;
      startY: number;
      startVal: number;
      /** performance.now() at pointer-down — used by Physics Speed drag clamp. */
      startTime: number;
      /** Last primary-node value from pointer move (avoids stale React doc on up). */
      lastVal: number;
      /** Y-axis range frozen at drag start so pointer→value stays stable while the draw range expands. */
      valueRange: { lo: number; hi: number };
      beforeDoc: MotionBuilderDocument;
    }
  | { kind: "box"; x0: number; y0: number; x1: number; y1: number }
  | {
      kind: "pencil";
      beforeDoc: MotionBuilderDocument;
      samples: Map<number, number>;
      lastFrame: number | null;
      lastVal: number | null;
      valueRange: { lo: number; hi: number };
    }
  | {
      kind: "eraser";
      beforeDoc: MotionBuilderDocument;
      erased: Set<number>;
    }
  | null;

type PendingPrecision = {
  beforeDoc: MotionBuilderDocument;
  frames: number[];
  laneId: string;
  startVal: number;
  finalVal: number;
  dragDelta: number;
  unit: "mm" | "°";
};

export function KeyframeGraph() {
  const { state, dispatch, physics } = useEditor();
  const { doc, selected, activeLane, prefs, playFrame, workingGroup } = state;
  const tallPlot = prefs.tabletLayout === "graph";
  const ref = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState<Zoom>(ZOOM0);
  const [size, setSize] = useState({ w: 640, h: 240 });
  const [precisionEdit, setPrecisionEdit] = useState(false);
  const [precisionModal, setPrecisionModal] = useState<PrecisionEditPayload | null>(null);
  const dragRef = useRef<DragState>(null);
  const layoutRef = useRef<Layout | null>(null);
  const rangeRef = useRef<{ lo: number; hi: number }>({ lo: 0, hi: 1 });
  /** Active pointers on the canvas (for 2-finger pinch / pan). */
  const pointersRef = useRef(new Map<number, { x: number; y: number }>());
  const pinchRef = useRef<{ dist: number; midX: number; midY: number } | null>(null);
  const precisionEditRef = useRef(precisionEdit);
  precisionEditRef.current = precisionEdit;
  const pendingPrecisionRef = useRef<PendingPrecision | null>(null);
  const precisionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearPrecisionTimer = useCallback(() => {
    if (precisionTimerRef.current !== null) {
      clearTimeout(precisionTimerRef.current);
      precisionTimerRef.current = null;
    }
  }, []);

  const armPrecisionPopup = useCallback((pending: PendingPrecision) => {
    clearPrecisionTimer();
    pendingPrecisionRef.current = pending;
    precisionTimerRef.current = setTimeout(() => {
      precisionTimerRef.current = null;
      const p = pendingPrecisionRef.current;
      if (!p) return;
      if (!precisionEditRef.current) return;
      setPrecisionModal({
        mode: p.frames.length > 1 ? "multi" : "single",
        unit: p.unit,
        absolute: p.finalVal,
        startAbsolute: p.startVal,
        dragDelta: p.dragDelta,
        frameCount: p.frames.length,
      });
    }, PRECISION_IDLE_MS);
  }, [clearPrecisionTimer]);

  useEffect(() => () => clearPrecisionTimer(), [clearPrecisionTimer]);

  useEffect(() => {
    if (!precisionEdit) {
      clearPrecisionTimer();
      pendingPrecisionRef.current = null;
      setPrecisionModal(null);
    }
  }, [precisionEdit, clearPrecisionTimer]);

  // Fill available panel height (critical for Graph focus layout)
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const cr = entries[0]?.contentRect;
      if (!cr) return;
      setSize({ w: Math.max(160, Math.round(cr.width)), h: Math.max(160, Math.round(cr.height)) });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [prefs.graphOpen]);

  const draw = useCallback(() => {
    const cvs = ref.current;
    if (!cvs || !prefs.graphOpen) return;
    const dpr = Math.min(2, devicePixelRatio || 1);
    const cssW = size.w;
    const cssH = size.h;
    cvs.width = Math.round(cssW * dpr);
    cvs.height = Math.round(cssH * dpr);
    const ctx = cvs.getContext("2d")!;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const ff = Math.max(2, doc.frames_forward);
    const kfs = doc.keyframes;
    const groups = doc.groups;
    const L = makeLayout(cssW, cssH, ff, zoom);
    layoutRef.current = L;

    ctx.clearRect(0, 0, cssW, cssH);
    ctx.fillStyle = "#0b0f16";
    ctx.fillRect(0, 0, cssW, cssH);

    // Active-lane value range first — grid must use real °/mm, not plot quarters.
    const liveExtra =
      dragRef.current?.kind === "drag" ? [dragRef.current.lastVal] : [];
    const activeRange = laneRange(kfs, activeLane, liveExtra);
    rangeRef.current = activeRange;
    const vLo = activeRange.lo + (activeRange.hi - activeRange.lo) * L.vy0;
    const vHi = activeRange.lo + (activeRange.hi - activeRange.lo) * L.vy1;
    const ticks = valueTicks(Math.min(vLo, vHi), Math.max(vLo, vHi), 5);

    ctx.font = "11px Segoe UI, sans-serif";
    for (const tick of ticks) {
      const y = vToY(tick, L, activeRange);
      if (y < PAD.t - 1 || y > PAD.t + L.plotH + 1) continue;
      const isZero = Math.abs(tick) < 1e-9;
      ctx.strokeStyle = isZero ? "rgba(255,255,255,0.18)" : "rgba(255,255,255,0.07)";
      ctx.lineWidth = isZero ? 1.25 : 1;
      ctx.beginPath();
      ctx.moveTo(PAD.l, y);
      ctx.lineTo(PAD.l + L.plotW, y);
      ctx.stroke();
      ctx.fillStyle = "rgba(255,255,255,0.5)";
      ctx.textAlign = "right";
      ctx.textBaseline = "middle";
      ctx.fillText(formatTick(tick), PAD.l - 4, y);
    }
    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";

    const lastKey = kfs.at(-1)?.frame ?? 0;
    if (lastKey < ff - 1) {
      const xH = fToX(lastKey, L);
      ctx.fillStyle = "rgba(255,171,64,0.08)";
      ctx.fillRect(xH, PAD.t, PAD.l + L.plotW - xH, L.plotH);
      ctx.fillStyle = "rgba(255,171,64,0.55)"; ctx.font = "11px Segoe UI, sans-serif";
      ctx.fillText("hold prior →", xH + 6, PAD.t + 14);
    }

    const selSet = new Set(selected);
    // Most recent authored key at/before the playhead (TriangleDetection-style current node)
    let playheadKey = kfs[0]?.frame ?? 0;
    for (const kf of kfs) {
      if (kf.frame <= playFrame) playheadKey = kf.frame;
      else break;
    }

    // Playhead scrubber line
    {
      const x = fToX(playFrame, L);
      ctx.strokeStyle = "rgba(255,255,255,0.35)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x, PAD.t); ctx.lineTo(x, PAD.t + L.plotH); ctx.stroke();
    }

    for (const [gi, g] of groups.entries()) {
      const color = normalizeGroupColor(g.color, gi);
      const laneKeys = kfs.filter((kf) => kf.lanes?.[g.id] !== undefined);
      const liveExtraLane =
        g.id === activeLane && dragRef.current?.kind === "drag"
          ? [dragRef.current.lastVal]
          : [];
      const r = g.id === activeLane ? activeRange : laneRange(kfs, g.id, liveExtraLane);
      const isActive = g.id === activeLane;
      ctx.strokeStyle = color;
      ctx.globalAlpha = isActive ? 1 : 0.35;
      ctx.lineWidth = isActive ? 2.2 : 1.2;
      ctx.beginPath();
      laneKeys.forEach((kf, idx) => {
        const x = fToX(kf.frame, L), y = vToY(kf.lanes?.[g.id] ?? 0, L, r);
        if (idx === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      });
      ctx.stroke();

      const lastLaneKey = laneKeys.at(-1)?.frame ?? 0;
      if (laneKeys.length && lastLaneKey < ff - 1) {
        const y = vToY(laneKeys.at(-1)!.lanes?.[g.id] ?? 0, L, r);
        ctx.setLineDash([4, 4]); ctx.beginPath();
        ctx.moveTo(fToX(lastLaneKey, L), y); ctx.lineTo(fToX(ff - 1, L), y); ctx.stroke(); ctx.setLineDash([]);
      }

      if (isActive) {
        laneKeys.forEach((kf) => {
          const x = fToX(kf.frame, L), y = vToY(kf.lanes?.[g.id] ?? 0, L, r);
          const sel = selSet.has(kf.frame);
          const atPlay = kf.frame === playheadKey;
          const lit = sel || atPlay;
          ctx.beginPath(); ctx.arc(x, y, lit ? NODE_R + 1.5 : NODE_R - 1, 0, Math.PI * 2);
          ctx.fillStyle = lit ? "#fff" : color; ctx.fill();
          ctx.strokeStyle = atPlay && !sel ? "rgba(79,195,247,0.95)" : "rgba(0,0,0,0.55)";
          ctx.lineWidth = atPlay ? 2 : 1; ctx.stroke();
        });
      }
      ctx.globalAlpha = 1;
    }

    if (physics && !physics.ok) {
      for (const v of physics.violations) {
        const x = fToX(v.frame, L);
        ctx.strokeStyle = "rgba(255,120,120,0.75)"; ctx.lineWidth = 1.25;
        ctx.setLineDash([5, 4]); ctx.beginPath();
        ctx.moveTo(x, PAD.t); ctx.lineTo(x, PAD.t + L.plotH); ctx.stroke(); ctx.setLineDash([]);
      }
    }

    const drag = dragRef.current;
    if (drag?.kind === "box") {
      ctx.fillStyle = "rgba(79,195,247,0.12)";
      ctx.strokeStyle = "rgba(79,195,247,0.6)";
      ctx.lineWidth = 1;
      const bx = Math.min(drag.x0, drag.x1), by = Math.min(drag.y0, drag.y1);
      const bw = Math.abs(drag.x1 - drag.x0), bh = Math.abs(drag.y1 - drag.y0);
      ctx.fillRect(bx, by, bw, bh);
      ctx.strokeRect(bx, by, bw, bh);
    }

    ctx.fillStyle = "rgba(255,255,255,0.45)";
    ctx.font = "11px Segoe UI, sans-serif";
    ctx.textAlign = "left";
    ctx.fillText(String(Math.round(L.vf0)), PAD.l, cssH - 8);
    ctx.fillText(String(Math.round(L.vf1)), PAD.l + L.plotW - 28, cssH - 8);
  }, [doc, selected, activeLane, prefs.graphOpen, zoom, physics, size, playFrame]);

  useEffect(draw, [draw]);

  const hitNode = useCallback((cx: number, cy: number, opts?: {
    /** Prefer hits among these frames (multi-select drag on tablet). */
    prefer?: number[];
    /** Hit radius in CSS px (default NODE_HIT). */
    radius?: number;
  }): number | null => {
    const L = layoutRef.current;
    if (!L) return null;
    const r = rangeRef.current;
    const rad = opts?.radius ?? NODE_HIT;
    let bestDist = rad * rad;
    let bestFrame: number | null = null;
    const prefer = opts?.prefer?.length ? new Set(opts.prefer) : null;
    for (const kf of doc.keyframes) {
      if (kf.lanes?.[activeLane] === undefined) continue;
      if (prefer && !prefer.has(kf.frame)) continue;
      const x = fToX(kf.frame, L), y = vToY(kf.lanes?.[activeLane] ?? 0, L, r);
      const d2 = (x - cx) ** 2 + (y - cy) ** 2;
      if (d2 < bestDist) { bestDist = d2; bestFrame = kf.frame; }
    }
    return bestFrame;
  }, [doc.keyframes, activeLane]);

  const cssPos = useCallback((e: React.PointerEvent): [number, number] => {
    const cvs = ref.current!;
    const rect = cvs.getBoundingClientRect();
    return [e.clientX - rect.left, e.clientY - rect.top];
  }, []);

  /** Begin or refresh a 2-finger pinch from current pointer map. */
  const beginPinch = useCallback(() => {
    const pts = [...pointersRef.current.values()];
    if (pts.length < 2) { pinchRef.current = null; return; }
    const dx = pts[1]!.x - pts[0]!.x, dy = pts[1]!.y - pts[0]!.y;
    pinchRef.current = {
      dist: Math.max(1, Math.hypot(dx, dy)),
      midX: (pts[0]!.x + pts[1]!.x) / 2,
      midY: (pts[0]!.y + pts[1]!.y) / 2,
    };
  }, []);

  /** Cancel a one-finger drag/box/stroke so pinch can take over (revert live edits). */
  const cancelOneFinger = useCallback(() => {
    const drag = dragRef.current;
    dragRef.current = null;
    if (drag?.kind === "drag" || drag?.kind === "pencil" || drag?.kind === "eraser") {
      dispatch({
        type: "edit", label: "Cancel stroke", undo: false,
        apply: () => drag.beforeDoc,
      });
    }
  }, [dispatch]);

  const applyDragValues = useCallback((
    beforeDoc: MotionBuilderDocument,
    frames: number[],
    startValsByLane: Record<string, Record<number, number>>,
    startVal: number,
    newVal: number,
  ) => {
    // Single-node + Duplicate until End: stamp absolute value through later keys
    if (prefs.duplicateUntilEnd && frames.length === 1) {
      return setLaneValueThroughEnd(beforeDoc, frames[0]!, activeLane, newVal, workingGroup);
    }
    return applyDeltaToLinkedLanes(
      beforeDoc, frames, activeLane, startValsByLane, startVal, newVal, workingGroup,
    );
  }, [activeLane, workingGroup, prefs.duplicateUntilEnd]);

  const applyPencilSamples = useCallback((
    beforeDoc: MotionBuilderDocument,
    samples: Map<number, number>,
  ) => {
    let next = beforeDoc;
    const sorted = [...samples.entries()].sort((a, b) => a[0] - b[0]);
    for (const [frame, value] of sorted) {
      try {
        next = setLaneValueLinked(next, frame, activeLane, value, workingGroup);
      } catch {
        /* frame 0 / edit errors — skip */
      }
    }
    return next;
  }, [activeLane, workingGroup]);

  const applyEraserFrames = useCallback((
    beforeDoc: MotionBuilderDocument,
    erased: Set<number>,
  ) => {
    if (!erased.size) return beforeDoc;
    return deleteLanesLinked(beforeDoc, [...erased], activeLane, workingGroup);
  }, [activeLane, workingGroup]);

  const focusGraph = useCallback(() => {
    const cvs = ref.current;
    if (!cvs) return;
    try { cvs.focus({ preventScroll: true }); } catch { cvs.focus(); }
  }, []);

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    const cvs = ref.current; if (!cvs) return;
    const [cx, cy] = cssPos(e);
    pointersRef.current.set(e.pointerId, { x: cx, y: cy });
    cvs.setPointerCapture(e.pointerId);
    // Pull focus off Groups/Transport inputs so V/B/E tool keys work after drawing.
    focusGraph();

    // Second finger → pinch/pan; abort any node edit or box select
    if (pointersRef.current.size >= 2) {
      cancelOneFinger();
      beginPinch();
      return;
    }

    const tool = prefs.graphTool ?? "pointer";
    const L = layoutRef.current;

    if (tool === "pencil" && L) {
      if (precisionEdit) {
        clearPrecisionTimer();
        pendingPrecisionRef.current = null;
        setPrecisionModal(null);
      }
      const samples = new Map<number, number>();
      const frame = xToF(cx, L);
      const value = yToV(cy, L, rangeRef.current);
      addPencilSegment(samples, null, null, frame, value, doc.grid_step || 10);
      const f = Math.round(frame);
      dragRef.current = {
        kind: "pencil",
        beforeDoc: doc,
        samples,
        lastFrame: f > 0 ? f : null,
        lastVal: f > 0 ? round1(value) : null,
        valueRange: { ...rangeRef.current },
      };
      if (samples.size) {
        dispatch({
          type: "edit", label: `Draw ${activeLane}`, undo: false,
          apply: () => applyPencilSamples(doc, samples),
        });
        if (f > 0) dispatch({ type: "select", frames: [f], playFrame: f });
      }
      return;
    }

    if (tool === "eraser") {
      const erased = new Set<number>();
      const hit = hitNode(cx, cy, { radius: NODE_HIT * 2 });
      if (hit != null && hit > 0) erased.add(hit);
      dragRef.current = { kind: "eraser", beforeDoc: doc, erased };
      if (erased.size) {
        dispatch({
          type: "edit", label: `Erase ${activeLane}`, undo: false,
          apply: () => applyEraserFrames(doc, erased),
        });
      }
      return;
    }

    // Multi-select: prefer a fatter hit on already-selected nodes so a finger
    // near the group drags the whole selection instead of collapsing to a neighbor.
    const hit = (selected.length > 1
      ? hitNode(cx, cy, { prefer: selected, radius: NODE_HIT * 2.5 })
      : null) ?? hitNode(cx, cy);
    if (hit !== null) {
      // Keep multi-select when dragging an already-selected node (tablet box-select → drag)
      let frames: number[];
      if (e.shiftKey) {
        frames = [...new Set([...selected, hit])];
      } else if (selected.length > 1 && selected.includes(hit)) {
        frames = [...selected];
      } else {
        frames = [hit];
      }
      dispatch({ type: "select", frames, playFrame: hit });

      // New drag cancels a pending precision popup
      if (precisionEdit) {
        clearPrecisionTimer();
        pendingPrecisionRef.current = null;
        setPrecisionModal(null);
      }

      if (hit > 0) {
        const dragFrames = frames.filter((f) => f > 0);
        const lanes = linkedLanes(doc, workingGroup, activeLane);
        const startValsByLane: Record<string, Record<number, number>> = {};
        for (const id of lanes) {
          startValsByLane[id] = {};
          for (const f of dragFrames) {
            const kf = doc.keyframes.find((k) => k.frame === f);
            startValsByLane[id]![f] = kf?.lanes?.[id] ?? 0;
          }
        }
        const startVals = startValsByLane[activeLane] ?? {};
        const startVal = startVals[hit] ?? 0;
        dragRef.current = {
          kind: "drag",
          frame: hit,
          frames: dragFrames,
          startVals,
          startValsByLane,
          startY: cy,
          startVal,
          startTime: performance.now(),
          lastVal: startVal,
          valueRange: { ...rangeRef.current },
          beforeDoc: doc,
        };
      }
    } else {
      dragRef.current = { kind: "box", x0: cx, y0: cy, x1: cx, y1: cy };
      if (!e.shiftKey) dispatch({ type: "select", frames: [] });
    }
  }, [
    cssPos, hitNode, selected, doc, activeLane, workingGroup, dispatch, cancelOneFinger, beginPinch,
    precisionEdit, clearPrecisionTimer, prefs.graphTool, applyPencilSamples, applyEraserFrames,
    focusGraph,
  ]);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!pointersRef.current.has(e.pointerId)) return;
    const [cx, cy] = cssPos(e);
    pointersRef.current.set(e.pointerId, { x: cx, y: cy });

    // Two-finger pinch zoom + pan (does not interfere with one-finger node edits)
    if (pointersRef.current.size >= 2) {
      if (!pinchRef.current) beginPinch();
      const pinch = pinchRef.current;
      const L = layoutRef.current;
      if (!pinch || !L) return;
      const pts = [...pointersRef.current.values()];
      const dist = Math.max(1, Math.hypot(pts[1]!.x - pts[0]!.x, pts[1]!.y - pts[0]!.y));
      const midX = (pts[0]!.x + pts[1]!.x) / 2;
      const midY = (pts[0]!.y + pts[1]!.y) / 2;
      const fac = pinch.dist / dist; // fingers apart → zoom in
      const ax = (midX - PAD.l) / Math.max(1, L.plotW);
      const ay = (midY - PAD.t) / Math.max(1, L.plotH);
      const panX = (midX - pinch.midX) / Math.max(1, L.plotW);
      const panY = (midY - pinch.midY) / Math.max(1, L.plotH);
      setZoom((z) => {
        let next = zoomToward(z, ax, ay, fac);
        // Content follows fingers (same direction as two-finger pan)
        next = panZoom(next, -panX, panY);
        return next;
      });
      pinchRef.current = { dist, midX, midY };
      return;
    }

    const drag = dragRef.current;
    if (!drag) return;
    if (drag.kind === "drag") {
      const L = layoutRef.current;
      if (!L) return;
      let newVal = round1(yToV(cy, L, drag.valueRange));
      const g = doc.groups.find((x) => x.id === activeLane);
      if (prefs.physicsDrag !== false) {
        const elapsedSec = (performance.now() - drag.startTime) / 1000;
        const kind = g?.kind ?? "rotary";
        const vmax = kind === "linear"
          ? (doc.limits.max_linear_speed ?? DEFAULT_LIMITS.max_linear_speed)
          : (doc.limits.max_rotary_speed ?? DEFAULT_LIMITS.max_rotary_speed);
        const accel = kind === "linear"
          ? (doc.limits.linear_accel ?? DEFAULT_LIMITS.linear_accel)
          : (doc.limits.rotary_accel ?? DEFAULT_LIMITS.rotary_accel);
        const maxReachable = trapezoidMaxDist(elapsedSec, vmax, accel);
        const delta = newVal - drag.startVal;
        const sign = delta >= 0 ? 1 : -1;
        newVal = round1(drag.startVal + sign * Math.min(Math.abs(delta), maxReachable));
      }
      if (g?.kind === "linear") {
        newVal = round1(clampLinearMm(newVal, linearMaxMmForGroup(g, doc.limits), doc.limits.min_linear_mm ?? 0));
      }
      drag.lastVal = newVal;
      dispatch({
        type: "edit", label: `Drag ${activeLane}`, undo: false,
        apply: () => applyDragValues(drag.beforeDoc, drag.frames, drag.startValsByLane, drag.startVal, newVal),
      });
    } else if (drag.kind === "pencil") {
      const L = layoutRef.current;
      if (!L) return;
      const frame = xToF(cx, L);
      const value = yToV(cy, L, drag.valueRange);
      addPencilSegment(
        drag.samples, drag.lastFrame, drag.lastVal, frame, value, doc.grid_step || 10,
      );
      const f = Math.round(frame);
      if (f > 0) {
        drag.lastFrame = f;
        drag.lastVal = round1(value);
      }
      dispatch({
        type: "edit", label: `Draw ${activeLane}`, undo: false,
        apply: () => applyPencilSamples(drag.beforeDoc, drag.samples),
      });
    } else if (drag.kind === "eraser") {
      const hit = hitNode(cx, cy, { radius: NODE_HIT * 2 });
      if (hit != null && hit > 0 && !drag.erased.has(hit)) {
        drag.erased.add(hit);
        dispatch({
          type: "edit", label: `Erase ${activeLane}`, undo: false,
          apply: () => applyEraserFrames(drag.beforeDoc, drag.erased),
        });
      }
    } else {
      drag.x1 = cx; drag.y1 = cy;
      draw();
    }
  }, [
    cssPos, activeLane, dispatch, draw, beginPinch, applyDragValues, applyPencilSamples,
    applyEraserFrames, hitNode, doc, prefs.physicsDrag,
  ]);

  const onPointerUp = useCallback((e: React.PointerEvent) => {
    const cvs = ref.current;
    pointersRef.current.delete(e.pointerId);
    if (cvs) {
      try { cvs.releasePointerCapture(e.pointerId); } catch { /* already released */ }
    }

    // Ending a pinch: ignore residual one-finger commit until next down
    if (pinchRef.current) {
      if (pointersRef.current.size < 2) pinchRef.current = null;
      dragRef.current = null;
      return;
    }

    const drag = dragRef.current;
    dragRef.current = null;

    if (drag?.kind === "drag") {
      const finalVal = round1(drag.lastVal);
      const dragDelta = round1(finalVal - drag.startVal);
      if (Math.abs(dragDelta) > 0.01) {
        dispatch({
          type: "edit",
          label: drag.frames.length > 1
            ? `Nudge ${activeLane} by ${dragDelta > 0 ? "+" : ""}${dragDelta.toFixed(1)} (${drag.frames.length} keys)`
            : `Set ${activeLane} at frame ${drag.frame} to ${finalVal.toFixed(1)}`,
          undoSnapshot: drag.beforeDoc,
          apply: () => applyDragValues(drag.beforeDoc, drag.frames, drag.startValsByLane, drag.startVal, finalVal),
        });
        if (precisionEditRef.current) {
          const kind = doc.groups.find((g) => g.id === activeLane)?.kind ?? "rotary";
          armPrecisionPopup({
            beforeDoc: drag.beforeDoc,
            frames: drag.frames,
            laneId: activeLane,
            startVal: drag.startVal,
            finalVal,
            dragDelta,
            unit: kind === "linear" ? "mm" : "°",
          });
        }
      }
    } else if (drag?.kind === "pencil") {
      if (drag.samples.size) {
        const n = drag.samples.size;
        dispatch({
          type: "edit",
          label: `Drew ${n} key${n === 1 ? "" : "s"} on ${activeLane}`,
          undoSnapshot: drag.beforeDoc,
          apply: () => applyPencilSamples(drag.beforeDoc, drag.samples),
        });
        const frames = [...drag.samples.keys()].sort((a, b) => a - b);
        dispatch({ type: "select", frames, playFrame: frames.at(-1) });
      }
    } else if (drag?.kind === "eraser") {
      if (drag.erased.size) {
        const n = drag.erased.size;
        dispatch({
          type: "edit",
          label: `Erased ${n} key${n === 1 ? "" : "s"} on ${activeLane}`,
          undoSnapshot: drag.beforeDoc,
          apply: () => applyEraserFrames(drag.beforeDoc, drag.erased),
        });
        dispatch({ type: "select", frames: [] });
      }
    } else if (drag?.kind === "box") {
      const L = layoutRef.current;
      if (!L) return;
      const bxMin = Math.min(drag.x0, drag.x1), bxMax = Math.max(drag.x0, drag.x1);
      const byMin = Math.min(drag.y0, drag.y1), byMax = Math.max(drag.y0, drag.y1);
      const boxSelected: number[] = [];
      for (const kf of doc.keyframes) {
        const x = fToX(kf.frame, L), y = vToY(kf.lanes?.[activeLane] ?? 0, L, rangeRef.current);
        if (x >= bxMin && x <= bxMax && y >= byMin && y <= byMax) boxSelected.push(kf.frame);
      }
      if (boxSelected.length) {
        const merged = e.shiftKey ? [...new Set([...selected, ...boxSelected])] : boxSelected;
        dispatch({ type: "select", frames: merged, playFrame: Math.min(...boxSelected) });
      }
      draw();
    }
  }, [
    doc, activeLane, selected, dispatch, draw, applyDragValues, applyPencilSamples,
    applyEraserFrames, armPrecisionPopup,
  ]);

  const onWheel = useCallback((e: React.WheelEvent) => {
    // Require Ctrl (Windows/Linux) or ⌘ (Mac) so trackpad/wheel scroll doesn't zoom by accident.
    if (!e.ctrlKey && !e.metaKey) return;
    e.preventDefault();
    const cvs = ref.current; if (!cvs) return;
    const L = layoutRef.current;
    const rect = cvs.getBoundingClientRect();
    const cx = e.clientX - rect.left, cy = e.clientY - rect.top;
    const ax = L ? (cx - PAD.l) / Math.max(1, L.plotW) : 0.5;
    const ay = L ? (cy - PAD.t) / Math.max(1, L.plotH) : 0.5;
    const fac = e.deltaY < 0 ? 0.85 : 1.18;
    setZoom((z) => zoomToward(z, ax, ay, fac));
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (isTypingTarget(e.target)) return;
      const ctrl = e.ctrlKey || e.metaKey;
      const key = e.key.toLowerCase();
      if (key === " ") { e.preventDefault(); return; }
      if (ctrl && key === "z") { e.preventDefault(); dispatch({ type: e.shiftKey ? "redo" : "undo" }); return; }
      if (ctrl && key === "y") { e.preventDefault(); dispatch({ type: "redo" }); return; }
      if (ctrl && key === "a" && prefs.graphOpen) { e.preventDefault(); dispatch(selectAll(state)); return; }
      if (ctrl && key === "c" && prefs.graphOpen) { e.preventDefault(); dispatch(copy(state)); return; }
      if (ctrl && key === "v" && prefs.graphOpen) { e.preventDefault(); dispatch(paste(state, "paste")); return; }
      if (ctrl && key === "d" && prefs.graphOpen) { e.preventDefault(); dispatch(e.shiftKey ? paste(state, "mirror") : paste(state, "after")); return; }
      if ((key === "delete" || key === "backspace") && prefs.graphOpen) { e.preventDefault(); dispatch(deleteSelection(state, e.altKey)); return; }
      // Tool keys: ignore when Ctrl/⌘/Alt held (paste etc.), and when graph is hidden.
      if (!ctrl && !e.altKey && prefs.graphOpen) {
        const tool = graphToolFromKey(e);
        if (tool) {
          e.preventDefault();
          e.stopPropagation();
          dispatch({ type: "prefs", patch: { graphTool: tool } });
          // Focus plot so the next stroke isn't lost to a leftover Groups input.
          requestAnimationFrame(() => {
            const cvs = ref.current;
            if (cvs) {
              try { cvs.focus({ preventScroll: true }); } catch { cvs.focus(); }
            }
          });
        }
      }
    };
    // Capture phase so tool keys win over focused buttons / radio groups.
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [dispatch, state, prefs.graphOpen]);

  if (!prefs.graphOpen) {
    return (
      <Panel title="Keyframe Graph" help="keyframe-graph" area="graph"
        actions={<button type="button" onClick={() => dispatch({ type: "prefs", patch: { graphOpen: true } })}>Show</button>}>
        <HintRow>Graph minimized</HintRow>
      </Panel>
    );
  }

  return (
    <Panel title="Keyframe Graph" help="keyframe-graph" area="graph"
      actions={<button type="button" onClick={() => dispatch({ type: "prefs", patch: { graphOpen: false } })}>Hide</button>}>
      <Row>
        <ToolPick role="radiogroup" aria-label="Graph tool">
          {GRAPH_TOOLS.map((t) => (
            <ToolBtn
              key={t.id}
              type="button"
              role="radio"
              aria-checked={(prefs.graphTool ?? "pointer") === t.id}
              $on={(prefs.graphTool ?? "pointer") === t.id}
              title={t.title}
              onClick={() => {
                dispatch({ type: "prefs", patch: { graphTool: t.id } });
                focusGraph();
              }}
            >
              {t.label}
            </ToolBtn>
          ))}
        </ToolPick>
        <Check title="After dropping a node, refine the value numerically">
          <input type="checkbox" checked={precisionEdit}
            onChange={(e) => setPrecisionEdit(e.target.checked)} />
          Precision Edit
        </Check>
        <Check title="Cap drag speed to what the motor can physically achieve">
          <input type="checkbox" checked={prefs.physicsDrag !== false}
            onChange={(e) => dispatch({ type: "prefs", patch: { physicsDrag: e.target.checked } })} />
          Physics Speed
        </Check>
        <Check title="Stamp a single-node absolute edit onto every later key on this lane">
          <input type="checkbox" checked={prefs.duplicateUntilEnd}
            onChange={(e) => dispatch({ type: "prefs", patch: { duplicateUntilEnd: e.target.checked } })} />
          Duplicate until End
        </Check>
        <LanePicker
          groups={doc.groups}
          value={activeLane}
          workingGroup={workingGroup}
          onChange={(id) => {
            dispatch({ type: "edit", label: "Move to top", apply: (d) => moveGroupToTop(d, id) });
            dispatch({ type: "lane", id });
          }}
        />
        <Check><input type="checkbox" checked={prefs.clipAllLanes}
          onChange={(e) => dispatch({ type: "prefs", patch: { clipAllLanes: e.target.checked } })} /> All lanes</Check>
      </Row>
      <Row>
        <button type="button" onClick={() => dispatch({ type: "undo" })}
          disabled={state.undo.length === 0} title="Undo (Ctrl+Z)">Undo</button>
        <button type="button" onClick={() => dispatch({ type: "redo" })}
          disabled={state.redo.length === 0} title="Redo (Ctrl+Y)">Redo</button>
        <button type="button" onClick={() => dispatch(selectAll(state))} title="Select all keys (Ctrl+A)">Select all</button>
        <button type="button" onClick={() => dispatch(addKey(state))} title="Add keyframe at playhead">Add</button>
        <button type="button" onClick={() => dispatch(deleteSelection(state, false))} title="Delete Edit-lane nodes at selected keys (Delete)">Delete</button>
        <button type="button" onClick={() => dispatch(deleteSelection(state, true))} title="Remove whole keys for every lane (Alt+Delete)">Remove</button>
        <button type="button" onClick={() => dispatch(averageSelection(state))} title="Average from neighbours">Average</button>
        <QuantizeBtn
          type="button"
          $lit={prefs.suggestQuantize}
          onClick={() => {
            dispatch(quantizeKeys(state));
            if (prefs.suggestQuantize) {
              dispatch({ type: "prefs", patch: { suggestQuantize: false } });
            }
          }}
          title={prefs.suggestQuantize
            ? "Quantize first — dense 1-frame keys make Scale/Spread All slow"
            : "Keep keys every 10 frames (0, 10, 20, …) plus the final frame when needed"}
        >
          Quantize
        </QuantizeBtn>
        <button type="button" onClick={() => dispatch(copy(state))} title="Copy (Ctrl+C)">Copy</button>
        <button type="button" onClick={() => dispatch(paste(state, "paste"))} title="Paste at playhead (Ctrl+V)">Paste</button>
        <button type="button" onClick={() => dispatch(paste(state, "after"))} title="Duplicate after selection (Ctrl+D)">Dup</button>
        <button type="button" onClick={() => dispatch(paste(state, "mirror"))} title="Mirror-duplicate (Ctrl+Shift+D)">Mirror</button>
      </Row>
      <ZoomBar>
        <span>Time</span>
        <button type="button" onClick={() => setZoom((z) => zoomAxis(z, "x", true))} title="Zoom in on time (X)">X＋</button>
        <button type="button" onClick={() => setZoom((z) => zoomAxis(z, "x", false))} title="Zoom out on time (X)">X−</button>
        <span>Value</span>
        <button type="button" onClick={() => setZoom((z) => zoomAxis(z, "y", true))} title="Zoom in on value (Y)">Y＋</button>
        <button type="button" onClick={() => setZoom((z) => zoomAxis(z, "y", false))} title="Zoom out on value (Y)">Y−</button>
        <span>Pan</span>
        <button type="button" onClick={() => setZoom((z) => panZoom(z, -0.25, 0))} title="Pan left (earlier)">←</button>
        <button type="button" onClick={() => setZoom((z) => panZoom(z, 0.25, 0))} title="Pan right (later)">→</button>
        <button type="button" onClick={() => setZoom((z) => panZoom(z, 0, -0.25))} title="Pan up (higher values)">↑</button>
        <button type="button" onClick={() => setZoom((z) => panZoom(z, 0, 0.25))} title="Pan down (lower values)">↓</button>
        <button type="button" onClick={() => setZoom(ZOOM0)} title="Fit all">Fit</button>
      </ZoomBar>
      <Wrap ref={wrapRef} $tall={tallPlot}>
        <Canvas
          ref={ref}
          tabIndex={0}
          aria-label="Keyframe graph"
          $cursor={GRAPH_TOOLS.find((t) => t.id === (prefs.graphTool ?? "pointer"))?.cursor}
          onWheel={onWheel}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        />
      </Wrap>
      <HintRow>
        {(prefs.graphTool ?? "pointer") === "pencil"
          ? "Pencil: drag to draw a wave on the Edit lane · 2-finger: pinch / pan · V/B/E switch tools"
          : (prefs.graphTool ?? "pointer") === "eraser"
            ? "Eraser: drag over nodes to delete them on the Edit lane · V/B/E switch tools"
            : selected.length
              ? `${selected.length} key(s) selected: frames ${[...selected].sort((a, b) => a - b).join(", ")} — drag vertically to edit`
              : "Pointer: edit / box-select · Pencil draws waves · Eraser deletes nodes · 2-finger: pinch / pan"}
      </HintRow>
      {precisionModal && (
        <PrecisionEditModal
          payload={precisionModal}
          onCancel={() => {
            setPrecisionModal(null);
            pendingPrecisionRef.current = null;
          }}
          onAccept={({ absolute, delta }) => {
            const pending = pendingPrecisionRef.current;
            setPrecisionModal(null);
            pendingPrecisionRef.current = null;
            if (!pending) return;
            const wg = workingGroup;
            // undo:false — keep the drag's undo baseline so one Undo restores pre-drag
            if (pending.frames.length > 1) {
              dispatch({
                type: "edit",
                label: `Precision Δ ${delta > 0 ? "+" : ""}${delta.toFixed(1)} on ${pending.laneId}`,
                undo: false,
                apply: () => nudgeLanesLinked(pending.beforeDoc, pending.frames, pending.laneId, delta, wg),
              });
            } else {
              const frame = pending.frames[0]!;
              const untilEnd = prefs.duplicateUntilEnd;
              dispatch({
                type: "edit",
                label: untilEnd
                  ? `Precision set ${pending.laneId} @${frame}→end to ${absolute.toFixed(1)}`
                  : `Precision set ${pending.laneId} @${frame} to ${absolute.toFixed(1)}`,
                undo: false,
                apply: () => untilEnd
                  ? setLaneValueThroughEnd(pending.beforeDoc, frame, pending.laneId, absolute, wg)
                  : setLaneValueLinked(pending.beforeDoc, frame, pending.laneId, absolute, wg),
              });
            }
          }}
        />
      )}
    </Panel>
  );
}
