import { apiError, createCollectionHandlers, queryFromRequest, requireAdmin } from "@/lib/api";
import { connectDb } from "@/lib/db";
import { jobSchema } from "@/lib/validation";
import { Job } from "@/models";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const handlers = createCollectionHandlers(Job, jobSchema, {
  searchFields: ["title", "slug", "workingAddress"],
  filterFields: ["departmentId", "workingType", "status"],
  sortFields: ["deadline"],
});

export const GET = async (request: NextRequest) => {
  try {
    await requireAdmin();
    await connectDb();
    const { query, page, limit, sort } = queryFromRequest(request, {
      searchFields: ["title", "slug", "workingAddress"],
      filterFields: ["departmentId", "workingType", "status"],
      sortFields: ["deadline"],
    });
    const [items, total] = await Promise.all([
      Job.find(query).populate([{ path: 'departmentId', strictPopulate: false }])
        .sort(sort)
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Job.countDocuments(query),
    ]);

    return NextResponse.json({ items, page, limit, total });
  } catch (error) {
    return apiError(error);
  }
};
export const POST = handlers.create;
