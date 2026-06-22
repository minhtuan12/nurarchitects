import { describe, expect, it } from "vitest";
import { Media as FirstMedia } from "@/models";
import { Media as SecondMedia } from "@/models";

describe("model registry", () => {
  it("reuses registered models", () => {
    expect(FirstMedia).toBe(SecondMedia);
  });
});
