import type { MotionBuilderDocument, MotorKind } from "../types";
import { EditError, keyAt, produce, round3 } from "./produce";
import { averageLaneAt, deleteLaneAt, nudgeLane, setLaneValue, writeLane } from "./keyframes";

/** Lanes in the working group that share `primary`'s kind (includes primary when linked). */
export function linkedLanes(
  doc: MotionBuilderDocument,
  workingGroup: readonly string[],
  primary: string,
): string[] {
  if (!workingGroup.includes(primary) || workingGroup.length < 2) return [primary];
  const kind = doc.groups.find((g) => g.id === primary)?.kind;
  if (!kind) return [primary];
  const ids = workingGroup.filter((id) => doc.groups.some((g) => g.id === id && g.kind === kind));
  return ids.length ? ids : [primary];
}

/**
 * Toggle `laneId` in/out of the working group. Same-kind only: joining a
 * different kind replaces the set with just that lane. Returns status text.
 */
export function toggleWorkingLane(
  doc: MotionBuilderDocument,
  workingGroup: readonly string[],
  laneId: string,
): { workingGroup: string[]; status: string; error?: boolean } {
  const g = doc.groups.find((x) => x.id === laneId);
  if (!g) return { workingGroup: [...workingGroup], status: "Unknown lane", error: true };

  if (workingGroup.includes(laneId)) {
    const next = workingGroup.filter((id) => id !== laneId);
    return {
      workingGroup: next,
      status: next.length
        ? `Unlinked ${g.label} (${next.length} in Working Group)`
        : `Cleared Working Group`,
    };
  }

  const existingKind: MotorKind | undefined = workingGroup.length
    ? doc.groups.find((x) => x.id === workingGroup[0])?.kind
    : undefined;

  if (existingKind && existingKind !== g.kind) {
    return {
      workingGroup: [laneId],
      status: `Working Group switched to ${g.kind} — linked ${g.label}`,
    };
  }

  const next = [...workingGroup, laneId];
  return {
    workingGroup: next,
    status: next.length === 1
      ? `Working Group: ${g.label} (link another ${g.kind} lane)`
      : `Linked ${g.label} (${next.length} in Working Group)`,
  };
}

export function clearWorkingGroup(): { workingGroup: string[]; status: string } {
  return { workingGroup: [], status: "Unlinked all Working Group lanes" };
}

/** Drop ids that no longer exist on the document. */
export function pruneWorkingGroup(
  doc: MotionBuilderDocument,
  workingGroup: readonly string[],
): string[] {
  const ids = new Set(doc.groups.map((g) => g.id));
  return workingGroup.filter((id) => ids.has(id));
}

/**
 * Set primary lane to `value` at `frame`, and apply the same delta to every
 * other same-kind lane in the working group at that frame.
 */
export function setLaneValueLinked(
  doc: MotionBuilderDocument,
  frame: number,
  primaryLane: string,
  value: number,
  workingGroup: readonly string[],
): MotionBuilderDocument {
  const lanes = linkedLanes(doc, workingGroup, primaryLane);
  if (lanes.length === 1) return setLaneValue(doc, frame, primaryLane, value);

  return produce(doc, (d) => {
    const bases: Record<string, number> = {};
    for (const id of lanes) {
      bases[id] = Number(keyAt(d, frame)?.lanes?.[id] ?? 0);
    }
    const delta = round3(value - (bases[primaryLane] ?? 0));
    for (const id of lanes) {
      const next = id === primaryLane ? value : (bases[id] ?? 0) + delta;
      if (!writeLane(d, frame, id, next)) {
        throw new EditError("Frame 0 stays Aligned (all zeros)");
      }
    }
  });
}

/**
 * Absolute fill-forward: stamp `value` on `primaryLane` at `fromFrame` and every
 * later authored key (frame 0 skipped). Working Group peers still get per-key delta.
 */
export function setLaneValueThroughEnd(
  doc: MotionBuilderDocument,
  fromFrame: number,
  primaryLane: string,
  value: number,
  workingGroup: readonly string[],
): MotionBuilderDocument {
  const start = Math.max(1, Math.round(fromFrame));
  const frames = doc.keyframes.map((k) => k.frame).filter((f) => f >= start);
  if (!frames.includes(start)) frames.push(start);
  frames.sort((a, b) => a - b);
  let next = doc;
  for (const f of frames) {
    next = setLaneValueLinked(next, f, primaryLane, value, workingGroup);
  }
  return next;
}

/** Add `delta` to primary and every linked peer across `frames`. */
export function nudgeLanesLinked(
  doc: MotionBuilderDocument,
  frames: number[],
  primaryLane: string,
  delta: number,
  workingGroup: readonly string[],
): MotionBuilderDocument {
  const lanes = linkedLanes(doc, workingGroup, primaryLane);
  let next = doc;
  for (const id of lanes) next = nudgeLane(next, frames, id, delta);
  return next;
}

/** Average primary and every linked peer from neighbours at `frames`. */
export function averageLanesLinked(
  doc: MotionBuilderDocument,
  frames: number[],
  primaryLane: string,
  workingGroup: readonly string[],
): MotionBuilderDocument {
  const lanes = linkedLanes(doc, workingGroup, primaryLane);
  let next = doc;
  for (const id of lanes) next = averageLaneAt(next, frames, id);
  return next;
}

/** Delete Edit-lane nodes (and Working Group peers) at `frames`; other lanes keep their keys. */
export function deleteLanesLinked(
  doc: MotionBuilderDocument,
  frames: number[],
  primaryLane: string,
  workingGroup: readonly string[],
): MotionBuilderDocument {
  const lanes = linkedLanes(doc, workingGroup, primaryLane);
  let next = doc;
  for (const id of lanes) next = deleteLaneAt(next, frames, id);
  return next;
}

/**
 * At each frame in `frames`, add `delta` to every linked lane (from the
 * baseline values in `beforeDoc` when provided via startVals map keyed by
 * `${frame}:${laneId}` — callers usually loop setLaneValueLinked / write).
 */
export function applyDeltaToLinkedLanes(
  doc: MotionBuilderDocument,
  frames: number[],
  primaryLane: string,
  startValsByLane: Record<string, Record<number, number>>,
  primaryStart: number,
  newPrimary: number,
  workingGroup: readonly string[],
): MotionBuilderDocument {
  const lanes = linkedLanes(doc, workingGroup, primaryLane);
  const delta = round3(newPrimary - primaryStart);
  return produce(doc, (d) => {
    for (const f of frames.filter((x) => x > 0)) {
      for (const id of lanes) {
        const base = startValsByLane[id]?.[f] ?? Number(keyAt(d, f)?.lanes?.[id] ?? 0);
        if (!writeLane(d, f, id, round3(base + delta))) {
          throw new EditError("Frame 0 stays Aligned (all zeros)");
        }
      }
    }
  });
}
