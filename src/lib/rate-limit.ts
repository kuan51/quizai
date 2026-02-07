import { logger } from "./logger";

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Max requests per window
}

/**
 * In-memory store for rate limiting
 *
 * PRODUCTION NOTE: For distributed deployments (multiple instances, serverless),
 * replace this with Redis-based storage:
 *
 * ```typescript
 * import { Redis } from "@upstash/redis";
 * import { Ratelimit } from "@upstash/ratelimit";
 *
 * const redis = Redis.fromEnv();
 * const ratelimit = new Ratelimit({
 *   redis,
 *   limiter: Ratelimit.slidingWindow(10, "10 s"),
 *   analytics: true,
 * });
 * ```
 *
 * Benefits of Redis:
 * - Works across multiple instances/containers
 * - Persists across serverless cold starts
 * - Supports sliding window algorithms
 * - Built-in analytics and monitoring
 */
const rateLimitStore = new Map<string, RateLimitEntry>();

// Track last cleanup time for lazy cleanup pattern
let lastCleanupTime = Date.now();
const CLEANUP_INTERVAL_MS = 60000; // 1 minute

// Default rate limit configurations per endpoint type
const rateLimitConfigs = {
  // Strict limit for AI generation (expensive operations)
  aiGeneration: { windowMs: 60000, maxRequests: 5 }, // 5 per minute
  // Moderate limit for AI grading
  aiGrading: { windowMs: 60000, maxRequests: 20 }, // 20 per minute
  // Standard API limit
  api: { windowMs: 60000, maxRequests: 60 }, // 60 per minute
  // Auth endpoints (prevent brute force)
  auth: { windowMs: 300000, maxRequests: 30 }, // 30 per 5 minutes
  // File upload with extraction (expensive: AI vision calls + processing)
  fileUpload: { windowMs: 60000, maxRequests: 2 }, // 2 per minute
};

/**
 * Lazy cleanup of expired entries
 * Called on each rate limit check instead of using setInterval
 * This pattern is serverless/edge-compatible
 */
function cleanupExpiredEntries(): void {
  const now = Date.now();

  // Only cleanup if enough time has passed since last cleanup
  if (now - lastCleanupTime < CLEANUP_INTERVAL_MS) {
    return;
  }

  lastCleanupTime = now;

  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
  retryAfter?: number;
}

type IdentifierType = "userId" | "ip" | "anonymous";

/**
 * Check if a request should be rate limited
 * @param identifier - Unique identifier (userId or IP address)
 * @param endpoint - Endpoint type for config lookup
 * @param config - Optional custom config
 * @param identifierType - Type of identifier for logging semantics
 */
export function checkRateLimit(
  identifier: string,
  endpoint: keyof typeof rateLimitConfigs = "api",
  config?: RateLimitConfig,
  identifierType: IdentifierType = "userId"
): RateLimitResult {
  // Perform lazy cleanup before processing
  cleanupExpiredEntries();

  const { windowMs, maxRequests } = config || rateLimitConfigs[endpoint];
  const now = Date.now();
  const key = `${endpoint}:${identifier}`;

  let entry = rateLimitStore.get(key);

  // Create new entry if doesn't exist or window expired
  if (!entry || now > entry.resetTime) {
    entry = {
      count: 0,
      resetTime: now + windowMs,
    };
  }

  // Increment count
  entry.count++;
  rateLimitStore.set(key, entry);

  const remaining = Math.max(0, maxRequests - entry.count);
  const allowed = entry.count <= maxRequests;

  if (!allowed) {
    const retryAfter = Math.ceil((entry.resetTime - now) / 1000);

    // Log with proper identifier semantics
    const logData: Parameters<typeof logger.security>[1] = {
      path: endpoint,
      message: `Rate limit exceeded: ${entry.count}/${maxRequests}`,
      metadata: { retryAfter, identifierType },
    };

    // Only set userId if the identifier is actually a userId
    if (identifierType === "userId") {
      logData.userId = identifier;
    } else {
      logData.ip = identifier;
    }

    logger.security("api.rate_limited", logData);

    return {
      allowed: false,
      remaining: 0,
      resetTime: entry.resetTime,
      retryAfter,
    };
  }

  return {
    allowed: true,
    remaining,
    resetTime: entry.resetTime,
  };
}

/**
 * Get rate limit headers for response
 */
export function getRateLimitHeaders(result: RateLimitResult): HeadersInit {
  const headers: HeadersInit = {
    "X-RateLimit-Remaining": result.remaining.toString(),
    "X-RateLimit-Reset": new Date(result.resetTime).toISOString(),
  };

  if (!result.allowed && result.retryAfter) {
    headers["Retry-After"] = result.retryAfter.toString();
  }

  return headers;
}

/**
 * Create a rate-limited response
 */
export function rateLimitedResponse(result: RateLimitResult): Response {
  return new Response(
    JSON.stringify({
      error: "Too many requests",
      retryAfter: result.retryAfter,
    }),
    {
      status: 429,
      headers: {
        "Content-Type": "application/json",
        ...getRateLimitHeaders(result),
      },
    }
  );
}
