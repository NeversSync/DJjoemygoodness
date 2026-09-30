import { stepperKind } from "../constants";
import { normalizeGroupColor } from "../document";
import type { MotionBuilderDocument, MotorKind, StepperName } from "../types";
import { produce } from "./produce";

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

/** Move a motor into a same-kind group, or make it solo (null). */
export const assignMotor = (doc: MotionBuilderDocument, stepper: StepperName, groupId: string | null) =>
  produce(doc, (d) => {
    const target = d.groups.find((g) => g.id === groupId);
    if (groupId && target?.kind !== stepperKind(stepper)) return;
    for (const g of d.groups) {
      g.steppers = g.steppers.filter((s) => s !== stepper);
      g.invert = (g.invert ?? []).filter((s) => s !== stepper);
    }
    target?.steppers.push(stepper);
  });

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
