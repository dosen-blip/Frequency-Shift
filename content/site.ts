export const siteConfig = {
  name: "Frequency Shift",
  location: "Ottawa, Canada",
  description:
    "An independent Ottawa event platform for forward-facing electronic music, intentional rooms, and community.",
  canonicalBase:
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://frequency-shift.figma.site",
};

export const primaryNavigation = [
  { label: "Events", href: "/events" },
  { label: "Archive", href: "/archive" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
] as const;

export const footerNavigation = [
  ...primaryNavigation,
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
] as const;
