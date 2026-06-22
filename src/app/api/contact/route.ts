import { NextResponse, type NextRequest } from "next/server";
import { apiError } from "@/lib/api";
import { getContact } from "@/lib/content";
import { connectDb } from "@/lib/db";
import { contactFormSchema } from "@/lib/validation";
import { ContactForm } from "@/models";

export const runtime = "nodejs";

export async function GET() {
  try {
    return NextResponse.json({ item: await getContact() });
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDb();
    const payload = contactFormSchema.omit({ status: true }).parse(await request.json());
    const item = await ContactForm.create({ ...payload, status: "new" });
    return NextResponse.json({ item }, { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}
