import { describe, expect, it } from "vitest";
import { projectSchema, seoSettingSchema } from "@/lib/validation";

describe("validation schemas", () => {
  it("accepts a valid project payload shaped from the DBML plan", () => {
    const result = projectSchema.parse({
      name: "Villa An Phu",
      slug: "villa-an-phu",
      description: "<p>Content</p>",
      status: "published",
      thumbnailId: "507f1f77bcf86cd799439011",
    });

    expect(result.status).toBe("published");
    expect(result.galleryMediaIds).toEqual([]);
  });

  it("rejects invalid slug and enum values", () => {
    expect(() =>
      projectSchema.parse({
        name: "Villa",
        slug: "Invalid Slug",
        status: "live",
      }),
    ).toThrow();
  });

  it("accepts SEO settings with keywords", () => {
    const result = seoSettingSchema.parse({
      entityType: "page",
      title: "Dự án",
      slug: "du-an",
      focusKeywords: ["kien truc", "noi that"],
    });

    expect(result.focusKeywords).toHaveLength(2);
  });
});
