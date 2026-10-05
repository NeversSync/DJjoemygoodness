# Transport

Moves the playhead through the timeline.

- **⏮ / ⏭**: jump to the first / last frame.
- **|◀ / ▶|**: step to the previous / next keyframe (or single frame when **Keys** is off).
- **Rev / ▶ / ■**: animate the preview backward or forward (ping-pong), or stop. **Space** toggles forward play / stop. **Rate** changes preview speed only, not the sculpture.
- **Scrub slider**: drag to any frame.
- **Keys**: when on, step buttons land on keyframes; when off, they move one frame at a time.
- **Go to**: type a frame number and press Enter.
- **End**: set the last frame (the start is always 0).

## End frame

- **Extending** adds a zero-change key every grid step, holding the last pose.
- **Shortening** adds an end key averaged from its neighbours and removes keys after it.
