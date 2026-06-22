import { NextResponse, type NextRequest } from "next/server";
import { createCollectionHandlers, apiError, requireAdmin } from "@/lib/api";
import { connectDb } from "@/lib/db";
import { uploadAnyMedia } from "@/lib/cloudinary";
import { mediaCreateSchema } from "@/lib/validation";
import { Media } from "@/models";

export const runtime = "nodejs";

const handlers = createCollectionHandlers(Media, mediaCreateSchema, {
  searchFields: ["filename", "originalName", "alt", "caption"],
});

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    await connectDb();

    const { searchParams } = new URL(request.url);
    const page = Math.max(Number(searchParams.get("page") ?? 1), 1);
    const limit = Math.min(Math.max(Number(searchParams.get("limit") ?? 20), 1), 100);
    const search = searchParams.get("search")?.trim();
    const resourceType = searchParams.get("resourceType")?.trim();
    const query: Record<string, unknown> = {};

    if (resourceType) {
      query.resourceType = resourceType;
    }

    if (search) {
      query.$or = ["filename", "originalName", "alt", "caption"].map((field) => ({
        [field]: { $regex: search, $options: "i" },
      }));
    }

    const [items, total] = await Promise.all([
      Media.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Media.countDocuments(query),
    ]);

    return NextResponse.json({ items, page, limit, total });
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    await connectDb();

    const contentType = request.headers.get("content-type") ?? "";
    if (contentType.includes("multipart/form-data")) {
      const form = await request.formData();
      const file = form.get("file");
      if (!(file instanceof File)) {
        return NextResponse.json({ error: "file is required" }, { status: 400 });
      }

      const upload = await uploadAnyMedia(file, {
        resourceType: (form.get("resourceType") as "image" | "video" | "raw" | "auto" | null) ?? undefined,
        tags: ["admin"],
      });
      const item = await Media.create({
        filename: upload.public_id,
        originalName: file.name,
        mimeType: file.type,
        size: file.size,
        url: upload.url,
        secureUrl: upload.secure_url,
        publicId: upload.public_id,
        resourceType: upload.resource_type,
        format: upload.format,
        width: upload.width,
        height: upload.height,
        duration: upload.duration,
        folder: upload.folder,
        alt: String(form.get("alt") ?? ""),
        caption: String(form.get("caption") ?? ""),
      });
      return NextResponse.json({ item }, { status: 201 });
    }

    return handlers.create(request);
  } catch (error) {
    return apiError(error);
  }
}
