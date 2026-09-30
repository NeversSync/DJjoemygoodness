import styled, { css, ThemeProvider } from "styled-components";
import { useCallback, useEffect, useRef, useState } from "react";
import { HelpProvider } from "./help/HelpContext";
import { HelpDrawer } from "./help/HelpDrawer";
import { EditorProvider, useEditor } from "./state/EditorContext";
import { PARTICIPATE_SESSION_KEY, defaultLayoutForWidth } from "./state/session";
import type { TabletLayout } from "./state/editor";
import { buildStart } from "./seeds";
import { GroupsPanel } from "./ui/GroupsPanel";
import { KeyframeGraph } from "./ui/KeyframeGraph";
import { ColumnSplitters, LayoutPicker } from "./ui/LayoutPicker";
import { OutlinePreview } from "./ui/OutlinePreview";
import { PhysicsPanel } from "./ui/PhysicsPanel";
import { StatusBar } from "./ui/StatusBar";
import { Toolbar } from "./ui/Toolbar";
import { Transport } from "./ui/Transport";
import { GlobalStyle, theme } from "./ui/theme";

const TABLET_MAX = "1280px";

/**
 * Short / landscape viewports: side panels scroll inside their cells.
 * Keyframe Graph stays overflow:hidden so chrome/canvas/hint never spill
 * into Groups / Preview (especially Graph focus).
 */
const COMPACT_HEIGHT = css`
  @media (max-height: 900px) {
    padding-bottom: 56px;

    [aria-label="Keyframe Graph"] {
      min-height: 0 !important;
      overflow: hidden;
    }
    [aria-label="Lanes & Motors"],
    [aria-label="Physics"] {
      max-height: min(50dvh, 360px);
      overflow-x: hidden;
      overflow-y: auto;
    }
  }

  @media (orientation: landscape) and (max-height: 850px) {
    gap: 6px;
    padding: 6px 6px 52px;

    [aria-label="Lanes & Motors"],
    [aria-label="Physics"] {
      max-height: min(44dvh, 280px);
    }
    [aria-label="Preview"] {
      padding: 4px 6px 6px;
      gap: 2px;
    }
  }
`;

const DESKTOP = css`
  grid-template-columns: var(--col-left) minmax(280px, 1fr) var(--col-right);
  grid-template-rows: auto auto minmax(0, 1fr) auto auto;
  grid-template-areas:
    "transport transport transport"
    "toolbar   toolbar   rail"
    "groups    graph     rail"
    "groups    graph     rail"
    "status    status    status";
`;

/**
 * Fixed Transport for Auto/Desktop — always on screen. (CSS sticky fails here
 * because body scrolls while Shell only has min-height, not a clipped viewport.)
 */
const FixedTransport = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  /* Stop short of the Preview rail — no empty background over that column */
  right: calc(8px + var(--col-right, 320px) + 8px);
  z-index: 8;
  background: ${({ theme }) => theme.bg};
  padding: 8px;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.45);

  & > [aria-label="Transport"] {
    grid-area: unset;
  }
`;

/** Reserves vertical space in the grid so content isn’t hidden under FixedTransport. */
const TransportSpacer = styled.div<{ $height: number }>`
  grid-area: transport;
  height: ${({ $height }) => $height}px;
  pointer-events: none;
`;

/** Holds the right-column grid slot so Toolbar / Groups never sit under Preview. */
const RailSpacer = styled.div`
  grid-area: rail;
  min-width: 0;
  pointer-events: none;
`;

/**
 * Fixed Preview + Physics in the right column — top-aligned with Transport
 * (Transport clears this column via padding-right, so no overlap).
 */
const DesktopRail = styled.aside<{ $width: number; $top: number }>`
  position: fixed;
  top: ${({ $top }) => $top}px;
  right: 8px;
  width: ${({ $width }) => $width}px;
  z-index: 9; /* above FixedTransport so Preview is never covered */
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
  max-height: calc(100dvh - ${({ $top }) => $top}px - 64px);
  overflow-x: hidden;
  overflow-y: auto;
  pointer-events: auto;

  & > [aria-label="Preview"],
  & > [aria-label="Physics"] {
    grid-area: unset;
    position: static;
    align-self: stretch;
    max-height: none;
  }

  & > [aria-label="Physics"] {
    flex: 0 1 auto;
    min-height: 0;
  }
