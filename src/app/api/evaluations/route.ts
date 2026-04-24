import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");

  const where = category && category !== "all" ? { category } : {};
  const evaluations = await prisma.evaluation.findMany({ where, orderBy: { score: "desc" } });

  return NextResponse.json(evaluations);
}

export async function POST(request: Request) {
  const data = await request.json();
  const evaluation = await prisma.evaluation.create({ data });
  return NextResponse.json(evaluation, { status: 201 });
}
