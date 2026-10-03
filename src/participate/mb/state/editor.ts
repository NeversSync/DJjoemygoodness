import { EditError, lastFrame } from "../core/edit/produce";
import type { Clip } from "../core/edit/clipboard";
import { pruneWorkingGroup } from "../core/edit/workingGroup";
import type { MotionBuilderDocument } from "../core/types";

export const MAX_UNDO = 60;

export type TabletLayout = "auto" | "wide" | "stacked" | "graph" | "preview";

export type PanelSizes = {
  /** Left column width (groups / transport side), px */
  left: number;
  /** Right column width (preview / physics), px */
  right: number;
};

/** Keyframe graph cursor: select/drag, freehand draw, or erase nodes. */
export type GraphTool = "pointer" | "pencil" | "eraser";

export type Prefs = {
  clipAllLanes: boolean;
  /** Stamp a single-node absolute edit onto every later key on the Edit lane. */
  duplicateUntilEnd: boolean;
  /** Cap node-drag value change to the motor’s achievable rate over drag time. */
  physicsDrag: boolean;
  /** UI nudge: highlight Quantize while a long Scale/Spread All is running. */
  suggestQuantize: boolean;
  /** Active Keyframe Graph tool (Pointer / Pencil / Eraser). */
  graphTool: GraphTool;
  scrubByKeyframe: boolean;
  allowFrameDrag: boolean;
  playRate: number;
  graphOpen: boolean;
  tabletLayout: TabletLayout;
  panelSizes: PanelSizes;
};

export const MIN_PANEL = { left: 200, right: 200, center: 280 } as const;
/** Right rail sized for a 2× Preview stage (see OutlinePreview DESKTOP_PREVIEW_MAX). */
export const DEFAULT_PANEL_SIZES: PanelSizes = { left: 320, right: 560 };

export const DEFAULT_PREFS: Prefs = {
  clipAllLanes: false, duplicateUntilEnd: false, physicsDrag: true,
  suggestQuantize: false,
  graphTool: "pointer",
  scrubByKeyframe: true, allowFrameDrag: false,
  playRate: 1, graphOpen: true, tabletLayout: "auto",
  panelSizes: { ...DEFAULT_PANEL_SIZES },
};

export type Status = { text: string; error: boolean };

export type EditorState = {
  doc: MotionBuilderDocument;
  /** Selected keyframes by frame number (stable across sorts and inserts). */
  selected: number[];
  playFrame: number;
  activeLane: string;
  /**
   * Session-only temporary link of same-kind lane ids. Edits to a member
   * apply the same delta to every other member. Not saved in JSON.
   */
  workingGroup: string[];
  clip: Clip | null;
  prefs: Prefs;
  status: Status;
  undo: MotionBuilderDocument[];
  redo: MotionBuilderDocument[];
};

export type EditResult = MotionBuilderDocument | { doc: MotionBuilderDocument; frames: number[] };

export type Action =
  | { type: "load"; doc: MotionBuilderDocument; status: string }
  | {
      type: "edit";
      label: string;
      apply: (doc: MotionBuilderDocument) => EditResult;
      /** false = live preview (no stack). Omit/true = push current doc. */
      undo?: boolean;
      /** When set, push this baseline instead of the current doc (drag commit). */
      undoSnapshot?: MotionBuilderDocument;
    }
  | { type: "select"; frames: number[]; playFrame?: number }
  | { type: "seek"; frame: number }
  | { type: "lane"; id: string }
  | { type: "clip"; clip: Clip; status: string }
  | { type: "prefs"; patch: Partial<Prefs> }
  | { type: "status"; text: string; error?: boolean }
  | { type: "workingGroup"; workingGroup: string[]; status: string; error?: boolean }
  | { type: "undo" }
  | { type: "redo" };

export function initialState(doc: MotionBuilderDocument, prefs: Prefs = DEFAULT_PREFS): EditorState {
  return {
    doc, selected: [], playFrame: 0, activeLane: doc.groups[0]?.id ?? "",
    workingGroup: [], clip: null, prefs,
    status: { text: `Loaded ${doc.name}`, error: false }, undo: [], redo: [],
  };
}

/** Keep selection, playhead, lane, and working group valid for the current document. */
function reconcile(s: EditorState): EditorState {
  const keys = new Set(s.doc.keyframes.map((k) => k.frame));
  const activeLane = s.doc.groups.some((g) => g.id === s.activeLane) ? s.activeLane : (s.doc.groups[0]?.id ?? "");
  return {
    ...s, activeLane,
    workingGroup: pruneWorkingGroup(s.doc, s.workingGroup),
    selected: s.selected.filter((f) => keys.has(f)),
    playFrame: Math.max(0, Math.min(Math.round(s.playFrame), lastFrame(s.doc))),
  };
}

function applyEdit(s: EditorState, a: Extract<Action, { type: "edit" }>): EditorState {
  try {
    const result = a.apply(s.doc);
    const { doc, frames } = "frames" in result ? result : { doc: result, frames: undefined };
    if (doc === s.doc) return s;
    const skipUndo = a.undo === false;
    const baseline = a.undoSnapshot ?? s.doc;
    const undo = skipUndo ? s.undo : [...s.undo, baseline].slice(-MAX_UNDO);
    const sel = frames ? { selected: frames, playFrame: Math.min(...frames) } : {};
    return reconcile({
      ...s, ...sel, doc, undo,
      redo: skipUndo ? s.redo : [],
      status: { text: a.label, error: false },
    });
  } catch (err) {
    if (!(err instanceof EditError)) throw err;
    return { ...s, status: { text: err.message, error: true } };
  }
}

function travel(s: EditorState, from: "undo" | "redo"): EditorState {
  const stack = s[from];
  const doc = stack.at(-1);
  if (!doc) return { ...s, status: { text: `Nothing to ${from}`, error: true } };
  const to = from === "undo" ? "redo" : "undo";
  return reconcile({ ...s, doc, [from]: stack.slice(0, -1), [to]: [...s[to], s.doc], status: { text: from === "undo" ? "Undo" : "Redo", error: false } });
}

export function reducer(s: EditorState, a: Action): EditorState {
  switch (a.type) {
    case "load":
      return reconcile({ ...initialState(a.doc, s.prefs), clip: s.clip, status: { text: a.status, error: false } });
    case "edit":
      return applyEdit(s, a);
    case "select":
      return reconcile({ ...s, selected: [...new Set(a.frames)], playFrame: a.playFrame ?? s.playFrame });
    case "seek":
      return reconcile({ ...s, playFrame: a.frame });
    case "lane":
      return reconcile({ ...s, activeLane: a.id });
    case "clip":
      return { ...s, clip: a.clip, status: { text: a.status, error: false } };
    case "prefs":
      return { ...s, prefs: { ...s.prefs, ...a.patch } };
    case "status":
      return { ...s, status: { text: a.text, error: !!a.error } };
    case "workingGroup":
      return reconcile({
        ...s,
        workingGroup: a.workingGroup,
        status: { text: a.status, error: !!a.error },
      });
    case "undo":
    case "redo":
      return travel(s, a.type);
  }
}
