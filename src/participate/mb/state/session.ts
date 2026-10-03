import { parseDocument } from "../core/document";
import { DEFAULT_PREFS, initialState, type Prefs, type EditorState } from "./editor";

/** Session-only persistence: survives refresh, gone when the tab closes. */
export const SESSION_KEY = "eemb.session.v1";
/** DjJoe Participate page — separate from standalone MB sessions. */
export const PARTICIPATE_SESSION_KEY = "eemb.participate.session.v1";

type Saved = Pick<EditorState, "doc" | "selected" | "playFrame" | "activeLane" | "prefs">;

export function saveSession(
  s: EditorState,
  storage: Storage = sessionStorage,
  key: string = SESSION_KEY,
): void {
  const saved: Saved = { doc: s.doc, selected: s.selected, playFrame: s.playFrame, activeLane: s.activeLane, prefs: s.prefs };
  try {
    storage.setItem(key, JSON.stringify(saved));
  } catch {
    /* quota or privacy mode: the file picker remains the durable path */
  }
}

export function loadSession(
  storage: Storage = sessionStorage,
  key: string = SESSION_KEY,
  prefsOverride?: Partial<Prefs>,
): EditorState | null {
  try {
    const raw = storage.getItem(key);
    if (!raw) return null;
    const saved = JSON.parse(raw) as Saved;
    const doc = parseDocument(JSON.stringify(saved.doc));
    const savedRight = saved.prefs?.panelSizes?.right;
    const s = initialState(doc, {
      ...DEFAULT_PREFS,
      ...saved.prefs,
      panelSizes: {
        ...DEFAULT_PREFS.panelSizes,
        ...saved.prefs?.panelSizes,
        // Migrate pre-2× Desktop rail default (320) → current default.
        ...(savedRight === 320 ? { right: DEFAULT_PREFS.panelSizes.right } : {}),
      },
      ...prefsOverride,
    });
    return { ...s, selected: saved.selected ?? [], playFrame: saved.playFrame ?? 0,
      activeLane: saved.activeLane || s.activeLane, status: { text: "Restored this tab's session", error: false } };
  } catch {
    storage.removeItem(key);
    return null;
  }
}

/** Tablet (≤1280 CSS px) → Preview focus; wider → Auto/Desktop. */
export function defaultLayoutForWidth(width: number): Prefs["tabletLayout"] {
  return width <= 1280 ? "preview" : "auto";
}
