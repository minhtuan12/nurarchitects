import { apiError, createCollectionHandlers, queryFromRequest, requireAdmin } from "@/lib/api";
import { connectDb } from "@/lib/db";
import { categorySchema } from "@/lib/validation";
import { NewsCategory } from "@/models";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const handlers = createCollectionHandlers(NewsCategory, categorySchema, {
  searchFields: ["name", "slug"],
  softDelete: true,
});

export async function GET(_request: NextRequest) {
  try {
    await requireAdmin();
    await connectDb();
    const { query, page, limit, sort } = queryFromRequest(_request, {
      searchFields: ["name", "slug"],
      softDelete: true,
    });
    const [items, total] = await Promise.all([
      NewsCategory.aggregate([
        {
          $match: query,
        },
        {
          $lookup: {
            from: "news", // tên collection của NewsSchema
            localField: "_id",
            foreignField: "categoryId",
            as: "news",
          },
        },
        {
          $addFields: {
            newsCount: {
              $size: "$news",
            },
          },
        },
        {
          $project: {
            news: 0, // bỏ danh sách news, chỉ giữ count
          },
        },
        {
          $sort: sort,
        },
        {
          $skip: (page - 1) * limit,
        },
        {
          $limit: limit,
        },
      ]),
      NewsCategory.countDocuments(query),
    ]);

    return NextResponse.json({
      items,
      page,
      limit,
      total,
    });
  } catch (error) {
    return apiError(error);
  }
}

export const POST = handlers.create;
