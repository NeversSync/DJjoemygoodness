import {
  ALL_STEPPERS,
  BOX_LANES,
  DEFAULT_FPS,
  DEFAULT_FRAMES_FORWARD,
  DEFAULT_GRID_STEP,
  DEFAULT_GROUPS,
  DEFAULT_LANE_COLORS,
  DEFAULT_LIMITS,
  DEFAULT_SPEED_SCALE,
  EMIT_ORDER_SUFFIXES,
  MAX_DOCUMENT_BYTES,
  MAX_SPEED_SCALE,
  MIN_SPEED_SCALE,
  PEAK_RESYNC_END_FRAMES,
  SCHEMA_VERSION,
  isStepperName,
  stepperKind,
} from "./constants";
import type {
  MotionBuilderDocument,
  MotionGroup,
  MotionKeyframe,
  StepperName,
  StepperPositions,
} from "./types";

type SeedOpts = { framesForward?: number; gridStep?: number; name?: string };
type SizeOpts = { maxBytes?: number };

export const cloneGroups = (groups: readonly MotionGroup[]): MotionGroup[] => structuredClone([...groups]);
export const zeroLanes = (groups: readonly MotionGroup[]) =>
  Object.fromEntries(groups.map((g) => [g.id, 0])) as Record<string, number>;

export function emptyDocument(opts: SeedOpts = {}): MotionBuilderDocument {
  const { framesForward = DEFAULT_FRAMES_FORWARD, gridStep = DEFAULT_GRID_STEP, name = "Attract_default" } = opts;
  return {
    version: SCHEMA_VERSION,
    name,
    source: "attract_tsv",
    frames_forward: framesForward,
    grid_step: gridStep,
    dwell_ms: Math.round(1000 / DEFAULT_FPS),
    fps: DEFAULT_FPS,
    limits: { ...DEFAULT_LIMITS },
    emit_order: [...EMIT_ORDER_SUFFIXES],
    emit_order_mode: "groups",
    resync_every_n_keyframes: 0,
    peak_resync: true,
    peak_resync_end_frames: [...PEAK_RESYNC_END_FRAMES],
    interpolate: true,
    speed_scale: DEFAULT_SPEED_SCALE,
    groups: cloneGroups(DEFAULT_GROUPS),
    keyframes: [{ frame: 0, lanes: zeroLanes(DEFAULT_GROUPS), steppers: {} }],
    meta: { aligned_required: true, notes: "All animations must start at Aligned (frame 0 = all axes 0)." },
  };
}

export function sampleGridFrames(framesForward: number, gridStep: number): number[] {
  const frames: number[] = [];
  for (let f = 0; f < framesForward; f += Math.max(1, gridStep)) frames.push(f);
  if (frames.at(-1) !== framesForward - 1) frames.push(framesForward - 1);
  return frames;
}

const soloLabel = (s: StepperName): string => {
  const [kind, suffix = ""] = s.split("_");
  const cap = suffix.charAt(0).toUpperCase() + suffix.slice(1);
  return `${kind === "rotary" ? "Rot" : "Lin"} ${cap}`;
};

export function blankSoloGroups(): MotionGroup[] {
  return BOX_LANES.flatMap(([, steppers]) => steppers).map((s, i) => ({
    id: s, label: soloLabel(s), kind: stepperKind(s), steppers: [s], invert: [],
    color: normalizeGroupColor(null, i),
  }));
}

export function seedBlankDocument(opts: SeedOpts = {}): MotionBuilderDocument {
  const { framesForward = DEFAULT_FRAMES_FORWARD, gridStep = DEFAULT_GRID_STEP, name = "Blank_solo" } = opts;
  const doc = emptyDocument({ framesForward, gridStep, name });
  doc.source = "blank_solo";
  doc.groups = blankSoloGroups();
  doc.keyframes = sampleGridFrames(framesForward, gridStep).map((frame) => ({
    frame, lanes: zeroLanes(doc.groups), steppers: {},
  }));
  doc.meta = { ...doc.meta, notes: `Blank solo session: one automation lane per motor (13). Zero keys every ${gridStep} frames.` };
  return ensureAlignedFrame0(doc);
}

