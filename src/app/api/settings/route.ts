import { NextResponse } from "next/server";
import { SettingsConfig } from "@/models";
import { connectDb } from "@/lib/db";
import { defaultSiteSettings } from "@/types/shared";

export const runtime = "nodejs";

export async function GET() {
	if (!(await connectDb())) return NextResponse.json({ item: null });

	const doc = await SettingsConfig.findOne({ _type: "settings" }).lean<
		Partial<typeof defaultSiteSettings>
	>();

	if (!doc) return NextResponse.json({ item: null });

	const item = {
		primaryColor: doc.primaryColor || defaultSiteSettings.primaryColor,
		// secondaryColor: doc.secondaryColor || defaultSiteSettings.secondaryColor,
		backgroundColor: doc.backgroundColor || defaultSiteSettings.backgroundColor,
		textColor: doc.textColor || defaultSiteSettings.textColor,
		headerBackgroundColor: doc.headerBackgroundColor ?? defaultSiteSettings.headerBackgroundColor,
		footerBackgroundColor: doc.footerBackgroundColor || defaultSiteSettings.footerBackgroundColor,
		footerTextColor: doc.footerTextColor || defaultSiteSettings.footerTextColor,
	};

	return NextResponse.json({ item });
}
