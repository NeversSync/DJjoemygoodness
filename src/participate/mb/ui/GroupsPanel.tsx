import { useCallback } from "react";
import styled from "styled-components";
import {
  addGroup, assignMotor, deleteGroup, groupLinkedLanes, moveGroupToTop, renameGroup, reorderGroup,
  setGroupColor, setInvert,
} from "../core/edit/groups";
import { setStepperOverride } from "../core/edit/keyframes";
import {
  clearWorkingGroup, linkAllOfKind, nudgeLanesLinked, setLaneValueLinked, setLaneValueThroughEnd,
  toggleWorkingLane,
} from "../core/edit/workingGroup";
import { stepperKind, BOX_LANES, ALL_STEPPERS, clampLinearMm, linearMaxMmForGroup, linearMaxMmForStepper } from "../core/constants";
import { normalizeGroupInvert } from "../core/document";
import type { MotionGroup, StepperName, StepperPositions } from "../core/types";
import { useEditor } from "../state/EditorContext";
import { Panel, Row } from "./Panel";
import { RotaryDial } from "./RotaryDial";

const GroupBox = styled.div<{ $color?: string }>`
  border-left: 3px solid ${({ $color, theme }) => $color ?? theme.accent};
  padding: 4px 6px 6px;
  background: ${({ theme }) => theme.panelAlt};
  border-radius: 6px;
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
  overflow: hidden;
`;
const GHead = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  min-width: 0;
  flex-wrap: nowrap;

  input[type="color"] {
    width: 28px;
    min-width: 28px;
    min-height: 28px;
    padding: 1px;
    flex-shrink: 0;
  }
  input[type="text"] {
    flex: 1 1 0;
    min-width: 0;
    min-height: 28px;
    padding: 0 6px;
    font-size: 0.85rem;
  }
`;
const Kind = styled.span`
  flex-shrink: 0;
  font-size: 0.7rem;
  color: ${({ theme }) => theme.muted};
  text-transform: uppercase;
  letter-spacing: 0.03em;
