import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import styled from "styled-components";
import {
  clampNumPadGeometry,
  loadNumPadGeometry,
  NUMPAD_MAX,
  NUMPAD_MIN,
  saveNumPadGeometry,
  type NumPadGeometry,
} from "./numberPadSession";

type PadTarget = {
  el: HTMLInputElement;
  original: string;
};

type NumPadCtx = {
  /** When false, OS number inputs behave normally (Desktop / Auto). */
  enabled: boolean;
};

const Ctx = createContext<NumPadCtx>({ enabled: false });

export function useNumPad() {
  return useContext(Ctx);
}

const Shell = styled.div<{ $w: number; $h: number; $left: number | null; $top: number | null }>`
  position: fixed;
  z-index: 50;
  width: ${({ $w }) => $w}px;
  height: ${({ $h }) => $h}px;
  left: ${({ $left, $w }) => ($left == null ? `calc(50% - ${$w / 2}px)` : `${$left}px`)};
  top: ${({ $top, $h }) => ($top == null ? `calc(100% - ${$h + 16}px)` : `${$top}px`)};
  display: flex;
  flex-direction: column;
  background: ${({ theme }) => theme.panel};
  border: 1px solid ${({ theme }) => theme.accent};
  border-radius: 14px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.55);
  overflow: hidden;
  touch-action: none;
`;

const Title = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 8px 10px;
  background: ${({ theme }) => theme.panelAlt};
  border-bottom: 1px solid ${({ theme }) => theme.border};
  cursor: grab;
  user-select: none;
  font-size: 0.85rem;
  font-weight: 600;
  &:active { cursor: grabbing; }
`;

const Display = styled.div`
  margin: 10px 12px 6px;
  min-height: 52px;
  padding: 10px 12px;
  border-radius: 10px;
  background: ${({ theme }) => theme.bg};
  border: 1px solid ${({ theme }) => theme.border};
  font-size: clamp(1.4rem, 5vw, 2rem);
  font-variant-numeric: tabular-nums;
  text-align: right;
  word-break: break-all;
  line-height: 1.2;
`;

const Hint = styled.div`
  padding: 0 12px 6px;
  font-size: 0.75rem;
  color: ${({ theme }) => theme.muted};
`;

const Keys = styled.div`
  flex: 1;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 6px;
  padding: 6px 12px 10px;
  min-height: 0;
`;

const Key = styled.button`
  min-height: 0 !important;
  border-radius: 10px;
  font-size: clamp(1.1rem, 4vw, 1.45rem);
  font-weight: 600;
  background: ${({ theme }) => theme.panelAlt};
  border: 1px solid ${({ theme }) => theme.border};
  &:active { background: rgba(79, 195, 247, 0.2); }
`;

const Actions = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1.2fr;
  gap: 6px;
  padding: 0 12px 12px;
  button {
    min-height: 44px;
    border-radius: 10px;
    font-weight: 600;
  }
`;

const ResizeHandle = styled.div`
  position: absolute;
  right: 2px;
  bottom: 2px;
  width: 22px;
  height: 22px;
  cursor: nwse-resize;
  touch-action: none;
  &::after {
    content: "";
    position: absolute;
    right: 4px;
    bottom: 4px;
    width: 12px;
    height: 12px;
    border-right: 2px solid ${({ theme }) => theme.muted};
    border-bottom: 2px solid ${({ theme }) => theme.muted};
  }
`;

function setInputValue(el: HTMLInputElement, value: string) {
  const desc = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value");
  desc?.set?.call(el, value);
  el.dispatchEvent(new Event("input", { bubbles: true }));
  el.dispatchEvent(new Event("change", { bubbles: true }));
}

function applyDraft(raw: string, key: string): string {
  if (key === "back") return raw.length ? raw.slice(0, -1) : "";
  if (key === "clear") return "";
  if (key === "sign") {
    if (!raw || raw === "-" || raw === "." || raw === "-.") return raw.startsWith("-") ? raw.slice(1) : `-${raw}`;
    return raw.startsWith("-") ? raw.slice(1) : `-${raw}`;
  }
  if (key === ".") {
    if (raw.includes(".")) return raw;
    return raw === "" || raw === "-" ? `${raw}.` : `${raw}.`;
  }
  if (/^\d$/.test(key)) {
    if (raw === "0") return key;
    if (raw === "-0") return `-${key}`;
    return `${raw}${key}`;
  }
  return raw;
}

type Props = {
  /** True for phone/tablet layouts (anything other than Desktop / Auto). */
  enabled: boolean;
  children: ReactNode;
};

