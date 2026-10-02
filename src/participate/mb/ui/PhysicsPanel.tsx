import { moveGroupToTop } from "../core/edit/groups";
import {
  canScale,
  canSpread,
  solveNextPhysicsViolation,
  solvePhysicsViolation,
  violationFingerprint,
  type SolveMode,
} from "../core/edit/physicsSolve";
import type { PhysicsViolation, ViolationCode } from "../core/types";
import { PHYSICS_DEBOUNCE_MS, useEditor } from "../state/EditorContext";
import { Panel } from "./Panel";
import { useEffect, useRef, useState } from "react";
import styled from "styled-components";

const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-height: 280px;
  overflow-y: auto;
`;
const Card = styled.div<{ $color?: string | null }>`
  border-left: 4px solid ${({ $color, theme }) => $color ?? theme.error};
  background: rgba(255,107,107,0.08);
  padding: 6px 8px;
  border-radius: 0 4px 4px 0;
`;
const VRow = styled.button`
  display: block;
  width: 100%;
  text-align: left;
  padding: 4px 2px;
  background: transparent;
  border: none;
  color: inherit;
  font-size: 0.85rem;
  word-break: break-word;
  min-height: 28px;
  cursor: pointer;
  &:hover { color: ${({ theme }) => theme.accent}; }
`;
const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 4px;
  button {
    font-size: 0.75rem;
    padding: 4px 10px;
    min-height: 28px;
  }
`;
const TopActions = styled(Actions)`
  margin-bottom: 8px;
  button {
    font-weight: 600;
  }
`;
const Ok = styled.div`color: ${({ theme }) => theme.ok}; font-weight: 600;`;
const Pending = styled.div`color: ${({ theme }) => theme.muted}; font-style: italic;`;

const SOLVE_ALL_PAUSE_MS = PHYSICS_DEBOUNCE_MS + 80;
const SOLVE_ALL_MAX_STEPS = 80;

/** Kept for help-topic anchors (HelpLink / registry), not used on row click. */
export const PHYSICS_HELP_ANCHOR: Record<ViolationCode, string> = {
  linear_below_min: "linear_below_min",
  linear_above_max: "linear_above_max",
  linear_speed: "linear_speed",
  linear_accel_time: "linear_accel_time",
  rotary_delta: "rotary_delta",
  rotary_speed: "rotary_speed",
  rotary_accel_time: "rotary_accel_time",
  crash_zone: "crash_zone",
  pillar_collision: "pillar_collision",
};

function sleep(ms: number) {
  return new Promise<void>((r) => setTimeout(r, ms));
}

export function PhysicsPanel() {
  const { physics, state, dispatch } = useEditor();
  const docRef = useRef(state.doc);
  docRef.current = state.doc;
  const [runningAll, setRunningAll] = useState<SolveMode | null>(null);
  const cancelRef = useRef(false);

  useEffect(() => () => { cancelRef.current = true; }, []);

  const seekViolation = (v: PhysicsViolation) => {
    const keys = new Set(state.doc.keyframes.map((k) => k.frame));
    const frames = [v.prev_frame, v.frame].filter((f): f is number => f != null && keys.has(f));
    dispatch({ type: "select", frames: frames.length ? frames : [v.frame], playFrame: v.frame });
    if (v.group_id) {
      dispatch({ type: "edit", label: "Move to top", apply: (d) => moveGroupToTop(d, v.group_id!) });
      dispatch({ type: "lane", id: v.group_id });
    }
    dispatch({ type: "prefs", patch: { graphOpen: true } });
  };

  const solve = (v: PhysicsViolation, mode: SolveMode) => {
    dispatch({
      type: "edit",
      label: `Physics ${mode} @ frame ${v.frame}`,
      apply: (d) => solvePhysicsViolation(d, v, mode),
    });
  };

  const solveAll = async (mode: SolveMode) => {
    if (runningAll) return;
    cancelRef.current = false;
    setRunningAll(mode);
    let steps = 0;
    let applied = 0;
    const attempted = new Set<string>();
    const history: string[] = [];
    try {
      while (steps < SOLVE_ALL_MAX_STEPS && !cancelRef.current) {
        steps++;
        const hit = solveNextPhysicsViolation(docRef.current, mode, attempted);
        if (!hit) break;
        const { violation: v } = hit;
        const fp = violationFingerprint(v);
        history.push(fp);
        // Abort if the last 3 solves repeat the previous 3 (A-B-C-A-B-C flash loop).
        if (history.length >= 6) {
          const a = history.slice(-6, -3).join("||");
          const b = history.slice(-3).join("||");
          if (a === b) {
            dispatch({
              type: "status",
              text: `Physics ${mode} all stopped — oscillating between the same hits`,
              error: true,
            });
            break;
          }
        }
        const beforeCount = docRef.current.keyframes.length;
        dispatch({
          type: "edit",
          label: `Physics ${mode} all @ frame ${v.frame}`,
          apply: (d) => solvePhysicsViolation(d, v, mode),
        });
        applied++;
        // Guard: Spread must not spawn keyframes; if it somehow did, stop flashing.
        await sleep(SOLVE_ALL_PAUSE_MS);
        if (mode === "spread" && docRef.current.keyframes.length > beforeCount) {
          dispatch({
            type: "status",
            text: "Spread All stopped — unexpected new keys",
            error: true,
          });
          break;
        }
      }
      dispatch({
        type: "status",
        text: applied === 0
          ? `No violations ${mode} could fix`
          : `Physics ${mode} all: ${applied} step(s)`,
        error: applied === 0,
      });
    } finally {
      setRunningAll(null);
    }
  };

  if (!physics) return <Panel title="Physics" help="physics" area="physics"><Pending>Checking…</Pending></Panel>;
  if (physics.ok) return <Panel title="Physics" help="physics" area="physics"><Ok>Physics OK ✓</Ok></Panel>;

  const busy = runningAll != null;

  return (
    <Panel title="Physics" help="physics" area="physics">
      <TopActions>
        <button type="button" disabled={busy}
          title="Apply Scale to each violation in turn (Undoable per step)"
          onClick={() => void solveAll("scale")}>
          {runningAll === "scale" ? "Scaling…" : "Scale All"}
        </button>
        <button type="button" disabled={busy}
          title="Apply Spread to each violation in turn (Undoable per step)"
          onClick={() => void solveAll("spread")}>
          {runningAll === "spread" ? "Spreading…" : "Spread All"}
        </button>
      </TopActions>
      <List>
        {physics.violations.map((v, i) => (
          <Card key={i} $color={v.color}>
            <Actions>
              {canScale(v.code) && (
                <button type="button" disabled={busy} title={
                  v.code === "pillar_collision"
                    ? "Pull the paired linear under the safe depth (Undoable)"
                    : "Shrink travel toward neighbors to fit limits (Undoable)"
                }
                  onClick={(e) => { e.stopPropagation(); solve(v, "scale"); }}>
                  Scale
                </button>
              )}
              {canSpread(v.code) && (
                <button type="button" disabled={busy} title={
                  v.code === "pillar_collision"
                    ? "Hold tips on a safe angle while linears are deep (Undoable)"
                    : "Keep the spike; pull nearby keys toward it in a smooth wave (Undoable)"
                }
                  onClick={(e) => { e.stopPropagation(); solve(v, "spread"); }}>
                  Spread
                </button>
              )}
            </Actions>
            <VRow
              type="button"
              title="Jump playhead, select keys, and edit this lane on the graph"
              onClick={() => seekViolation(v)}
            >
              {v.display}
            </VRow>
          </Card>
        ))}
      </List>
    </Panel>
  );
}
