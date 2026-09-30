# Lanes & motors

Shows every motor's value at the current keyframe, organized by **lockstep lane**.

## Lanes

- **+ Rotary / + Linear** adds an empty lane. Motors only join lanes of the same kind.
- Rename a lane by editing its label. The color swatch paints its graph line and physics rows.
- **Drag the ⠿ handle** (or use ↑ ↓) to reorder lanes. The physics list follows this order.
- **Delete** removes the lane. Its motors become solo.

## Motors

- **Group** picks the lane a motor follows, or *solo* to control it alone.
- **Inv** mirrors a motor inside its lane: it receives the negative value.
- Rotary values are **degrees** (multi-turn allowed, e.g. 720). Nudge buttons add ±1, ±15, ±90, ±360. With several graph nodes selected, a nudge applies to all of them.
- Linear values are **millimetres** of travel toward the center (0 = home).

Frame 0 is locked to Aligned, so its controls are disabled.
