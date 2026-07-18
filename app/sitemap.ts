import type { MetadataRoute } from "next";
import { archives } from "@/content/archives";
import { artists } from "@/content/artists";
import { events } from "@/content/events";
import { siteConfig } from "@/content/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = ["", "/events", "/archive", "/about", "/contact", "/privacy", "/terms"];
  const routes = [
    ...staticRoutes,
    ...events.filter((event) => !event.draft).map((event) => `/events/${event.slug}`),
    ...archives.map((entry) => `/archive/${entry.slug}`),
    ...artists.map((artist) => `/artists/${artist.slug}`),
  ];

  return routes.map((route) => ({
    url: `${siteConfig.canonicalBase}${route}`,
    changeFrequency: route === "" || route === "/events" ? "weekly" : "monthly",
  }));
}
