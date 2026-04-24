import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search");

  const where = search
    ? { OR: [
        { name: { contains: search } },
        { provider: { contains: search } },
      ]}
    : {};

  const models = await prisma.model.findMany({ where, orderBy: { rating: "desc" } });
  return NextResponse.json(models);
}
