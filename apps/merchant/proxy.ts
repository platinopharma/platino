import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

function isTrustedOrigin(origin: string): boolean {
  if (!origin) return false;
  if (origin.startsWith("http://localhost:") || origin.startsWith("http://127.0.0.1:")) {
    return true;
  }
  return origin.endsWith(".platinopharma.com") || origin === "https://platinopharma.com";
}

export function proxy(request: NextRequest) {
  const origin = request.headers.get("origin") ?? "";
  const allowedOrigin = isTrustedOrigin(origin) ? origin : null;
  const isPreflight = request.method === "OPTIONS";

  if (isPreflight) {
    const headers: Record<string, string> = {
      "Access-Control-Allow-Methods": "GET, DELETE, PATCH, POST, PUT, OPTIONS",
      "Access-Control-Allow-Headers": "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization",
      "Access-Control-Allow-Credentials": "true",
      "Access-Control-Max-Age": "86400", // Cache edge preflight verification for 24 hours to eliminate redundant OPTIONS network trips
      "Vary": "Origin, Access-Control-Request-Headers, Access-Control-Request-Method",
    };
    if (allowedOrigin) {
      headers["Access-Control-Allow-Origin"] = allowedOrigin;
    }
    return new NextResponse(null, { status: 200, headers });
  }

  const response = NextResponse.next();

  if (allowedOrigin) {
    response.headers.set("Access-Control-Allow-Origin", allowedOrigin);
    response.headers.set("Access-Control-Allow-Credentials", "true");
    response.headers.set("Access-Control-Allow-Methods", "GET, DELETE, PATCH, POST, PUT, OPTIONS");
    response.headers.set(
      "Access-Control-Allow-Headers",
      "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization"
    );
    response.headers.set("Vary", "Origin");
  }

  return response;
}

export const config = {
  matcher: "/api/:path*",
};
