/**
 * Clones the page into a container so a lens can show it magnified.
 *
 * No browser API magnifies live DOM, so a copy is the only reliable route. Taken once per
 * pick-up rather than per frame: moving the glass afterwards is then pure transform.
 */
export function takeSnapshot(into: HTMLElement | null) {
  const source = document.querySelector<HTMLElement>(".studio");
  if (!source || !into) return;

  const copy = source.cloneNode(true) as HTMLElement;

  // cloneNode copies a <canvas> element but not its bitmap, so anything drawn into one —
  // the folder artwork, for instance — would magnify as a blank rectangle. Paint them
  // across before anything is removed, while the two trees still line up index for index.
  const drawn = source.querySelectorAll("canvas");
  const blank = copy.querySelectorAll("canvas");
  for (let i = 0; i < drawn.length; i++) {
    const from = drawn[i];
    const to = blank[i];
    if (!to || !from.width || !from.height) continue;
    to.width = from.width;
    to.height = from.height;
    to.getContext("2d")?.drawImage(from, 0, 0);
  }

  // Without this a lens would contain itself, and so on.
  copy.querySelectorAll("[data-lens-root]").forEach((el) => el.remove());
  // Fixed overlays would re-anchor to the clone and appear duplicated inside the glass.
  copy.querySelectorAll("[data-lens-omit]").forEach((el) => el.remove());

  // Ids are deliberately left alone. Stripping them breaks every SVG `url(#id)` reference in
  // the copy, and duplicates are harmless here: getElementById resolves in document order so
  // the real page always wins, and the copy is inert and hidden from the accessibility tree.
  // Render the copy as a blueprint. `.studio.xray` already inverts the scope, and its token
  // pair flips with the theme, so the lens always reads as the opposite of the page: a dark
  // disc on a light page, a light one on a dark page.
  copy.classList.add("xray");
  copy.setAttribute("aria-hidden", "true");
  copy.inert = true;
  copy.style.width = `${document.documentElement.clientWidth}px`;

  into.replaceChildren(copy);
}
