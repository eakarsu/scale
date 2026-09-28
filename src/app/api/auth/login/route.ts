import bcrypt from "bcryptjs";
import { timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import { createSession, SESSION_COOKIE } from "@/lib/auth";

export const runtime = "nodejs";

const inputSchema = z.object({ email: z.string().email(), password: z.string().min(1).max(256) });
const dummyHash = "$2b$12$C6UzMDM.H6dfI/f/IKcEe.yrNRwLeO.JMzQW0U8T7uZR5T6z5MZ6S";

function sameSecret(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}

export async function POST(request: Request) {
  const parsed = inputSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });

  const operatorEmail = (process.env.NEXUS_OPERATOR_EMAIL || "").trim().toLowerCase();
  const configuredHash = process.env.NEXUS_OPERATOR_PASSWORD_HASH || "";
  const demoEmail = (process.env.NEXT_PUBLIC_DEMO_EMAIL || "").trim().toLowerCase();
  const demoPassword = process.env.NEXT_PUBLIC_DEMO_PASSWORD || "";
  const localDemoConfigured = process.env.NODE_ENV !== "production" && Boolean(demoEmail && demoPassword);
  if ((!operatorEmail || !/^\$2[aby]\$/.test(configuredHash)) && !localDemoConfigured) {
    return NextResponse.json({ error: "Authentication is not configured" }, { status: 503 });
  }

  const submittedEmail = parsed.data.email.trim().toLowerCase();
  const operatorEmailMatches = submittedEmail === operatorEmail;
  const operatorPasswordMatches = await bcrypt.compare(parsed.data.password, operatorEmailMatches ? configuredHash : dummyHash);
  const localDemoMatches = localDemoConfigured && submittedEmail === demoEmail && sameSecret(parsed.data.password, demoPassword);
  if ((!operatorEmailMatches || !operatorPasswordMatches) && !localDemoMatches) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const authenticatedEmail = localDemoMatches ? demoEmail : operatorEmail;
  const token = await createSession(authenticatedEmail);
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production" && process.env.NEXUS_COOKIE_SECURE === "true",
    path: "/",
    maxAge: 8 * 60 * 60,
  });
  return NextResponse.json({ user: { email: authenticatedEmail, role: "operator" } });
}
