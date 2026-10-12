"use client";

import { useEffect, useRef, useState } from "react";

export type RecordItem = Record<string, unknown>;

type RecordDialogProps = {
  title: string;
  item: RecordItem;
  hiddenKeys?: string[];
  onClose: () => void;
  onSave?: (updated: RecordItem) => void;
  onDelete?: () => void;
};

const titleCase = (key: string) =>
  key.replace(/([a-z0-9])([A-Z])/g, "$1 $2").replace(/[_-]+/g, " ").replace(/^./, (letter) => letter.toUpperCase());

function fieldValue(value: unknown) {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "object") return JSON.stringify(value, null, 2);
  return String(value);
}

/**
 * RecordDialog — row details with Edit / Delete (confirmed) / Cancel.
 * Opens from a table row click; Escape closes, Enter/Space activate controls.
 */
export default function RecordDialog({ title, item, hiddenKeys = [], onClose, onSave, onDelete }: RecordDialogProps) {
  const [draft, setDraft] = useState<RecordItem>(item);
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const dialog = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") { event.preventDefault(); onClose(); }
    };
    document.addEventListener("keydown", onKey);
    dialog.current?.querySelector("button")?.focus();
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const keys = Object.keys(item).filter((key) => !hiddenKeys.includes(key));

  const save = () => { onSave?.(draft); setEditing(false); };
  const remove = () => { onDelete?.(); onClose(); };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <div ref={dialog} role="dialog" aria-modal="true" aria-label={title} className="max-h-[85vh] w-[min(44rem,95vw)] overflow-auto rounded-xl border border-white/10 bg-[#0b1424] p-6 shadow-2xl">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-cyan-400">{editing ? "Edit record" : "Record details"}</span>
            <h3 className="mt-1 text-lg font-semibold text-white">{title}</h3>
          </div>
          <button type="button" aria-label="Cancel" className="rounded border border-white/10 px-3 py-1 text-sm text-gray-300 hover:bg-white/5" onClick={onClose}>×</button>
        </div>

        <div className="space-y-2">
          {keys.map((key) => (
            <div key={key} className="grid grid-cols-[minmax(9rem,32%)_1fr] gap-4 border-b border-white/[0.05] py-2 text-sm">
              <span className="font-medium text-gray-400">{titleCase(key)}</span>
              {editing && typeof item[key] !== "object" ? (
                <input
                  className="w-full rounded border border-white/15 bg-black/30 px-2 py-1 text-white outline-none focus:border-cyan-500"
                  value={draft[key] === null || draft[key] === undefined ? "" : String(draft[key])}
                  onChange={(event) => setDraft((current) => ({ ...current, [key]: event.target.value }))}
                />
              ) : (
                <span className="whitespace-pre-wrap break-words text-gray-200">{fieldValue(draft[key])}</span>
              )}
            </div>
          ))}
        </div>

        {confirmDelete && (
          <div role="alert" className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">
            <strong>Delete this record?</strong>
            <p className="mt-1 text-xs text-red-200/80">This removes the row from the current view. The API does not persist deletions.</p>
            <div className="mt-3 flex gap-2">
              <button type="button" className="rounded bg-red-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-400" onClick={remove}>Delete record</button>
              <button type="button" className="rounded border border-white/10 px-3 py-1.5 text-sm text-gray-300 hover:bg-white/5" onClick={() => setConfirmDelete(false)}>Cancel deletion</button>
            </div>
          </div>
        )}

        <div className="mt-5 flex flex-wrap gap-2">
          {editing ? (
            <button type="button" className="rounded bg-cyan-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-cyan-500" onClick={save} disabled={!onSave}>Save changes</button>
          ) : (
            <button type="button" className="rounded bg-cyan-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-cyan-500" onClick={() => { setDraft(item); setEditing(true); }} disabled={!onSave}>Edit</button>
          )}
          {!editing && <button type="button" className="rounded border border-red-500/40 px-3 py-1.5 text-sm font-medium text-red-300 hover:bg-red-500/10" onClick={() => setConfirmDelete(true)} disabled={!onDelete}>Delete</button>}
          <button type="button" className="rounded border border-white/10 px-3 py-1.5 text-sm text-gray-300 hover:bg-white/5" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
