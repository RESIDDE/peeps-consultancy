"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import GlassFolder, { type ArtPreset } from "@/components/ui/glass-folder-cards";
import { VERTICALS } from "@/lib/content";

/**
 * The three launch sectors as folders you can open. Files are left without artwork on
 * purpose: a plain sheet reads as a document, which is what a shortlist is made of.
 *
 * Client-side because each folder's menu items carry handlers, which a server component
 * cannot hand across the boundary.
 */
const ART: ArtPreset[] = ["aurora", "glacier", "ember"];
const PLACEMENT = ["bottom-left", "top-left", "top-right"] as const;

export function ShortlistFolders() {
  const router = useRouter();
  const launch = VERTICALS.filter((v) => v.launch);

  return (
    <section data-chapter="Shortlists" className="shell py-24 md:py-32">
      <div className="mb-16 flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div>
          <p className="label">[ What you receive ]</p>
          <h2 className="headline mt-6 max-w-[18ch]">Every shortlist comes with the evidence inside it.</h2>
        </div>
        <Link href="/sectors" className="chars inline-flex shrink-0 items-center gap-2">
          All sectors <ArrowUpRight className="size-4" aria-hidden />
        </Link>
      </div>

      <div className="grid grid-cols-1 items-end justify-items-center gap-x-10 gap-y-10 md:grid-cols-2 xl:grid-cols-3">
        {launch.map((v, i) => (
          <GlassFolder
            key={v.slug}
            label={v.name}
            art={ART[i]}
            seed={3 + i * 8}
            labelPlacement={PLACEMENT[i]}
            action="more"
            appearDelay={i * 140}
            width={300}
            files={v.roles.map((role) => ({ name: role, href: `/sectors/${v.slug}` }))}
            // Every item goes somewhere real. The component's own Open / Close sits above these.
            menu={[
              { label: "View sector", onSelect: () => router.push(`/sectors/${v.slug}`) },
              { label: "Request talent", onSelect: () => router.push("/employers#request") },
              { label: "How we select", onSelect: () => router.push("/how-we-select") },
            ]}
          />
        ))}
      </div>

      <p className="label mt-14 text-center">Hover to lean · Click to open · ··· for options</p>
    </section>
  );
}
