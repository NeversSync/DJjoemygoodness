import { captureAll, captureLane, mirrorSamples, pasteAnchor, pasteClip, type Clip, type PasteMode } from "../core/edit/clipboard";
import { EditError } from "../core/edit/produce";
import { addKeyframe, quantizeKeyframes, removeKeys } from "../core/edit/keyframes";
import { averageLanesLinked, deleteLanesLinked, nudgeLanesLinked } from "../core/edit/workingGroup";
import type { Action, EditorState } from "./editor";

const laneLabel = (s: EditorState) => s.doc.groups.find((g) => g.id === s.activeLane)?.label ?? s.activeLane;
const nonZero = (s: EditorState) => s.selected.filter((f) => f > 0);
const fail = (text: string): Action => ({ type: "status", text, error: true });

function capture(s: EditorState): Clip {
  return s.prefs.clipAllLanes ? captureAll(s.doc, s.selected) : captureLane(s.doc, s.selected, s.activeLane);
}

function guard(fn: () => Action): Action {
  try {
    return fn();
  } catch (err) {
    if (err instanceof EditError) return fail(err.message);
    throw err;
  }
}

export const copy = (s: EditorState): Action => guard(() => {
  const clip = capture(s);
  return { type: "clip", clip, status: `Copied ${clip.samples.length} key(s)${clip.scope === "all" ? " × all lanes" : ` from ${laneLabel(s)}`}` };
});

/** Paste at the playhead, duplicate after the selection, or mirror-duplicate (ping-pong). */
export function paste(s: EditorState, mode: PasteMode): Action {
  return guard(() => {
    let clip = mode === "paste" ? s.clip : capture(s);
    if (!clip) throw new EditError("Clipboard empty — copy a selection first");
    if (mode === "mirror") {
      if (clip.samples.length < 2) throw new EditError("Select at least 2 keys to mirror-duplicate");
      clip = { ...clip, samples: mirrorSamples<(typeof clip.samples)[number]>(clip.samples) } as Clip;
    }
    const anchor = pasteAnchor(s.doc, s.selected, mode, s.playFrame);
    const verb = { paste: "Pasted", after: "Duplicated", mirror: "Mirror-duplicated" }[mode];
    const c = clip;
    const wg = s.workingGroup;
    return { type: "edit", label: `${verb} ${c.samples.length} key(s) @ frame ${anchor}`,
      apply: (doc) => pasteClip(doc, c, anchor, s.activeLane, wg) };
  });
}

/** Delete removes Edit-lane nodes only; whole-key removes the time stop for every lane. */
export function deleteSelection(s: EditorState, wholeKey: boolean): Action {
  const frames = nonZero(s);
  if (!frames.length) return fail("Select keyframes to delete (frame 0 is locked)");
  if (wholeKey) return { type: "edit", label: `Removed ${frames.length} keyframe(s) for all lanes`, apply: (d) => removeKeys(d, frames) };
  const wg = s.workingGroup;
  return { type: "edit", label: `Deleted ${laneLabel(s)} node(s) at ${frames.length} key(s)`,
    apply: (d) => deleteLanesLinked(d, frames, s.activeLane, wg) };
}

export function averageSelection(s: EditorState): Action {
  const frames = nonZero(s);
  if (!frames.length) return fail("Select non-zero keyframes to average from neighbours");
  const wg = s.workingGroup;
  return { type: "edit", label: `Averaged ${laneLabel(s)} at ${frames.length} key(s)`,
    apply: (d) => averageLanesLinked(d, frames, s.activeLane, wg) };
}

export function nudgeSelection(s: EditorState, delta: number): Action {
  const frames = nonZero(s);
  if (!frames.length) return fail("Select non-zero keyframes to nudge (frame 0 is locked)");
  const sign = delta > 0 ? "+" : "";
  const wg = s.workingGroup;
  return { type: "edit", label: `Nudged ${frames.length} key(s) on ${laneLabel(s)} by ${sign}${delta}°`,
    apply: (d) => ({ doc: nudgeLanesLinked(d, frames, s.activeLane, delta, wg), frames }) };
}

export function quantizeKeys(_s: EditorState): Action {
  return guard(() => ({
    type: "edit",
    label: "Quantize keyframes to every 10 frames",
    apply: (d) => {
      const doc = quantizeKeyframes(d);
      return { doc, frames: doc.keyframes.map((k) => k.frame) };
    },
  }));
}

export function addKey(s: EditorState): Action {
  const current = [...s.doc.keyframes].reverse().find((k) => k.frame <= s.playFrame)?.frame ?? 0;
  return guard(() => {
    const { frame } = addKeyframe(s.doc, current);
    return { type: "edit", label: `Added keyframe at frame ${frame}`, apply: (d) => ({ doc: addKeyframe(d, current).doc, frames: [frame] }) };
  });
}

export const selectAll = (s: EditorState): Action =>
  ({
    type: "select",
    frames: s.doc.keyframes
      .filter((k) => k.lanes?.[s.activeLane] !== undefined)
      .map((k) => k.frame),
    playFrame: 0,
  });
