export const siteConfig = {
  name: "Frequency Shift",
  location: "Ottawa, Canada",
  description:
    "For the love of house: raw underground energy, self-expression, and community on Ottawa dancefloors.",
  canonicalBase:
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://dosen-blip.github.io/Frequency-Shift",
  instagram: {
    handle: "@frequency___shift",
    href: "https://www.instagram.com/frequency___shift/",
  },
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
