"use client";

import type { ComponentProps, CSSProperties, ReactNode } from "react";
import Link from "next/link";
import { GlassButton, GlassSurface } from "@/components/true-glass/true-glass";

export type SiteGlassVariant = "solid" | "light" | "ghost";

type GlassStyle = CSSProperties & Record<`--${string}`, string>;

const frostedStyle: GlassStyle = {
  color: "#050507",
  "--glass-fill": "0.64",
  "--glass-tint": "244, 248, 250",
  "--glass-rim-energy": "0.36",
  "--glass-light-opacity": "0.42",
  "--glass-transmission-opacity": "0.28",
};

const darkGlassStyle: GlassStyle = {
  color: "rgba(255, 255, 255, 0.92)",
  "--glass-fill": "0.24",
  "--glass-tint": "12, 10, 17",
  "--glass-rim-energy": "0.42",
};

function classes(variant: SiteGlassVariant, className?: string) {
  return [
    "button",
    `button--${variant}`,
    "site-glass-button",
    `site-glass-button--${variant === "ghost" ? "dark" : "frosted"}`,
    className,
  ].filter(Boolean).join(" ");
}

function Material({ variant, children }: { variant: SiteGlassVariant; children: ReactNode }) {
  const frosted = variant !== "ghost";
  return (
    <GlassSurface
      className="site-glass-button__material"
      tone={frosted ? "clear" : "smoked"}
      depth={frosted ? "deep" : "shallow"}
      radius="999px"
      displacementScale={frosted ? 23 : 28}
      aberrationIntensity={frosted ? 0.68 : 0.78}
      elasticity={0.24}
      blurAmount={frosted ? 12 : 7}
      saturation={frosted ? 118 : 150}
      style={frosted ? frostedStyle : darkGlassStyle}
    >
      {children}
    </GlassSurface>
  );
}

type SiteGlassLinkProps = ComponentProps<typeof Link> & {
  variant?: SiteGlassVariant;
};

export function SiteGlassLink({
  children,
  className,
  variant = "ghost",
  ...props
}: SiteGlassLinkProps) {
  return (
    <Link className={classes(variant, className)} {...props}>
      <Material variant={variant}>{children}</Material>
    </Link>
  );
}

type SiteGlassAnchorProps = ComponentProps<"a"> & {
  variant?: SiteGlassVariant;
};

export function SiteGlassAnchor({
  children,
  className,
  variant = "ghost",
  ...props
}: SiteGlassAnchorProps) {
  return (
    <a className={classes(variant, className)} {...props}>
      <Material variant={variant}>{children}</Material>
    </a>
  );
}

type SiteGlassButtonProps = ComponentProps<typeof GlassButton> & {
  variant?: SiteGlassVariant;
};

export function SiteGlassButton({
  children,
  className,
  variant = "ghost",
  ...props
}: SiteGlassButtonProps) {
  const frosted = variant !== "ghost";
  return (
    <GlassButton
      className={`${classes(variant, className)} site-glass-control`}
      tone={frosted ? "clear" : "smoked"}
      depth={frosted ? "deep" : "shallow"}
      displacementScale={frosted ? 23 : 28}
      aberrationIntensity={frosted ? 0.68 : 0.78}
      elasticity={0.24}
      blurAmount={frosted ? 12 : 7}
      saturation={frosted ? 118 : 150}
      style={frosted ? frostedStyle : darkGlassStyle}
      {...props}
    >
      {children}
    </GlassButton>
  );
}
