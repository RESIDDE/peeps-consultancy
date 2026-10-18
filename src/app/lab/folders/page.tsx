import type { Metadata } from "next";
import GlassFolderCardsDemo from "./demo";

/**
 * A bench for the glass folder component. Deliberately outside the (site) group: the
 * marketing layout wraps everything in the studio scope, whose lens clones the page and
 * whose custom cursor would both get in the way of a component being evaluated.
 */
export const metadata: Metadata = {
  title: "Glass folders",
  robots: { index: false, follow: false },
};

export default function GlassFoldersLabPage() {
  return <GlassFolderCardsDemo />;
}
