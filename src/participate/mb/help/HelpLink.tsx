import styled from "styled-components";
import { useHelp } from "./HelpContext";
import { HELP_TOPICS, type HelpTopicId } from "./registry";

const Btn = styled.button`
  width: 28px;
  height: 28px;
  min-width: 28px;
  border-radius: 50%;
  padding: 0;
  font-weight: 700;
  color: ${({ theme }) => theme.accent};
  border: 1px solid ${({ theme }) => theme.accent};
  background: transparent;
`;

type Props = { topic: HelpTopicId; anchor?: string };

/** "?" button that opens the help drawer at a topic (and optional heading anchor). */
export function HelpLink({ topic, anchor }: Props) {
  const { open } = useHelp();
  return (
    <Btn type="button" aria-label={`Help: ${HELP_TOPICS[topic]}`} data-help-topic={topic}
      onClick={() => open({ topic, anchor })}>
      ?
    </Btn>
  );
}
