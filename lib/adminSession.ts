import { createHmac, timingSafeEqual } from "crypto";

export const ADMIN_SESSION_COOKIE = "swapspot_admin_session";
const SESSION_TTL_SECONDS = 60 * 60 * 12;

function getAdminPassword() {
  return process.env.ANALYTICS_API_SECRET || "";
}

function sign(value: string, secret: string) {
  return createHmac("sha256", secret).update(value).digest("base64url");
}

function safelyEquals(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}

function readCookie(cookieHeader: string | null, name: string) {
  if (!cookieHeader) return "";
  return cookieHeader.split(";").map((item) => item.trim()).find((item) => item.startsWith(`${name}=`))?.slice(name.length + 1) || "";
}

export function verifyAdminPassword(password: string) {
  const secret = getAdminPassword();
  return Boolean(secret) && safelyEquals(password, secret);
}

export function createAdminSession() {
  const secret = getAdminPassword();
  if (!secret) throw new Error("Analytics access is not configured");

  const expiresAt = Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS;
  const payload = `admin:${expiresAt}`;
  return `${expiresAt}.${sign(payload, secret)}`;
}

export function hasAdminSession(request: Request) {
  const secret = getAdminPassword();
  const value = readCookie(request.headers.get("cookie"), ADMIN_SESSION_COOKIE);
  const [expiryText, signature, ...rest] = value.split(".");
  const expiresAt = Number(expiryText);

  if (!secret || rest.length > 0 || !Number.isInteger(expiresAt) || expiresAt <= Math.floor(Date.now() / 1000) || !signature) {
    return false;
  }

  return safelyEquals(signature, sign(`admin:${expiresAt}`, secret));
}

export function adminSessionCookie(value: string) {
  return {
    name: ADMIN_SESSION_COOKIE,
    value,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict" as const,
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  };
}
