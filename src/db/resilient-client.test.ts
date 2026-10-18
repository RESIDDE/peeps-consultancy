import { describe, expect, it } from "vitest";
import { isReadOnly, isTransient, withReadRetry } from "./resilient-client";

const reset = () => Object.assign(new Error("read ECONNRESET"), { code: "ECONNRESET" });
// Shaped like what the driver surfaces: a "Failed query" error with the socket error as its cause.
const failedQuery = () => new Error("Failed query: select ...", { cause: reset() });

/** Stands in for postgres.js: lazy, resolves on await, and records every attempt. */
function fakeClient(respond: (attempt: number, asValues: boolean) => unknown) {
  const queries: string[] = [];
  const client = {
    options: { parsers: {}, serializers: {} },
    end: () => "ended",
    unsafe(query: string) {
      queries.push(query);
      const attempt = queries.length;
      let asValues = false;
      const pending = {
        values() {
          asValues = true;
          return pending;
        },
        then: (ok: (v: unknown) => unknown, err: (e: unknown) => unknown) =>
          Promise.resolve().then(() => respond(attempt, asValues)).then(ok, err),
      };
      return pending;
    },
  };
  return { client: withReadRetry(client), queries };
}

describe("transient connection errors", () => {
  it("finds the socket error through the cause chain", () => {
    expect(isTransient(failedQuery())).toBe(true);
    expect(isTransient(reset())).toBe(true);
    expect(isTransient(Object.assign(new Error("syntax"), { code: "42601" }))).toBe(false);
    expect(isTransient(new Error("plain"))).toBe(false);
  });
});

describe("read detection", () => {
  it("accepts reads and rejects anything that writes", () => {
    expect(isReadOnly('select "employers"."id" from "employers"')).toBe(true);
    expect(isReadOnly("  WITH recent AS (select 1) select * from recent")).toBe(true);
    expect(isReadOnly('insert into "employers" values ($1)')).toBe(false);
    expect(isReadOnly('with moved as (delete from "a" returning *) select * from moved')).toBe(false);
    expect(isReadOnly('update "employers" set "name" = $1')).toBe(false);
  });
});

describe("withReadRetry", () => {
  it("retries a read once and returns the second result", async () => {
    const { client, queries } = fakeClient((attempt) => {
      if (attempt === 1) throw failedQuery();
      return [{ id: "ok" }];
    });
    await expect(client.unsafe("select 1")).resolves.toEqual([{ id: "ok" }]);
    expect(queries).toHaveLength(2);
  });

  it("preserves .values() across the retry", async () => {
    const { client } = fakeClient((attempt, asValues) => {
      if (attempt === 1) throw failedQuery();
      return asValues ? [["ok"]] : [{ id: "ok" }];
    });
    await expect(client.unsafe("select 1").values()).resolves.toEqual([["ok"]]);
  });

  it("runs the query once when it succeeds", async () => {
    const { client, queries } = fakeClient(() => [{ id: "ok" }]);
    await client.unsafe("select 1");
    expect(queries).toHaveLength(1);
  });

  it("runs the query once however often the result is awaited", async () => {
    const { client, queries } = fakeClient(() => [{ id: "ok" }]);
    const pending = client.unsafe("select 1");
    await Promise.all([pending, pending, pending]);
    expect(queries).toHaveLength(1);
  });

  it("does not retry a write", async () => {
    const { client, queries } = fakeClient(() => {
      throw failedQuery();
    });
    await expect(client.unsafe("insert into employers values ($1)")).rejects.toThrow("Failed query");
    expect(queries).toHaveLength(1);
  });

  it("does not retry an error the connection did not cause", async () => {
    const { client, queries } = fakeClient(() => {
      throw Object.assign(new Error("syntax error"), { code: "42601" });
    });
    await expect(client.unsafe("select bogus")).rejects.toThrow("syntax error");
    expect(queries).toHaveLength(1);
  });

  it("surfaces the error when the retry also fails", async () => {
    const { client, queries } = fakeClient(() => {
      throw failedQuery();
    });
    await expect(client.unsafe("select 1")).rejects.toThrow("Failed query");
    expect(queries).toHaveLength(2);
  });

  it("passes other client members straight through", () => {
    const { client } = fakeClient(() => []);
    expect(client.options).toEqual({ parsers: {}, serializers: {} });
    expect(client.end()).toBe("ended");
  });
});
