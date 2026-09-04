import type { RankId } from "@/lib/reputation";

function strokeProps(className?: string) {
  return {
    className,
    viewBox: "0 0 24 24",
    fill: "none" as const,
    "aria-hidden": true as const,
  };
}

export function RankIcon({ id, className }: { id: RankId; className?: string }) {
  const props = strokeProps(className);
  switch (id) {
    case "bauer":
      return (
        <svg {...props}>
          <path d="M4.6 18.6h14.8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          <path
            d="M8.4 18.6c0-3.2 1.2-6.4 3.6-8.4 2.4 2 3.6 5.2 3.6 8.4"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinejoin="round"
          />
          <path d="M12 10.2V6.4M10.2 7.6 12 6.2l1.8 1.4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "haendler":
      return (
        <svg {...props}>
          <path
            d="M7.4 10.4c0-2.6 2-4.6 4.6-4.6s4.6 2 4.6 4.6"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
          <path
            d="M6 10.4h12l-1.2 8.2H7.2L6 10.4Z"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "kaufmann":
      return (
        <svg {...props}>
          <path d="M5 9.2 12 5.6 19 9.2" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
          <path d="M6.2 9.2h11.6V19H6.2z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
          <path d="M10.4 19v-5.2h3.2V19" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
        </svg>
      );
    case "grosshaendler":
      return (
        <svg {...props}>
          <rect x="4.2" y="12.4" width="7.2" height="6.4" rx="0.8" stroke="currentColor" strokeWidth="1.4" />
          <rect x="12.6" y="12.4" width="7.2" height="6.4" rx="0.8" stroke="currentColor" strokeWidth="1.4" />
          <rect x="8.4" y="5.2" width="7.2" height="6.4" rx="0.8" stroke="currentColor" strokeWidth="1.4" />
        </svg>
      );
    case "handelsmagnat":
      return (
        <svg {...props}>
          <path d="M5 19V10.6L12 5.6l7 5V19" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
          <path d="M9.2 19v-5.4h5.6V19" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
          <path d="M5 19h14" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
      );
    case "mogul":
      return (
        <svg {...props}>
          <path
            d="M4.6 18.4 9.2 9.6l2.8 4.4 3-6.6 4.4 11"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          <path d="M4.4 18.4h15.2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
      );
    default:
      return null;
  }
}

export function StatusMedalIcon({ id, className }: { id: string; className?: string }) {
  const props = strokeProps(className);
  switch (id) {
    case "erstes-inserat":
      return (
        <svg {...props}>
          <path
            d="M12 20.2c-3.4-1.8-5.6-4.8-5.6-8.2C6.4 8.2 8.8 6 12 8.2 15.2 6 17.6 8.2 17.6 12c0 3.4-2.2 6.4-5.6 8.2Z"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinejoin="round"
          />
          <path d="M12 8.2V5.4M12 5.4c.8-.2 1.8.2 2.2 1" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
      );
    case "anbieter":
      return (
        <svg {...props}>
          <path
            d="M8.2 10.4c0-2.2 1.7-4 3.8-4s3.8 1.8 3.8 4"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
          <path
            d="M5.6 10.4h12.8l-.7 6.8c-.2 1.3-1.3 2.2-2.6 2.2H8.9c-1.3 0-2.4-.9-2.6-2.2l-.7-6.8Z"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinejoin="round"
          />
          <circle cx="9.6" cy="13.8" r="1" stroke="currentColor" strokeWidth="1.2" />
          <circle cx="12" cy="13.4" r="1" stroke="currentColor" strokeWidth="1.2" />
          <circle cx="14.4" cy="13.8" r="1" stroke="currentColor" strokeWidth="1.2" />
        </svg>
      );
    case "vielseitig":
      return (
        <svg {...props}>
          <rect x="4.6" y="8" width="14.8" height="10.4" rx="1.1" stroke="currentColor" strokeWidth="1.4" />
          <path d="M4.6 11.4h14.8M9.4 8v10.4M14.6 8v10.4" stroke="currentColor" strokeWidth="1.3" />
          <circle cx="7.4" cy="14.6" r=".85" fill="currentColor" />
          <circle cx="12" cy="14.2" r=".85" fill="currentColor" />
          <circle cx="16.6" cy="14.6" r=".85" fill="currentColor" />
        </svg>
      );
    case "erster-verkauf":
      return (
        <svg {...props}>
          <path
            d="M7.2 13.2c1.4-1.2 3-1.8 4.8-1.8s3.4.6 4.8 1.8"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
          <path d="M8.4 13.2v5.2M15.6 13.2v5.2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          <circle cx="8.4" cy="10.2" r="1.6" stroke="currentColor" strokeWidth="1.4" />
          <circle cx="15.6" cy="10.2" r="1.6" stroke="currentColor" strokeWidth="1.4" />
        </svg>
      );
    case "haendler":
      return (
        <svg {...props}>
          <path d="M4.6 9.4 12 5.8l7.4 3.6" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
          <path d="M5.4 9.4h13.2v2.2H5.4z" stroke="currentColor" strokeWidth="1.4" />
          <path d="M6.6 11.6V19M17.4 11.6V19M5 19h14" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
      );
    case "erster-kauf":
      return (
        <svg {...props}>
          <path
            d="M12 20c-3.2-1.7-5.2-4.5-5.2-7.7C6.8 8.6 9 6.6 12 8.6c.6-1.2 1.6-1.8 2.6-1.8 2 0 3.4 1.8 3.4 5.5 0 1.2-.3 2.5-.8 3.7"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          <path d="M12 8.6V5.8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
      );
    case "stammkaeufer":
      return (
        <svg {...props}>
          <path
            d="M8.4 10.6c0-2 1.6-3.6 3.6-3.6s3.6 1.6 3.6 3.6"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
          <path
            d="M6 10.6h12l-1.1 7.4H7.1L6 10.6Z"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinejoin="round"
          />
          <path d="M10 14.2h4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
      );
    case "gut-bewertet":
      return (
        <svg {...props}>
          <path
            d="M10.4 16.6c-1.6.7-3.2.3-4-1.2-.8-1.6.1-3.3 1.8-4.1 1.2-.5 2.4-.2 3.2.6.8-.8 2-1.1 3.2-.6 1.7.8 2.6 2.5 1.8 4.1-.8 1.5-2.4 1.9-4 1.2"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinejoin="round"
          />
          <path d="M12 11.8V20" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          <path d="M9.6 7.2c.6-1.2 1.6-2 2.4-2s1.8.8 2.4 2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
      );
    case "vertrauenswuerdig":
      return (
        <svg {...props}>
          <circle cx="12" cy="13" r="6.4" stroke="currentColor" strokeWidth="1.4" />
          <path
            d="M12 8.4c1.6 1.2 2.6 2.8 2.6 4.6S13.6 16.4 12 17.6c-1.6-1.2-2.6-2.8-2.6-4.6S10.4 9.6 12 8.4Z"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "makellos":
      return (
        <svg {...props}>
          <path
            d="M12 20.2c-3.4-1.8-5.6-4.8-5.6-8.2C6.4 8.2 8.8 6 12 8.2 15.2 6 17.6 8.2 17.6 12c0 3.4-2.2 6.4-5.6 8.2Z"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinejoin="round"
          />
          <path d="M9.6 13.2 11.4 15l3.2-3.6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    default:
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="6.2" stroke="currentColor" strokeWidth="1.4" />
        </svg>
      );
  }
}
