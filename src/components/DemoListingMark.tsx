export function DemoListingMark({ compact = false }: { compact?: boolean }) {
  return (
    <>
      <span className="sr-only">Demo-Inserat, kein echtes Angebot</span>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[1] flex items-center justify-center overflow-hidden [container-type:size]"
      >
        <span
          className="whitespace-nowrap font-medium tracking-[0.14em] text-uf-text/40"
          style={{
            transform: "rotate(-34deg)",
            fontSize: compact ? "8px" : "clamp(16px, 11cqmin, 40px)",
          }}
        >
          Demo Inserat
        </span>
      </div>
    </>
  );
}
