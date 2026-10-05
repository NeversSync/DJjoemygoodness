# Keyframe graph

One line per lane across the timeline. The **Edit lane** is bright and shows draggable nodes.

## Tools

Pick a cursor on the graph toolbar (shortcuts **V** / **B** / **E**):

- **Pointer** — select, box-select, and drag nodes (default).
- **Pencil** — drag across the plot to draw a wave of keys on the Edit lane (Working Group peers get the same absolute delta). Fast strokes fill in-between frames; use **Quantize** afterward if you want a 10-frame grid.
- **Eraser** — drag over nodes to delete them on the Edit lane (linked lanes erase together).

## Editing

- **Tap / click a node** (Pointer) to select it and move the playhead there. Shift-click adds to the selection.
- **Drag a node** up or down to change its value. Turn on **Drag frames** (or hold Alt) to also move it in time.
- **Physics Speed** (checkbox): when on, dragging a node is capped to the speed and acceleration the motor can actually achieve. A large fast drag hits max acceleration; small gentle movements stay proportionally small. Uncheck to drag freely.
- **Drag on empty space** (Pointer) to box-select nodes.
- **Add** inserts a key one grid step after the current key, averaged from its neighbours.
- **Quantize** keeps only keys on every 10th frame (0, 10, 20, …) and the final frame when it is not on that grid. Motion is sampled from the current curve so the shape stays close.
- **Delete** removes selected nodes on the Edit lane only (other lanes keep their keys at that frame). **Remove** deletes the whole key for every lane.
- **Average** smooths selected Edit-lane keys from their neighbours.

## Copy & duplicate

- **Copy / Paste** copy the selected keys and paste them at the playhead.
- **Duplicate** repeats the selection right after itself.
- **Mirror** plays the selection backwards after itself (ping-pong).
- With **All lanes** on, these include every lane. The timeline extends automatically when needed.

## View

- **One finger**: tap/drag nodes to edit; drag empty space to box-select.
- **Two fingers**: pinch to zoom (time + value); slide both fingers to pan.
- **Shift+wheel** zooms toward the **selection centroid** (average of selected Edit-lane nodes). With nothing selected, it zooms toward the playhead on the Edit-lane curve. Use the **X／Y／Pan／Fit** buttons when you prefer discrete control.
- **Follow** (Zoom bar): keeps the playhead centered while you play or scrub. It tracks the Edit-lane curve at true frame pace — including stretches where keys were deleted. Manual pan, Fit, Shift+wheel, or pinch turns Follow off.
- The shaded **hold** region after the last key keeps that pose to the end.
- Red bands mark physics issues. Tap one to see the details.
