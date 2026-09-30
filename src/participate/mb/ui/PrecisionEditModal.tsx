import { useEffect, useId, useState } from "react";
import styled from "styled-components";

const Overlay = styled.div`
  position: fixed; inset: 0; z-index: 40;
  background: rgba(0,0,0,0.65);
  display: flex; align-items: center; justify-content: center;
  padding: 16px;
`;
const Card = styled.div`
  width: min(380px, 100%);
  background: ${({ theme }) => theme.panel};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 14px;
  padding: 18px;
  display: flex; flex-direction: column; gap: 12px;
  box-shadow: 0 12px 40px rgba(0,0,0,0.45);
  h2 { margin: 0; font-size: 1.1rem; }
  p { margin: 0; color: ${({ theme }) => theme.muted}; font-size: 0.85rem; }
  label {
    display: flex; flex-direction: column; gap: 6px;
    font-size: 0.85rem;
  }
  input[type="number"] {
    min-height: 36px;
    padding: 0 10px;
    font-size: 1rem;
    font-variant-numeric: tabular-nums;
  }
`;
const Actions = styled.div`display: flex; gap: 8px; justify-content: flex-end;`;
const DeltaReadout = styled.div`
  font-variant-numeric: tabular-nums;
  font-size: 0.9rem;
  color: ${({ theme }) => theme.muted};
`;

export type PrecisionEditPayload = {
  /** Multi-select: only delta is editable. */
  mode: "single" | "multi";
  unit: "mm" | "°";
  /** Absolute value at primary node after drag (single mode seed). */
  absolute: number;
  /** Value at primary node before drag. */
  startAbsolute: number;
  /** Shared drag delta applied to the selection. */
  dragDelta: number;
  frameCount: number;
};

type Props = {
  payload: PrecisionEditPayload;
  onAccept: (result: { absolute: number; delta: number }) => void;
  onCancel: () => void;
};

const round1 = (n: number) => Math.round(n * 10) / 10;

export function PrecisionEditModal({ payload, onAccept, onCancel }: Props) {
  const absId = useId();
  const deltaId = useId();
  const [absolute, setAbsolute] = useState(() => round1(payload.absolute));
  const [delta, setDelta] = useState(() => round1(payload.dragDelta));

  useEffect(() => {
    setAbsolute(round1(payload.absolute));
    setDelta(round1(payload.dragDelta));
  }, [payload]);

  const liveDelta = round1(absolute - payload.startAbsolute);
  const unit = payload.unit;

  return (
    <Overlay role="dialog" aria-modal="true" aria-label="Precision edit">
      <Card>
        <h2>Precision Edit</h2>
        {payload.mode === "single" ? (
          <>
            <p>Adjust the absolute value, or accept the drop as-is.</p>
            <label htmlFor={absId}>
              Absolute ({unit})
              <input
                id={absId}
                type="number"
                step={0.1}
                value={absolute}
                autoFocus
                onChange={(e) => {
                  const n = Number(e.target.value);
                  if (Number.isFinite(n)) setAbsolute(n);
                }}
              />
            </label>
            <DeltaReadout>
              Δ {liveDelta > 0 ? "+" : ""}{liveDelta.toFixed(1)}{unit}
            </DeltaReadout>
          </>
        ) : (
          <>
            <p>
              {payload.frameCount} keys selected — edit the shared delta only.
            </p>
            <label htmlFor={deltaId}>
              Delta ({unit})
              <input
                id={deltaId}
                type="number"
                step={0.1}
                value={delta}
                autoFocus
                onChange={(e) => {
                  const n = Number(e.target.value);
                  if (Number.isFinite(n)) setDelta(n);
                }}
              />
            </label>
          </>
        )}
        <Actions>
          <button type="button" onClick={onCancel}>Cancel</button>
          <button
            type="button"
            style={{ background: "#00e676", color: "#000" }}
            onClick={() => {
              if (payload.mode === "single") {
                onAccept({ absolute: round1(absolute), delta: liveDelta });
              } else {
                onAccept({ absolute: round1(payload.startAbsolute + delta), delta: round1(delta) });
              }
            }}
          >
            Accept
          </button>
        </Actions>
      </Card>
    </Overlay>
  );
}
