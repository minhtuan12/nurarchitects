import { describe, expect, it } from "vitest";
import {
  mediaToOgImageUrl,
  mediaToUploadFile,
} from "@/components/admin/media/media-upload-file";

describe("mediaToUploadFile", () => {
  it("maps a persisted media item to an Ant Upload file without requiring re-upload", () => {
    const file = mediaToUploadFile({
      _id: "507f1f77bcf86cd799439011",
      originalName: "front elevation.jpg",
      filename: "nur/projects/front-elevation",
      secureUrl:
        "https://res.cloudinary.com/nur/image/upload/v1/nur/projects/front-elevation.jpg",
      url: "http://res.cloudinary.com/nur/image/upload/v1/nur/projects/front-elevation.jpg",
      resourceType: "image",
    });

    expect(file).toMatchObject({
      uid: "507f1f77bcf86cd799439011",
      name: "front elevation.jpg",
      status: "done",
      url: "https://res.cloudinary.com/nur/image/upload/v1/nur/projects/front-elevation.jpg",
      mediaId: "507f1f77bcf86cd799439011",
    });
  });

  it("falls back to filename and url when optional fields are absent", () => {
    const file = mediaToUploadFile({
      _id: "507f1f77bcf86cd799439012",
      filename: "nur/raw/specification",
      url: "https://res.cloudinary.com/nur/raw/upload/specification.pdf",
      resourceType: "raw",
    });

    expect(file.name).toBe("nur/raw/specification");
    expect(file.url).toBe("https://res.cloudinary.com/nur/raw/upload/specification.pdf");
  });
});

describe("mediaToOgImageUrl", () => {
  it("uses secureUrl before url for SEO image fields", () => {
    expect(
      mediaToOgImageUrl({
        _id: "507f1f77bcf86cd799439013",
        filename: "seo/og",
        secureUrl: "https://res.cloudinary.com/nur/image/upload/seo-og.jpg",
        url: "http://res.cloudinary.com/nur/image/upload/seo-og.jpg",
        resourceType: "image",
      }),
    ).toBe("https://res.cloudinary.com/nur/image/upload/seo-og.jpg");
  });

  it("falls back to url when secureUrl is absent", () => {
    expect(
      mediaToOgImageUrl({
        _id: "507f1f77bcf86cd799439014",
        filename: "seo/og",
        url: "https://res.cloudinary.com/nur/image/upload/fallback-og.jpg",
        resourceType: "image",
      }),
    ).toBe("https://res.cloudinary.com/nur/image/upload/fallback-og.jpg");
  });
});
