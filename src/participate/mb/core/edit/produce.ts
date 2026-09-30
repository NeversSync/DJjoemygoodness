import type { MotionBuilderDocument, MotionKeyframe } from "../types";

export class EditError extends Error {}

/** Apply `fn` to a deep copy so edits never mutate the caller's document. */
export function produce(doc: MotionBuilderDocument, fn: (draft: MotionBuilderDocument) => void): MotionBuilderDocument {
  const draft = structuredClone(doc);
  fn(draft);
  draft.keyframes.sort((a, b) => a.frame - b.frame);
  return draft;
}

export const round3 = (v: number) => Math.round(Number(v) * 1000) / 1000;

export const keyAt = (doc: MotionBuilderDocument, frame: number): MotionKeyframe | undefined =>
  doc.keyframes.find((k) => k.frame === frame);

export const lastFrame = (doc: MotionBuilderDocument) => Math.max(2, doc.frames_forward) - 1;

export function ensureTimelineFits(doc: MotionBuilderDocument, frame: number): void {
  if (frame > lastFrame(doc)) doc.frames_forward = frame + 1;
}
