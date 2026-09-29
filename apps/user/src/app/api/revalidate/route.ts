import { revalidateTag, revalidatePath } from 'next/cache';
import { NextResponse, type NextRequest } from 'next/server';

/**
 * Enterprise On-Demand ISR Revalidation Webhook (/api/revalidate)
 * Eliminates cache decoupling by allowing BACKEND store parameter edits to immediately purge edge CDN caches globally.
 */
export async function POST(request: NextRequest) {
  try {
    const tag = request.nextUrl.searchParams.get('tag');
    const path = request.nextUrl.searchParams.get('path');
    const secret = request.nextUrl.searchParams.get('secret');
    const authHeader = request.headers.get('authorization');

    // Verify cryptographic webhook secret to prevent unauthorized edge cache eviction attacks
    const expectedSecret = process.env.REVALIDATION_SECRET || 'platino-enterprise-revalidation-key';
    if (secret !== expectedSecret && authHeader !== `Bearer ${expectedSecret}`) {
      return NextResponse.json({ success: false, error: 'Unauthorized revalidation invocation.' }, { status: 401 });
    }

    if (!tag && !path) {
      return NextResponse.json({ success: false, error: 'At least one target tag or path parameter is required.' }, { status: 400 });
    }

    if (tag) {
      revalidateTag(tag, { expire: 0 });
    }
    if (path) {
      revalidatePath(path, 'page');
    }

    return NextResponse.json({ 
      success: true, 
      revalidated: true, 
      target: { tag: tag || null, path: path || null }, 
      timestamp: Date.now() 
    }, { status: 200 });
  } catch (err: unknown) {
    console.error('[ON-DEMAND REVALIDATION ERROR]', err);
    return NextResponse.json({ success: false, error: 'Failed to purge edge cache representations.' }, { status: 500 });
  }
}
