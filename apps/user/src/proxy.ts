import { NextResponse } from 'next/server';
import type { NextRequest, NextFetchEvent } from 'next/server';

/**
 * ─── EXTERNAL LOGGING SERVICE ───────────────────────────────────────────────
 * Edge-compatible fetcher that fails silently if the logging ingestion API
 * is down, ensuring the user's request is never blocked.
 */
async function sendAuditLog(auditData: Record<string, any>) {
  try {
    // Example ingestion endpoint (replace with Datadog, Axiom, CloudWatch, etc.)
    // await fetch('https://audit.platinopharma.com/v1/logs', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(auditData),
    //   // Note: keepalive is automatically supported in Edge fetch
    // });
    
    // For local observation:
    // console.log('[AUDIT LOG]', JSON.stringify(auditData, null, 2));
  } catch (error) {
    // Fail silently but log to the server console for Ops monitoring
    console.error('[AUDIT LOG ERROR] Ingestion failed:', error);
  }
}

export default async function proxy(request: NextRequest, event: NextFetchEvent) {
  const { pathname } = request.nextUrl;
  
  // 1. TRACING: Generate a unique x-request-id
  // crypto.randomUUID() is fully supported in the V8 Edge Runtime
  const requestId = crypto.randomUUID();
  
  // 2. DATA PRIVACY & PAYLOAD: Sanitize headers before logging
  const sanitizedHeaders: Record<string, string> = {};
  request.headers.forEach((value, key) => {
    const lowerKey = key.toLowerCase();
    if (lowerKey === 'authorization' || lowerKey === 'cookie') {
      sanitizedHeaders[key] = '[REDACTED]';
    } else {
      sanitizedHeaders[key] = value;
    }
  });

  const auditData = {
    requestId,
    method: request.method,
    url: request.url,
    pathname,
    timestamp: new Date().toISOString(),
    ip: request.headers.get('x-forwarded-for') ?? 'Unknown',
    geo: {
      country: request.headers.get('x-vercel-ip-country') ?? 'Unknown',
      region: request.headers.get('x-vercel-ip-country-region') ?? 'Unknown',
      city: request.headers.get('x-vercel-ip-city') ?? 'Unknown',
    },
    headers: sanitizedHeaders,
  };

  // 3. AUDIT LOGGING: Fire-and-forget background execution
  // event.waitUntil allows the promise to finish resolving in the background
  // after the middleware has returned a response to the user.
  event.waitUntil(sendAuditLog(auditData));

  // 4. EXISTING AUTHENTICATION LOGIC
  const protectedRoutes = ['/checkout', '/profile', '/orders'];
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));

  if (isProtectedRoute) {
    const token =
      request.cookies.get('__Host-platino_patient_jwt')?.value ||
      request.cookies.get('platino_patient_jwt')?.value ||
      request.cookies.get('patient_session')?.value ||
      request.cookies.get('access_token')?.value;

    if (!token) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
    
    // 5. ACTIVE VALIDATION: Ensure user exists and is active for high-security routes
    if (pathname.startsWith('/checkout')) {
      try {
        const backendUrl = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000';
        const res = await fetch(`${backendUrl}/api/user/user/profile`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.status === 401) {
          const loginUrl = new URL('/login', request.url);
          loginUrl.searchParams.set('redirect', pathname);
          const response = NextResponse.redirect(loginUrl);
          response.cookies.delete('__Host-platino_patient_jwt');
          response.cookies.delete('platino_patient_jwt');
          response.cookies.delete('patient_session');
          return response;
        }
      } catch (err) {
        // Network or non-auth error — do not block user from checkout
      }
    }
  }

  // 5. DOWNSTREAM TRACING
  // Attach the x-request-id to the request headers so your backend Server Components
  // and API route handlers can trace the request flow.
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-request-id', requestId);

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    }
  });
  
  // Optionally expose the tracing ID to the client browser
  response.headers.set('x-request-id', requestId);

  return response;
}

// 6. FILTERING / MATCHERS
export const config = {
  // Highly optimized regex matcher that completely bypasses the middleware
  // for Next.js internal files, static assets, and images, saving execution costs.
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
