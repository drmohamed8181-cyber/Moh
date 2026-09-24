"use client";

import { useState, type DragEvent } from "react";

// Drag-to-reorder for the admin lists (native HTML drag and drop, so it works
// with a mouse; phones and keyboards use the up/down buttons next to it).
// `onMove(from, to)` gets list positions; the caller moves and saves.
export function useDragReorder(ids: string[], onMove: (from: number, to: number) => void, disabled = false) {
  const [dragId, setDragId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);

  const end = () => {
    setDragId(null);
    setOverId(null);
  };

  const rowProps = (id: string) => ({
    draggable: !disabled,
    onDragStart: (e: DragEvent) => {
      e.dataTransfer.effectAllowed = "move";
      // Firefox only starts a drag when some data is set.
      e.dataTransfer.setData("text/plain", id);
      setDragId(id);
    },
    onDragOver: (e: DragEvent) => {
      if (!dragId) return;
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      if (overId !== id) setOverId(id);
    },
    onDrop: (e: DragEvent) => {
      e.preventDefault();
      const from = dragId ? ids.indexOf(dragId) : -1;
      const to = ids.indexOf(id);
      end();
      if (from !== -1 && to !== -1 && from !== to) onMove(from, to);
    },
    onDragEnd: end,
  });

  // Classes for a row: faded while it is being dragged, highlighted as the drop target.
  const rowClass = (id: string) =>
    dragId === id ? "opacity-40" : overId === id && dragId ? "bg-primary-50 ring-2 ring-inset ring-primary-300" : "";

  return { rowProps, rowClass };
}

/** `items` with the entry at `from` moved to `to`. */
export function moveItem<T>(items: T[], from: number, to: number): T[] {
  const next = [...items];
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved);
  return next;
}
