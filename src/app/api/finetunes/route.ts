import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  const finetunes = await prisma.fineTune.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(finetunes);
}

export async function POST(request: Request) {
  const data = await request.json();
  const finetune = await prisma.fineTune.create({ data });
  return NextResponse.json(finetune, { status: 201 });
}
