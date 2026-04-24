import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  const labelers = await prisma.labeler.findMany({ orderBy: { rating: "desc" } });
  return NextResponse.json(labelers);
}
