import { existsSync } from "node:fs";
import { join } from "node:path";

/** Screenshot del caso studio (generati da `npm run concept:shots`), se esistono. Solo lato server. */
export function conceptShots(slug: string) {
  const p = (name: string) => `/concept/${slug}/shots/${name}.webp`;
  const has = (name: string) => existsSync(join(process.cwd(), "public", p(name)));
  const names = ["prima-desktop", "prima-mobile", "dopo-desktop", "dopo-mobile"];
  if (!names.every(has)) return null;
  return {
    prima: { desktop: p("prima-desktop"), mobile: p("prima-mobile") },
    dopo: { desktop: p("dopo-desktop"), mobile: p("dopo-mobile") },
  };
}
