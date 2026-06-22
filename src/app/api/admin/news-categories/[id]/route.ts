import { apiError, createCollectionHandlers, requireAdmin } from "@/lib/api";
import { connectDb } from "@/lib/db";
import { categorySchema } from "@/lib/validation";
import { News, NewsCategory } from "@/models";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const handlers = createCollectionHandlers(NewsCategory, categorySchema, { softDelete: true });

export const GET = handlers.get;
export const PATCH = handlers.update;
export const DELETE = async (_request: NextRequest, context: { params: Promise<{ id: string }> }) => {
	try {
		await requireAdmin();
		await connectDb();
		const { id } = await context.params;
		const item = await NewsCategory.findByIdAndUpdate(id, { isDeleted: true }, { new: true }).lean()

		if (!item) {
			return NextResponse.json({ error: "Not found" }, { status: 404 });
		}

		// remove category reference from news
		await News.updateMany(
			{ categoryId: id },
			{ $unset: { categoryId: '' } }
		);
		return NextResponse.json({ item });
	} catch (error) {
		return apiError(error);
	}
};
