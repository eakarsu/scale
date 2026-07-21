import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { SESSION_COOKIE, verifySession } from "@/lib/auth";

export async function GET() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return NextResponse.json({ authenticated: false }, { status: 401 });
  try {
    const { payload } = await verifySession(token);
    return NextResponse.json({ authenticated: true, user: { email: payload.email, role: payload.role } });
  } catch {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
}
