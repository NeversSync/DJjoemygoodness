import { useCallback, useEffect, useRef, useState } from "react";
import styled from "styled-components";
import type { TabletLayout } from "../state/editor";
import { useEditor } from "../state/EditorContext";

const LAYOUTS: { id: TabletLayout; label: string; desc: string; icon: string }[] = [
  { id: "auto", label: "Auto / Desktop", desc: "Sticky Transport on top; Preview + Physics fixed on the right", icon: "▦" },
  { id: "wide", label: "Side-by-side", desc: "Transport + Preview top, Graph full width", icon: "⬛⬛" },
  { id: "stacked", label: "Stacked", desc: "All panels in a single column — easiest scroll", icon: "▬" },
  { id: "graph", label: "Graph focus", desc: "Fixed Transport + Preview/Physics; Graph takes most of the space; Lanes scroll", icon: "▮█" },
  { id: "preview", label: "Preview focus", desc: "Half-screen Preview left; Physics under it; Transport + Graph + Lanes right", icon: "▀▀" },
];

const Fab = styled.button`
  position: fixed;
  bottom: 14px; right: 14px;
  z-index: 15;
  width: 44px; height: 44px;
  border-radius: 50%;
  font-size: 1.2rem;
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 2px 12px rgba(0,0,0,0.4);
`;
const Overlay = styled.div`
  position: fixed; inset: 0; z-index: 16;
  background: rgba(0,0,0,0.55);
  display: flex; align-items: flex-end; justify-content: center;
  padding: 0 10px 20px;
`;
const Sheet = styled.div`
  background: ${({ theme }) => theme.panel};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 16px 16px 0 0;
  padding: 16px;
  width: 100%; max-width: 480px;
  display: flex; flex-direction: column; gap: 8px;
`;
const Option = styled.button<{ $active: boolean }>`
  text-align: left;
  padding: 10px 14px;
  border-radius: 10px;
  border: 2px solid ${({ $active, theme }) => $active ? theme.accent : theme.border};
  background: ${({ $active, theme }) => $active ? "rgba(79,195,247,0.12)" : theme.panelAlt};
  display: flex; flex-direction: column; gap: 2px;
  span:first-child { font-weight: 600; }
  span:last-child { font-size: 0.85rem; color: ${({ theme }) => theme.muted}; }
`;

/** Layout presets for PC and tablet (≥768px). */
export function LayoutPicker() {
  const { state, dispatch } = useEditor();
  const [open, setOpen] = useState(false);
  const [wideEnough, setWideEnough] = useState(true);

  useEffect(() => {
    const check = () => setWideEnough(window.innerWidth >= 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const pick = useCallback((layout: TabletLayout) => {
    dispatch({ type: "prefs", patch: { tabletLayout: layout } });
    setOpen(false);
  }, [dispatch]);

  if (!wideEnough) return null;

  return (
    <>
      <Fab onClick={() => setOpen(true)} aria-label="Change layout" title="Change layout">⊞</Fab>
      {open && (
        <Overlay onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}>
          <Sheet>
            <h3 style={{ margin: 0 }}>Layout</h3>
            <p style={{ margin: 0, fontSize: "0.85rem", color: "#8d9ab3" }}>
              On a wide PC, drag the vertical borders between columns to resize (min 200px). Tablets use fixed compact columns.
            </p>
            {LAYOUTS.map((l) => (
              <Option key={l.id} $active={state.prefs.tabletLayout === l.id} onClick={() => pick(l.id)}>
                <span>{l.icon}  {l.label}</span>
                <span>{l.desc}</span>
              </Option>
            ))}
            <button type="button" onClick={() => setOpen(false)} style={{ alignSelf: "flex-end" }}>Close</button>
          </Sheet>
        </Overlay>
      )}
    </>
  );
}

const Handle = styled.div<{ $left?: number; $right?: number }>`
  position: absolute;
  top: 0; bottom: 0;
  width: 10px;
  ${({ $left }) => $left != null ? `left: ${$left}px;` : ""}
  ${({ $right }) => $right != null ? `right: ${$right}px;` : ""}
  margin-left: -5px;
  cursor: col-resize;
  z-index: 6;
  touch-action: none;
  &:hover, &:active { background: rgba(79,195,247,0.25); }
`;

/** Drag handles for left/right columns on resizable layouts. */
export function ColumnSplitters({
  enabled, mode, left, right, onChange,
}: {
  enabled: boolean;
  mode: "three" | "two";
  left: number;
  right: number;
  onChange: (next: { left: number; right: number }) => void;
}) {
  const drag = useRef<{ side: "left" | "right"; startX: number; start: number } | null>(null);

  useEffect(() => {
    if (!enabled) return;
    const onMove = (e: PointerEvent) => {
      const d = drag.current;
      if (!d) return;
      const dx = e.clientX - d.startX;
      const shellW = document.documentElement.clientWidth;
      if (d.side === "left") {
        const maxLeft = Math.max(200, shellW - (mode === "three" ? right : 0) - 280 - 24);
        onChange({ left: Math.min(maxLeft, Math.max(200, d.start + dx)), right });
      } else {
        const maxRight = Math.max(200, shellW - left - 280 - 24);
        onChange({ left, right: Math.min(maxRight, Math.max(200, d.start - dx)) });
      }
    };
    const onUp = () => { drag.current = null; };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, [enabled, left, right, onChange, mode]);

  if (!enabled) return null;
  return (
    <>
      <Handle $left={left + 8} title="Drag to resize left column"
        onPointerDown={(e) => { drag.current = { side: "left", startX: e.clientX, start: left }; e.currentTarget.setPointerCapture(e.pointerId); }} />
      {mode === "three" && (
        <Handle $right={right + 8} title="Drag to resize right column"
          onPointerDown={(e) => { drag.current = { side: "right", startX: e.clientX, start: right }; e.currentTarget.setPointerCapture(e.pointerId); }} />
      )}
    </>
  );
}
