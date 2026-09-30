import { parseDocument, seedBlankDocument } from "../core/document";
import type { MotionBuilderDocument } from "../core/types";
import attract from "./Attract_100.json";
import butterfly from "./ButterflyV2.json";
import wave from "./Wave_Motion_V2.json";

export type StartingPoint = { id: string; label: string; build: () => MotionBuilderDocument };

const fromJson = (raw: unknown) => () => parseDocument(JSON.stringify(raw));

export const STARTING_POINTS: readonly StartingPoint[] = [
  { id: "blank", label: "Blank (13 solo lanes)", build: () => seedBlankDocument() },
  { id: "Attract_100", label: "Attract", build: fromJson(attract) },
  { id: "Wave_Motion_V2", label: "Wave Motion", build: fromJson(wave) },
  { id: "ButterflyV2", label: "Butterfly", build: fromJson(butterfly) },
];

export const DEFAULT_START = "Attract_100";

export const buildStart = (id: string): MotionBuilderDocument =>
  (STARTING_POINTS.find((p) => p.id === id) ?? STARTING_POINTS[1]!).build();
