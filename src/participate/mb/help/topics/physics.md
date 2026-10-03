# Physics

Checks your animation against what the real motors can do. It re-runs automatically after every edit and stops at the **first failing span** (two neighbouring keys). You can still save with issues, but **Our Team** can only schedule files that pass.

Each row names the motor, the span, and a **recc** (recommendation): usually *scale the move down* or *spread it over more frames*. Tap a row to jump the playhead and graph there.

## Scale vs Spread

- **Scale**: shrink the offending travel toward safer neighbors (keeps timing; lowers the spike).
- **Spread**: keep the spike's magnitude and pull nearby keys toward it in a wave. If the wave hits **Aligned** (frame 0), Spread expands the takeoff forward instead so the peak lands a few frames later.
**Scale All / Spread All**: walk open violations one at a time (short pause so the UI can refresh). While running, the error list is covered by a **Processing** overlay with **Cancel** (stops after the current step). Dense solo-lane takes may need many steps (1-frame gaps × motors); if a run lasts more than a few seconds, Quantize lights up — cancel and Quantize first to shorten the job. If the run hits the step limit, the status says so — run again to continue. Each step is Undoable. Spread only adjusts existing keys (no new keyframes) and skips hits it already tried so it cannot flash-loop. On **solo lanes** (Blank / one motor per group), solvers write the lane itself so the graph matches physics; takeoff spikes against Aligned use a capacity-weighted ramp. **Working Group**: when lanes are linked, Scale/Spread prefer the group and the most stringent box first, then apply a shared absolute delta across peers so one step can clear a whole span; leftover one-offs still run afterward. **crash_zone**: Scale pulls each deep linear under ~85% of **its own** tier max (upper 136mm / lower 109mm). Link edits still share absolute mm (not % of reach), so lower-tier motors hit their 85% band sooner when linked with uppers.

## linear_above_max

A slide goes past its maximum travel. Keep linear values at or under the cap shown.

## linear_below_min

A slide goes below 0 mm (home). Raise the value to 0 or more.

## linear_speed

A slide must move faster than its top speed. Reduce the distance or add frames between the keys.

## linear_accel_time

The move is under top speed but too short to speed up and slow down. Add frames or shorten the move.

## rotary_delta

A spin exceeds 180° per frame, which looks like jitter. Spread it over more frames.

## rotary_speed

A spin must turn faster than the motor's top speed. Reduce the rotation or add frames.

## rotary_accel_time

A spin is too short to accelerate and stop in time. Add frames or reduce the rotation.

## crash_zone

Five or more slides are near full extension at once. Pull at least one lane back under ~85%, or stagger them.

## pillar_collision

A deeply extended box would swing its tip into the center column. **Scale** pulls that linear just under the safe depth; **Spread** holds the tip on a safe angle while the linear is deep so the path cannot clip the pillar mid-swing.
