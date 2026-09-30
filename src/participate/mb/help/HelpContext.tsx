import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import type { HelpTopicId } from "./registry";

export type HelpTarget = { topic: HelpTopicId; anchor?: string };
type HelpApi = { target: HelpTarget | null; open: (t: HelpTarget) => void; close: () => void };

const Ctx = createContext<HelpApi | null>(null);

export function HelpProvider({ children }: { children: ReactNode }) {
  const [target, setTarget] = useState<HelpTarget | null>(null);
  const open = useCallback((t: HelpTarget) => setTarget(t), []);
  const close = useCallback(() => setTarget(null), []);
  const api = useMemo(() => ({ target, open, close }), [target, open, close]);
  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

export function useHelp(): HelpApi {
  const api = useContext(Ctx);
  if (!api) throw new Error("useHelp must be used inside <HelpProvider>");
  return api;
}
