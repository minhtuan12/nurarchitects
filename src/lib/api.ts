import type { Model } from "mongoose";
import { NextResponse, type NextRequest } from "next/server";
import { z, ZodError } from "zod";
import { connectDb } from "@/lib/db";

export interface ApiConfig {
  searchFields?: string[];
  softDelete?: boolean;
  defaultSort?: Record<string, 1 | -1>;
  /**
   * Tên các field được phép filter bằng "match chính xác" qua query string.
   * VD: ["status", "category", "isFeatured", "implementationYear"]
   * Query: ?status=published&category=house&isFeatured=true&implementationYear=2024
   */
  filterFields?: string[];
  /**
   * Tên các field được phép sort qua query string `sortBy` + `sortOrder`.
   * VD: ["area", "implementationYear", "createdAt"]
   * Query: ?sortBy=area&sortOrder=asc
   */
  sortFields?: string[];
}

export async function requireAdmin() {
  return true;
}

export function apiError(error: unknown) {
  if (error instanceof ZodError) {
    return NextResponse.json({ error: "Validation failed", issues: error.issues }, { status: 400 });
  }

  if (error instanceof Error) {
    if (error.message.includes("E11000")) {
      return NextResponse.json({ error: "Duplicate value" }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ error: "Unknown error" }, { status: 500 });
}

/**
 * Cố gắng cast giá trị string từ query param sang kiểu phù hợp (boolean / number),
 * vì query string luôn là string trong khi field trong DB có thể là Boolean/Number.
 */
function coerceFilterValue(raw: string): unknown {
  if (raw === "true") return true;
  if (raw === "false") return false;
  if (raw !== "" && !Number.isNaN(Number(raw))) return Number(raw);
  return raw;
}

export function queryFromRequest(request: NextRequest, config: ApiConfig) {
  const { searchParams } = new URL(request.url);
  const page = Math.max(Number(searchParams.get("page") ?? 1), 1);
  const limit = Math.min(Math.max(Number(searchParams.get("limit") ?? 20), 1), 100);
  const search = searchParams.get("search")?.trim();
  const query: Record<string, unknown> = {};

  if (config.softDelete) {
    query.isDeleted = { $ne: true };
  }

  if (search && config.searchFields?.length) {
    query.$or = config.searchFields.map((field) => ({
      [field]: { $regex: search, $options: "i" },
    }));
  }

  // Filter theo các field được khai báo trong config.filterFields.
  // Hỗ trợ giá trị dạng list phân tách bởi dấu phẩy (VD: ?status=published,draft) -> $in
  if (config.filterFields?.length) {
    for (const field of config.filterFields) {
      const raw = searchParams.get(field);
      if (raw === null || raw === "") continue;

      if (raw.includes(",")) {
        const values = raw
          .split(",")
          .map((v) => v.trim())
          .filter(Boolean)
          .map(coerceFilterValue);
        query[field] = { $in: values };
      } else {
        query[field] = coerceFilterValue(raw);
      }
    }
  }

  // Sort: ?sortBy=area&sortOrder=asc|desc (chỉ cho phép các field trong config.sortFields)
  let sort: Record<string, 1 | -1> = config.defaultSort ?? { createdAt: -1 };
  const sortBy = searchParams.get("sortBy");
  const sortOrder = searchParams.get("sortOrder");
  if (sortBy && config.sortFields?.includes(sortBy)) {
    sort = { [sortBy]: sortOrder === "asc" ? 1 : -1 };
  }

  return { query, page, limit, sort };
}

type ApiSchema = z.ZodObject<Record<string, z.ZodType>>;
type ApiModel = Model<Record<string, unknown>>;

export function createCollectionHandlers(
  Model: ApiModel,
  schema: ApiSchema,
  config: ApiConfig = {},
) {
  return {
    async list(request: NextRequest) {
      try {
        await requireAdmin();
        await connectDb();
        const { query, page, limit, sort } = queryFromRequest(request, config);
        const [items, total] = await Promise.all([
          Model.find(query).populate([{ path: 'thumbnail', strictPopulate: false }])
            .sort(sort)
            .skip((page - 1) * limit)
            .limit(limit)
            .lean(),
          Model.countDocuments(query),
        ]);

        return NextResponse.json({ items, page, limit, total });
      } catch (error) {
        return apiError(error);
      }
    },
    async create(request: NextRequest) {
      try {
        await requireAdmin();
        await connectDb();
        const payload = schema.parse(await request.json());
        const item = await Model.create(payload);
        return NextResponse.json({ item }, { status: 201 });
      } catch (error) {
        return apiError(error);
      }
    },
    async get(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
      try {
        await requireAdmin();
        await connectDb();
        const { id } = await context.params;
        const item = await Model.findById(id).lean();
        if (!item) {
          return NextResponse.json({ error: "Not found" }, { status: 404 });
        }
        return NextResponse.json({ item });
      } catch (error) {
        return apiError(error);
      }
    },
    async update(request: NextRequest, context: { params: Promise<{ id: string }> }) {
      try {
        await requireAdmin();
        await connectDb();
        const { id } = await context.params;
        const payload = schema.partial().parse(await request.json());
        const item = await Model.findByIdAndUpdate(id, payload, { new: true, runValidators: true }).lean();
        if (!item) {
          return NextResponse.json({ error: "Not found" }, { status: 404 });
        }
        return NextResponse.json({ item });
      } catch (error) {
        return apiError(error);
      }
    },
    async remove(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
      try {
        await requireAdmin();
        await connectDb();
        const { id } = await context.params;
        const item = config.softDelete
          ? await Model.findByIdAndUpdate(id, { isDeleted: true }, { new: true }).lean()
          : await Model.findByIdAndDelete(id).lean();

        if (!item) {
          return NextResponse.json({ error: "Not found" }, { status: 404 });
        }
        return NextResponse.json({ item });
      } catch (error) {
        return apiError(error);
      }
    },
  };
}

export function createSingletonHandlers(
  Model: ApiModel,
  schema: ApiSchema,
  type: string,
) {
  return {
    async get() {
      try {
        await requireAdmin();
        await connectDb();
        const item = await Model.findOne({ _type: type }).lean();
        return NextResponse.json({ item });
      } catch (error) {
        return apiError(error);
      }
    },
    async upsert(request: NextRequest) {
      try {
        await requireAdmin();
        await connectDb();
        const payload = schema.parse(await request.json());
        const item = await Model.findOneAndUpdate(
          { _type: type },
          { ...payload, _type: type },
          { new: true, upsert: true, runValidators: true },
        ).lean();
        return NextResponse.json({ item });
      } catch (error) {
        return apiError(error);
      }
    },
  };
}

export async function publicList(Model: ApiModel, query: Record<string, unknown> = {}, limit = 24) {
  await connectDb();
  return Model.find(query).sort({ createdAt: -1 }).limit(limit).lean();
}