export function normalizeGroupColor(color: unknown, index = 0): string {
  const raw = String(color ?? "").trim();
  if (/^#?[0-9a-fA-F]{6}$/.test(raw)) return raw.startsWith("#") ? raw : `#${raw}`;
  return DEFAULT_LANE_COLORS[index % DEFAULT_LANE_COLORS.length]!;
}

export function normalizeGroupInvert(group: Pick<MotionGroup, "steppers" | "invert">): StepperName[] {
  const members = new Set(group.steppers);
  const raw: unknown = group.invert;
  if (!Array.isArray(raw)) return [];
  return [...new Set(raw.filter((s): s is StepperName => members.has(s)))];
}

export function normalizeDocumentGroups<T extends Partial<MotionBuilderDocument>>(doc: T): T & { groups: MotionGroup[] } {
  const raw: unknown = doc.groups;
  const normalized = (Array.isArray(raw) ? raw : []).flatMap((g: Partial<MotionGroup>, i): MotionGroup[] => {
    const id = String(g?.id ?? "").trim();
    if (!g || typeof g !== "object" || !id) return [];
    const steppers = (Array.isArray(g.steppers) ? g.steppers : []).filter(isStepperName);
    return [{
      id, label: String(g.label || id), kind: g.kind === "linear" ? "linear" : "rotary", steppers,
      invert: normalizeGroupInvert({ steppers, invert: g.invert }), color: normalizeGroupColor(g.color, i),
    }];
  });
  return { ...doc, groups: normalized.length ? normalized : cloneGroups(DEFAULT_GROUPS) };
}

export function ensureAlignedFrame0(doc: MotionBuilderDocument): MotionBuilderDocument {
  const groups = doc.groups?.length ? doc.groups : DEFAULT_GROUPS;
  const rest = (doc.keyframes ?? []).filter((k) => Number(k.frame) !== 0);
  const keyframes: MotionKeyframe[] = [{ frame: 0, lanes: zeroLanes(groups), steppers: {} }, ...rest]
    .sort((a, b) => a.frame - b.frame);
  return { ...doc, keyframes, frames_forward: Math.max(Math.trunc(doc.frames_forward) || 2, 2) };
}

export function expandKeyframePositions(doc: MotionBuilderDocument, kf: MotionKeyframe): StepperPositions {
  const out = Object.fromEntries(ALL_STEPPERS.map((s) => [s, 0])) as StepperPositions;
  for (const g of doc.groups) {
    const val = kf.lanes?.[g.id];
    if (val === undefined) continue;
    const inverted = new Set(normalizeGroupInvert(g));
    for (const s of g.steppers) if (s in out) out[s] = inverted.has(s) ? -val : Number(val);
  }
  for (const [s, v] of Object.entries(kf.steppers ?? {})) {
    if (isStepperName(s) && v !== undefined) out[s] = Number(v);
  }
  return out;
}

function laneFlatZero(keyframes: readonly MotionKeyframe[], laneId: string): boolean {
  for (const kf of keyframes) {
    const v = kf.lanes?.[laneId];
    if (v != null && Math.abs(Number(v)) > 1e-9) return false;
  }
  return true;
}

/**
 * After motors are consolidated into new groups, animation can remain on empty
 * orphan solo lanes while the new group lanes stay 0 — playback looks frozen.
 * Copy donor curves onto flat targets and drop orphan solo shells.
 */
export function repairOrphanedGroupLanes(doc: MotionBuilderDocument): MotionBuilderDocument {
  const groups = doc.groups.map((g) => ({
    ...g, steppers: [...g.steppers], invert: [...(g.invert ?? [])],
  }));
  const keyframes = doc.keyframes.map((kf) => ({
    ...kf,
    lanes: { ...(kf.lanes ?? {}) },
    steppers: { ...(kf.steppers ?? {}) },
  }));
  const donors = new Set<string>();

  for (const g of groups) {
    if (!g.steppers.length || !laneFlatZero(keyframes, g.id)) continue;
    let donor: string | null = null;
    for (const s of g.steppers) {
      const orphan = groups.find((x) => x.id === s && x.steppers.length === 0);
      if (orphan && !laneFlatZero(keyframes, orphan.id)) {
        donor = orphan.id;
        break;
      }
    }
    if (!donor) {
      for (const x of groups) {
        if (x.steppers.length || x.kind !== g.kind || x.id === g.id) continue;
        if (!laneFlatZero(keyframes, x.id)) {
          donor = x.id;
          break;
        }
      }
    }
    if (!donor) continue;
    for (const kf of keyframes) {
      kf.lanes[g.id] = Number(kf.lanes[donor] ?? 0);
    }
    donors.add(donor);
  }

  const nextGroups = groups.filter((g) => {
    if (donors.has(g.id)) return false;
    // Drop emptied solo shells left behind after regrouping (id == stepper name).
    if (g.steppers.length === 0 && isStepperName(g.id)) return false;
    return true;
  });
  const keep = new Set(nextGroups.map((g) => g.id));
  for (const kf of keyframes) {
    for (const id of Object.keys(kf.lanes)) {
      if (!keep.has(id)) delete kf.lanes[id];
    }
  }
  if (
    nextGroups.length === doc.groups.length
    && nextGroups.every((g, i) => g.id === doc.groups[i]?.id && g.steppers.length === doc.groups[i]!.steppers.length)
    && donors.size === 0
  ) {
    return doc;
  }
  return { ...doc, groups: nextGroups, keyframes };
}

export function groupIdForStepper(doc: MotionBuilderDocument, stepper: StepperName | null): string | null {
  if (!stepper) return null;
  return doc.groups.find((g) => g.steppers.includes(stepper))?.id ?? null;
}

export const clampSpeedScale = (v: unknown): number => {
  const n = Number(v);
  return Math.max(MIN_SPEED_SCALE, Math.min(MAX_SPEED_SCALE, Number.isFinite(n) ? n : DEFAULT_SPEED_SCALE));
};

export const safeName = (name: string): string =>
  (String(name ?? "").trim() || "motion").replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 80);

