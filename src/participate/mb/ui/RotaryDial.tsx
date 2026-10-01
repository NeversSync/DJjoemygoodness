import { useCallback, useEffect, useRef } from "react";
import styled from "styled-components";
import { dialHomeAngleRad } from "../core/previewAngles";
import type { StepperName } from "../core/types";

const SIZE = 56;
const Wrap = styled.div`
  position: relative;
  width: ${SIZE}px;
  height: ${SIZE}px;
  flex-shrink: 0;
  touch-action: none;
  user-select: none;
`;
const Canvas = styled.canvas`
  width: ${SIZE}px;
  height: ${SIZE}px;
  display: block;
  border-radius: 50%;
  cursor: grab;
  &:active { cursor: grabbing; }
`;

function angleAt(cx: number, cy: number, x: number, y: number): number {
  return Math.atan2(y - cy, x - cx);
}

function wrapPi(a: number): number {
  let x = a;
  while (x > Math.PI) x -= Math.PI * 2;
  while (x < -Math.PI) x += Math.PI * 2;
  return x;
}

type Props = {
  stepper: StepperName;
  value: number;
  disabled?: boolean;
  onChange: (absoluteDeg: number) => void;
};

/**
 * Infinite absolute rotary dial. Pointer at 0° matches the Preview triangle tip
 * for this motor's box; positive ° rotates the same direction as Preview.
 */
export function RotaryDial({ stepper, value, disabled, onChange }: Props) {
  const ref = useRef<HTMLCanvasElement>(null);
  const home = dialHomeAngleRad(stepper);
  const drag = useRef<{ lastAng: number; value: number } | null>(null);
  const valueRef = useRef(value);
  valueRef.current = value;
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const draw = useCallback(() => {
    const cvs = ref.current;
    if (!cvs) return;
    const dpr = Math.min(2, devicePixelRatio || 1);
    cvs.width = Math.round(SIZE * dpr);
    cvs.height = Math.round(SIZE * dpr);
    const ctx = cvs.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const cx = SIZE / 2, cy = SIZE / 2, r = SIZE * 0.42;
    ctx.clearRect(0, 0, SIZE, SIZE);
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fillStyle = "#1a2230";
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.22)";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Tick at home (0°)
    const hx = cx + Math.cos(home) * r * 0.72;
    const hy = cy + Math.sin(home) * r * 0.72;
    ctx.strokeStyle = "rgba(255,255,255,0.35)";
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(home) * r * 0.45, cy + Math.sin(home) * r * 0.45);
    ctx.lineTo(hx, hy);
    ctx.stroke();

    const tip = home + (valueRef.current * Math.PI) / 180;
    const px = cx + Math.cos(tip) * r * 0.78;
    const py = cy + Math.sin(tip) * r * 0.78;
    ctx.strokeStyle = "#4fc3f7";
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(px, py);
    ctx.stroke();
    ctx.fillStyle = "#4fc3f7";
    ctx.beginPath();
    ctx.arc(px, py, 3.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,0.2)";
    ctx.beginPath();
    ctx.arc(cx, cy, 3, 0, Math.PI * 2);
    ctx.fill();
  }, [home]);

  useEffect(() => { draw(); }, [draw, value]);

  const onPointerDown = (e: React.PointerEvent) => {
    if (disabled) return;
    const cvs = ref.current;
    if (!cvs) return;
    cvs.setPointerCapture(e.pointerId);
    const rect = cvs.getBoundingClientRect();
    const ang = angleAt(rect.width / 2, rect.height / 2, e.clientX - rect.left, e.clientY - rect.top);
    drag.current = { lastAng: ang, value: valueRef.current };
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!drag.current || disabled) return;
    const cvs = ref.current;
    if (!cvs) return;
    const rect = cvs.getBoundingClientRect();
    const ang = angleAt(rect.width / 2, rect.height / 2, e.clientX - rect.left, e.clientY - rect.top);
    const dAng = wrapPi(ang - drag.current.lastAng);
    drag.current.lastAng = ang;
    const next = Math.round((drag.current.value + (dAng * 180) / Math.PI) * 10) / 10;
    drag.current.value = next;
    onChangeRef.current(next);
  };

  const onPointerUp = (e: React.PointerEvent) => {
    drag.current = null;
    try { ref.current?.releasePointerCapture(e.pointerId); } catch { /* */ }
  };

  return (
    <Wrap title={`${stepper}: drag to set absolute ° (matches Preview tip)`}>
      <Canvas
        ref={ref}
        width={SIZE}
        height={SIZE}
        aria-label={`${stepper} rotary dial`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      />
    </Wrap>
  );
}
