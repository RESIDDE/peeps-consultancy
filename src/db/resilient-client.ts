// Recycling connections only narrows the window: a socket dropped mid-idle (laptop asleep, wifi
// change, a proxy culling the whole pool at once) still sits in the pool looking healthy, so the
// reset surfaces on whichever query next picks it up rather than on the one that lost it.
// postgres.js discards the dead connection as it throws, so a second attempt opens a fresh socket.
// Reads only: a write may have committed before the reset reached us, and replaying it on a new
// connection would apply it twice.
const TRANSIENT = new Set(["ECONNRESET", "EPIPE", "ETIMEDOUT", "CONNECTION_CLOSED", "CONNECTION_DESTROYED", "CONNECTION_ENDED"]);
const WRITE_KEYWORD = /\b(?:insert|update|delete|merge|truncate|create|alter|drop|grant|revoke)\b/i;

// The driver reports the reset as the `cause` of a "Failed query" error, so the chain is walked.
export function isTransient(error: unknown) {
  for (let cause: unknown = error, hops = 0; cause instanceof Error && hops < 5; cause = cause.cause, hops++) {
    if (TRANSIENT.has((cause as NodeJS.ErrnoException).code ?? "")) return true;
  }
  return false;
}

// `with` can wrap a writing CTE, so a read has to be free of write keywords too. Misreading a read
// as a write only costs it the retry; the reverse would duplicate data.
export const isReadOnly = (query: string) => /^\s*(?:select|with)\b/i.test(query) && !WRITE_KEYWORD.test(query);

type PendingQuery = PromiseLike<unknown> & { values: () => PromiseLike<unknown> };
type Unsafe = (query: string, params?: unknown[], options?: unknown) => PendingQuery;

// Drizzle either awaits `unsafe(...)` or awaits `unsafe(...).values()`, so the retry stays dormant
// until one of those settles it, and runs the query once per call however often it is awaited.
function retryingRead(run: (asValues: boolean) => PromiseLike<unknown>) {
  let asValues = false;
  let started: Promise<unknown> | undefined;
  const exec = () =>
    (started ??= Promise.resolve(run(asValues)).catch((error) => {
      if (!isTransient(error)) throw error;
      return run(asValues);
    }));

  const pending: PendingQuery = {
    values() {
      asValues = true;
      return pending;
    },
    then: (onFulfilled, onRejected) => exec().then(onFulfilled, onRejected),
  };
  return pending;
}

/** Wraps a postgres.js client so read queries survive a connection the pool did not know was dead. */
export function withReadRetry<T extends object>(client: T): T {
  return new Proxy(client, {
    get(target, property) {
      const value = Reflect.get(target, property);
      if (property !== "unsafe") return typeof value === "function" ? value.bind(target) : value;

      return (query: string, params?: unknown[], options?: unknown) => {
        const attempt = (asValues: boolean) => {
          const pending = (value as Unsafe).call(target, query, params, options);
          return asValues ? pending.values() : pending;
        };
        return isReadOnly(query) ? retryingRead(attempt) : attempt(false);
      };
    },
  });
}
