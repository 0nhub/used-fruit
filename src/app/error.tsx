"use client";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center px-4 text-center">
      <h1 className="text-[28px] font-semibold text-uf-text">Seite konnte nicht geladen werden</h1>
      <p className="mt-2 text-[14px] text-uf-text-secondary">
        Bitte erneut versuchen oder zur Übersicht zurückgehen.
      </p>
      <div className="mt-5 flex gap-3">
        <button
          type="button"
          onClick={reset}
          className="h-10 rounded-full bg-uf-text px-5 text-[14px] font-medium text-white"
        >
          Erneut versuchen
        </button>
        <a
          href="/"
          className="inline-flex h-10 items-center rounded-full border border-uf-border px-5 text-[14px]"
        >
          Zur Übersicht
        </a>
      </div>
    </div>
  );
}
