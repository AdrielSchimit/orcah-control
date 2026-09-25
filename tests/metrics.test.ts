import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { bucketByDay } from "../src/lib/metrics";

describe("metrics", () => {
  it("buckets rows by recent day", () => {
    const today = new Date();
    const points = bucketByDay([{ createdAt: today }, { createdAt: today }], 7);
    assert.equal(points.length, 7);
    assert.equal(points.at(-1)?.count, 2);
  });
});
