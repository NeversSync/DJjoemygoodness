import styled from "styled-components";
import { moveGroupToTop } from "../core/edit/groups";
import {
  canScale,
  canSpread,
  solvePhysicsViolation,
  type SolveMode,
} from "../core/edit/physicsSolve";
import type { PhysicsViolation, ViolationCode } from "../core/types";
import { useEditor } from "../state/EditorContext";
import { Panel } from "./Panel";

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
  margin-top: 4px;
  button {
    font-size: 0.75rem;
    padding: 4px 10px;
    min-height: 28px;
  }
`;
const Ok = styled.div`color: ${({ theme }) => theme.ok}; font-weight: 600;`;
const Pending = styled.div`color: ${({ theme }) => theme.muted}; font-style: italic;`;

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

export function PhysicsPanel() {
  const { physics, state, dispatch } = useEditor();

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

  if (!physics) return <Panel title="Physics" help="physics" area="physics"><Pending>Checking…</Pending></Panel>;
  if (physics.ok) return <Panel title="Physics" help="physics" area="physics"><Ok>Physics OK ✓</Ok></Panel>;

  return (
    <Panel title="Physics" help="physics" area="physics">
      <List>
        {physics.violations.map((v, i) => (
          <Card key={i} $color={v.color}>
            <VRow
              type="button"
              title="Jump playhead, select keys, and edit this lane on the graph"
              onClick={() => seekViolation(v)}
            >
              {v.display}
            </VRow>
            <Actions>
              {canScale(v.code) && (
                <button type="button" title="Shrink travel to fit limits (Undoable)"
                  onClick={(e) => { e.stopPropagation(); solve(v, "scale"); }}>
                  Scale
                </button>
              )}
              {canSpread(v.code) && (
                <button type="button" title="Reshape this lane’s values along a linear ramp on the grid (Undoable)"
                  onClick={(e) => { e.stopPropagation(); solve(v, "spread"); }}>
                  Spread
                </button>
              )}
            </Actions>
          </Card>
        ))}
      </List>
    </Panel>
  );
}
