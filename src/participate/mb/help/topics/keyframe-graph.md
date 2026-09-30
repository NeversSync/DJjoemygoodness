# Keyframe graph

One line per lane across the timeline. The **Edit lane** is bright and shows draggable nodes.

## Editing

- **Tap / click a node** to select it and move the playhead there. Shift-click adds to the selection.
- **Drag a node** up or down to change its value. Turn on **Drag frames** (or hold Alt) to also move it in time.
- **Drag on empty space** to box-select nodes.
- **Add** inserts a key one grid step after the current key, averaged from its neighbours.
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
- Mouse wheel zooms toward the cursor. Use the **X／Y／Pan／Fit** buttons when you prefer discrete control.
- The shaded **hold** region after the last key keeps that pose to the end.
- Red bands mark physics issues. Tap one to see the details.
