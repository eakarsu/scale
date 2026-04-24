import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");

  const where = status && status !== "all" ? { status } : {};
  const projects = await prisma.project.findMany({ where, orderBy: { createdAt: "desc" } });

  return NextResponse.json(projects);
}

export async function POST(request: Request) {
  const data = await request.json();
  const project = await prisma.project.create({ data });
  return NextResponse.json(project, { status: 201 });
}
