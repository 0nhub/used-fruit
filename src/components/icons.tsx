export function StoreLogo({ className }: { className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src="/logo.png" alt="" className={className} aria-hidden />
  );
}

export function LocationIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 21s6.5-5.2 6.5-11a6.5 6.5 0 1 0-13 0C5.5 15.8 12 21 12 21Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="10" r="2.25" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

export function SearchIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="11" cy="11" r="6.25" stroke="currentColor" strokeWidth="1.4" />
      <path d="M16 16.5 20 20.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

export function HeartIcon({ className, filled }: { className?: string; filled?: boolean }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} aria-hidden>
      <path
        d="M12 20s-6.2-3.8-8.4-7.2C1.8 10.2 2.4 6.8 5.2 5.6 7.2 4.8 9.3 5.5 12 8c2.7-2.5 4.8-3.2 6.8-2.4 2.8 1.2 3.4 4.6 1.6 7.2C18.2 16.2 12 20 12 20Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function MoreIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <circle cx="6" cy="12" r="1.5" />
      <circle cx="12" cy="12" r="1.5" />
      <circle cx="18" cy="12" r="1.5" />
    </svg>
  );
}

export function ArchiveIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M3.5 4.75h17v3.4h-17v-3.4Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path
        d="M5 8.15h14v10.6a1.1 1.1 0 0 1-1.1 1.1H6.1A1.1 1.1 0 0 1 5 18.75V8.15Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path d="M10 13.25h4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

export function MuteIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M6.2 9.6v4.8h3.1L14 19.2V4.8L9.3 9.6H6.2Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path d="m16.4 9.4 4.2 5.2M20.6 9.4l-4.2 5.2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

export function BanIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="8.25" stroke="currentColor" strokeWidth="1.4" />
      <path d="M6.15 17.85 17.85 6.15" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

export function TrashIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M5 7.5h14" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <path
        d="M9.2 7.5V5.8A1.3 1.3 0 0 1 10.5 4.5h3a1.3 1.3 0 0 1 1.3 1.3v1.7"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <path
        d="M6.6 7.5 7.4 19a1.2 1.2 0 0 0 1.2 1.1h6.8A1.2 1.2 0 0 0 16.6 19l.8-11.5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ShareIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 13.5V4M12 4 8.6 7.4M12 4l3.4 3.4"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M7 10H6.2A2.2 2.2 0 0 0 4 12.2v6.6A2.2 2.2 0 0 0 6.2 21h11.6a2.2 2.2 0 0 0 2.2-2.2v-6.6A2.2 2.2 0 0 0 17.8 10H17"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function MessageIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4.5 6.5h15v10.2a1.3 1.3 0 0 1-1.3 1.3H8.2L4.5 21V6.5Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path d="M8 10.5h8M8 13.5h5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

export function ProfileIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="8.2" r="3.1" stroke="currentColor" strokeWidth="1.4" />
      <path
        d="M5.2 18.8c.8-2.8 3.2-4.5 6.8-4.5s6 1.7 6.8 4.5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function SettingsIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M5 8h14M5 12h14M5 16h14" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <circle cx="9" cy="8" r="1.6" fill="currentColor" />
      <circle cx="15" cy="12" r="1.6" fill="currentColor" />
      <circle cx="11" cy="16" r="1.6" fill="currentColor" />
    </svg>
  );
}

export function LogoutIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M10 5.5H6.8A1.8 1.8 0 0 0 5 7.3v9.4a1.8 1.8 0 0 0 1.8 1.8H10"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <path
        d="M10 12h9M16.2 8.8 19.5 12l-3.3 3.2"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function LoginIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M14 5.5h3.2A1.8 1.8 0 0 1 19 7.3v9.4a1.8 1.8 0 0 1-1.8 1.8H14"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <path
        d="M14 12H5M8.8 8.8 5.5 12l3.3 3.2"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function MacBookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect
        x="5.4"
        y="4.2"
        width="13.2"
        height="8.6"
        rx="1.2"
        stroke="currentColor"
        strokeWidth="1.4"
      />
      <rect
        x="2.2"
        y="14.6"
        width="19.6"
        height="4"
        rx="1"
        stroke="currentColor"
        strokeWidth="1.4"
      />
      <path d="M10 16.2h4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

export function PlusIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

export function MegaphoneIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 10.5v3c0 .8.6 1.5 1.4 1.5H7l6 4.2V5.3L7 9.5H5.4C4.6 9.5 4 10 4 10.5Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path d="M17.2 9.2a3.2 3.2 0 0 1 0 5.6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

export function MenuIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

export function CloseIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

export function ExternalLinkIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M10 6H7.5A2.5 2.5 0 0 0 5 8.5v8A2.5 2.5 0 0 0 7.5 19h8a2.5 2.5 0 0 0 2.5-2.5V14"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <path
        d="M13 5h6v6M19 5l-8 8"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function MedalIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="13.5" r="5.25" stroke="currentColor" strokeWidth="1.4" />
      <path d="M9.2 8.6 8 3.8h8L14.8 8.6" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M10.6 13.5h2.8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

export function ThumbUpIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M8 20V10.5L12.2 4.6c.4-.6 1.3-.4 1.4.3l.4 3.4h4.1c1.2 0 2.1 1.1 1.9 2.3l-1 6.2c-.2 1-.9 1.7-1.9 1.7H8Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path d="M8 10.5H5.6A1.6 1.6 0 0 0 4 12.1V18.4A1.6 1.6 0 0 0 5.6 20H8" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

export function ThumbDownIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M16 4v9.5L11.8 19.4c-.4.6-1.3.4-1.4-.3l-.4-3.4H5.9c-1.2 0-2.1-1.1-1.9-2.3l1-6.2C5.2 6.2 5.9 5.5 6.9 5.5H16Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path d="M16 13.5h2.4A1.6 1.6 0 0 0 20 11.9V5.6A1.6 1.6 0 0 0 18.4 4H16" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

export function ChevronIcon({ className, open }: { className?: string; open?: boolean }) {
  return (
    <svg
      className={`${className ?? ""} transition-transform ${open ? "rotate-180" : ""}`}
      viewBox="0 0 12 12"
      fill="none"
      aria-hidden
    >
      <path d="M2.5 4.25 6 7.75l3.5-3.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}
