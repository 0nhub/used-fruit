"use client";

export function AppleMark({ className }: { className?: string }) {
  return (
    <svg viewBox="-0.5 0 17 21" className={className} aria-hidden>
      <path
        fill="currentColor"
        d="M13.2 10.6c0-2.4 2-3.6 2.1-3.7-1.1-1.7-2.9-1.9-3.5-1.9-1.5-.2-2.9.9-3.7.9s-1.9-1-3.2-1C3.3 5 1.4 6.2.6 8.1c-1.7 3-.4 7.4 1.2 9.8.8 1.2 1.8 2.5 3 2.4 1.2 0 1.6-.8 3.1-.8s1.8.8 3.2.7c1.3 0 2.2-1.2 3-2.4.9-1.4 1.3-2.7 1.3-2.8-.1 0-2.5-1-2.2-4.4ZM11.1 3.4c.7-.8 1.1-2 1-3.1-1 .1-2.2.7-2.9 1.5-.6.7-1.2 1.9-1 3 1.1.1 2.2-.5 2.9-1.4Z"
      />
    </svg>
  );
}

export function AppleSignInButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-12 w-full max-w-xs items-center justify-center gap-2.5 rounded-full bg-black px-5 text-[15px] font-medium text-white hover:bg-[#1d1d1f]"
    >
      <AppleMark className="block h-5 w-4 shrink-0 -translate-y-px" />
      Mit Apple anmelden
    </button>
  );
}
