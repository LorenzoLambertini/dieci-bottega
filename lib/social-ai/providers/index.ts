import type { Platform } from "../types";
import type { SocialProvider } from "./types";
import { facebookProvider, instagramProvider } from "./meta";
import { linkedinProvider } from "./linkedin";
import { tiktokProvider } from "./tiktok";

export const PROVIDERS: Record<Platform, SocialProvider> = {
  instagram: instagramProvider,
  facebook: facebookProvider,
  linkedin: linkedinProvider,
  tiktok: tiktokProvider,
};

export const PLATFORM_LABEL: Record<Platform, string> = {
  instagram: "Instagram",
  facebook: "Facebook",
  linkedin: "LinkedIn",
  tiktok: "TikTok",
};

/** Variabili d'ambiente necessarie per poter collegare ciascuna piattaforma. */
export function platformConfigured(p: Platform): boolean {
  switch (p) {
    case "instagram":
    case "facebook":
      return !!(process.env.META_APP_ID && process.env.META_APP_SECRET && process.env.META_VERIFY_TOKEN);
    case "linkedin":
      return !!(process.env.LINKEDIN_CLIENT_ID && process.env.LINKEDIN_CLIENT_SECRET);
    case "tiktok":
      return !!(process.env.TIKTOK_CLIENT_KEY && process.env.TIKTOK_CLIENT_SECRET);
  }
}

export type { SocialProvider } from "./types";
