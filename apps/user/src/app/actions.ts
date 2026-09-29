'use server';

import { revalidatePath } from 'next/cache';

/**
 * Server Action to explicitly invalidate Next.js Edge Cache / ISR memory 
 * for a specific path (and all its children) globally.
 */
export async function invalidateCache(path = '/', type: 'page' | 'layout' = 'layout') {
  revalidatePath(path, type);
}
