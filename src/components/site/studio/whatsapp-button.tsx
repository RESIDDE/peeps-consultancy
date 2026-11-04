import { WHATSAPP_NUMBER } from "@/lib/services";

/**
 * The floating chat button the brief asks for on every page. It opens a WhatsApp chat with
 * PEEPs, with an opening line already written so the first message says where it came from.
 *
 * PEEPs is supplying the number: set NEXT_PUBLIC_WHATSAPP to it in international form
 * without the plus, e.g. 2348012345678. Without it the button does not render, rather than
 * pointing people at a chat that does not exist.
 *
 * It is marked data-lens-omit so the hero's magnifier does not carry a copy of it around
 * the page, and it sits above the nav's own stacking so nothing covers it.
 */
export function WhatsAppButton() {
  if (!WHATSAPP_NUMBER) return null;
  const href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Hello PEEPs, I have a question about ")}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      data-lens-omit
      aria-label="Chat with PEEPs on WhatsApp"
      className="group fixed bottom-5 right-5 z-50 flex size-14 items-center justify-center rounded-full bg-[#25d366] text-white shadow-[0_12px_30px_-8px_rgb(0_0_0/0.5)] transition-transform duration-300 hover:scale-105 active:scale-95 sm:bottom-7 sm:right-7"
    >
      {/* WhatsApp's own mark. Lucide has no brand icons, so it is drawn here. */}
      <svg aria-hidden viewBox="0 0 24 24" fill="currentColor" className="size-7">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.149-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884a9.82 9.82 0 0 1 6.988 2.896 9.83 9.83 0 0 1 2.893 6.994c-.003 5.45-4.437 9.886-9.885 9.886m8.413-18.297A11.8 11.8 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.9 11.9 0 0 0 5.688 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.82 11.82 0 0 0-3.48-8.413Z" />
      </svg>
      <span className="pointer-events-none absolute right-full mr-3 hidden whitespace-nowrap rounded-full bg-[#0b0c0f] px-3.5 py-2 text-xs text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100 sm:block">
        Chat with PEEPs
      </span>
    </a>
  );
}
