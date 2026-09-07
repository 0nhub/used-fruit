import { createId } from "@/lib/format";
import { BLOCKED_STORAGE_KEY, MUTED_STORAGE_KEY, PROFILE_EVENT } from "@/lib/profile";
import type { Listing } from "@/lib/types";

export const MESSAGES_STORAGE_KEY = "used-fruit-messages";

export type OfferStatus = "pending" | "accepted" | "declined";

export interface ChatMessage {
  id: string;
  sequence?: string;
  at: string;
  author: "buyer" | "seller";
  kind: "text" | "offer" | "accept" | "decline";
  text?: string;
  price?: number;
}

export interface Thread {
  id: string;
  sellerId?: string;
  buyerId?: string;
  muted?: boolean;
  unreadCount?: number;
  readSequence?: string;
  listingId: string;
  listingTitle: string;
  listingPrice: number;
  sellerName: string;
  sellerEmoji: string;
  buyerName: string;
  buyerEmoji: string;
  offer?: { id?: string; senderId?: string; resolvedAt?: string; price: number; status: OfferStatus };
  messages: ChatMessage[];
  updatedAt: string;
  archived?: boolean;
}

export function personKey(name: string) {
  return name.trim().toLowerCase();
}

function notify() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(PROFILE_EVENT));
}

export function readThreads(): Thread[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(MESSAGES_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as Thread[]) : [];
  } catch {
    return [];
  }
}

function writeThreads(threads: Thread[]) {
  localStorage.setItem(MESSAGES_STORAGE_KEY, JSON.stringify(threads));
  notify();
  return threads;
}

export function threadIdFor(listingId: string, buyerName: string) {
  return `th-${listingId}-${buyerName.trim().toLowerCase().replace(/\s+/g, "-") || "gast"}`;
}

/** Bestehende Konversation zu diesem Inserat, sonst die jüngste mit demselben Anbieter. */
export function findThreadForListing(threads: Thread[], listing: Listing): Thread | undefined {
  const forListing = threads.find((thread) => thread.listingId === listing.id);
  if (forListing) return forListing;
  const seller = personKey(listing.sellerName);
  return threads
    .filter((thread) => personKey(thread.sellerName) === seller)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0];
}

export function upsertThread(input: {
  listing: Listing;
  sellerEmoji: string;
  buyerName: string;
  buyerEmoji: string;
}): Thread {
  const threads = readThreads();
  const id = threadIdFor(input.listing.id, input.buyerName);
  const existing = threads.find((thread) => thread.id === id);
  if (existing) {
    if (existing.archived && !isNameBlocked(input.listing.sellerName) && !isNameBlocked(input.buyerName)) {
      return setThreadArchived(existing.id, false) ?? existing;
    }
    return existing;
  }
  const next: Thread = {
    id,
    listingId: input.listing.id,
    listingTitle: input.listing.title,
    listingPrice: input.listing.price,
    sellerName: input.listing.sellerName,
    sellerEmoji: input.sellerEmoji,
    buyerName: input.buyerName,
    buyerEmoji: input.buyerEmoji,
    messages: [],
    updatedAt: new Date().toISOString(),
  };
  writeThreads([next, ...threads]);
  return next;
}

export function appendMessage(
  threadId: string,
  message: Omit<ChatMessage, "id" | "at">,
  offer?: Thread["offer"],
): Thread | undefined {
  const threads = readThreads();
  const index = threads.findIndex((thread) => thread.id === threadId);
  if (index < 0) return undefined;
  const nextMessage: ChatMessage = {
    ...message,
    id: createId("msg"),
    at: new Date().toISOString(),
  };
  const current = threads[index];
  const updated: Thread = {
    ...current,
    messages: [...current.messages, nextMessage],
    offer: offer ?? current.offer,
    updatedAt: nextMessage.at,
  };
  const next = [...threads];
  next.splice(index, 1);
  writeThreads([updated, ...next]);
  return updated;
}

export function setOfferStatus(threadId: string, status: OfferStatus, author: "buyer" | "seller") {
  const threads = readThreads();
  const thread = threads.find((item) => item.id === threadId);
  if (!thread?.offer) return undefined;
  const updated = appendMessage(
    threadId,
    {
      author,
      kind: status === "accepted" ? "accept" : "decline",
      price: thread.offer.price,
    },
    { ...thread.offer, status },
  );
  if (status === "accepted" && updated) {
    declineOtherOffers(updated.listingId, updated.id);
  }
  return updated;
}

export function readBlocked(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(BLOCKED_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : [];
  } catch {
    return [];
  }
}

export function isNameBlocked(name: string) {
  const key = personKey(name);
  return Boolean(key) && readBlocked().includes(key);
}

function writeBlocked(names: string[]) {
  localStorage.setItem(BLOCKED_STORAGE_KEY, JSON.stringify([...new Set(names)]));
  notify();
  return names;
}

export function setThreadArchived(threadId: string, archived: boolean) {
  const threads = readThreads();
  const index = threads.findIndex((thread) => thread.id === threadId);
  if (index < 0) return undefined;
  const updated = { ...threads[index], archived };
  const next = [...threads];
  next[index] = updated;
  writeThreads(next);
  return updated;
}

export function deleteThread(threadId: string) {
  writeThreads(readThreads().filter((thread) => thread.id !== threadId));
}

export function blockPerson(name: string) {
  const key = personKey(name);
  if (!key) return;
  writeBlocked([...readBlocked(), key]);
  writeThreads(
    readThreads().map((thread) =>
      personKey(thread.buyerName) === key || personKey(thread.sellerName) === key
        ? { ...thread, archived: true }
        : thread,
    ),
  );
}

export function unblockPerson(name: string) {
  const key = personKey(name);
  writeBlocked(readBlocked().filter((item) => item !== key));
  writeThreads(
    readThreads().map((thread) =>
      personKey(thread.buyerName) === key || personKey(thread.sellerName) === key
        ? { ...thread, archived: false }
        : thread,
    ),
  );
}

export function readMuted(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(MUTED_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : [];
  } catch {
    return [];
  }
}

function writeMuted(names: string[]) {
  localStorage.setItem(MUTED_STORAGE_KEY, JSON.stringify([...new Set(names)]));
  notify();
  return names;
}

export function isNameMuted(name: string) {
  const key = personKey(name);
  return Boolean(key) && readMuted().includes(key);
}

export function mutePerson(name: string) {
  const key = personKey(name);
  if (!key) return;
  writeMuted([...readMuted(), key]);
}

export function unmutePerson(name: string) {
  const key = personKey(name);
  writeMuted(readMuted().filter((item) => item !== key));
}

export function declineOtherOffers(listingId: string, exceptThreadId: string) {
  const pending = readThreads().filter(
    (thread) =>
      thread.listingId === listingId &&
      thread.id !== exceptThreadId &&
      thread.offer?.status === "pending",
  );
  for (const thread of pending) {
    appendMessage(
      thread.id,
      {
        author: "seller",
        kind: "decline",
        price: thread.offer?.price,
        text: "Das Gerät ist bereits verkauft.",
      },
      thread.offer ? { ...thread.offer, status: "declined" } : undefined,
    );
  }
}
