import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  const datasets = await prisma.dataset.findMany({ orderBy: { records: "desc" } });
  return NextResponse.json(datasets);
}

export async function POST(request: Request) {
  const data = await request.json();
  const dataset = await prisma.dataset.create({ data });
  return NextResponse.json(dataset, { status: 201 });
}
