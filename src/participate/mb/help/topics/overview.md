# Motion Builder

Design a kinetic animation for the **Equilateral Expedition** sculpture: seven triangle boxes, each with a rotary motor (spin) and six with a linear motor (slide toward the center).

You author **keyframes**, the app checks them against the real motors' limits, and you save a small **JSON file**. **Our Team** reviews approved files and schedules them on the sculpture.

- Start with the floating **Getting Started** video (or [watch on YouTube](https://youtu.be/R8Uw1rk1n9I)), then [Workflows](#help:workflows) for the step-by-step path.
- Every panel has a **?** button that opens help for just that panel.
- Your work lives in this browser tab only. **Save JSON** often; closing the tab clears it.

## Glossary

- **Frame**: one tick of the timeline (24 per second by default).
- **Keyframe**: a frame where you set motor values; frames in between ease under **Smooth Animation**, or hold under **Keyframe Poses**.
- **Lane / lockstep group**: motors that move together from one shared value.
- **Aligned**: every motor at 0. Frame 0 is always Aligned and cannot be edited.
- **Rotary (°)** / **Linear (mm)**: spin vs slide-toward-center.
- **Physics**: live check that moves fit motor speed, accel, travel, and collision rules.
- **Scale**: shrink an offending move toward safer neighbors (or pull a tip linear under safe depth).
- **Spread**: keep a spike's magnitude and ease neighbors toward it (or expand takeoff when blocked by Aligned).
- **Our Team**: the Equilateral Expedition operators who review and run shows on the sculpture.
- **Working Group**: a temporary multi-lane selection for editing together.

## Contribute

Want to help build Motion Builder or the sculpture software? Reach Our Team through the site [booking / contact form](https://joemygoodness.com/#booking).
