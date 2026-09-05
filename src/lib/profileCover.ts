export function safeProfileCover(value: unknown): string | undefined {
  return typeof value === "string" && value.length <= 450000 && /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(value) ? value : undefined;
}

export async function prepareProfileCover(file: File): Promise<string> {
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 15 * 1024 * 1024) throw new Error("Bitte wähle ein JPG-, PNG- oder WebP-Bild mit maximal 15 MB.");
  const bitmap = await createImageBitmap(file);
  try {
    const canvas = document.createElement('canvas');
    const scale = Math.min(1, 1600 / bitmap.width, 900 / bitmap.height);
    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scale));
    const context = canvas.getContext('2d');
    if (!context) throw new Error("Das Bild konnte nicht verarbeitet werden.");
    context.fillStyle = '#ffffff'; context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    for (const quality of [0.8, 0.6, 0.4, 0.25]) {
      const result = safeProfileCover(canvas.toDataURL('image/jpeg', quality));
      if (result) return result;
    }
    throw new Error("Das Bild ist zu groß. Bitte wähle einen kleineren Ausschnitt.");
  } finally { bitmap.close(); }
}
