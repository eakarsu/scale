import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import { createSession, SESSION_COOKIE } from "@/lib/auth";

export const runtime = "nodejs";

const inputSchema = z.object({ email: z.string().email(), password: z.string().min(1).max(256) });
const dummyHash = "$2b$12$C6UzMDM.H6dfI/f/IKcEe.yrNRwLeO.JMzQW0U8T7uZR5T6z5MZ6S";

export async function POST(request: Request) {
  const parsed = inputSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });

  const operatorEmail = (process.env.NEXUS_OPERATOR_EMAIL || "").trim().toLowerCase();
  const configuredHash = process.env.NEXUS_OPERATOR_PASSWORD_HASH || "";
  if (!operatorEmail || !/^\$2[aby]\$/.test(configuredHash)) {
    return NextResponse.json({ error: "Authentication is not configured" }, { status: 503 });
  }

  const emailMatches = parsed.data.email.trim().toLowerCase() === operatorEmail;
  const passwordMatches = await bcrypt.compare(parsed.data.password, emailMatches ? configuredHash : dummyHash);
  if (!emailMatches || !passwordMatches) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const token = await createSession(operatorEmail);
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production" && process.env.NEXUS_COOKIE_SECURE === "true",
    path: "/",
    maxAge: 8 * 60 * 60,
  });
  return NextResponse.json({ user: { email: operatorEmail, role: "operator" } });
}
