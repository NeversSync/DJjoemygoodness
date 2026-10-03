/**
 * Motion Builder document schema v1. Must stay byte-compatible with
 * TriangleDetection's motion_builder_factory.py (admin renders GCode from it).
 */

export type RotaryStepper =
  | "rotary_twelve"
  | "rotary_two"
  | "rotary_center"
  | "rotary_four"
  | "rotary_six"
  | "rotary_eight"
  | "rotary_ten";

export type LinearStepper =
  | "linear_twelve"
  | "linear_two"
  | "linear_four"
  | "linear_six"
  | "linear_eight"
  | "linear_ten";

export type StepperName = RotaryStepper | LinearStepper;
export type MotorKind = "rotary" | "linear";

export type MotionGroup = {
  id: string;
  label: string;
  kind: MotorKind;
  steppers: StepperName[];
  /** Members that receive the negated lane value (mirror within one lane). */
  invert?: StepperName[];
  /** #rrggbb lane color for graph + physics rows. */
  color?: string;
};

export type MotionKeyframe = {
  /** Forward frame; frame 0 is always Aligned (all zeros). */
  frame: number;
  /** Lane values keyed by group id. Rotary = degrees, linear = mm. */
  lanes: Record<string, number>;
  /** Per-motor overrides that break lockstep at this keyframe. */
  steppers?: Partial<Record<StepperName, number>>;
};

export type MotionLimits = {
  max_rotary_speed: number;
  max_linear_speed: number;
  rotary_accel: number;
  linear_accel: number;
  max_linear_mm: number;
  min_linear_mm: number;
  max_rotary_delta_per_step: number;
  max_time_scale?: number;
  max_motor_mm_upper?: number;
  max_motor_mm_lower?: number;
  linear_mm_scale?: number;
};

export type MotionBuilderDocument = {
  version: 1;
  name: string;
  source: string;
  frames_forward: number;
  grid_step: number;
  dwell_ms: number;
  fps: number;
  limits: MotionLimits;
  /** GCode-only fields below are preserved for the admin render, not edited here. */
  emit_order: string[];
  emit_order_mode?: "groups" | "tier_queue";
  resync_every_n_keyframes: number;
  peak_resync?: boolean;
  peak_resync_end_frames?: number[];
  /** true = linear blend between keys; false = hold until next key. */
  interpolate?: boolean;
  /** Global motor speed multiplier (0.1–1.0) used by the admin render. */
  speed_scale?: number;
  groups: MotionGroup[];
  keyframes: MotionKeyframe[];
  meta?: Record<string, unknown>;
};

export type StepperPositions = Record<StepperName, number>;
export type ForwardTrajectory = Record<StepperName, number[]>;

export type ViolationCode =
  | "linear_below_min"
  | "linear_above_max"
  | "linear_speed"
  | "linear_accel_time"
  | "rotary_delta"
  | "rotary_speed"
  | "rotary_accel_time"
  | "crash_zone"
  | "pillar_collision";

export type PhysicsViolation = {
  frame: number;
  prev_frame: number | null;
  stepper: StepperName | null;
  group_id: string | null;
  code: ViolationCode;
  message: string;
  recommendation: string | null;
  display: string;
  color?: string | null;
};

export type PhysicsResult = {
  ok: boolean;
  break_frame: number | null;
  violations: PhysicsViolation[];
  checked_keyframes: number;
};

export type BoxPose = {
  box: string;
  /** 0..1 clock fraction of rotation (Aligned = 0). */
  rotation: number;
  rotation_deg: number;
  hub_mm: number;
  tier_max_mm: number;
  steppers: Partial<StepperPositions>;
};
