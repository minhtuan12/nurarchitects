import { describe, expect, it } from "vitest";
import { normalizeIntroductionSnapshot } from "./utils";

describe("normalizeIntroductionSnapshot", () => {
  it("normalizes populated media objects to string ids", () => {
    const snapshot = normalizeIntroductionSnapshot({
      bannerId: {
        _id: "banner-media-id",
        secureUrl: "https://cdn.example.com/banner.jpg",
      },
      imageIds: [
        { _id: "gallery-media-id", secureUrl: "https://cdn.example.com/gallery.jpg" },
        "gallery-media-id-2",
      ],
      members: [
        {
          imageId: {
            _id: "member-media-id",
            secureUrl: "https://cdn.example.com/member.jpg",
          },
          name: "Member",
          description: "<p>Team member</p>",
          experiences: [],
        },
      ],
    });

    expect(snapshot.bannerId).toBe("banner-media-id");
    expect(snapshot.imageIds).toEqual(["gallery-media-id", "gallery-media-id-2"]);
    expect(snapshot.members[0]?.imageId).toBe("member-media-id");
  });
});
