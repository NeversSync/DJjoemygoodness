import { parseDocument, safeName, serializeDocument } from "../core/document";
import type { MotionBuilderDocument } from "../core/types";

type PickerWindow = Window & {
  showSaveFilePicker?: (o: object) => Promise<FileSystemFileHandle>;
};

const JSON_TYPES = [{ description: "Motion Builder JSON", accept: { "application/json": [".json"] } }];
const isAbort = (e: unknown) => e instanceof DOMException && e.name === "AbortError";

export const fileNameFor = (doc: MotionBuilderDocument) => `${safeName(doc.name)}.json`;

/** Save via the native picker when available (Chromium), else a download (Safari / iPad). Resolves false if cancelled. */
export async function saveDocumentFile(doc: MotionBuilderDocument, win: PickerWindow = window): Promise<boolean> {
  const text = serializeDocument(doc);
  const name = fileNameFor(doc);
  const blob = new Blob([text], { type: "application/json;charset=utf-8" });
  if (win.showSaveFilePicker) {
    try {
      const handle = await win.showSaveFilePicker({ suggestedName: name, types: JSON_TYPES });
      const stream = await handle.createWritable();
      await stream.write(blob);
      await stream.close();
      return true;
    } catch (e) {
      if (isAbort(e)) return false;
      throw e;
    }
  }
  // Keep the blob URL alive long enough for the browser to finish the download.
  // Revoking on the next tick (0ms) can produce empty / truncated files.
  const url = URL.createObjectURL(blob);
  const a = Object.assign(win.document.createElement("a"), { href: url, download: name });
  win.document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
  return true;
}

/**
 * Open a JSON file via a DOM file input (works on Chrome, Safari, and iPad).
 * Pass an existing <input type="file"> from React when available (best user-gesture chain).
 */
export function pickJsonFile(input?: HTMLInputElement | null, win: PickerWindow = window): Promise<File | null> {
  return new Promise((resolve) => {
    if (input) {
      const onChange = () => {
        input.removeEventListener("change", onChange);
        resolve(input.files?.[0] ?? null);
        input.value = "";
      };
      input.addEventListener("change", onChange);
      input.click();
      return;
    }
    const el = Object.assign(win.document.createElement("input"), {
      type: "file",
      accept: ".json,application/json",
    });
    el.style.cssText = "position:fixed;left:-9999px;top:0;width:1px;height:1px;opacity:0";
    win.document.body.appendChild(el);
    const cleanup = () => { try { win.document.body.removeChild(el); } catch { /* gone */ } };
    el.addEventListener("change", () => { resolve(el.files?.[0] ?? null); cleanup(); });
    el.addEventListener("cancel", () => { resolve(null); cleanup(); });
    el.click();
  });
}

/** Open and validate a Motion Builder JSON file. Resolves null if cancelled; throws on invalid files. */
export async function openDocumentFile(
  input?: HTMLInputElement | null,
  win: PickerWindow = window,
): Promise<MotionBuilderDocument | null> {
  const file = await pickJsonFile(input, win);
  if (!file) return null;
  if (file.size === 0) throw new Error("File is empty — re-save the JSON and try again.");
  return parseDocument(await file.text());
}
