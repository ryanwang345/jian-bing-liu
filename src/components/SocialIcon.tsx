import { MapPin } from "lucide-react";
import type { SocialLink } from "@/data/restaurant";

interface SocialIconProps {
  platform: SocialLink["platform"];
  className?: string;
}

export function SocialIcon({
  platform,
  className = "h-4 w-4 shrink-0",
}: SocialIconProps) {
  switch (platform) {
    case "instagram":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.9"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          className={className}
        >
          <rect x="2.5" y="2.5" width="19" height="19" rx="5" />
          <circle cx="12" cy="12" r="4.2" />
          <circle cx="17.6" cy="6.4" r="1" fill="currentColor" stroke="none" />
        </svg>
      );
    case "threads":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.9"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          className={className}
        >
          <path d="M19 12a7 7 0 1 0-2.6 5.4" />
          <path d="M16 12c0-2.4-1.6-4-4-4s-4 1.6-4 4 1.6 4 4 4c1.6 0 2.9-.7 3.5-1.8" />
          <path d="M16 12v1.2a2.3 2.3 0 0 0 4.6 0V12" />
        </svg>
      );
    case "tiktok":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.9"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          className={className}
        >
          <path d="M14 3v11.5a4 4 0 1 1-3-3.87" />
          <path d="M14 3c.7 2.8 2.8 4.8 6 5" />
        </svg>
      );
    case "google-maps":
      return <MapPin className={className} aria-hidden="true" />;
  }
}
