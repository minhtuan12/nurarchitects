import { describe, expect, it } from "vitest";
import { buildCloudinaryUrl } from "@/lib/cloudinary-url";
import { getUploadResourceType, shouldUseChunkedUpload } from "@/lib/cloudinary";

describe("cloudinary helpers", () => {
  it("detects upload resource types from mime type", () => {
    expect(getUploadResourceType({ type: "image/jpeg" })).toBe("image");
    expect(getUploadResourceType({ type: "video/mp4" })).toBe("video");
    expect(getUploadResourceType({ type: "application/pdf" })).toBe("raw");
  });

  it("uses chunked upload for large videos only", () => {
    expect(shouldUseChunkedUpload({ type: "video/mp4", size: 60 * 1024 * 1024 })).toBe(true);
    expect(shouldUseChunkedUpload({ type: "video/mp4", size: 10 * 1024 * 1024 })).toBe(false);
    expect(shouldUseChunkedUpload({ type: "image/jpeg", size: 60 * 1024 * 1024 })).toBe(false);
  });

  it("builds a transformed Cloudinary delivery URL", () => {
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME = "nur";
    expect(buildCloudinaryUrl("folder/image", ["f_auto", "q_auto"])).toBe(
      "https://res.cloudinary.com/nur/image/upload/f_auto,q_auto/folder/image",
    );
  });
});
