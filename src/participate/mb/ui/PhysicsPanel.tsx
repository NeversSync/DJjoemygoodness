import styled from "styled-components";
import { moveGroupToTop } from "../core/edit/groups";
import type { ViolationCode } from "../core/types";
import { useEditor } from "../state/EditorContext";
import { Panel } from "./Panel";

const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  max-height: 240px;
  overflow-y: auto;
`;
const VRow = styled.button<{ $color?: string | null }>`
  text-align: left;
  padding: 6px 10px;
  border-left: 4px solid ${({ $color, theme }) => $color ?? theme.error};
  background: rgba(255,107,107,0.08);
  font-size: 0.85rem;
  word-break: break-word;
  min-height: 36px;
  &:hover { background: rgba(255,107,107,0.16); }
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

  if (!physics) return <Panel title="Physics" help="physics" area="physics"><Pending>Checking…</Pending></Panel>;
  if (physics.ok) return <Panel title="Physics" help="physics" area="physics"><Ok>Physics OK ✓</Ok></Panel>;

  return (
    <Panel title="Physics" help="physics" area="physics">
      <List>
        {physics.violations.map((v, i) => (
          <VRow
            key={i}
            $color={v.color}
            title="Jump playhead, select keys, and edit this lane on the graph"
            onClick={() => {
              const keys = new Set(state.doc.keyframes.map((k) => k.frame));
              const frames = [v.prev_frame, v.frame].filter((f): f is number => f != null && keys.has(f));
              dispatch({ type: "select", frames: frames.length ? frames : [v.frame], playFrame: v.frame });
              if (v.group_id) {
                dispatch({ type: "edit", label: "Move to top", apply: (d) => moveGroupToTop(d, v.group_id!) });
                dispatch({ type: "lane", id: v.group_id });
              }
              dispatch({ type: "prefs", patch: { graphOpen: true } });
            }}
          >
            {v.display}
          </VRow>
        ))}
      </List>
    </Panel>
  );
}
