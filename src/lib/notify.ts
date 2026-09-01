export async function requestMessagePermission(): Promise<boolean> {
  if (typeof window === "undefined" || !("Notification" in window)) return false;
  if (Notification.permission === "granted") return true;
  if (Notification.permission === "denied") return false;
  const result = await Notification.requestPermission();
  return result === "granted";
}

export function canNotifyMessages(): boolean {
  return typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted";
}

export function showMessageNotification(title: string, body: string, url: string) {
  if (!canNotifyMessages()) return;
  try {
    const note = new Notification(title, { body, tag: url });
    note.onclick = () => {
      window.focus();
      window.location.assign(url);
      note.close();
    };
  } catch {
    /* ignore blocked or insecure contexts */
  }
}
