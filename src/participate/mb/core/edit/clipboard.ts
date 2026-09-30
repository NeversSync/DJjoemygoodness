import type { MotionBuilderDocument, MotorKind } from "../types";
import { writeLane } from "./keyframes";
import { setLaneValueLinked } from "./workingGroup";
import { EditError, keyAt, produce, round3 } from "./produce";

export type LaneSample = { offset: number; value: number };
export type AllSample = { offset: number; lanes: Record<string, number> };
export type LaneClip = { scope: "lane"; kind: MotorKind; sourceLaneId: string; sourceLabel: string; samples: LaneSample[] };
export type AllClip = { scope: "all"; laneCount: number; samples: AllSample[] };
export type Clip = LaneClip | AllClip;
export type PasteMode = "paste" | "after" | "mirror";

const sortedFrames = (doc: MotionBuilderDocument, frames: number[]) => {
  const out = [...new Set(frames)].filter((f) => keyAt(doc, f)).sort((a, b) => a - b);
  if (!out.length) throw new EditError("Select keyframes to copy");
  return out;
};

export function captureLane(doc: MotionBuilderDocument, frames: number[], laneId: string): LaneClip {
  const g = doc.groups.find((x) => x.id === laneId);
  if (!g) throw new EditError("No Edit lane selected");
  const fs = sortedFrames(doc, frames);
  return {
    scope: "lane", kind: g.kind, sourceLaneId: laneId, sourceLabel: g.label,
    samples: fs.map((f) => ({ offset: f - fs[0]!, value: round3(keyAt(doc, f)!.lanes[laneId] ?? 0) })),
  };
}

export function captureAll(doc: MotionBuilderDocument, frames: number[]): AllClip {
  const fs = sortedFrames(doc, frames);
  const lanesAt = (f: number) => Object.fromEntries(doc.groups.map((g) => [g.id, round3(keyAt(doc, f)!.lanes[g.id] ?? 0)]));
  return { scope: "all", laneCount: doc.groups.length, samples: fs.map((f) => ({ offset: f - fs[0]!, lanes: lanesAt(f) })) };
}

/** Time-reverse samples around the last offset (ping-pong block). */
export function mirrorSamples<S extends { offset: number }>(samples: S[]): S[] {
  const span = samples.at(-1)?.offset ?? 0;
  return samples.map((s) => ({ ...s, offset: span - s.offset })).sort((a, b) => a.offset - b.offset);
}

/** Where a paste lands: at the playhead, one smallest-gap after the selection, or pivoting on its last key. */
export function pasteAnchor(doc: MotionBuilderDocument, selected: number[], mode: PasteMode, playFrame: number): number {
  if (mode === "paste") return Math.round(playFrame);
  const fs = sortedFrames(doc, selected);
  const maxF = fs.at(-1)!;
  if (mode === "mirror") return maxF;
  const gaps = fs.slice(1).map((f, i) => f - fs[i]!).filter((d) => d > 0);
  return maxF + (gaps.length ? Math.min(...gaps) : Math.max(1, doc.grid_step || 10));
}

export function pasteClip(
  doc: MotionBuilderDocument,
  clip: Clip,
  anchor: number,
  laneId?: string,
  workingGroup: readonly string[] = [],
) {
  if (!clip.samples.length) throw new EditError("Clipboard empty — copy a selection first");
  const frames = clip.samples.map((s) => Math.round(anchor + s.offset));
  if (clip.scope === "lane") {
    const g = doc.groups.find((x) => x.id === laneId);
    if (!g) throw new EditError("No Edit lane selected");
    if (g.kind !== clip.kind) throw new EditError(`Cannot paste ${clip.kind} automation onto ${g.kind} lane "${g.label}"`);
    // Absolute write on the Edit lane; linked peers get the same per-key delta
    let next = doc;
    for (let i = 0; i < clip.samples.length; i++) {
      next = setLaneValueLinked(next, frames[i]!, g.id, clip.samples[i]!.value, workingGroup);
    }
    return { doc: next, frames };
  }
  const known = new Set(doc.groups.map((g) => g.id));
  const next = produce(doc, (d) => clip.samples.forEach((s, i) => {
    for (const [id, v] of Object.entries(s.lanes)) if (known.has(id)) writeLane(d, frames[i]!, id, v);
  }));
  return { doc: next, frames };
}
