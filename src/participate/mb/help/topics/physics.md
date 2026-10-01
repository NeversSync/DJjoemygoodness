# Physics

Checks your animation against what the real motors can do. It re-runs automatically after every edit and stops at the **first failing span** (two neighbouring keys). You can still save with issues, but Joe can only schedule files that pass.

Each row names the motor, the span, and a **recc** (recommendation): usually *scale the move down* or *spread it over more frames*. Tap a row to jump the playhead and graph there.

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
