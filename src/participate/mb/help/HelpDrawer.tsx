import { useEffect, useRef, type ReactNode } from "react";
import Markdown, { type Components } from "react-markdown";
import styled from "styled-components";
import { BOOKING_CONTACT_HREF, isBookingContactHref } from "./contact";
import { useHelp } from "./HelpContext";
import { HELP_TOPIC_IDS, HELP_TOPICS, helpMarkdown, parseHelpHref, slugify } from "./registry";

const Panel = styled.aside`
  position: fixed;
  inset: 0 0 0 auto;
  width: min(440px, 92vw);
  z-index: 20;
  display: flex;
  flex-direction: column;
  background: ${({ theme }) => theme.panel};
  border-left: 1px solid ${({ theme }) => theme.border};
  box-shadow: -8px 0 24px rgba(0, 0, 0, 0.45);
`;
const Head = styled.header`
  display: flex;
  gap: 8px;
  align-items: center;
  padding: 10px 12px;
  border-bottom: 1px solid ${({ theme }) => theme.border};
  select { flex: 1; }
`;
const Body = styled.div`
  overflow-y: auto;
  padding: 4px 18px 24px;
  line-height: 1.5;
  h1 { font-size: 1.3rem; }
  h2 { font-size: 1.05rem; margin-top: 1.4em; color: ${({ theme }) => theme.accent}; }
  code { background: ${({ theme }) => theme.bg}; padding: 0 4px; border-radius: 4px; }
  a { color: ${({ theme }) => theme.accent}; }
  .is-target { outline: 2px solid ${({ theme }) => theme.accent}; outline-offset: 4px; border-radius: 4px; }
`;

const text = (children: ReactNode): string =>
  Array.isArray(children) ? children.map(text).join("") : typeof children === "string" ? children : "";

export function HelpDrawer() {
  const { target, open, close } = useHelp();
  const body = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!target) return;
    const el = target.anchor ? body.current?.querySelector(`#${target.anchor}`) : null;
    body.current?.querySelectorAll(".is-target").forEach((n) => n.classList.remove("is-target"));
    el?.classList.add("is-target");
    if (el?.scrollIntoView) el.scrollIntoView({ block: "start" });
    else body.current?.scrollTo?.(0, 0);
  }, [target]);

  if (!target) return null;

  const components: Components = {
    h2: ({ children }) => <h2 id={slugify(text(children))}>{children}</h2>,
    a: ({ href = "", children }) => {
      const link = parseHelpHref(href);
      if (link) {
        return <a href={href} onClick={(e) => { e.preventDefault(); open(link); }}>{children}</a>;
      }
      // Prefer an explicit window.open so left-click matches "Open in new tab"
      // (same-tab location.assign was cancelled in the Participate embed).
      if (isBookingContactHref(href)) {
        return (
          <a
            href={BOOKING_CONTACT_HREF}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              window.open(BOOKING_CONTACT_HREF, "_blank", "noopener,noreferrer");
            }}
          >
            {children}
          </a>
        );
      }
      return <a href={href} target="_blank" rel="noopener noreferrer">{children}</a>;
    },
  };

  return (
    <Panel role="dialog" aria-label="Help" onKeyDown={(e) => e.key === "Escape" && close()}>
      <Head>
        <select aria-label="Help topic" value={target.topic}
          onChange={(e) => open({ topic: e.target.value as typeof target.topic })}>
          {HELP_TOPIC_IDS.map((id) => <option key={id} value={id}>{HELP_TOPICS[id]}</option>)}
        </select>
        <button type="button" onClick={close} aria-label="Close help">✕</button>
      </Head>
      <Body ref={body}>
        <Markdown components={components}>{helpMarkdown(target.topic)}</Markdown>
      </Body>
    </Panel>
  );
}
