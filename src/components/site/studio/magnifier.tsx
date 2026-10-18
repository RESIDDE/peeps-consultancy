import { cn } from "@/lib/utils";

/** Bezel graduations, the detail that makes it read as an instrument rather than an icon. */
const TICKS = Array.from({ length: 72 }, (_, i) => i * 5);

/**
 * Trig is rounded before it reaches the DOM. Math.sin/Math.cos precision is
 * implementation-defined, so Node and the browser can disagree in the last digit and React
 * reports a hydration mismatch on every tick. Two decimals is far finer than a pixel here.
 */
const place = (n: number) => Math.round(n * 100) / 100;

/** Glass geometry in viewBox units, exported so a lens can be laid over the real glass. */
export const VIEW = 620;
export const CX = 230;
export const CY = 205;
export const R_GLASS = 150;
const R_OUTER = 182;

/**
 * The hero magnifier, drawn rather than photographed: the reference uses a 3D render and
 * there is no artwork in this project. Everything is vector, so it stays crisp at any size
 * and costs one request.
 */
export function Magnifier({ className, children }: { className?: string; children?: React.ReactNode }) {
  return (
    <div className={cn("relative", className)}>
      <svg viewBox="0 0 620 620" className="h-auto w-full" role="img" aria-label="A magnifying glass, inviting you to pick it up">
        <defs>
          <linearGradient id="mg-chrome" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#f2f2f4" />
            <stop offset="35%" stopColor="#9a9aa2" />
            <stop offset="55%" stopColor="#dcdce0" />
            <stop offset="100%" stopColor="#6e6e76" />
          </linearGradient>
          <linearGradient id="mg-bezel" x1="0.2" y1="0" x2="0.8" y2="1">
            <stop offset="0%" stopColor="#3a3a40" />
            <stop offset="45%" stopColor="#141417" />
            <stop offset="100%" stopColor="#2b2b31" />
          </linearGradient>
          <linearGradient id="mg-grip" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#0c0c0e" />
            <stop offset="30%" stopColor="#3a3a42" />
            <stop offset="55%" stopColor="#141418" />
            <stop offset="100%" stopColor="#09090b" />
          </linearGradient>
          <linearGradient id="mg-band" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#8f8f98" />
            <stop offset="40%" stopColor="#ececf0" />
            <stop offset="100%" stopColor="#7c7c85" />
          </linearGradient>
          <radialGradient id="mg-glass" cx="0.38" cy="0.3" r="0.85">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="60%" stopColor="#ebebe9" />
            <stop offset="100%" stopColor="#d9d9d6" />
          </radialGradient>
          <radialGradient id="mg-dot" cx="0.35" cy="0.3" r="0.75">
            <stop offset="0%" stopColor="#ff8d85" />
            <stop offset="45%" stopColor="#ff3e3e" />
            <stop offset="100%" stopColor="#c62828" />
          </radialGradient>
          <filter id="mg-shadow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="18" />
          </filter>
          <filter id="mg-soft" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="6" />
          </filter>
        </defs>

        {/* Cast shadow, offset down-right to match the light coming from upper left */}
        <g filter="url(#mg-shadow)" opacity="0.22">
          <ellipse cx={CX + 36} cy={CY + 46} rx={R_OUTER - 6} ry={R_OUTER - 18} fill="#121214" />
          <rect x={CX - 18} y={CY + 190} width="56" height="250" rx="28" fill="#121214" transform={`rotate(-45 ${CX} ${CY})`} />
        </g>

        {/* Handle, swung down to the right out of the lens */}
        <g transform={`rotate(-45 ${CX} ${CY})`}>
          <rect x={CX - 27} y={CY + 158} width="54" height="44" rx="12" fill="url(#mg-band)" />
          <rect x={CX - 25} y={CY + 192} width="50" height="232" rx="25" fill="url(#mg-grip)" />
          <rect x={CX - 25} y={CY + 206} width="50" height="15" rx="7" fill="#ff3e3e" />
          {[250, 282, 314, 346].map((dy) => (
            <rect key={dy} x={CX - 25} y={CY + dy} width="50" height="5" rx="2.5" fill="#b9b9c1" opacity="0.65" />
          ))}
          <rect x={CX - 23} y={CY + 400} width="46" height="26" rx="13" fill="url(#mg-band)" />
        </g>

        {/* Lens */}
        <circle cx={CX} cy={CY} r={R_OUTER} fill="url(#mg-chrome)" />
        <circle cx={CX} cy={CY} r={R_OUTER - 10} fill="url(#mg-bezel)" />
        <circle cx={CX} cy={CY} r={R_GLASS} fill="url(#mg-glass)" />

        {/* Graduations around the inside of the bezel */}
        <g stroke="#f4f4f2" strokeLinecap="round">
          {TICKS.map((deg) => {
            const major = deg % 15 === 0;
            const a = (deg * Math.PI) / 180;
            const r1 = R_GLASS + 4;
            const r2 = R_GLASS + (major ? 17 : 10);
            return (
              <line
                key={deg}
                x1={place(CX + Math.cos(a) * r1)}
                y1={place(CY + Math.sin(a) * r1)}
                x2={place(CX + Math.cos(a) * r2)}
                y2={place(CY + Math.sin(a) * r2)}
                strokeWidth={major ? 2.4 : 1.2}
                opacity={major ? 0.95 : 0.55}
              />
            );
          })}
        </g>

        {/* The thin red ring just inside the glass */}
        <circle cx={CX} cy={CY} r={R_GLASS - 9} fill="none" stroke="#ff3e3e" strokeWidth="2.5" />

        {/* Specular sweep across the glass */}
        <path
          d={`M ${CX - 112} ${CY - 86} A 140 140 0 0 1 ${CX + 52} ${CY - 136}`}
          fill="none"
          stroke="#ffffff"
          strokeWidth="26"
          strokeLinecap="round"
          opacity="0.75"
          filter="url(#mg-soft)"
        />

        {/* The dot you are invited to pick up, and the nudge toward it */}
        <circle cx={CX} cy={CY + 24} r="20" fill="url(#mg-dot)" />
        <path
          d={`M ${CX + 20} ${CY + 46} l 22 22 m 0 0 l -1 -15 m 1 15 l -15 -1`}
          fill="none"
          stroke="#ff3e3e"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      {/* Whatever is shown through the lens. Positioned in percentages so it stays locked to
          the glass at any rendered size, and clipped to the glass circle. */}
      {children ? (
        <div
          className="glass-well"
          style={{
            left: `${place(((CX - R_GLASS) / VIEW) * 100)}%`,
            top: `${place(((CY - R_GLASS) / VIEW) * 100)}%`,
            width: `${place(((R_GLASS * 2) / VIEW) * 100)}%`,
            height: `${place(((R_GLASS * 2) / VIEW) * 100)}%`,
          }}
        >
          {children}
        </div>
      ) : null}

      {/* Set in HTML rather than SVG so it uses the display face and scales with the page */}
      <span
        aria-hidden
        className="font-display pointer-events-none absolute text-center font-semibold leading-[1.05] text-[color:var(--accent)]"
        style={{
          left: `${place((CX / VIEW) * 100)}%`,
          top: `${place(((CY - 34) / VIEW) * 100)}%`,
          transform: "translate(-50%, -100%)",
          zIndex: 2,
          fontSize: "clamp(1rem, 2.1vw, 1.75rem)",
        }}
      >
        Pick
        <br />
        me up.
      </span>
    </div>
  );
}
