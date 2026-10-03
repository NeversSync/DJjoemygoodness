import { stepperKind } from "../constants";
import { normalizeGroupColor } from "../document";
import type { MotionBuilderDocument, MotorKind, StepperName } from "../types";
import { produce, round3 } from "./produce";

/** True when every authored sample of this lane is ~0 (or missing). */
export function laneIsFlatZero(doc: MotionBuilderDocument, laneId: string): boolean {
  for (const kf of doc.keyframes) {
    const v = kf.lanes?.[laneId];
    if (v != null && Math.abs(Number(v)) > 1e-9) return false;
  }
  return true;
}

/** Copy `fromId` lane samples onto `toId` (all keyframes). */
export function copyLaneValues(
  doc: MotionBuilderDocument,
  fromId: string,
  toId: string,
): MotionBuilderDocument {
  if (fromId === toId) return doc;
  return produce(doc, (d) => {
    for (const kf of d.keyframes) {
      const v = kf.lanes?.[fromId];
      kf.lanes[toId] = v == null ? 0 : round3(Number(v));
    }
  });
}

function uniqueGroupId(doc: MotionBuilderDocument, label: string): string {
  const base = label.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "").slice(0, 24) || "group";
  const ids = new Set(doc.groups.map((g) => g.id));
  let id = base;
  for (let n = 2; ids.has(id); n++) id = `${base}_${n}`;
  return id;
}

export function addGroup(doc: MotionBuilderDocument, kind: MotorKind) {
  const label = kind === "linear" ? "New Linear Group" : "New Rotary Group";
  const id = uniqueGroupId(doc, label);
  const next = produce(doc, (d) => {
    d.groups.push({ id, label, kind, steppers: [], invert: [], color: normalizeGroupColor(null, d.groups.length) });
    for (const kf of d.keyframes) kf.lanes[id] = 0;
  });
  return { doc: next, id };
}

export const deleteGroup = (doc: MotionBuilderDocument, id: string) =>
  produce(doc, (d) => {
    d.groups = d.groups.filter((g) => g.id !== id);
    for (const kf of d.keyframes) delete kf.lanes[id];
  });

export const renameGroup = (doc: MotionBuilderDocument, id: string, label: string) =>
  produce(doc, (d) => {
    const g = d.groups.find((x) => x.id === id);
    if (g) g.label = label.trim() || g.id;
  });

/** Move `fromId` to sit immediately before `beforeId` (end when null). */
export const reorderGroup = (doc: MotionBuilderDocument, fromId: string, beforeId: string | null) =>
  produce(doc, (d) => {
    const i = d.groups.findIndex((g) => g.id === fromId);
    if (i < 0 || fromId === beforeId) return;
    const [item] = d.groups.splice(i, 1);
    const j = beforeId ? d.groups.findIndex((g) => g.id === beforeId) : -1;
    d.groups.splice(j < 0 ? d.groups.length : j, 0, item!);
  });

/** Jump a group to the head of the Lanes list. */
export const moveGroupToTop = (doc: MotionBuilderDocument, id: string) => {
  const first = doc.groups[0]?.id ?? null;
  if (!first || first === id) return doc;
  return reorderGroup(doc, id, first);
};

/**
 * Move a motor into a same-kind group, or ungroup it (null).
 * When joining a group whose lane is still flat zero, copy the source group's
 * curve onto the target so consolidating Blank solos (or regrouping) keeps
 * playback. Empty source groups are removed after the move.
 */
export const assignMotor = (doc: MotionBuilderDocument, stepper: StepperName, groupId: string | null) => {
  const source = doc.groups.find((g) => g.steppers.includes(stepper));
  const target = groupId ? doc.groups.find((g) => g.id === groupId) : undefined;
  if (groupId && target?.kind !== stepperKind(stepper)) return doc;

  let next = doc;
  // Migrate motion before membership changes so expandKeyframePositions keeps playing.
  if (source && target && source.id !== target.id && laneIsFlatZero(doc, target.id)) {
    if (!laneIsFlatZero(doc, source.id)) {
      next = copyLaneValues(next, source.id, target.id);
    }
  }

  next = produce(next, (d) => {
    const t = d.groups.find((g) => g.id === groupId);
    for (const g of d.groups) {
      g.steppers = g.steppers.filter((s) => s !== stepper);
      g.invert = (g.invert ?? []).filter((s) => s !== stepper);
    }
    t?.steppers.push(stepper);
  });

  // Drop emptied source shells (and their stale lanes) after consolidating.
  if (source && source.id !== groupId) {
    const src = next.groups.find((g) => g.id === source.id);
    if (src && src.steppers.length === 0) next = deleteGroup(next, source.id);
  }
  return next;
};

export const setInvert = (doc: MotionBuilderDocument, stepper: StepperName, inverted: boolean) =>
  produce(doc, (d) => {
    const g = d.groups.find((x) => x.steppers.includes(stepper));
    if (!g) return;
    const set = new Set(g.invert ?? []);
    if (inverted) set.add(stepper);
    else set.delete(stepper);
    g.invert = g.steppers.filter((s) => set.has(s));
  });

export const setGroupColor = (doc: MotionBuilderDocument, id: string, color: string) =>
  produce(doc, (d) => {
    const i = d.groups.findIndex((g) => g.id === id);
    if (i >= 0) d.groups[i]!.color = normalizeGroupColor(color, i);
  });