`;
const HeadActions = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 2px;
  flex-shrink: 0;
  margin-left: auto;
`;
const IconBtn = styled.button`
  min-height: 28px !important;
  min-width: 28px !important;
  width: 28px;
  padding: 0 !important;
  font-size: 0.8rem;
  line-height: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
`;
const LinkBtn = styled(IconBtn)<{ $on?: boolean }>`
  width: auto !important;
  min-width: 36px !important;
  padding: 0 6px !important;
  font-size: 0.7rem !important;
  font-weight: 600;
  letter-spacing: 0.02em;
  color: ${({ $on, theme }) => ($on ? "#000" : theme.muted)};
  background: ${({ $on }) => ($on ? "#4fc3f7" : "transparent")};
  border: 1px solid ${({ $on, theme }) => ($on ? "#4fc3f7" : theme.border)};
`;
const WgHint = styled.div`
  font-size: 0.75rem;
  color: ${({ theme }) => theme.muted};
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  min-height: 28px;
`;
const MotorRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px 6px;
  padding: 1px 0;
  min-width: 0;

  > span:first-child {
    flex: 0 0 auto;
    min-width: 4.5rem;
    max-width: 5.5rem;
    font-size: 0.75rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  select {
    flex: 1 1 7rem;
    min-width: 0;
    max-width: 100%;
    min-height: 28px;
    padding: 0 6px;
    font-size: 0.8rem;
  }
  input[type="range"] {
    flex: 1 1 6rem;
    min-width: 4rem;
  }
  input[type="number"] {
    width: 4.5rem;
    min-width: 4.5rem;
    min-height: 28px;
    padding: 0 4px;
    font-size: 0.8rem;
    font-variant-numeric: tabular-nums;
  }
`;
const Unit = styled.span`
  font-size: 0.75rem;
  color: ${({ theme }) => theme.muted};
  flex-shrink: 0;
`;
const Nudges = styled.div`
  display: inline-flex;
  flex-wrap: wrap;
  gap: 2px;
  button {
    min-height: 26px !important;
    min-width: 0 !important;
    padding: 0 5px !important;
    font-size: 0.7rem;
  }
`;

const ROTARY_NUDGES = [-60, -15, -1, 1, 15, 60];

export function GroupsPanel() {
  const { state, dispatch, forward } = useEditor();
  const { doc, selected, activeLane, workingGroup } = state;
  const playFrame = state.playFrame;
  const locked = playFrame === 0;
  /** Held/interpolated pose so a deleted lane at this time stop does not read as 0. */
  const pos = Object.fromEntries(
    ALL_STEPPERS.map((s) => [s, forward[s]?.[playFrame] ?? 0]),
  ) as StepperPositions;

  const edit = useCallback((label: string, apply: (d: typeof doc) => typeof doc) => {
    dispatch({ type: "edit", label, apply });
  }, [dispatch]);

  const onLaneChange = useCallback((frame: number, lane: string, value: number) => {
    const wg = workingGroup;
    const untilEnd = state.prefs.duplicateUntilEnd;
    dispatch({
      type: "edit",
      label: untilEnd ? `Set ${lane} through end` : `Set ${lane}`,
      apply: (d) => untilEnd
        ? setLaneValueThroughEnd(d, frame, lane, value, wg)
        : setLaneValueLinked(d, frame, lane, value, wg),
    });
  }, [dispatch, workingGroup, state.prefs.duplicateUntilEnd]);

  const onNudge = useCallback((delta: number) => {
    if (selected.length > 1) {
      const d = delta;
      const wg = workingGroup;
      dispatch({
        type: "edit",
        label: `Nudge ${activeLane} by ${d > 0 ? "+" : ""}${d}`,
        apply: (doc) => nudgeLanesLinked(doc, selected, activeLane, d, wg),
      });
    }
  }, [dispatch, selected, activeLane, workingGroup]);

  const desktop = state.prefs.tabletLayout === "auto";

  const toggleLink = useCallback((laneId: string, e?: { ctrlKey?: boolean; metaKey?: boolean }) => {
    const modClick = !!(e?.ctrlKey || e?.metaKey);
    const r = desktop && modClick
      ? linkAllOfKind(doc, laneId)
      : toggleWorkingLane(doc, workingGroup, laneId);
    dispatch({ type: "workingGroup", workingGroup: r.workingGroup, status: r.status, error: r.error });
  }, [dispatch, doc, workingGroup, desktop]);

  const setMotorValue = (stepper: StepperName, group: MotionGroup | undefined, value: number) => {
    const maxMm = group
      ? linearMaxMmForGroup(group, doc.limits)
      : linearMaxMmForStepper(stepper, doc.limits);
    const clamped = String(stepper).startsWith("linear_")
      ? clampLinearMm(value, maxMm, doc.limits.min_linear_mm ?? 0)
      : value;
    if (group) onLaneChange(playFrame, group.id, clamped);
    else dispatch({
      type: "edit",
      label: `Set ${stepper}`,
      apply: (d) => setStepperOverride(d, playFrame, stepper, clamped),
    });
  };

  const renderMotor = (stepper: StepperName, group: MotionGroup | undefined) => {
    const kind = stepperKind(stepper);
    const val = pos[stepper];
    const inverted = group ? normalizeGroupInvert(group).includes(stepper) : false;
    const short = stepper.replace("_", " ").replace(/(rotary|linear)/, (m) => m.slice(0, 3).toUpperCase());
    const linMax = group
      ? linearMaxMmForGroup(group, doc.limits)
      : linearMaxMmForStepper(stepper, doc.limits);

    return (
      <MotorRow key={stepper}>
        <span title={stepper}>{short}</span>
        <select value={group?.id ?? ""}
          onChange={(e) => edit("Assign motor", (d) => assignMotor(d, stepper, e.target.value || null))}>
          <option value="">— solo —</option>
          {doc.groups.filter((g) => g.kind === kind).map((g) => (
            <option key={g.id} value={g.id}>{g.label}</option>
          ))}
        </select>
        {group && kind === "rotary" && <label style={{ fontSize: "0.75rem", display: "inline-flex", alignItems: "center", gap: 3, flexShrink: 0 }}>
          <input type="checkbox" checked={inverted} disabled={!group || locked}
            onChange={(e) => edit("Toggle invert", (d) => setInvert(d, stepper, e.target.checked))} /> Inv
        </label>}
        {kind === "linear" ? (
          <>
            <input type="range" min={0} max={linMax} step={0.1} value={Math.min(val, linMax)} disabled={locked}
              onChange={(e) => setMotorValue(stepper, group, Number(e.target.value))} />
            <input type="number" min={0} max={linMax} step={0.1} value={Number(Math.min(val, linMax).toFixed(1))}
              disabled={locked} title={`mm (max ${linMax})`} aria-label={`${short} mm`}
              onChange={(e) => {
                const n = Number(e.target.value);
                if (Number.isFinite(n)) setMotorValue(stepper, group, n);
              }} />
            <Unit>mm</Unit>
          </>
        ) : (
          <>
            <RotaryDial
              stepper={stepper}
              value={val}
              disabled={locked}
              onChange={(abs) => setMotorValue(stepper, group, abs)}
            />
            <input type="number" step={0.1} value={Number(val.toFixed(1))} disabled={locked}
              title="Absolute degrees (cumulative)" aria-label={`${short} degrees`}
              onChange={(e) => {
                const n = Number(e.target.value);
                if (Number.isFinite(n)) setMotorValue(stepper, group, n);
              }} />
            <Unit>°</Unit>
            <Nudges>
              {ROTARY_NUDGES.map((d) => (
                <button key={d} type="button" disabled={locked} onClick={() => {
                  if (selected.length > 1) onNudge(d);
                  else setMotorValue(stepper, group, val + d);
                }}>{d > 0 ? `+${d}` : d}</button>
              ))}
            </Nudges>
          </>
        )}
      </MotorRow>
    );
  };

  return (
    <Panel title="Lanes & Motors" help="groups" area="groups">
      <Row>
        <button type="button" onClick={() => edit("Add rotary group", (d) => addGroup(d, "rotary").doc)}>+ Rotary</button>
        <button type="button" onClick={() => edit("Add linear group", (d) => addGroup(d, "linear").doc)}>+ Linear</button>
      </Row>
      <WgHint>
        <span title="Link same-kind lanes so edits apply as a shared delta">Working Group</span>
        {workingGroup.length === 0 ? (
          <span>Use Link on lanes to edit them together</span>
        ) : (
          <>
            <span>
              {workingGroup.length} linked · {doc.groups.find((g) => g.id === workingGroup[0])?.kind ?? "?"}
            </span>
            {workingGroup.length >= 2 && (
              <button
                type="button"
                title="Create a permanent lockstep group from these linked lanes"
                onClick={() => {
                  let newId = "";
                  let status = "Grouped linked lanes";
                  dispatch({
                    type: "edit",
                    label: "Group Linked",
                    apply: (d) => {
                      const r = groupLinkedLanes(d, workingGroup);
                      newId = r.id;
                      status = r.status;
                      return r.doc;
                    },
                  });
                  dispatch({ type: "workingGroup", workingGroup: [], status });
                  if (newId) dispatch({ type: "lane", id: newId });
                }}
              >
                Group Linked
              </button>
            )}
            <button type="button" title="Release every lane from the Working Group"
              onClick={() => {
                const r = clearWorkingGroup();
                dispatch({ type: "workingGroup", workingGroup: r.workingGroup, status: r.status });
              }}>Unlink all</button>
          </>
        )}
      </WgHint>
      {doc.groups.map((g, gi) => {
        const linked = workingGroup.includes(g.id);
        return (
        <GroupBox key={g.id} $color={g.color} style={linked ? { outline: "1px solid #4fc3f7" } : undefined}>
          <GHead>
            <input type="color" value={g.color ?? "#e94560"} title="Lane color"
              onChange={(e) => edit("Group color", (d) => setGroupColor(d, g.id, e.target.value))} />
            <input type="text" value={g.label} aria-label={`Rename ${g.id}`}
              onChange={(e) => edit("Rename", (d) => renameGroup(d, g.id, e.target.value))} />
            <Kind title={g.kind}>{g.kind === "rotary" ? "rot" : "lin"}</Kind>
            <LinkBtn type="button" $on={linked}
              title={linked
                ? "Unlink from Working Group"
                : desktop
                  ? "Link into Working Group (same kind). Ctrl/⌘+click: link all of this kind"
                  : "Link into Working Group (same kind; edits share delta)"}
              aria-pressed={linked}
              onClick={(e) => toggleLink(g.id, e)}>
              {linked ? "Linked" : "Link"}
            </LinkBtn>
            <HeadActions>
              {gi > 0 && (
                <IconBtn type="button" title="Move to top (and edit on graph)"
                  onClick={() => {
                    dispatch({ type: "edit", label: "Move to top", apply: (d) => moveGroupToTop(d, g.id) });
                    dispatch({ type: "lane", id: g.id });
                  }}>⇈</IconBtn>
              )}
              {gi > 0 && (
                <IconBtn type="button" title="Move up"
                  onClick={() => edit("Move up", (d) => reorderGroup(d, g.id, doc.groups[gi - 1]?.id ?? null))}>↑</IconBtn>
              )}
              {gi < doc.groups.length - 1 && (
                <IconBtn type="button" title="Move down"
                  onClick={() => edit("Move down", (d) => reorderGroup(d, g.id, doc.groups[gi + 2]?.id ?? null))}>↓</IconBtn>
              )}
              <IconBtn type="button" title="Delete group" style={{ color: "#ff6b6b" }}
                onClick={() => edit("Delete group", (d) => deleteGroup(d, g.id))}>✕</IconBtn>
            </HeadActions>
          </GHead>
          {g.steppers.map((s) => renderMotor(s, g))}
          {g.steppers.length === 0 && <div style={{ color: "#8d9ab3", fontSize: "0.8rem" }}>No motors assigned</div>}
        </GroupBox>
        );
      })}
      {(() => {
        const grouped = new Set(doc.groups.flatMap((g) => g.steppers));
        const solos = BOX_LANES.flatMap(([, steppers]) => steppers).filter((s) => !grouped.has(s));
        if (!solos.length) return null;
        return (
          <GroupBox $color="#666">
            <GHead><span style={{ fontSize: "0.8rem" }}>Solo motors</span></GHead>
            {solos.map((s) => renderMotor(s as StepperName, undefined))}
          </GroupBox>
        );
      })()}
    </Panel>
  );
}
