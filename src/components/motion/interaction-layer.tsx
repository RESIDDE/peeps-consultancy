"use client";

import { ChapterIndicator } from "./chapter-indicator";
import { Cursor } from "./cursor";
import { Lens } from "./lens";
import { SectionRail } from "@/components/site/section-rail";

/**
 * Every fixed overlay, mounted once as the last child of the site layout. No portal is
 * needed: nothing above it is transformed, filtered or contained, so a fixed child here
 * is already in the root stacking context.
 */
export function InteractionLayer() {
  return (
    <>
      <Cursor />
      <Lens />
      <ChapterIndicator />
      <SectionRail />
    </>
  );
}
