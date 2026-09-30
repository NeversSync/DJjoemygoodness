# Motion Builder

Design a kinetic animation for the **Equilateral Expedition** sculpture: seven triangle boxes, each with a rotary motor (spin) and six with a linear motor (slide toward the center).

You author **keyframes**, the app checks them against the real motors' limits, and you save a small **JSON file**. Joe renders approved files onto the sculpture.

- Start with [Workflows](#help:workflows) for the step-by-step path.
- Every panel has a **?** button that opens help for just that panel.
- Your work lives in this browser tab only. **Save JSON** often; closing the tab clears it.

## Terms

- **Frame**: one tick of the timeline (24 per second).
- **Keyframe**: a frame where you set motor values; frames in between blend.
- **Lane / lockstep group**: motors that move together from one value.
- **Aligned**: every motor at 0. Frame 0 is always Aligned.
