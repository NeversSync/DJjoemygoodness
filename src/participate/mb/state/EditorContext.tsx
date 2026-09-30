import { createContext, useContext, useEffect, useMemo, useReducer, useState, type Dispatch, type ReactNode } from "react";
import { interpolateForwardPositions } from "../core/interpolate";
import { checkPhysics } from "../core/physics";
import type { ForwardTrajectory, MotionBuilderDocument, PhysicsResult } from "../core/types";
import { DEFAULT_START, buildStart } from "../seeds";
import { DEFAULT_PREFS, initialState, reducer, type Action, type EditorState, type Prefs } from "./editor";
import { SESSION_KEY, loadSession, saveSession } from "./session";

export const PHYSICS_DEBOUNCE_MS = 200;

type Editor = {
  state: EditorState;
  dispatch: Dispatch<Action>;
  forward: ForwardTrajectory;
  physics: PhysicsResult | null;
};

const Ctx = createContext<Editor | null>(null);

function usePhysics(doc: MotionBuilderDocument): PhysicsResult | null {
  const [result, setResult] = useState<{ doc: MotionBuilderDocument; physics: PhysicsResult } | null>(null);
  useEffect(() => {
    const t = setTimeout(() => setResult({ doc, physics: checkPhysics(doc) }), PHYSICS_DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [doc]);
  return result?.doc === doc ? result.physics : null;
}

export type EditorProviderProps = {
  children: ReactNode;
  initialDoc?: MotionBuilderDocument;
  /** sessionStorage key (Participate uses a separate key). */
  sessionKey?: string;
  /** When false, always start from initialDoc / default seed. */
  restoreSession?: boolean;
  /** Merged into prefs on cold start (and overrides restored prefs when provided). */
  initialPrefs?: Partial<Prefs>;
  /** Persist edits to sessionStorage (default true). */
  persistSession?: boolean;
};

export function EditorProvider({
  children,
  initialDoc,
  sessionKey = SESSION_KEY,
  restoreSession = true,
  initialPrefs,
  persistSession = true,
}: EditorProviderProps) {
  const [state, dispatch] = useReducer(reducer, undefined, () => {
    if (restoreSession && typeof sessionStorage !== "undefined") {
      const restored = loadSession(sessionStorage, sessionKey, initialPrefs);
      if (restored) return restored;
    }
    return initialState(initialDoc ?? buildStart(DEFAULT_START), {
      ...DEFAULT_PREFS,
      ...initialPrefs,
    });
  });
  const forward = useMemo(() => interpolateForwardPositions(state.doc), [state.doc]);
  const physics = usePhysics(state.doc);

  useEffect(() => {
    if (!persistSession) return;
    const t = setTimeout(() => saveSession(state, sessionStorage, sessionKey), 150);
    return () => clearTimeout(t);
  }, [state, persistSession, sessionKey]);

  const value = useMemo(() => ({ state, dispatch, forward, physics }), [state, forward, physics]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useEditor(): Editor {
  const v = useContext(Ctx);
  if (!v) throw new Error("useEditor must be used inside <EditorProvider>");
  return v;
}
