"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import "lenis/dist/lenis.css";

let lenis: Lenis | null = null;

/** The running instance, for the few places that have to pause it (an open menu). */
export function getLenis() {
  return lenis;
}

/**
 * Eased wheel scrolling for the marketing site. Lenis still drives the native scroll
 * position, so sticky sections and scroll-linked MotionValues keep working untouched.
 * Touch keeps the platform's own scrolling, and reduced motion keeps all of it native.
 */
export function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    lenis = new Lenis({ autoRaf: true, anchors: true, lerp: 0.1 });
    return () => {
      lenis?.destroy();
      lenis = null;
    };
  }, []);
  return null;
}
