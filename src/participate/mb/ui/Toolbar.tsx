import { useCallback, useRef } from "react";
import styled from "styled-components";
import { parseDocument } from "../core/document";
import { openDocumentFile, saveDocumentFile } from "../io/files";
import { buildStart, STARTING_POINTS } from "../seeds";
import { useEditor } from "../state/EditorContext";
import { Panel, Row } from "./Panel";

const Name = styled.input`flex: 1; min-width: 120px;`;
const Pct = styled.span`font-variant-numeric: tabular-nums; min-width: 36px; text-align: right;`;
const HiddenFile = styled.input`display: none;`;

export function Toolbar() {
  const { state, dispatch } = useEditor();
  const doc = state.doc;
  const fileRef = useRef<HTMLInputElement>(null);

  const onName = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    dispatch({ type: "edit", label: "Rename", apply: (d) => ({ ...d, name }), undo: false });
  }, [dispatch]);

  const onStart = useCallback((id: string) => {
    const d = buildStart(id);
    dispatch({ type: "load", doc: d, status: `Loaded starting point: ${d.name}` });
  }, [dispatch]);

  const onLoad = useCallback(async () => {
    dispatch({ type: "status", text: "Opening file…" });
    try {
      const d = await openDocumentFile(fileRef.current);
      if (d) {
        dispatch({
          type: "load",
          doc: d,
          status: `Loaded ${d.name} (${d.keyframes.length} keys, ${d.frames_forward} frames)`,
        });
      } else {
        dispatch({ type: "status", text: "Load cancelled" });
      }
    } catch (err) {
      dispatch({ type: "status", text: err instanceof Error ? err.message : "Load failed", error: true });
    }
  }, [dispatch]);

  const onSave = useCallback(async () => {
    try {
      const ok = await saveDocumentFile(doc);
      if (ok) dispatch({ type: "status", text: `Saved ${doc.name}` });
    } catch (err) {
      dispatch({ type: "status", text: err instanceof Error ? err.message : "Save failed", error: true });
    }
  }, [doc, dispatch]);

  const onInterpolate = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const interpolate = e.target.value === "smooth";
    dispatch({
      type: "edit",
      label: interpolate ? "Smooth Animation" : "Keyframe Poses",
      apply: (d) => ({ ...d, interpolate }),
    });
  }, [dispatch]);

  const onSpeed = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const speed_scale = Number(e.target.value) / 100;
    dispatch({ type: "edit", label: `Global Motor Speed ${Math.round(speed_scale * 100)}%`,
      apply: (d) => ({ ...d, speed_scale }), undo: false });
  }, [dispatch]);

  const onPasteDoc = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText();
      const d = parseDocument(text);
      dispatch({ type: "load", doc: d, status: `Pasted ${d.name}` });
    } catch {
      dispatch({ type: "status", text: "Paste failed — clipboard does not contain valid JSON", error: true });
    }
  }, [dispatch]);

  return (
    <Panel title="Toolbar" help="overview" area="toolbar">
      <HiddenFile
        ref={fileRef}
        type="file"
        accept=".json,application/json"
        aria-hidden
        tabIndex={-1}
      />
      <Row>
        <Name value={doc.name} onChange={onName} aria-label="Animation name" />
        <select aria-label="Starting point" id="mbStartSelect"
          onChange={(e) => { if (e.target.value) onStart(e.target.value); e.target.value = ""; }}>
          <option value="">Start from…</option>
          {STARTING_POINTS.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}
        </select>
      </Row>
      <Row>
        <button type="button" onClick={onSave}>Save JSON</button>
        <button type="button" onClick={onLoad}>Load JSON</button>
        <button type="button" onClick={onPasteDoc} title="Parse a JSON document from the system clipboard">Paste JSON</button>
        <button type="button" onClick={() => dispatch({ type: "undo" })}
          disabled={state.undo.length === 0} title="Undo (Ctrl+Z)">Undo</button>
        <button type="button" onClick={() => dispatch({ type: "redo" })}
          disabled={state.redo.length === 0} title="Redo (Ctrl+Y)">Redo</button>
      </Row>
      <Row>
        <label style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
          <select
            aria-label="Motion between keyframes"
            value={doc.interpolate !== false ? "smooth" : "poses"}
            onChange={onInterpolate}
          >
            <option value="smooth">Smooth Animation</option>
            <option value="poses">Keyframe Poses</option>
          </select>
        </label>
        <label style={{ display: "inline-flex", alignItems: "center", gap: 6, flex: "0 1 33%", maxWidth: "33%", minWidth: 120 }}>
          Global Motor Speed %
          <input type="range" min={10} max={100} step={5}
            value={Math.round((doc.speed_scale ?? 1) * 100)} onChange={onSpeed}
            style={{ flex: 1, minWidth: 0, width: "100%" }} />
          <Pct>{Math.round((doc.speed_scale ?? 1) * 100)}%</Pct>
        </label>
      </Row>
    </Panel>
  );
}
