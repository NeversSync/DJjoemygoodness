/** Session-only number-pad geometry (survives refresh, cleared when the tab closes). */
export const NUMPAD_SESSION_KEY = "eemb.numpad.v1";

export type NumPadGeometry = {
  width: number;
  height: number;
  /** CSS px from left; null = centered horizontally. */
  left: number | null;
  /** CSS px from top; null = near bottom. */
  top: number | null;
};

export const DEFAULT_NUMPAD_GEOMETRY: NumPadGeometry = {
  width: 300,
  height: 380,
  left: null,
  top: null,
};

const MIN_W = 240;
const MIN_H = 300;
const MAX_W = 520;
const MAX_H = 640;

export function clampNumPadGeometry(g: Partial<NumPadGeometry>): NumPadGeometry {
  const width = Math.min(MAX_W, Math.max(MIN_W, Math.round(Number(g.width) || DEFAULT_NUMPAD_GEOMETRY.width)));
  const height = Math.min(MAX_H, Math.max(MIN_H, Math.round(Number(g.height) || DEFAULT_NUMPAD_GEOMETRY.height)));
  const left = g.left == null || !Number.isFinite(Number(g.left)) ? null : Math.round(Number(g.left));
  const top = g.top == null || !Number.isFinite(Number(g.top)) ? null : Math.round(Number(g.top));
  return { width, height, left, top };
}

export function loadNumPadGeometry(storage: Storage = sessionStorage): NumPadGeometry {
  try {
    const raw = storage.getItem(NUMPAD_SESSION_KEY);
    if (!raw) return { ...DEFAULT_NUMPAD_GEOMETRY };
    return clampNumPadGeometry(JSON.parse(raw) as Partial<NumPadGeometry>);
  } catch {
    return { ...DEFAULT_NUMPAD_GEOMETRY };
  }
}

export function saveNumPadGeometry(g: NumPadGeometry, storage: Storage = sessionStorage): void {
  try {
    storage.setItem(NUMPAD_SESSION_KEY, JSON.stringify(clampNumPadGeometry(g)));
  } catch {
    /* quota / private mode */
  }
}

export const NUMPAD_MIN = { width: MIN_W, height: MIN_H };
export const NUMPAD_MAX = { width: MAX_W, height: MAX_H };