`;

/** Landscape-friendly: preview sits beside transport as a compact square. */
const TAB_WIDE = css`
  grid-template-columns: 1fr minmax(160px, 200px);
  grid-template-rows: auto auto minmax(0, 1fr) auto auto;
  grid-template-areas:
    "toolbar   toolbar"
    "transport preview"
    "graph     graph"
    "groups    physics"
    "status    status";
`;

const TAB_STACKED = css`
  grid-template-columns: 1fr;
  grid-template-rows: auto;
  grid-template-areas:
    "toolbar" "transport" "preview" "graph" "groups" "physics" "status";
`;

/**
 * Graph focus: Desktop-style fixed chrome (Transport + Preview/Physics always on
 * screen). Graph takes the majority of the scrollable area; Lanes sit below (tablet)
 * or in a side column (wide desktop).
 */
const TAB_GRAPH = css`
  overflow-x: hidden;
  /* Tablet / default: graph full width beside a compact rail */
  grid-template-columns: minmax(0, 1fr) var(--col-right);
  grid-template-rows: auto auto minmax(360px, 1fr) auto auto;
  grid-template-areas:
    "transport transport"
    "toolbar   rail"
    "graph     rail"
    "groups    rail"
    "status    status";

  @media (min-width: 1281px) {
    grid-template-columns: minmax(200px, var(--col-left)) minmax(280px, 1fr) var(--col-right);
    grid-template-areas:
      "transport transport transport"
      "toolbar   toolbar   rail"
      "groups    graph     rail"
      "groups    graph     rail"
      "status    status    status";
  }

  [aria-label="Toolbar"],
  [aria-label="Keyframe Graph"],
  [aria-label="Lanes & Motors"],
  [aria-label="Status"] {
    min-width: 0;
  }

  [aria-label="Keyframe Graph"] {
    align-self: stretch;
    overflow: hidden;
    min-height: min(58dvh, 520px);
  }

  [aria-label="Lanes & Motors"] {
    overflow-x: hidden;
    overflow-y: auto;
    max-height: min(40dvh, 300px);
  }
`;

const TAB_PREVIEW = css`
  /* Half-screen Preview; Physics under it; everything else squeezed into the right half */
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  grid-template-rows: auto auto minmax(0, 1fr) auto auto;
  grid-template-areas:
    "toolbar  toolbar"
    "preview  transport"
    "preview  graph"
    "physics  groups"
    "status   status";

  [aria-label="Preview"] {
    align-self: stretch;
    min-width: 0;
    overflow: hidden;
  }

  /* Override OutlinePreview’s compact stage cap so the square can fill the column */
  .preview-stage {
    width: 100%;
    max-width: none;
  }

  [aria-label="Physics"] {
    align-self: stretch;
    min-width: 0;
    overflow-x: hidden;
    overflow-y: auto;
    max-height: min(28dvh, 220px);
  }

  [aria-label="Lanes & Motors"] {
    min-width: 0;
    overflow-x: hidden;
    overflow-y: auto;
    max-height: min(40dvh, 300px);
  }

  [aria-label="Transport"],
  [aria-label="Keyframe Graph"] {
    min-width: 0;
  }

  [aria-label="Keyframe Graph"] {
    overflow: hidden;
    min-height: 0;
  }
`;

const LAYOUT_CSS: Record<Exclude<TabletLayout, "auto">, ReturnType<typeof css>> = {
  wide: TAB_WIDE, stacked: TAB_STACKED, graph: TAB_GRAPH, preview: TAB_PREVIEW,
};

const Shell = styled.div<{ $layout: TabletLayout; $left: number; $right: number }>`
  position: relative;
  display: grid;
  gap: 8px;
  padding: 8px 8px 72px;
  box-sizing: border-box;
  min-height: 100dvh;
  overflow-x: hidden;
  overflow-y: auto;
  --col-left: ${({ $left }) => $left}px;
  --col-right: ${({ $right }) => $right}px;

  ${({ $layout }) => $layout === "auto" ? DESKTOP : LAYOUT_CSS[$layout]}

  ${({ $layout }) => $layout === "auto" && css`
    @media (max-width: ${TABLET_MAX}) {
      ${TAB_WIDE}
    }
  `}

  @media (max-width: 767px) {
    height: auto;
    max-height: none;
    overflow: visible;
    grid-template-columns: 1fr;
    grid-template-rows: auto;
    grid-template-areas:
      "toolbar" "transport" "preview" "graph" "groups" "physics" "status";
  }

  [aria-label="Keyframe Graph"] {
    min-height: 200px;
    overflow: hidden;
  }

  [aria-label="Preview"] {
    align-self: start;
  }

  ${COMPACT_HEIGHT}
