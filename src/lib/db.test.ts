import { describe, expect, it, vi } from "vitest";

describe("connectDb", () => {
  it("throws a clear error when MONGODB_URI is missing", async () => {
    const original = process.env.MONGODB_URI;
    vi.resetModules();
    process.env.MONGODB_URI = "";
    const { connectDb } = await import("@/lib/db");

    await expect(connectDb()).rejects.toThrow("Please define the MONGODB_URI environment variable");
    if (original === undefined) {
      delete process.env.MONGODB_URI;
    } else {
      process.env.MONGODB_URI = original;
    }
  });
});
