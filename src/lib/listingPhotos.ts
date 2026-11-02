const DB_NAME = "used-fruit";
const STORE = "listing-photos";

export const LISTING_PHOTO_LIMIT = 8;

export function listingPhotoUrl(id: string) {
  return `/api/v1/media/${id}`;
}

export function listingCoverUrl(listing: { photoUrls?: string[]; photoIds?: string[] }) {
  if (listing.photoUrls?.[0]) return listing.photoUrls[0];
  if (listing.photoIds?.[0]) return listingPhotoUrl(listing.photoIds[0]);
  return undefined;
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(STORE)) request.result.createObjectStore(STORE);
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveListingPhotoFiles(files: File[]) {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).put(files, "pending");
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
}

export async function readListingPhotoFiles(): Promise<File[]> {
  const db = await openDb();
  const files = await new Promise<File[]>((resolve, reject) => {
    const tx = db.transaction(STORE, "readonly");
    const request = tx.objectStore(STORE).get("pending");
    request.onsuccess = () => resolve(Array.isArray(request.result) ? request.result.filter((file) => file instanceof File) : []);
    request.onerror = () => reject(request.error);
  });
  db.close();
  return files;
}

export async function clearListingPhotoFiles() {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).delete("pending");
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
}

export async function uploadListingPhoto(file: File): Promise<string> {
  const type = file.type === "image/jpg" ? "image/jpeg" : file.type;
  if (!["image/jpeg", "image/png", "image/webp"].includes(type)) {
    throw new Error("Bitte wähle JPEG, PNG oder WebP.");
  }
  const response = await fetch("/api/v1/media", {
    method: "POST",
    credentials: "same-origin",
    headers: { "Content-Type": type },
    body: file,
  });
  const data = (await response.json().catch(() => null)) as { id?: string; error?: { message?: string } } | null;
  if (!response.ok || typeof data?.id !== "string") {
    throw new Error(data?.error?.message ?? "Das Bild konnte nicht hochgeladen werden.");
  }
  return data.id;
}
