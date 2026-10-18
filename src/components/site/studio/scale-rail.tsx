/**
 * The graduated rules down both edges. On the reference they stand in for the scrollbar
 * and frame the page. Values are viewport pixels from the top, so they never update on scroll.
 */
const MINOR = 8;
const MAJOR = 64;
const HEIGHT = 1600;

function Rule({ side }: { side: "left" | "right" }) {
  const ticks = Array.from({ length: Math.floor(HEIGHT / MINOR) + 1 }, (_, i) => i * MINOR);
  const edge = side === "left" ? { left: 0 } : { right: 0 };

  return (
    <div
      aria-hidden
      data-lens-omit
      className="pointer-events-none fixed top-0 z-30 hidden h-dvh w-12 select-none overflow-hidden lg:block"
      style={edge}
    >
      {ticks.map((y) => {
        const major = y % MAJOR === 0 && y > 0;
        return (
          <div key={y} className="absolute" style={{ top: y, ...edge }}>
            <span
              className="block bg-foreground/25"
              style={{ width: major ? 10 : 5, height: 1, marginLeft: side === "right" ? (major ? 38 : 43) : 0 }}
            />
            {/* Only the left rule is numbered, as on the reference; two columns of numerals
                either side of the page would read as data rather than as a measure. */}
            {major && side === "left" && (
              <span
                className="absolute left-3.5 top-0 font-mono text-[0.625rem] leading-none text-foreground/35"
                style={{ transform: "translateY(-50%)" }}
              >
                {y}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

export function ScaleRail() {
  return (
    <>
      <Rule side="left" />
      <Rule side="right" />
    </>
  );
}
