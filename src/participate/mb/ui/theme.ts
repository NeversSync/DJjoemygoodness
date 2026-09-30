import { createGlobalStyle } from "styled-components";

export const theme = {
  bg: "#0b0f16",
  panel: "#131a26",
  panelAlt: "#1a2333",
  border: "#27324a",
  text: "#e6ebf5",
  muted: "#8d9ab3",
  accent: "#4fc3f7",
  ok: "#00e676",
  error: "#ff6b6b",
  /** Minimum touch target (px) for tablet use. */
  touch: 40,
};

export type AppTheme = typeof theme;

declare module "styled-components" {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  export interface DefaultTheme extends AppTheme {}
}

/** Scoped to `.mb-participate-root` so DjJoe site CSS is not clobbered. */
export const GlobalStyle = createGlobalStyle`
  .mb-participate-root *, .mb-participate-root *::before, .mb-participate-root *::after { box-sizing: border-box; }
  .mb-participate-root {
    margin: 0;
    min-height: 100dvh;
    background: ${theme.bg};
    color: ${theme.text};
    font: 14px/1.4 "Segoe UI", system-ui, -apple-system, sans-serif;
    -webkit-tap-highlight-color: transparent;
    overflow-x: hidden;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
  }
  .mb-participate-root button,
  .mb-participate-root input,
  .mb-participate-root select {
    font: inherit;
    color: inherit;
    min-height: ${theme.touch}px;
    border-radius: 8px;
    border: 1px solid ${theme.border};
    background: ${theme.panelAlt};
    padding: 0 10px;
  }
  .mb-participate-root button { cursor: pointer; touch-action: manipulation; }
  .mb-participate-root button:disabled,
  .mb-participate-root input:disabled,
  .mb-participate-root select:disabled { opacity: 0.45; cursor: not-allowed; }
  .mb-participate-root button:focus-visible,
  .mb-participate-root input:focus-visible,
  .mb-participate-root select:focus-visible { outline: 2px solid ${theme.accent}; outline-offset: 1px; }
  .mb-participate-root input[type="checkbox"] { min-height: 0; width: 20px; height: 20px; accent-color: ${theme.accent}; }
  .mb-participate-root input[type="range"] { padding: 0; accent-color: ${theme.accent}; background: transparent; border: none; }
  .mb-participate-root input[type="color"] { padding: 2px; width: ${theme.touch}px; }
`;
