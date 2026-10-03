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
import styled, { keyframes } from "styled-components";

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

const ListHost = styled.div`
  position: relative;
  min-height: 120px;
`;

/** Flow layout (not absolute) so the spinner always gets real space. */
const BusyShell = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  min-height: 200px;
  padding: 20px 12px;
  border-radius: 8px;
  background: rgba(15, 18, 24, 0.92);
  border: 1px solid rgba(79, 195, 247, 0.18);
`;

const ProcessingLabel = styled.div`
  font-weight: 600;
  letter-spacing: 0.04em;
  color: ${({ theme }) => theme.text};
`;

const ProcessingHint = styled.div`
  font-size: 0.8rem;
  color: ${({ theme }) => theme.muted};
  text-align: center;
`;

const QuantizeReminder = styled.div`
  font-size: 0.8rem;
  line-height: 1.35;
  text-align: center;
  max-width: 260px;
  color: ${({ theme }) => theme.accent};
  padding: 6px 8px;
  border-radius: 8px;
  background: rgba(79, 195, 247, 0.1);
  border: 1px solid rgba(79, 195, 247, 0.35);
`;

const CancelBtn = styled.button`
  font-weight: 600;
  min-width: 96px;
`;

const QUANTIZE_HINT_AFTER_MS = 5000;

const dashSpin = keyframes`
  to { stroke-dashoffset: -66; }
`;
const ghostPulse = keyframes`
  0%, 100% { opacity: 0.25; }
  50% { opacity: 1; }
`;

/** CSS-only equilateral triangle + soft particles — element selectors, no rAF. */
const GhostTri = styled.svg`
  display: block;
  width: 80px;
  height: 80px;
  flex: 0 0 auto;
  overflow: visible;

  polygon {
    fill: rgba(79, 195, 247, 0.06);
    stroke: rgba(79, 195, 247, 0.75);
    stroke-width: 2;
    stroke-linejoin: round;
    stroke-dasharray: 16 10;
    animation: ${dashSpin} 2.4s linear infinite;
  }
  circle {
    animation: ${ghostPulse} 1.6s ease-in-out infinite;
  }
  circle:nth-of-type(1) { fill: rgba(232, 234, 237, 0.85); animation-delay: 0s; }
  circle:nth-of-type(2) { fill: rgba(79, 195, 247, 0.8); animation-delay: 0.2s; }
  circle:nth-of-type(3) { fill: rgba(255, 171, 64, 0.75); animation-delay: 0.4s; }
  circle:nth-of-type(4) { fill: rgba(0, 230, 118, 0.55); animation-delay: 0.15s; }
  circle:nth-of-type(5) { fill: rgba(206, 147, 216, 0.55); animation-delay: 0.35s; }
  circle:nth-of-type(6) { fill: rgba(128, 222, 234, 0.55); animation-delay: 0.55s; }

  @media (prefers-reduced-motion: reduce) {
    polygon, circle { animation: none; }
    polygon { stroke-dasharray: none; opacity: 0.85; }
    circle { opacity: 0.7; }
  }
