"use client";

import { useSyncExternalStore } from "react";
import { useReducedMotion } from "motion/react";

/** The queries every interactive island asks about, so they are all asking the same one. */
const QUERIES = {
  finePointer: "(pointer: fine) and (hover: hover)",
  wide: "(min-width: 1024px)",
} as const;

type QueryKey = keyof typeof QUERIES;

// MediaQueryList objects and their subscribe functions are cached per query: useSyncExternalStore
// resubscribes whenever the subscribe function's identity changes, so it has to be stable.
const lists = new Map<QueryKey, MediaQueryList>();
const subscribers = new Map<QueryKey, (onChange: () => void) => () => void>();

function listFor(key: QueryKey) {
  let list = lists.get(key);
  if (!list) {
    list = window.matchMedia(QUERIES[key]);
    lists.set(key, list);
  }
  return list;
}

function subscriberFor(key: QueryKey) {
  let subscribe = subscribers.get(key);
  if (!subscribe) {
    subscribe = (onChange: () => void) => {
      const list = listFor(key);
      list.addEventListener("change", onChange);
      return () => list.removeEventListener("change", onChange);
    };
    subscribers.set(key, subscribe);
  }
  return subscribe;
}

/** Never notifies: the snapshot simply differs between server and client, which is the point. */
const neverChanges = () => () => {};

/** Server snapshot is always false: the server cannot know, and guessing would break hydration. */
function useMedia(key: QueryKey) {
  return useSyncExternalStore(
    subscriberFor(key),
    () => listFor(key).matches,
    () => false,
  );
}

/**
 * One answer to "may I animate this, and is there a pointer to animate for?".
 *
 * `mounted` matters: useReducedMotion() returns null on the server, so branching markup on it
 * during the first render changes the tree between server and client. Wait for mount instead,
 * and render the unenhanced markup until then.
 */
export function useMotionEnv() {
  const reduced = useReducedMotion() ?? false;
  const finePointer = useMedia("finePointer");
  const wide = useMedia("wide");
  const mounted = useSyncExternalStore(neverChanges, () => true, () => false);

  return {
    mounted,
    reduced,
    finePointer,
    wide,
    /** Pointer-driven extras: a real pointer, no reduced-motion request, and room to show them. */
    pointerExtras: mounted && !reduced && finePointer && wide,
    /** Scroll choreography: allowed on touch-less wide screens only, and never under reduce. */
    scrollChoreography: mounted && !reduced && wide,
  };
}
