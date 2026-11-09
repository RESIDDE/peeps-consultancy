import Link from "next/link";

/** The ruled list of onward links under a sign-in form: the link, and who it is for. */
export function AuthLinks({ title, items }: { title: string; items: { href: string; label: string; note: string }[] }) {
  return (
    <div className="mt-12 border-t border-border pt-7">
      <p className="label text-muted-foreground">{title}</p>
      <ul className="mt-5">
        {items.map((item) => (
          <li key={item.href} className="hairline last:border-b">
            <Link href={item.href} className="group flex items-baseline justify-between gap-6 py-4">
              <span className="text-[1.05rem] transition-opacity duration-300 group-hover:opacity-60">{item.label}</span>
              <span className="label shrink-0 text-right text-muted-foreground">{item.note}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
