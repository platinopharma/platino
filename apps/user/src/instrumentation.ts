/**
 * Next.js Enterprise Instrumentation Setup
 * This file is executed when the Next.js server boots in Node.js and Edge runtimes.
 * Used for initializing observability, OpenTelemetry tracing, and global server monitoring.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    // Node.js server initialization hooks (e.g., database warming, logging aggregators)
  }

  if (process.env.NEXT_RUNTIME === "edge") {
    // Edge runtime initialization hooks
  }
}
