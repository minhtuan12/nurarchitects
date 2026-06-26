import { apiError, createSingletonHandlers, populateMediaFields, requireAdmin } from "@/lib/api";
import { connectDb } from "@/lib/db";
import { introductionConfigSchema } from "@/lib/validation";
import { IntroductionConfig } from "@/models";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const handlers = createSingletonHandlers(IntroductionConfig, introductionConfigSchema, "introduction");

export const GET = async () => {
	try {
		await requireAdmin();
		await connectDb();
		const item = await IntroductionConfig.findOne({ _type: "introduction" }).lean();
		const populated = await populateMediaFields(IntroductionConfig, item);
		return NextResponse.json({ item: populated });
	} catch (error) {
		return apiError(error);
	}
};
export const PUT = handlers.upsert;
export const PATCH = async (request: NextRequest) => {
	try {
		await requireAdmin();
		await connectDb();
		const payload = introductionConfigSchema.parse(await request.json());
		const item = await IntroductionConfig.findOneAndUpdate(
			{ _type: "introduction" },
			{ ...payload, _type: "introduction" },
			{ new: true, upsert: true, runValidators: true },
		).lean();

		const populated = await populateMediaFields(IntroductionConfig, item);
		return NextResponse.json({ item: populated });
	} catch (error) {
		return apiError(error);
	}
};
