import { InteractionProvider } from "@/components/motion/interaction-provider";
import { SmoothScroll } from "@/components/motion/smooth-scroll";
import { StudioNav } from "@/components/site/studio/nav";
import { StudioFooter } from "@/components/site/studio/footer";

/** Marketing pages stay static; the header discovers a session client-side. */
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <InteractionProvider>
      <div className="studio">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
        >
          Skip to content
        </a>
        <StudioNav />
        <main id="main">{children}</main>
        <StudioFooter />
        <SmoothScroll />
      </div>
    </InteractionProvider>
  );
}
