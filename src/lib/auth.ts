import { SignJWT, jwtVerify } from "jose";

export const SESSION_COOKIE = "nexus_session";

function sessionKey() {
  const secret = process.env.NEXUS_SESSION_SECRET || "";
  if (secret.length < 32) throw new Error("NEXUS_SESSION_SECRET must contain at least 32 characters");
  return new TextEncoder().encode(secret);
}

export async function createSession(email: string) {
  return new SignJWT({ email, role: "operator" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuer("nexus-ai-local")
    .setAudience("nexus-ai-operator")
    .setIssuedAt()
    .setExpirationTime("8h")
    .sign(sessionKey());
}

export async function verifySession(token: string) {
  return jwtVerify(token, sessionKey(), {
    issuer: "nexus-ai-local",
    audience: "nexus-ai-operator",
    algorithms: ["HS256"],
  });
}