`;

function useWindowSize() {
  const [size, setSize] = useState(() => ({
    w: typeof window !== "undefined" ? window.innerWidth : 1400,
    h: typeof window !== "undefined" ? window.innerHeight : 900,
  }));
  useEffect(() => {
    const onResize = () => setSize({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  return size;
}

function useEffectiveLayout(pref: TabletLayout, width: number): TabletLayout {
  if (pref !== "auto") return pref;
  return width <= 1280 ? "wide" : "auto";
}

function AppInner({ autoPlay }: { autoPlay?: boolean }) {
  const { state, dispatch } = useEditor();
  const layout = state.prefs.tabletLayout;
  const sizes = state.prefs.panelSizes ?? { left: 320, right: 320 };
  const { w: width } = useWindowSize();
  const effective = useEffectiveLayout(layout, width);
  const canResize = effective === "auto" || effective === "graph";
  /** Auto/Desktop + Graph focus: fixed Transport + fixed Preview/Physics rail. */
  const fixedChrome = effective === "auto" || effective === "graph";
  /** Tablet Graph focus: keep the rail compact so the plot owns the width. */
  const railWidth =
    effective === "graph" && width <= 1280
      ? Math.min(Math.max(140, sizes.right), 168)
      : sizes.right;
  const transportRef = useRef<HTMLDivElement>(null);
  const [transportH, setTransportH] = useState(120);

  useEffect(() => {
    if (!fixedChrome) return;
    const el = transportRef.current;
    if (!el) return;
    const measure = () => setTransportH(Math.max(48, Math.round(el.getBoundingClientRect().height)));
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [fixedChrome, width, railWidth]);

  /* Align with Shell / FixedTransport padding — sit in the column Transport already cleared. */
  const railTop = 8;

  const onSizes = useCallback((next: { left: number; right: number }) => {
    dispatch({ type: "prefs", patch: { panelSizes: next } });
  }, [dispatch]);

  return (
    <>
      <Shell $layout={layout} $left={sizes.left} $right={railWidth} data-layout={layout}>
        {fixedChrome ? (
          <>
            <FixedTransport ref={transportRef} aria-label="Fixed transport">
              <Transport autoPlay={autoPlay} />
            </FixedTransport>
            <TransportSpacer $height={transportH} aria-hidden />
          </>
        ) : (
          <Transport autoPlay={autoPlay} />
        )}
        <Toolbar />
        {fixedChrome ? (
          <>
            <RailSpacer aria-hidden />
            <DesktopRail aria-label="Preview rail" $width={railWidth} $top={railTop}>
              <OutlinePreview />
              <PhysicsPanel />
            </DesktopRail>
          </>
        ) : (
          <>
            <OutlinePreview />
            <PhysicsPanel />
          </>
        )}
        <KeyframeGraph />
        <GroupsPanel />
        <StatusBar />
        <ColumnSplitters
          enabled={canResize && width > 1280}
          mode={effective === "graph" ? "two" : "three"}
          left={sizes.left}
          right={sizes.right}
          onChange={onSizes}
        />
      </Shell>
      <LayoutPicker />
      <HelpDrawer />
    </>
  );
}

/** Public DjJoe Participate entry — no LAN gate; Attract + layout defaults + autoplay. */
export default function ParticipateApp() {
  const width = typeof window !== "undefined" ? window.innerWidth : 1400;
  const layout = defaultLayoutForWidth(width);

  return (
    <div className="mb-participate-root">
      <ThemeProvider theme={theme}>
        <GlobalStyle />
        <HelpProvider>
          <EditorProvider
            initialDoc={buildStart("Attract_100")}
            sessionKey={PARTICIPATE_SESSION_KEY}
            restoreSession={false}
            initialPrefs={{ tabletLayout: layout }}
          >
            <AppInner autoPlay />
          </EditorProvider>
        </HelpProvider>
      </ThemeProvider>
    </div>
  );
}
