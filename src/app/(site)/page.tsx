import { DivisionsStack } from "@/components/site/studio/divisions-stack";
import { StudioHero } from "@/components/site/studio/hero";
import { HowItWorks } from "@/components/site/studio/how-it-works";
import { KeyFacts } from "@/components/site/studio/key-facts";
import { SectorGallery } from "@/components/site/studio/sector-gallery";
import { StageArc } from "@/components/site/studio/stage-arc";
import { Statement } from "@/components/site/studio/statement";
import { WordMarquee } from "@/components/site/studio/word-marquee";

/**
 * The landing page runs in a fixed rhythm of dark and light, whatever the theme: dark for
 * the opening, light for the facts and the sectors, dark for the divisions, light for the
 * method, and the footer closes in dark. Each run sets its tone once, on a wrapper, and the
 * nav reads it to pick its own colours.
 */
export default function HomePage() {
  return (
    <>
      {/* One dark run, with no break between them, so the glass leaving the hero is still
          seen travelling behind the statement. */}
      <div data-tone="dark" className="tone-dark haze">
        <StudioHero />
        <Statement />
        <WordMarquee />
      </div>

      <div data-tone="light" className="tone-light wash">
        <KeyFacts />
        <SectorGallery />
      </div>

      <div data-tone="dark" className="tone-dark haze">
        <DivisionsStack />
      </div>

      <div data-tone="light" className="tone-light wash">
        <HowItWorks />
        <StageArc />
      </div>
    </>
  );
}
