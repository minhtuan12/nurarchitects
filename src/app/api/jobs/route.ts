import { randomUUID } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { apiError } from "@/lib/api";
import { getRecruitingJobs } from "@/lib/content";
import { connectDb } from "@/lib/db";
import { uploadAnyMedia } from "@/lib/cloudinary";
import { applicationSchema } from "@/lib/validation";
import { Application, Media } from "@/models";

export const runtime = "nodejs";

const ALLOWED_RESUME_MIME_TYPES = ["application/pdf"];

const MAX_RESUME_SIZE = 5 * 1024 * 1024; // 5MB

export async function GET() {
  try {
    return NextResponse.json({ items: await getRecruitingJobs() });
  } catch (error) {
    return apiError(error);
  }
}

async function uploadResumeAndCreateMedia(file: File) {
  if (!ALLOWED_RESUME_MIME_TYPES.includes(file.type)) {
    throw Object.assign(new Error("Chỉ chấp nhận file CV định dạng PDF"), {
      status: 400,
    });
  }

  if (file.size > MAX_RESUME_SIZE) {
    throw Object.assign(new Error("Kích thước file CV tối đa 5MB"), { status: 400 });
  }

  // Cloudinary cần extension nằm trong public_id đối với resource_type "raw",
  // nếu không thì delivery URL sẽ thiếu đuôi file -> trình duyệt/OS không nhận
  // đúng định dạng -> tải về bị sai/hỏng file. Đây chính là nguyên nhân của lỗi.
  const publicId = `${randomUUID()}.pdf`;

  const upload = await uploadAnyMedia(file, {
    resourceType: "raw",
    publicId,
    tags: ["job-application"],
  });

  const media = await Media.create({
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
  });

  return String(media._id);
}

export async function POST(request: NextRequest) {
  try {
    await connectDb();

    const contentType = request.headers.get("content-type") ?? "";
    const applicationInputSchema = applicationSchema.omit({
      status: true,
      adminNote: true,
    });

    let payload: Record<string, unknown>;

    if (contentType.includes("multipart/form-data")) {
      const form = await request.formData();
      const file = form.get("file");

      const fields: Record<string, unknown> = {
        jobId: form.get("jobId"),
        fullName: form.get("fullName"),
        email: form.get("email"),
        phone: form.get("phone"),
      };

      if (file instanceof File && file.size > 0) {
        fields.resumeId = await uploadResumeAndCreateMedia(file);
      }

      payload = fields;
    } else {
      payload = await request.json();
    }

    const parsed = applicationInputSchema.parse(payload);
    const item = await Application.create({ ...parsed, status: "new" });
    return NextResponse.json({ item }, { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}