export function NumberPadProvider({ enabled, children }: Props) {
  const [geom, setGeom] = useState<NumPadGeometry>(() => loadNumPadGeometry());
  const [target, setTarget] = useState<PadTarget | null>(null);
  const [draft, setDraft] = useState("");
  const [label, setLabel] = useState("Number");
  const geomRef = useRef(geom);
  geomRef.current = geom;
  const targetRef = useRef(target);
  targetRef.current = target;

  const persistGeom = useCallback((next: NumPadGeometry) => {
    const clamped = clampNumPadGeometry(next);
    setGeom(clamped);
    saveNumPadGeometry(clamped);
  }, []);

  const close = useCallback((commit: boolean) => {
    const t = targetRef.current;
    if (!t) return;
    if (!commit) setInputValue(t.el, t.original);
    t.el.readOnly = false;
    t.el.removeAttribute("inputmode");
    // Blur so Transport Go-to / End commit on blur.
    t.el.blur();
    setTarget(null);
    setDraft("");
  }, []);

  const openFor = useCallback((el: HTMLInputElement) => {
    if (targetRef.current?.el === el) return;
    if (targetRef.current) close(true);
    const original = el.value;
    el.readOnly = true;
    el.setAttribute("inputmode", "none");
    setTarget({ el, original });
    setDraft(original);
    setLabel(el.getAttribute("aria-label") || el.title || "Number");
  }, [close]);

  useEffect(() => {
    if (!enabled) {
      if (targetRef.current) close(true);
      return;
    }
    const onFocusIn = (e: FocusEvent) => {
      const el = e.target;
      if (!(el instanceof HTMLInputElement)) return;
      if (el.type !== "number" || el.disabled) return;
      if (el.dataset.numpad === "off") return;
      openFor(el);
    };
    document.addEventListener("focusin", onFocusIn, true);
    return () => document.removeEventListener("focusin", onFocusIn, true);
  }, [enabled, openFor, close]);

  useEffect(() => {
    if (!target) return;
    // Skip incomplete drafts so controlled inputs (and Transport blur-commit) stay stable.
    if (draft === "" || draft === "-" || draft === "." || draft === "-.") return;
    if (draft.endsWith(".")) return;
    if (!Number.isFinite(Number(draft))) return;
    setInputValue(target.el, draft);
  }, [draft, target]);

  useEffect(() => {
    if (!target) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { e.preventDefault(); close(false); }
      if (e.key === "Enter") { e.preventDefault(); close(true); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [target, close]);

  const onKey = useCallback((key: string) => {
    setDraft((d) => applyDraft(d, key));
  }, []);

  const onTitlePointer = useCallback((e: React.PointerEvent) => {
    if (e.button !== 0) return;
    e.preventDefault();
    const startX = e.clientX;
    const startY = e.clientY;
    const g = geomRef.current;
    const rect = (e.currentTarget.parentElement as HTMLElement).getBoundingClientRect();
    const originLeft = g.left ?? rect.left;
    const originTop = g.top ?? rect.top;
    const onMove = (ev: PointerEvent) => {
      persistGeom({
        ...geomRef.current,
        left: Math.max(0, Math.min(window.innerWidth - 80, originLeft + (ev.clientX - startX))),
        top: Math.max(0, Math.min(window.innerHeight - 80, originTop + (ev.clientY - startY))),
      });
    };
    const onUp = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  }, [persistGeom]);

  const onResizePointer = useCallback((e: React.PointerEvent) => {
    if (e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();
    const startX = e.clientX;
    const startY = e.clientY;
    const startW = geomRef.current.width;
    const startH = geomRef.current.height;
    const onMove = (ev: PointerEvent) => {
      persistGeom({
        ...geomRef.current,
        width: Math.min(NUMPAD_MAX.width, Math.max(NUMPAD_MIN.width, startW + (ev.clientX - startX))),
        height: Math.min(NUMPAD_MAX.height, Math.max(NUMPAD_MIN.height, startH + (ev.clientY - startY))),
      });
    };
    const onUp = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  }, [persistGeom]);

  const ctx = useMemo(() => ({ enabled }), [enabled]);
  const keys = ["7", "8", "9", "4", "5", "6", "1", "2", "3", "sign", "0", "."] as const;

  return (
    <Ctx.Provider value={ctx}>
      {children}
      {enabled && target && (
        <Shell
          role="dialog"
          aria-modal="true"
          aria-label="Number pad"
          $w={geom.width}
          $h={geom.height}
          $left={geom.left}
          $top={geom.top}
        >
          <Title onPointerDown={onTitlePointer}>
            <span>Number pad</span>
            <button type="button" onClick={() => close(false)} aria-label="Cancel number pad"
              style={{ minHeight: 32, padding: "2px 10px" }}>✕</button>
          </Title>
          <Display aria-live="polite">{draft === "" ? "—" : draft}</Display>
          <Hint>{label} · drag title to move · corner to resize</Hint>
          <Keys>
            {keys.map((k) => (
              <Key
                key={k}
                type="button"
                // Keep the field focused so Transport blur-commit does not fire mid-edit.
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => onKey(k)}
              >
                {k === "sign" ? "±" : k}
              </Key>
            ))}
          </Keys>
          <Actions>
            <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => onKey("clear")}>Clear</button>
            <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => onKey("back")}>⌫</button>
            <button
              type="button"
              style={{ background: "#00e676", color: "#000" }}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => close(true)}
            >
              Done
            </button>
          </Actions>
          <ResizeHandle onPointerDown={onResizePointer} title="Drag to resize" aria-label="Resize number pad" />
        </Shell>
      )}
    </Ctx.Provider>
  );
}
