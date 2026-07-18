import type { Metadata } from "next";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { SiteMotion } from "@/components/site-motion";
import { siteConfig } from "@/content/site";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: `${siteConfig.name} — ${siteConfig.location}`,
    template: `%s — ${siteConfig.name}`,
  },
  description: siteConfig.description,
  icons: {
    icon: "/media/figma/fs-logo.png",
    shortcut: "/media/figma/fs-logo.png",
  },
  openGraph: {
    title: siteConfig.name,
    description: siteConfig.description,
    type: "website",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `if(!Object.hasOwn){Object.hasOwn=function(object,key){return Object.prototype.hasOwnProperty.call(Object(object),key)}}if(!Array.prototype.at){Array.prototype.at=function(index){index=Math.trunc(index)||0;if(index<0)index+=this.length;return this[index]}}if(!String.prototype.replaceAll){String.prototype.replaceAll=function(search,replacement){if(search instanceof RegExp){if(!search.global)throw new TypeError("replaceAll requires a global RegExp");return this.replace(search,replacement)}return this.split(search).join(replacement)}}`,
          }}
        />
      </head>
      <body>
        <SiteMotion />
        <a className="skip-link" href="#main-content">
          Skip to content
        </a>
        <SiteHeader />
        <main id="main-content" className="site-main">
          {children}
        </main>
        <SiteFooter />
      </body>
    </html>
  );
}
