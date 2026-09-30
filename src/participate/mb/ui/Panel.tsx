import type { ReactNode } from "react";
import styled from "styled-components";
import { HelpLink } from "../help/HelpLink";
import type { HelpTopicId } from "../help/registry";

const Box = styled.section<{ $area: string }>`
  grid-area: ${({ $area }) => $area};
  min-width: 0;
  min-height: 0;
  background: ${({ theme }) => theme.panel};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 12px;
  padding: 10px 12px 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  @media (orientation: landscape) and (max-height: 850px) {
    padding: 6px 8px 8px;
    gap: 4px;
    border-radius: 10px;
    h2 { font-size: 0.85rem; }
  }
`;
const Title = styled.header`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
  h2 { margin: 0; font-size: 0.95rem; flex: 1; letter-spacing: 0.02em; }
`;

type Props = { title: string; help: HelpTopicId; area: string; actions?: ReactNode; children: ReactNode };

export function Panel({ title, help, area, actions, children }: Props) {
  return (
    <Box $area={area} aria-label={title}>
      <Title>
        <h2>{title}</h2>
        {actions}
        <HelpLink topic={help} />
      </Title>
      {children}
    </Box>
  );
}

export const Row = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
  min-width: 0;
`;

export const Check = styled.label`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: ${({ theme }) => theme.touch}px;
  user-select: none;
`;
