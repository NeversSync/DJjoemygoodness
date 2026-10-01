import { useCallback, useEffect, useRef, useState } from "react";
import { setEndFrame } from "../core/edit/keyframes";
import { lastFrame } from "../core/edit/produce";
import { useEditor } from "../state/EditorContext";
import { Panel, Row, Check } from "./Panel";

/**
 * Transport with TriangleDetection-style ping-pong:
 * Play runs start→end then end→start continuously until Stop.
 */
export function Transport({ autoPlay = false }: { autoPlay?: boolean } = {}) {
  const { state, dispatch } = useEditor();
  const { doc, playFrame, prefs } = state;
  const end = lastFrame(doc);
  const kfs = doc.keyframes;
  const [playing, setPlaying] = useState(false);
  const [armedDir, setArmedDir] = useState<1 | -1>(1); // which button started play
  const dirRef = useRef<1 | -1>(1);
  const raf = useRef(0);
  const last = useRef(0);
  const accum = useRef(0);
  const frameRef = useRef(playFrame);
  const endRef = useRef(end);
  /** Draft strings so tablet soft-keyboards can edit without Enter; commit on blur. */
  const [endDraft, setEndDraft] = useState(String(end));
  const [gotoDraft, setGotoDraft] = useState("0");
  useEffect(() => { frameRef.current = playFrame; }, [playFrame]);
  useEffect(() => { endRef.current = end; }, [end]);
  useEffect(() => { setEndDraft(String(end)); }, [end]);

  const seek = useCallback((f: number) => dispatch({ type: "seek", frame: Math.max(0, Math.min(end, f)) }), [dispatch, end]);

  const stepKey = useCallback((dir: 1 | -1) => {
    const frames = kfs.map((k) => k.frame).sort((a, b) => a - b);
    if (prefs.scrubByKeyframe) {
      const cur = frames.findIndex((f) => f >= playFrame + (dir > 0 ? 1 : 0));
      const idx = dir > 0 ? (cur >= 0 ? cur : frames.length - 1) : (cur > 0 ? cur - 1 : 0);
      seek(frames[idx] ?? playFrame);
    } else {
      seek(playFrame + dir);
    }
  }, [kfs, playFrame, prefs.scrubByKeyframe, seek]);

  const startPlay = useCallback((dir: 1 | -1) => {
    dirRef.current = dir;
    setArmedDir(dir);
    setPlaying(true);
  }, []);

  useEffect(() => {
    if (!autoPlay) return;
    startPlay(1);
  }, [autoPlay, startPlay]);

  useEffect(() => {
    if (!playing) return;
    accum.current = 0;
    last.current = 0;
    const fps = doc.fps || 24;
    const rate = prefs.playRate;
    const step = (ts: number) => {
      const dt = last.current ? ts - last.current : 0;
      last.current = ts;
      accum.current += (dt / 1000) * fps * rate * dirRef.current;
      const whole = Math.trunc(accum.current);
      if (whole !== 0) {
        accum.current -= whole;
        let next = frameRef.current + whole;
        const lastFr = endRef.current;
        if (next >= lastFr) {
          next = lastFr;
          dirRef.current = -1;
        } else if (next <= 0) {
          next = 0;
          dirRef.current = 1;
        }
        dispatch({ type: "seek", frame: next });
      }
      raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf.current);
  }, [playing, dispatch, doc.fps, prefs.playRate]);

  const commitEnd = useCallback(() => {
    const val = Math.max(1, parseInt(endDraft, 10) || 1);
    if (val === end) {
      setEndDraft(String(end));
      return;
    }
    dispatch({ type: "edit", label: `End frame ${val}`, apply: (d) => setEndFrame(d, val) });
  }, [dispatch, end, endDraft]);

  const commitGoto = useCallback(() => {
    const val = Math.max(0, parseInt(gotoDraft, 10) || 0);
    seek(val);
    setGotoDraft(String(Math.max(0, Math.min(end, val))));
  }, [end, gotoDraft, seek]);

  const dir = armedDir;

  return (
    <Panel title="Transport" help="transport" area="transport">
      <Row>
        <button type="button" onClick={() => seek(0)} title="Start">⏮</button>
        <button type="button" onClick={() => stepKey(-1)} title="Previous key / frame">|◀</button>
        <button type="button" onClick={() => playing && dir === -1 ? setPlaying(false) : startPlay(-1)}
          title="Play reverse (ping-pong)"
          style={playing && dir === -1 ? { background: "#448aff" } : undefined}>Rev</button>
        <button type="button" onClick={() => setPlaying(false)} title="Stop">■</button>
        <button type="button" onClick={() => playing && dir === 1 ? setPlaying(false) : startPlay(1)}
          title="Play forward (ping-pong)"
          style={playing && dir === 1 ? { background: "#00e676", color: "#000" } : undefined}>▶</button>
        <button type="button" onClick={() => stepKey(1)} title="Next key / frame">▶|</button>
        <button type="button" onClick={() => seek(end)} title="End">⏭</button>
      </Row>
      <Row>
        <input type="range" min={0} max={end} value={playFrame} style={{ flex: 1 }}
          onChange={(e) => seek(Number(e.target.value))} aria-label="Scrub" />
        <span style={{ fontVariantNumeric: "tabular-nums", minWidth: 70 }}>
          {playFrame} / {end}
        </span>
      </Row>
      <Row>
        <Check><input type="checkbox" checked={prefs.scrubByKeyframe}
          onChange={(e) => dispatch({ type: "prefs", patch: { scrubByKeyframe: e.target.checked } })} /> Keys</Check>
        <label style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
          Rate <select value={prefs.playRate} onChange={(e) => dispatch({ type: "prefs", patch: { playRate: Number(e.target.value) } })}>
            {[0.25, 0.5, 1, 2, 4].map((r) => <option key={r} value={r}>{r}×</option>)}
          </select>
        </label>
        <label style={{ display: "inline-flex", alignItems: "center", gap: 4, marginLeft: "auto" }}>
          Go to <input type="number" min={0} max={end} value={gotoDraft}
            style={{ width: 72 }} aria-label="Go to frame"
            onChange={(e) => setGotoDraft(e.target.value)}
            onBlur={commitGoto}
            onKeyDown={(e) => { if (e.key === "Enter") (e.target as HTMLInputElement).blur(); }} />
        </label>
        <label style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
          End <input type="number" min={1} value={endDraft}
            style={{ width: 72 }} aria-label="End frame"
            onChange={(e) => setEndDraft(e.target.value)}
            onBlur={commitEnd}
            onKeyDown={(e) => { if (e.key === "Enter") (e.target as HTMLInputElement).blur(); }} />
        </label>
      </Row>
    </Panel>
  );
}
