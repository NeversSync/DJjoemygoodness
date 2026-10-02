import styled from "styled-components";
import { useEditor } from "../state/EditorContext";

const Bar = styled.div<{ $err: boolean }>`
  grid-area: status;
  position: sticky;
  bottom: 0;
  z-index: 5;
  padding: 8px 14px;
  font-size: 0.85rem;
  border-radius: 8px;
  background: ${({ $err, theme }) => $err ? "rgba(255,107,107,0.92)" : theme.panelAlt};
  color: ${({ $err, theme }) => $err ? "#fff" : theme.muted};
  border: 1px solid ${({ $err, theme }) => $err ? theme.error : theme.border};
  min-height: 36px;
  display: flex;
  align-items: center;
  box-shadow: 0 -4px 16px rgba(0,0,0,0.35);
`;

const Label = styled.span`
  margin-right: 0.4em;
  color: ${({ theme }) => theme.accent};
  white-space: nowrap;
`;

export function StatusBar() {
  const { state } = useEditor();
  const text = state.status.text.trim();
  return (
    <Bar $err={state.status.error} aria-label="Last action">
      <Label>Last action:</Label>
      <span>{text || "—"}</span>
    </Bar>
  );
}
