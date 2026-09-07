"use client";

import { RatingPrompt } from "@/components/RatingPrompt";
import { ArchiveIcon, BanIcon, ExternalLinkIcon, MessageIcon, MoreIcon, MuteIcon, TrashIcon } from "@/components/icons";
import { ProductImage } from "@/components/ProductImage";
import { SiteHeader } from "@/components/SiteHeader";
import {
  formatListingHeadline,
  formatMessageDay,
  formatMessageTime,
  formatPrice,
  isSameMessageDay,
} from "@/lib/format";
import { isDemoListing } from "@/lib/listingNumber";
import { type Thread } from "@/lib/messages";
import { canRateThread, daysUntilRating, hasRatedThread } from "@/lib/reputation";
import { INBOX_WIDTH_KEY } from "@/lib/profile";
import { useListings } from "@/lib/useListings";
import { useMessages } from "@/lib/useMessages";
import { useProfile } from "@/lib/useProfile";
import { useReputation } from "@/lib/useReputation";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";

import { currentIdentity } from "@/lib/authClient";
import { useChatPresence } from "@/lib/useChatPresence";
import { showApiError } from "@/lib/apiClient";

type InboxTab = "nachrichten" | "archiv" | "blockiert";

const INBOX_WIDTH_MIN = 220;
const INBOX_WIDTH_MAX = 420;
const INBOX_WIDTH_DEFAULT = 260;

const INBOX_TABS: {
  id: InboxTab;
  label: string;
  Icon: typeof MessageIcon;
}[] = [
  { id: "nachrichten", label: "Nachrichten", Icon: MessageIcon },
  { id: "archiv", label: "Archiv", Icon: ArchiveIcon },
  { id: "blockiert", label: "Blockiert", Icon: BanIcon },
];

function parseInboxTab(value: string | null): InboxTab {
  if (value === "archiv" || value === "blockiert") return value;
  return "nachrichten";
}

function clampInboxWidth(value: number) {
  return Math.min(INBOX_WIDTH_MAX, Math.max(INBOX_WIDTH_MIN, Math.round(value)));
}

function useInboxWidth() {
  const [width, setWidth] = useState(INBOX_WIDTH_DEFAULT);
  const widthRef = useRef(width);
  widthRef.current = width;

  useEffect(() => {
    const stored = Number(localStorage.getItem(INBOX_WIDTH_KEY));
    if (Number.isFinite(stored) && stored > 0) setWidth(clampInboxWidth(stored));
  }, []);

  const startResize = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    event.preventDefault();
    const handle = event.currentTarget;
    const startX = event.clientX;
    const startWidth = widthRef.current;
    handle.setPointerCapture(event.pointerId);
    const previousUserSelect = document.body.style.userSelect;
    document.body.style.userSelect = "none";

    const onMove = (move: PointerEvent) => {
      setWidth(clampInboxWidth(startWidth + move.clientX - startX));
    };
    const onUp = () => {
      handle.releasePointerCapture(event.pointerId);
      document.body.style.userSelect = previousUserSelect;
      localStorage.setItem(INBOX_WIDTH_KEY, String(widthRef.current));
      handle.removeEventListener("pointermove", onMove);
      handle.removeEventListener("pointerup", onUp);
    };
    handle.addEventListener("pointermove", onMove);
    handle.addEventListener("pointerup", onUp);
  };

  return { width, startResize };
}

function counterpartOf(thread: Thread) {
  return thread.sellerId === currentIdentity()?.id
    ? { id: thread.buyerId ?? "", name: thread.buyerName, emoji: thread.buyerEmoji }
    : { id: thread.sellerId ?? "", name: thread.sellerName, emoji: thread.sellerEmoji };
}

function NachrichtenInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedId = searchParams.get("id") ?? searchParams.get("conversation") ?? "";
  const tab = parseInboxTab(searchParams.get("tab"));
  const { width, startResize } = useInboxWidth();
  const { profile, signedIn } = useProfile();
  const { userListings, getListing } = useListings();
  const {
    threads,
    blocked,
    blockedName,
    ready,
    send,
    resolveOffer,
    archiveThread,
    removeThread,
    block,
    unblock,
    isBlocked,
    mute,
    unmute,
    isMuted,
  } = useMessages();
  const { ratings, rate } = useReputation(currentIdentity()?.id);
  const sellerListingIds = useMemo(
    () => new Set(userListings.map((item) => item.id)),
    [userListings],
  );
  const [draft, setDraft] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirm, setConfirm] = useState<"delete" | "block" | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const visible = threads.filter((thread) => {
    const blockedThread = isBlocked(counterpartOf(thread).id);
    if (tab === "blockiert") return blockedThread;
    if (tab === "archiv") return Boolean(thread.archived) && !blockedThread;
    return !thread.archived && !blockedThread;
  });
  const blockedOrphans = blocked.filter(
    (name) =>
      !threads.some((thread) => counterpartOf(thread).id === name),
  );
  const selected = visible.find((thread) => thread.id === selectedId) ?? (selectedId ? undefined : visible[0]);

  useEffect(() => {
    if (!selectedId) return;
    const thread = threads.find((item) => item.id === selectedId);
    if (!thread) return;
    const blockedThread = isBlocked(counterpartOf(thread).id);
    if (blockedThread && tab !== "blockiert") {
      router.push(`/nachrichten?tab=blockiert&id=${encodeURIComponent(thread.id)}`);
    } else if (!blockedThread && thread.archived && tab !== "archiv") {
      router.push(`/nachrichten?tab=archiv&id=${encodeURIComponent(thread.id)}`);
    }
  }, [selectedId, threads, tab, router, isBlocked, sellerListingIds]);

  useEffect(() => {
    if (!menuOpen) return;
    const onPointer = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) setMenuOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        setConfirm(null);
      }
    };
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  useChatPresence(selected?.id, selected?.messages.at(-1)?.id);

  const listing = selected ? getListing(selected.listingId) : undefined;
  const iAmSeller = Boolean(selected && selected.sellerId === currentIdentity()?.id);
  const counterpartName = selected
    ? iAmSeller
      ? selected.buyerName
      : selected.sellerName
    : "";
  const counterpartId = selected ? (iAmSeller ? selected.buyerId : selected.sellerId) ?? "" : "";
  const counterpartBlocked = counterpartId ? isBlocked(counterpartId) : false;
  const counterpartMuted = selected ? isMuted(selected.id) : false;
  const ratingReady =
    Boolean(selected && profile.name.trim()) &&
    canRateThread(selected!, currentIdentity()?.id ?? "", ratings);
  const ratingWaiting =
    Boolean(selected?.offer?.status === "accepted" && profile.name.trim()) &&
    !hasRatedThread(ratings, selected!.id, currentIdentity()?.id ?? "") &&
    !ratingReady;
  const ratingDaysLeft = selected ? daysUntilRating(selected) : 0;

  const title = useMemo(() => {
    if (!selected) return "";
    if (listing) return formatListingHeadline(listing, { includeParts: false });
    return selected.listingTitle.replace(/^Refurbished\s+/, "").replace(/\s+Apple$/, "");
  }, [listing, selected]);

  const openList = (nextTab: InboxTab, id?: string) => {
    const params = new URLSearchParams();
    if (nextTab !== "nachrichten") params.set("tab", nextTab);
    if (id) params.set("id", id);
    const query = params.toString();
    router.push(query ? `/nachrichten?${query}` : "/nachrichten");
  };

  const leaveConversation = (nextTab: InboxTab = tab) => {
    setMenuOpen(false);
    setConfirm(null);
    openList(nextTab);
  };

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center text-uf-text-secondary">
        Laden…
      </div>
    );
  }

  if (!signedIn) {
    return (
      <Shell>
        <div className="mx-auto max-w-lg px-4 py-16 text-center">
          <h1 className="text-[28px] font-semibold">Nachrichten</h1>
          <p className="mt-3 text-[14px] text-uf-text-secondary">
            Melde dich an, um Kaufanfragen und Chats zu sehen.
          </p>
          <a
            href="/anmelden?next=/nachrichten"
            className="mt-6 inline-flex h-10 items-center rounded-full bg-uf-text px-5 text-[14px] text-white"
          >
            Mit Apple anmelden
          </a>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <div className="flex min-h-[calc(100dvh-49px)] w-full">
        <aside
          className={`relative w-full shrink-0 border-b border-uf-border-soft md:w-[var(--inbox-width)] md:border-r md:border-b-0 ${
            selectedId ? "hidden md:block" : ""
          }`}
          style={{ ["--inbox-width" as string]: `${width}px` }}
        >
          <h1 className="sr-only">{INBOX_TABS.find((item) => item.id === tab)?.label}</h1>
          <div className="flex items-center gap-2 px-3 pt-3 pb-2">
            {INBOX_TABS.map((item) => {
              const active = tab === item.id;
              const Icon = item.Icon;
              return (
                <button
                  key={item.id}
                  type="button"
                  aria-label={item.label}
                  aria-current={active ? "page" : undefined}
                  onClick={() => openList(item.id)}
                  className={`inline-flex h-8 shrink-0 items-center justify-center rounded-full text-[13px] font-medium transition-[background-color,color,padding] duration-300 ease-out motion-reduce:transition-none ${active ? "bg-[#0071e3] px-3 text-white" : "bg-[#f2f2f7] px-2 text-[#3a3a3c] hover:bg-[#e8e8ed]"}`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span aria-hidden={!active} className={`overflow-hidden whitespace-nowrap transition-[max-width,opacity,margin] duration-300 ease-out motion-reduce:transition-none ${active ? "ml-1.5 max-w-[110px] opacity-100" : "ml-0 max-w-0 opacity-0"}`}>{item.label}</span>
                </button>
              );
            })}
          </div>
          <div key={tab} className="uf-inbox-enter">
          {visible.length === 0 && (tab !== "blockiert" || blockedOrphans.length === 0) ? (
            <p className="px-4 py-4 text-[13px] text-uf-text-secondary">
              {tab === "archiv"
                ? "Keine archivierten Unterhaltungen."
                : tab === "blockiert"
                  ? "Keine blockierten Nutzer."
                  : "Noch keine Nachrichten. Öffne ein Inserat und tippe auf Kaufen oder Nachricht."}
            </p>
          ) : (
            <ul>
              {visible.map((thread) => {
                const person = counterpartOf(thread);
                return (
                  <li key={thread.id}>
                    <button
                      type="button"
                      onClick={() => openList(tab, thread.id)}
                      className={`flex w-full items-center gap-3 px-4 py-3 text-left ${
                        thread.id === selected?.id ? "bg-uf-bg-subtle" : "hover:bg-uf-bg-subtle/70"
                      }`}
                    >
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-uf-bg-subtle text-[22px] leading-none">
                        {person.emoji}
                      </span>
                      <span className="flex min-w-0 flex-1 items-center gap-1.5">
                        <span className="truncate text-[13px] font-medium">{person.name}</span>
                        {isMuted(person.name) ? (
                          <MuteIcon className="h-3 w-3 shrink-0 text-uf-text-tertiary" />
                        ) : null}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
          {tab === "blockiert" && blockedOrphans.length > 0 ? (
            <ul className={visible.length > 0 ? "border-t border-uf-border-soft" : undefined}>
              {blockedOrphans.map((name) => (
                <li key={name} className="flex items-center justify-between gap-3 px-4 py-3">
                  <span className="truncate text-[13px] font-medium capitalize">{blockedName(name)}</span>
                  <button
                    type="button"
                    onClick={() => unblock(name)}
                    className="shrink-0 text-[12px] text-uf-link"
                  >
                    Freigeben
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
          </div>
          <div
            role="separator"
            aria-orientation="vertical"
            aria-label="Breite der Nachrichtenliste"
            onPointerDown={startResize}
            className="absolute top-0 right-0 hidden h-full w-1.5 cursor-col-resize hover:bg-uf-border-soft md:block"
          />
        </aside>

        <section className={`flex min-h-[420px] min-w-0 flex-1 flex-col ${selectedId ? "" : "hidden md:flex"}`}>
          {!selected ? (
            <div className="flex flex-1 items-center justify-center px-4 text-[14px] text-uf-text-secondary">
              Wähle eine Unterhaltung.
            </div>
          ) : (
            <>
              <header className="flex items-center justify-between gap-3 border-b border-uf-border-soft px-4 py-3">
                <div className="flex min-w-0 items-center gap-3">
                  <Link
                    href={tab === "nachrichten" ? "/nachrichten" : `/nachrichten?tab=${tab}`}
                    className="mr-0.5 text-[13px] text-uf-link md:hidden"
                  >
                    Zurück
                  </Link>
                  {listing?.soldAt ? (
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="h-11 w-[3.6rem] shrink-0 overflow-hidden rounded-[10px] bg-uf-bg-subtle">
                        <ProductImage
                          modelId={listing.modelId}
                          colorId={listing.colorId}
                          alt={title}
                          className="h-full"
                          demo={isDemoListing(listing.id)}
                          compact
                        />
                      </span>
                      <p className="truncate text-[15px] font-medium text-uf-text">{title}</p>
                    </div>
                  ) : (
                    <Link
                      href={`/listing/${encodeURIComponent(selected.listingId)}?nachricht=${encodeURIComponent(selected.id)}&nachrichtenTab=${encodeURIComponent(tab)}`}
                      aria-label={`Inserat öffnen: ${title}`}
                      className="group flex min-w-0 items-center gap-3"
                    >
                      <span className="h-11 w-[3.6rem] shrink-0 overflow-hidden rounded-[10px] bg-uf-bg-subtle">
                        {listing ? (
                          <ProductImage
                            modelId={listing.modelId}
                            colorId={listing.colorId}
                            alt=""
                            className="h-full"
                            demo={isDemoListing(listing.id)}
                            compact
                          />
                        ) : null}
                      </span>
                      <span className="flex min-w-0 items-center gap-1.5">
                        <p className="truncate text-[15px] font-medium text-uf-text">{title}</p>
                        <ExternalLinkIcon className="h-[15px] w-[15px] shrink-0 text-uf-link" />
                      </span>
                    </Link>
                  )}
                </div>
                <div className="relative" ref={menuRef}>
                  <button
                    type="button"
                    aria-label="Unterhaltung"
                    aria-expanded={menuOpen}
                    onClick={() => setMenuOpen((open) => !open)}
                    className="flex h-9 w-9 items-center justify-center rounded-full text-uf-text-secondary hover:bg-uf-bg-subtle hover:text-uf-text"
                  >
                    <MoreIcon className="h-5 w-5" />
                  </button>
                  {menuOpen && (
                    <div
                      role="menu"
                      className="absolute right-0 z-50 mt-1.5 min-w-[232px] overflow-hidden rounded-xl border border-uf-border-soft bg-white py-1 shadow-[0_8px_24px_rgba(0,0,0,0.08)]"
                    >
                      <button
                        type="button"
                        role="menuitem"
                        className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-[13px] text-uf-text hover:bg-uf-bg-subtle"
                        onClick={() => {
                          const restore = Boolean(selected.archived);
                          archiveThread(selected.id, !restore);
                          if (restore) openList("nachrichten", selected.id);
                          else leaveConversation("nachrichten");
                        }}
                      >
                        <ArchiveIcon className="h-4 w-4 shrink-0 text-uf-text-secondary" />
                        {selected.archived ? "Nachricht wiederherstellen" : "Nachricht archivieren"}
                      </button>
                      <button
                        type="button"
                        role="menuitem"
                        className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-[13px] text-uf-text hover:bg-uf-bg-subtle"
                        onClick={() => {
                          setMenuOpen(false);
                          setConfirm("delete");
                        }}
                      >
                        <TrashIcon className="h-4 w-4 shrink-0 text-uf-text-secondary" />
                        Nachricht löschen
                      </button>
                      <button
                        type="button"
                        role="menuitem"
                        className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-[13px] text-uf-text hover:bg-uf-bg-subtle"
                        onClick={() => {
                          setMenuOpen(false);
                          if (counterpartMuted) unmute(selected.id);
                          else mute(selected.id);
                        }}
                      >
                        <MuteIcon className="h-4 w-4 shrink-0 text-uf-text-secondary" />
                        {counterpartMuted ? "Stummschaltung aufheben" : "Nachricht stumm schalten"}
                      </button>
                      <button
                        type="button"
                        role="menuitem"
                        className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-[13px] text-uf-text hover:bg-uf-bg-subtle"
                        onClick={() => {
                          setMenuOpen(false);
                          if (counterpartBlocked) {
                            unblock(counterpartId);
                            openList("nachrichten", selected.id);
                          } else {
                            setConfirm("block");
                          }
                        }}
                      >
                        <BanIcon className="h-4 w-4 shrink-0 text-uf-text-secondary" />
                        {counterpartBlocked ? "Freigeben" : "Nutzer blockieren"}
                      </button>
                    </div>
                  )}
                </div>
              </header>

              {selected.offer && (
                <div
                  className={`px-4 py-3 text-[13px] ${
                    selected.offer.status === "accepted"
                      ? "bg-[#f0f7f1] text-[#1d6b32]"
                      : selected.offer.status === "declined"
                        ? "bg-uf-bg-subtle text-uf-text-secondary"
                        : "bg-[#fff6e5] text-[#8a5a00]"
                  }`}
                >
                  {selected.offer.status === "pending" &&
                    `Offenes Angebot: ${formatPrice(selected.offer.price)}.`}
                  {selected.offer.status === "accepted" &&
                    `Kauf vereinbart für ${formatPrice(selected.offer.price)}. Ihr könnt jetzt Versand oder Abholung klären.`}
                  {selected.offer.status === "declined" &&
                    `Angebot über ${formatPrice(selected.offer.price)} abgelehnt.`}
                  {ratingWaiting && ratingDaysLeft > 0 && (
                    <p className="mt-2 text-[13px] text-[#1d6b32]/80">
                      Bewertung in {ratingDaysLeft === 1 ? "1 Tag" : `${ratingDaysLeft} Tagen`} möglich.
                    </p>
                  )}
                  {selected.offer.status === "pending" && !selected.archived && !counterpartBlocked && (
                    <div className="mt-2 flex gap-2">
                      <button
                        type="button"
                        onClick={() => resolveOffer(selected.id, "accepted", "seller")}
                        className="h-8 rounded-full bg-uf-text px-3 text-[12px] text-white"
                      >
                        Angebot annehmen
                      </button>
                      <button
                        type="button"
                        onClick={() => resolveOffer(selected.id, "declined", "seller")}
                        className="h-8 rounded-full border border-uf-border bg-white px-3 text-[12px] text-uf-text"
                      >
                        Offerte ablehnen
                      </button>
                    </div>
                  )}
                </div>
              )}

              {ratingReady && (
                <RatingPrompt
                  counterpart={counterpartName}
                  onRate={(sentiment) => rate(selected, profile.name, sentiment)}
                />
              )}

              <div className="uf-scroll-hidden flex-1 space-y-3 overflow-y-auto px-4 py-4">
                {selected.messages.map((message, index) => {
                  const mine =
                    (iAmSeller && message.author === "seller") ||
                    (!iAmSeller && message.author === "buyer");
                  const previous = selected.messages[index - 1];
                  const showDay = !previous || !isSameMessageDay(previous.at, message.at);
                  return (
                    <div key={message.id} data-message-sequence={message.sequence}>
                      {showDay && (
                        <p className="mb-3 text-center text-[11px] text-uf-text-tertiary">
                          {formatMessageDay(message.at)}
                        </p>
                      )}
                      <div className={`flex flex-col ${mine ? "items-end" : "items-start"}`}>
                        <div
                          className={`max-w-[80%] rounded-2xl px-3 py-2 text-[14px] ${
                            mine ? "bg-uf-text text-white" : "bg-uf-bg-subtle text-uf-text"
                          }`}
                        >
                          {message.kind === "offer" && (
                            <p className="font-medium">
                              Kaufoption {message.price != null ? formatPrice(message.price) : ""}
                            </p>
                          )}
                          {message.kind === "accept" && <p className="font-medium">Kauf bestätigt</p>}
                          {message.kind === "decline" && <p>Angebot abgelehnt</p>}
                          {message.text && (
                            <p className={message.kind === "text" ? "" : "mt-1 opacity-90"}>{message.text}</p>
                          )}
                        </div>
                        <p className="mt-1 px-1 text-[11px] text-uf-text-tertiary">
                          {formatMessageTime(message.at)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {counterpartBlocked ? (
                <p className="border-t border-uf-border-soft px-4 py-3 text-[13px] text-uf-text-secondary">
                  Dieser Nutzer ist blockiert.
                </p>
              ) : selected.archived ? (
                <div className="flex items-center justify-between gap-3 border-t border-uf-border-soft px-4 py-3">
                  <p className="text-[13px] text-uf-text-secondary">Diese Unterhaltung liegt im Archiv.</p>
                  <button
                    type="button"
                    onClick={() => {
                      archiveThread(selected.id, false);
                      openList("nachrichten", selected.id);
                    }}
                    className="h-8 rounded-full px-3 text-[12px] text-uf-link"
                  >
                    Wiederherstellen
                  </button>
                </div>
              ) : (
                <form
                  className="flex gap-2 border-t border-uf-border-soft px-4 py-3"
                  onSubmit={async (event) => {
                    event.preventDefault();
                    const text = draft.trim();
                    if (!text) return;
                    try { await send(selected.id, {
                      author: iAmSeller ? "seller" : "buyer",
                      kind: "text",
                      text,
                    });
                    setDraft(""); } catch (error) { showApiError(error); }
                  }}
                >
                  <input
                    className="h-10 flex-1 rounded-full border border-uf-border px-4 text-[14px] outline-none"
                    value={draft}
                    placeholder={
                      selected.offer?.status === "accepted"
                        ? "Versand oder Abholung klären…"
                        : "Nachricht schreiben…"
                    }
                    onChange={(e) => setDraft(e.target.value)}
                  />
                  <button
                    type="submit"
                    className="h-10 rounded-full bg-uf-text px-4 text-[13px] text-white"
                  >
                    Senden
                  </button>
                </form>
              )}
            </>
          )}
        </section>
      </div>

      {confirm && selected && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/25 px-4">
          <div
            role="alertdialog"
            className="w-full max-w-sm rounded-2xl bg-white px-5 py-5 shadow-[0_16px_50px_rgba(0,0,0,0.18)]"
          >
            <p className="text-[17px] font-semibold text-uf-text">
              {confirm === "delete" ? "Unterhaltung löschen?" : `${counterpartName} blockieren?`}
            </p>
            <p className="mt-2 text-[14px] text-uf-text-secondary">
              {confirm === "delete"
                ? "Der Verlauf wird entfernt und kann nicht wiederhergestellt werden."
                : "Nachrichten von diesem Nutzer erscheinen unter Blockiert."}
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirm(null)}
                className="h-9 rounded-full px-3 text-[13px] text-uf-text-secondary"
              >
                Abbrechen
              </button>
              <button
                type="button"
                onClick={() => {
                  if (confirm === "delete") {
                    removeThread(selected.id);
                    leaveConversation();
                  } else {
                    block(counterpartId);
                    leaveConversation("blockiert");
                  }
                }}
                className="h-9 rounded-full bg-uf-text px-4 text-[13px] text-white"
              >
                {confirm === "delete" ? "Löschen" : "Blockieren"}
              </button>
            </div>
          </div>
        </div>
      )}
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white">
      <SiteHeader />
      {children}
    </div>
  );
}

export default function NachrichtenPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center text-uf-text-secondary">
          Laden…
        </div>
      }
    >
      <NachrichtenInner />
    </Suspense>
  );
}
