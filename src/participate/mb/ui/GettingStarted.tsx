import { useCallback, useState } from "react";
import styled from "styled-components";

/** Equilateral Expedition Motion Builder tutorial. */
export const GETTING_STARTED_YOUTUBE_ID = "R8Uw1rk1n9I";
export const GETTING_STARTED_YOUTUBE_URL = `https://youtu.be/${GETTING_STARTED_YOUTUBE_ID}`;
export const GETTING_STARTED_EMBED_URL =
  `https://www.youtube-nocookie.com/embed/${GETTING_STARTED_YOUTUBE_ID}?rel=0`;

/** Session-only dismiss (survives refresh, cleared when the tab closes). */
export const GETTING_STARTED_SESSION_KEY = "eemb.gettingStarted.dismissed";

const Card = styled.aside`
  position: fixed;
  top: 10px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 18;
  width: min(420px, calc(100vw - 20px));
  background: ${({ theme }) => theme.panel};
  border: 1px solid ${({ theme }) => theme.accent};
  border-radius: 14px;
  box-shadow: 0 10px 36px rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px 12px 10px;
`;

const Head = styled.header`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
  h2 {
    margin: 0;
    font-size: 1.05rem;
    color: ${({ theme }) => theme.accent};
  }
  p {
    margin: 4px 0 0;
    font-size: 0.82rem;
    color: ${({ theme }) => theme.muted};
    line-height: 1.35;
  }
`;

const Close = styled.button`
  flex-shrink: 0;
  min-height: 32px !important;
  width: 32px;
  padding: 0;
  border-radius: 8px;
  font-size: 1rem;
  line-height: 1;
`;

const EmbedWrap = styled.div`
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  border-radius: 10px;
  overflow: hidden;
  background: #000;
  border: 1px solid ${({ theme }) => theme.border};
  iframe {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    border: 0;
  }
`;

const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  justify-content: space-between;
  a {
    color: ${({ theme }) => theme.accent};
    font-weight: 600;
    font-size: 0.9rem;
  }
  button {
    min-height: 36px;
    font-size: 0.85rem;
  }
`;

function isDismissed(): boolean {
  try {
    return sessionStorage.getItem(GETTING_STARTED_SESSION_KEY) === "1";
  } catch {
    return false;
  }
}

function persistDismissed(): void {
  try {
    sessionStorage.setItem(GETTING_STARTED_SESSION_KEY, "1");
  } catch {
    /* private mode */
  }
}

/** Floating Getting Started card with a small YouTube embed; dismissable for this tab. */
export function GettingStarted() {
  const [open, setOpen] = useState(() => !isDismissed());

  const dismiss = useCallback(() => {
    persistDismissed();
    setOpen(false);
  }, []);

  if (!open) return null;

  return (
    <Card role="dialog" aria-label="Getting started">
      <Head>
        <div>
          <h2>Getting Started</h2>
          <p>Quick walkthrough of Motion Builder — then author your take and send it to Our Team.</p>
        </div>
        <Close type="button" onClick={dismiss} aria-label="Dismiss getting started">✕</Close>
      </Head>
      <EmbedWrap>
        <iframe
          src={GETTING_STARTED_EMBED_URL}
          title="Motion Builder getting started tutorial"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          loading="lazy"
          referrerPolicy="strict-origin-when-cross-origin"
        />
      </EmbedWrap>
      <Actions>
        <a href={GETTING_STARTED_YOUTUBE_URL} target="_blank" rel="noopener noreferrer">
          Watch on YouTube ↗
        </a>
        <button type="button" onClick={dismiss}>Got it</button>
      </Actions>
    </Card>
  );
}
