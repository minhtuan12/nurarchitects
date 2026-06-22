import { NextResponse, type NextRequest } from "next/server";
import { apiError, requireAdmin } from "@/lib/api";
import {
	buildActivityReorderOperations,
	clampActivityOrder,
} from "@/lib/activity-order";
import { connectDb } from "@/lib/db";
import {
	assertProjectSeoSlugAvailable,
	projectSeoInputSchema,
	upsertProjectSeoSetting,
} from "@/lib/seo-service";
import { activityUpdateSchema } from "@/lib/validation";
import { Activity, SeoSetting } from "@/models";
import mongoose from "mongoose";

export const runtime = "nodejs";

class NotFoundError extends Error { }

export async function GET(
	_request: NextRequest,
	context: { params: Promise<{ id: string }> },
) {
	try {
		await requireAdmin();
		await connectDb();

		const { id } = await context.params;
		const item = await Activity.findById(id).lean();
		if (!item) {
			return NextResponse.json({ error: "Not found" }, { status: 404 });
		}

		const seo = await SeoSetting.findOne({
			entityId: item._id,
			entityType: "post",
		}).lean();

		return NextResponse.json({ item, seo });
	} catch (error) {
		return apiError(error);
	}
}

export async function DELETE(
	request: NextRequest,
	context: { params: Promise<{ id: string }> },
) {
	const session = await mongoose.startSession();

	try {
		await requireAdmin();
		await connectDb();

		const { id } = await context.params;

		await session.withTransaction(async () => {
			const deletedActivity = await Activity.findById(id)
				.select("order")
				.session(session)
				.lean<{ order?: number }>();

			if (!deletedActivity) {
				throw new NotFoundError();
			}

			await Activity.findByIdAndDelete(id).session(session);

			const deletedOrder = deletedActivity.order;
			if (deletedOrder !== undefined && deletedOrder !== null) {
				await Activity.updateMany(
					{ order: { $gt: deletedOrder } },
					{ $inc: { order: -1 } },
				).session(session);
			}
		});

		return NextResponse.json({ success: true });
	} catch (error) {
		if (error instanceof NotFoundError) {
			return NextResponse.json({ error: "Not found" }, { status: 404 });
		}
		return apiError(error);
	} finally {
		await session.endSession();
	}
}

export async function PATCH(
	request: NextRequest,
	context: { params: Promise<{ id: string }> },
) {
	try {
		await requireAdmin();
		await connectDb();

		const { id } = await context.params;
		const body = await request.json();
		const { order, ...payload } = activityUpdateSchema.parse(body);
		const seoInput = body.seo ? projectSeoInputSchema.parse(body.seo) : null;

		if (seoInput) {
			await assertProjectSeoSlugAvailable(seoInput.slug, id);
		}

		const currentActivity = await Activity.findById(id)
			.select("order")
			.lean<{ order?: number }>();

		if (!currentActivity) {
			return NextResponse.json({ error: "Not found" }, { status: 404 });
		}

		if (order !== undefined) {
			const total = await Activity.countDocuments();
			const nextOrder = clampActivityOrder(order, total);
			const currentOrder = currentActivity.order ?? total;
			const operations = buildActivityReorderOperations(
				id,
				currentOrder,
				nextOrder,
			);

			if (operations.length) {
				await Activity.bulkWrite(operations);
			}
		}

		const item = Object.keys(payload).length
			? await Activity.findByIdAndUpdate(id, payload, {
				new: true,
				runValidators: true,
			}).lean()
			: await Activity.findById(id).lean();

		const seo = seoInput && item
			? await upsertProjectSeoSetting(item._id, seoInput)
			: null;

		return NextResponse.json({ item, seo });
	} catch (error) {
		return apiError(error);
	}
}
