import type {
  LinearStepper,
  MotionGroup,
  MotionLimits,
  MotorKind,
  RotaryStepper,
  StepperName,
} from "./types";

export const SCHEMA_VERSION = 1;
export const DEFAULT_FRAMES_FORWARD = 540;
export const DEFAULT_GRID_STEP = 10;
export const DEFAULT_FPS = 24;
export const MAX_MOTOR_MM_UPPER = 136;
export const MAX_MOTOR_MM_LOWER = 109;

/** Upper-tier linear steppers (12 / 4 / 8 o'clock) — hardware travel 136 mm. */
export const UPPER_LINEAR_STEPPERS: ReadonlySet<string> = new Set([
  "linear_twelve", "linear_four", "linear_eight",
]);

/** Per-motor linear travel cap from Start From / hardware tiers. */
export function linearMaxMmForStepper(
  stepper: string,
  limits?: Pick<MotionLimits, "max_motor_mm_upper" | "max_motor_mm_lower" | "max_linear_mm"> | null,
): number {
  const upper = UPPER_LINEAR_STEPPERS.has(stepper);
  const tier = upper
    ? (limits?.max_motor_mm_upper ?? MAX_MOTOR_MM_UPPER)
    : (limits?.max_motor_mm_lower ?? MAX_MOTOR_MM_LOWER);
  return Number(tier || limits?.max_linear_mm || (upper ? MAX_MOTOR_MM_UPPER : MAX_MOTOR_MM_LOWER));
}

/** Tightest travel cap among a group's linear members (mixed groups use the lower tier). */
export function linearMaxMmForGroup(
  group: Pick<MotionGroup, "kind" | "steppers">,
  limits?: Pick<MotionLimits, "max_motor_mm_upper" | "max_motor_mm_lower" | "max_linear_mm" | "min_linear_mm"> | null,
): number {
  if (group.kind !== "linear") return limits?.max_linear_mm ?? MAX_MOTOR_MM_UPPER;
  const linears = group.steppers.filter((s) => String(s).startsWith("linear_"));
  if (!linears.length) return limits?.max_linear_mm ?? MAX_MOTOR_MM_UPPER;
  return Math.min(...linears.map((s) => linearMaxMmForStepper(s, limits)));
}

export function clampLinearMm(
  value: number,
  maxMm: number,
  minMm = 0,
): number {
  return Math.max(minMm, Math.min(maxMm, value));
}

/** Max absolute ° change between consecutive authored rotary samples (one keyframe jump). */
export const MAX_ROTARY_JUMP_DEG = 360;

/** Clamp `next` so |next − prev| ≤ maxJump (default 360°). */
export function clampRotaryJump(
  prev: number,
  next: number,
  maxJump: number = MAX_ROTARY_JUMP_DEG,
): number {
  const d = next - prev;
  if (d > maxJump) return prev + maxJump;
  if (d < -maxJump) return prev - maxJump;
  return next;
}
/** Keeps files email-attachable after Base64 overhead. */
export const MAX_DOCUMENT_BYTES = 9 * 1024 * 1024;

export const DEFAULT_SPEED_SCALE = 1.0;
export const MIN_SPEED_SCALE = 0.1;
export const MAX_SPEED_SCALE = 1;

export const ALL_ROTARY_STEPPERS: readonly RotaryStepper[] = [
  "rotary_twelve", "rotary_two", "rotary_center",
  "rotary_four", "rotary_six", "rotary_eight", "rotary_ten",
];

export const ALL_LINEAR_STEPPERS: readonly LinearStepper[] = [
  "linear_twelve", "linear_two", "linear_four",
  "linear_six", "linear_eight", "linear_ten",
];

/** Attract source-spec order (matches Python ALL_STEPPERS). */
export const ALL_STEPPERS: readonly StepperName[] = [
  "rotary_twelve", "rotary_two", "rotary_center",
  "linear_twelve", "linear_two",
  "rotary_four", "rotary_six", "linear_four", "linear_six",
  "rotary_eight", "rotary_ten", "linear_eight", "linear_ten",
];

export const stepperKind = (s: StepperName): MotorKind =>
  s.startsWith("rotary_") ? "rotary" : "linear";

export const isStepperName = (s: unknown): s is StepperName =>
  typeof s === "string" && (ALL_STEPPERS as readonly string[]).includes(s);

export const BOX_LANES: readonly (readonly [string, readonly StepperName[]])[] = [
  ["12 o'clock", ["rotary_twelve", "linear_twelve"]],
  ["2 o'clock", ["rotary_two", "linear_two"]],
  ["4 o'clock", ["rotary_four", "linear_four"]],
  ["6 o'clock", ["rotary_six", "linear_six"]],
  ["8 o'clock", ["rotary_eight", "linear_eight"]],
  ["10 o'clock", ["rotary_ten", "linear_ten"]],
  ["center", ["rotary_center"]],
];

export const UPPER_BOXES: ReadonlySet<string> = new Set(["12 o'clock", "4 o'clock", "8 o'clock"]);

/** [rotary, linear, flat-face phase offset deg]: upper tier 0, lower tier 60. */
export const COLLISION_BOX_PAIRS: readonly (readonly [RotaryStepper, LinearStepper, number])[] = [
  ["rotary_twelve", "linear_twelve", 0],
  ["rotary_four", "linear_four", 0],
  ["rotary_eight", "linear_eight", 0],
  ["rotary_two", "linear_two", 60],
  ["rotary_six", "linear_six", 60],
  ["rotary_ten", "linear_ten", 60],
];

export const DEFAULT_LANE_COLORS = [
  "#e94560", "#448aff", "#00e676", "#ffab40", "#ce93d8", "#80deea", "#ff8a80",
];

export const DEFAULT_GROUPS: readonly MotionGroup[] = [
  { id: "rot_upper", label: "Rotary Upper", kind: "rotary",
    steppers: ["rotary_twelve", "rotary_four", "rotary_eight"], invert: [], color: "#e94560" },
  { id: "rot_lower", label: "Rotary Lower + Center", kind: "rotary",
    steppers: ["rotary_two", "rotary_six", "rotary_ten", "rotary_center"], invert: [], color: "#448aff" },
  { id: "loc_upper", label: "Linear Upper", kind: "linear",
    steppers: ["linear_twelve", "linear_four", "linear_eight"], invert: [], color: "#00e676" },
  { id: "loc_lower", label: "Linear Lower", kind: "linear",
    steppers: ["linear_two", "linear_six", "linear_ten"], invert: [], color: "#ffab40" },
];

export const DEFAULT_LIMITS: Readonly<Required<Omit<MotionLimits, "linear_mm_scale">>> = {
  max_rotary_speed: 540,
  max_linear_speed: 300,
  rotary_accel: 1500,
  linear_accel: 1000,
  max_linear_mm: MAX_MOTOR_MM_UPPER,
  max_rotary_delta_per_step: 180,
  min_linear_mm: 0,
  max_time_scale: 1,
  max_motor_mm_upper: MAX_MOTOR_MM_UPPER,
  max_motor_mm_lower: MAX_MOTOR_MM_LOWER,
};

export const EMIT_ORDER_SUFFIXES = ["twelve", "four", "eight", "two", "six", "ten", "center"];
export const PEAK_RESYNC_END_FRAMES = [40, 160, 220, 360, 440, 520];