function assertWithinLimit(bytes: number, maxBytes: number): void {
  if (bytes <= maxBytes) return;
  const mb = (n: number) => n / (1024 * 1024);
  throw new Error(`Motion Builder JSON exceeds ${mb(maxBytes).toFixed(0)} MB limit ` +
    `(${mb(bytes).toFixed(2)} MB). Reduce keyframes or lanes before saving.`);
}

const utf8Bytes = (text: string) => new TextEncoder().encode(text).length;

/** Canonical file encoding (UTF-8, indent 2, trailing newline). */
export function serializeDocument(doc: MotionBuilderDocument, { maxBytes = MAX_DOCUMENT_BYTES }: SizeOpts = {}): string {
  const text = `${JSON.stringify(ensureAlignedFrame0(doc), null, 2)}\n`;
  assertWithinLimit(utf8Bytes(text), maxBytes);
  return text;
}

/** Strip BOM / odd whitespace so Windows downloads and notepad round-trips still parse. */
export function scrubJsonText(text: string): string {
  return String(text ?? "")
    .replace(/^\uFEFF/, "")
    .replace(/^\u0000+/, "")
    .trim();
}

export function parseDocument(text: string, { maxBytes = MAX_DOCUMENT_BYTES }: SizeOpts = {}): MotionBuilderDocument {
  const cleaned = scrubJsonText(text);
  assertWithinLimit(utf8Bytes(cleaned || text), maxBytes);
  if (!cleaned) throw new Error("File is empty — re-save the JSON and try again.");
  let data: unknown;
  try {
    data = JSON.parse(cleaned);
  } catch {
    const head = cleaned.slice(0, 40).replace(/\s+/g, " ");
    throw new Error(`File is not valid JSON (starts with: ${JSON.stringify(head)}).`);
  }
  if (!data || typeof data !== "object" || Array.isArray(data)) throw new Error("Document must be a JSON object.");
  const base = emptyDocument();
  const merged = { ...base, ...(data as Partial<MotionBuilderDocument>) };
  merged.limits = { ...base.limits, ...merged.limits };
  if (!Array.isArray(merged.keyframes)) merged.keyframes = [];
  return repairOrphanedGroupLanes(ensureAlignedFrame0(normalizeDocumentGroups(merged)));
}
