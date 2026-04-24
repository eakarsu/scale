import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  const agents = await prisma.agent.findMany({ orderBy: { requests: "desc" } });
  return NextResponse.json(agents);
}

export async function POST(request: Request) {
  const data = await request.json();
  const agent = await prisma.agent.create({ data });
  return NextResponse.json(agent, { status: 201 });
}
