import overview from "./topics/overview.md";
import workflows from "./topics/workflows.md";
import startingPoints from "./topics/starting-points.md";
import transport from "./topics/transport.md";
import groups from "./topics/groups.md";
import keyframeGraph from "./topics/keyframe-graph.md";
import physics from "./topics/physics.md";
import preview from "./topics/preview.md";
import saveLoad from "./topics/save-load.md";
import shortcuts from "./topics/shortcuts.md";

const TOPIC_BODY: Record<string, string> = {
  overview,
  workflows,
  "starting-points": startingPoints,
  transport,
  groups,
  "keyframe-graph": keyframeGraph,
  physics,
  preview,
  "save-load": saveLoad,
  shortcuts,
};

export const HELP_TOPICS = {
  overview: "Overview",
  workflows: "Workflows",
  "starting-points": "Starting points",
  transport: "Transport",
  groups: "Lanes & motors",
  "keyframe-graph": "Keyframe graph",
  physics: "Physics",
  preview: "Preview",
  "save-load": "Save & load",
  shortcuts: "Keyboard shortcuts",
} as const;

export type HelpTopicId = keyof typeof HELP_TOPICS;

export const HELP_TOPIC_IDS = Object.keys(HELP_TOPICS) as HelpTopicId[];

export const helpMarkdown = (id: HelpTopicId): string => TOPIC_BODY[id] ?? "";

export const slugify = (text: string) => text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

/** In-help links use `#help:<topic>` or `#help:<topic>/<anchor>`. */
export function parseHelpHref(href: string): { topic: HelpTopicId; anchor?: string } | null {
  const m = /^#help:([a-z-]+)(?:\/([a-z0-9-]+))?$/.exec(href);
  if (!m || !(m[1]! in HELP_TOPICS)) return null;
  return { topic: m[1] as HelpTopicId, anchor: m[2] };
}

export const headingSlugs = (md: string) => [...md.matchAll(/^#{2,3} (.+)$/gm)].map((m) => slugify(m[1]!));
