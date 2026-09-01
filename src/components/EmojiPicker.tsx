"use client";

import { EMOJI_GROUPS, searchEmojis } from "@/data/emojis";
import { extractAvatarEmoji } from "@/lib/profile";
import { useEffect, useMemo, useRef, useState } from "react";

export function EmojiPicker({
  open,
  onClose,
  onPick,
}: {
  open: boolean;
  onClose: () => void;
  onPick: (emoji: string) => void;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [groupId, setGroupId] = useState(EMOJI_GROUPS[0].id);

  const groups = useMemo(() => searchEmojis(query), [query]);
  const activeGroup = groups.find((g) => g.id === groupId) ?? groups[0];

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) onClose();
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    const frame = window.requestAnimationFrame(() => searchRef.current?.focus());
    return () => window.cancelAnimationFrame(frame);
  }, [open]);

  useEffect(() => {
    if (groups.length === 0) return;
    if (!groups.some((g) => g.id === groupId)) setGroupId(groups[0].id);
  }, [groups, groupId]);

  if (!open) return null;

  return (
    <div
      ref={rootRef}
      role="dialog"
      aria-label="Emoji auswählen"
      className="absolute left-0 top-full z-30 mt-2 w-[min(calc(100vw-2rem),22rem)] overflow-hidden rounded-2xl border border-uf-border-soft bg-white shadow-[0_12px_40px_rgba(0,0,0,0.12)]"
    >
      <div className="border-b border-uf-border-soft p-2.5">
        <input
          ref={searchRef}
          className="h-9 w-full rounded-lg border border-uf-border bg-uf-bg-subtle px-3 text-[13px] outline-none"
          value={query}
          placeholder="Suchen"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div className="flex gap-0.5 overflow-x-auto border-b border-uf-border-soft px-2 py-1.5">
        {(query.trim() ? groups : EMOJI_GROUPS).map((group) => {
          const active = activeGroup?.id === group.id;
          return (
            <button
              key={group.id}
              type="button"
              title={group.label}
              aria-label={group.label}
              onClick={() => setGroupId(group.id)}
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[16px] ${
                active ? "bg-uf-bg-subtle" : "hover:bg-uf-bg-subtle/70"
              }`}
            >
              {group.icon}
            </button>
          );
        })}
      </div>

      <div className="uf-scroll-hidden max-h-56 overflow-y-auto p-2">
        {activeGroup ? (
          <div className="grid grid-cols-8 gap-0.5">
            {activeGroup.items.map((item) => (
              <button
                key={`${activeGroup.id}-${item.e}`}
                type="button"
                title={item.k}
                onClick={() => {
                  const parsed = extractAvatarEmoji(item.e);
                  if (!parsed) return;
                  onPick(parsed);
                  setQuery("");
                  onClose();
                }}
                className="flex h-9 w-full items-center justify-center rounded-lg text-[20px] leading-none hover:bg-uf-bg-subtle"
              >
                {item.e}
              </button>
            ))}
          </div>
        ) : (
          <p className="px-2 py-6 text-center text-[13px] text-uf-text-tertiary">
            Kein Emoji gefunden.
          </p>
        )}
      </div>
    </div>
  );
}
