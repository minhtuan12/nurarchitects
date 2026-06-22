import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AppImage } from "@/components/AppImage";

describe("AppImage", () => {
  it("renders alt text and media dimensions", () => {
    render(
      <AppImage
        alt="Project thumbnail"
        media={{ secureUrl: "https://res.cloudinary.com/demo/image/upload/project.jpg", width: 640, height: 480 }}
      />,
    );

    const image = screen.getByAltText("Project thumbnail");
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute("width", "640");
    expect(image).toHaveAttribute("height", "480");
  });

  it("supports fill mode with a stable wrapper", () => {
    render(
      <AppImage
        alt="Hero"
        fill
        aspectRatio="16 / 9"
        media={{ secureUrl: "https://res.cloudinary.com/demo/image/upload/hero.jpg" }}
      />,
    );

    expect(screen.getByAltText("Hero")).toBeInTheDocument();
  });
});