`;

function ProcessingSpinner() {
  return (
    <GhostTri viewBox="0 0 100 100" aria-hidden focusable="false">
      <polygon points="50,10 90,86 10,86" />
      <circle cx="50" cy="10" r="4" />
      <circle cx="90" cy="86" r="4" />
      <circle cx="10" cy="86" r="4" />
      <circle cx="70" cy="48" r="2.5" />
      <circle cx="50" cy="86" r="2.5" />
      <circle cx="30" cy="48" r="2.5" />
    </GhostTri>
  );
}

const SOLVE_ALL_PAUSE_MS = PHYSICS_DEBOUNCE_MS + 80;
/**
 * Dense solo-lane takes (many 1-frame gaps × 6+ motors) need hundreds of steps.
 * Not a memory limit — each step is one Scale/Spread. User can Cancel anytime.
 */
const SOLVE_ALL_MAX_STEPS = 2000;

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
  const [progressStep, setProgressStep] = useState(0);
  const [showQuantizeHint, setShowQuantizeHint] = useState(false);
  const cancelRef = useRef(false);
  const quantizeHintTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    cancelRef.current = true;
    if (quantizeHintTimer.current !== null) clearTimeout(quantizeHintTimer.current);
  }, []);

  const clearQuantizeNudge = () => {
    if (quantizeHintTimer.current !== null) {
      clearTimeout(quantizeHintTimer.current);
      quantizeHintTimer.current = null;
    }
    setShowQuantizeHint(false);
    dispatch({ type: "prefs", patch: { suggestQuantize: false } });
  };

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
    const wg = state.workingGroup;
    dispatch({
      type: "edit",
      label: `Physics ${mode} @ frame ${v.frame}`,
      apply: (d) => solvePhysicsViolation(d, v, mode, wg),
    });
  };

  const solveAll = async (mode: SolveMode) => {
    if (runningAll) return;
    cancelRef.current = false;
    setProgressStep(0);
    setShowQuantizeHint(false);
    setRunningAll(mode);
    quantizeHintTimer.current = setTimeout(() => {
      quantizeHintTimer.current = null;
      setShowQuantizeHint(true);
      dispatch({ type: "prefs", patch: { suggestQuantize: true } });
    }, QUANTIZE_HINT_AFTER_MS);
    let steps = 0;
    let applied = 0;
    let cancelled = false;
    let hitStepLimit = false;
    let oscillated = false;
    const attempted = new Set<string>();
    const history: string[] = [];
    const wg = state.workingGroup;
    try {
      while (steps < SOLVE_ALL_MAX_STEPS && !cancelRef.current) {
        steps++;
        const hit = solveNextPhysicsViolation(docRef.current, mode, attempted, wg);
        if (!hit) break;
        const { violation: v } = hit;
        const fp = violationFingerprint(v);
        history.push(fp);
        // Abort if the last 3 solves repeat the previous 3 (A-B-C-A-B-C flash loop).
        if (history.length >= 6) {
          const a = history.slice(-6, -3).join("||");
          const b = history.slice(-3).join("||");
          if (a === b) {
            oscillated = true;
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
          apply: (d) => solvePhysicsViolation(d, v, mode, wg),
        });
        applied++;
        setProgressStep(applied);
        // Guard: Spread must not spawn keyframes; if it somehow did, stop flashing.
        await sleep(SOLVE_ALL_PAUSE_MS);
        if (cancelRef.current) {
          cancelled = true;
          break;
        }
        if (mode === "spread" && docRef.current.keyframes.length > beforeCount) {
          dispatch({
            type: "status",
            text: "Spread All stopped — unexpected new keys",
            error: true,
          });
          break;
        }
      }
      if (steps >= SOLVE_ALL_MAX_STEPS && !cancelled && !oscillated) {
        hitStepLimit = true;
      }
      if (cancelled || cancelRef.current) {
        dispatch({
          type: "status",
          text: `Physics ${mode} all cancelled (${applied} step${applied === 1 ? "" : "s"})`,
        });
      } else if (oscillated) {
        /* status already set */
      } else if (hitStepLimit) {
        dispatch({
          type: "status",
          text: `Physics ${mode} all paused at step limit (${applied}/${SOLVE_ALL_MAX_STEPS}). Run again to continue.`,
          error: true,
        });
      } else {
        dispatch({
          type: "status",
          text: applied === 0
            ? `No violations ${mode} could fix`
            : `Physics ${mode} all: ${applied} step(s)`,
          error: applied === 0,
        });
      }
    } finally {
      clearQuantizeNudge();
      setRunningAll(null);
      setProgressStep(0);
    }
  };

  const busy = runningAll != null;
  const modeLabel = runningAll === "scale" ? "Scale All" : "Spread All";

  // While Scale/Spread All runs, physics is briefly null each step (debounce).
  // Stay on a stable Processing shell so we never flash Checking… / OK / error list.
  if (busy) {
    return (
      <Panel title="Physics" help="physics" area="physics">
        <TopActions>
          <button type="button" disabled>
            {runningAll === "scale" ? "Scaling…" : "Scale All"}
          </button>
          <button type="button" disabled>
            {runningAll === "spread" ? "Spreading…" : "Spread All"}
          </button>
        </TopActions>
        <BusyShell role="status" aria-live="polite" aria-busy="true">
          <ProcessingSpinner />
          <ProcessingLabel>Processing</ProcessingLabel>
          <ProcessingHint>
            {modeLabel}
            {progressStep > 0 ? ` — step ${progressStep}` : ""}
          </ProcessingHint>
          {showQuantizeHint && (
            <QuantizeReminder>
              Taking a while — dense 1-frame keys make Scale/Spread All slow.
              Cancel and hit Quantize (every 10 frames) first to shorten the job.
            </QuantizeReminder>
          )}
          <CancelBtn
            type="button"
            title="Stop after the current step finishes"
            onClick={() => { cancelRef.current = true; }}
          >
            Cancel
          </CancelBtn>
        </BusyShell>
      </Panel>
    );
  }

  if (!physics) return <Panel title="Physics" help="physics" area="physics"><Pending>Checking…</Pending></Panel>;
  if (physics.ok) return <Panel title="Physics" help="physics" area="physics"><Ok>Physics OK ✓</Ok></Panel>;

  return (
    <Panel title="Physics" help="physics" area="physics">
      <TopActions>
        <button type="button"
          title="Apply Scale to each violation in turn (Undoable per step)"
          onClick={() => void solveAll("scale")}>
          Scale All
        </button>
        <button type="button"
          title="Apply Spread to each violation in turn (Undoable per step)"
          onClick={() => void solveAll("spread")}>
          Spread All
        </button>
      </TopActions>
      <ListHost>
        <List>
          {physics.violations.map((v, i) => (
            <Card key={i} $color={v.color}>
              <Actions>
                {canScale(v.code) && (
                  <button type="button" title={
                    v.code === "pillar_collision"
                      ? "Pull the paired linear under the safe depth (Undoable)"
                      : "Shrink travel toward neighbors to fit limits (Undoable)"
                  }
                    onClick={(e) => { e.stopPropagation(); solve(v, "scale"); }}>
                    Scale
                  </button>
                )}
                {canSpread(v.code) && (
                  <button type="button" title={
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
      </ListHost>
    </Panel>
  );
}
