import { ALL_STEPPERS, BOX_LANES, MAX_MOTOR_MM_LOWER, MAX_MOTOR_MM_UPPER, UPPER_BOXES } from "./constants";
import { interpolateForwardPositions } from "./interpolate";
import type { BoxPose, ForwardTrajectory, MotionBuilderDocument, StepperPositions } from "./types";

export function positionsAt(forward: ForwardTrajectory, frame: number): StepperPositions {
  const ff = forward.rotary_twelve.length;
  const f = Math.max(0, Math.min(Math.trunc(frame), ff - 1));
  return Object.fromEntries(ALL_STEPPERS.map((s) => [s, forward[s][f]!])) as StepperPositions;
}

/** Absolute stepper positions at an authored forward frame (interpolated). */
export const documentForPreview = (doc: MotionBuilderDocument, frame: number): StepperPositions =>
  positionsAt(interpolateForwardPositions(doc), frame);

export function boxesPoseFromSteppers(pos: StepperPositions): BoxPose[] {
  return BOX_LANES.map(([box, steppers]) => {
    const rot = steppers.find((s) => s.startsWith("rotary_"));
    const lin = steppers.find((s) => s.startsWith("linear_"));
    const rotDeg = rot ? pos[rot] : 0;
    return {
      box,
      rotation: (((rotDeg / 360) % 1) + 1) % 1,
      rotation_deg: rotDeg,
      hub_mm: lin ? pos[lin] : 0,
      tier_max_mm: UPPER_BOXES.has(box) ? MAX_MOTOR_MM_UPPER : MAX_MOTOR_MM_LOWER,
      steppers: Object.fromEntries(steppers.map((s) => [s, pos[s]])),
    };
  });
}
