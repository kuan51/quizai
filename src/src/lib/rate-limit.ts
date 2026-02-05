import { logger } from "./logger";

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Max requests per window
}

// In-memory store for rate limiting
// In production, consider using Redis for distributed rate limiting
const rateLimitStore = new Map<string, RateLimitEntry>();

// Default rate limit configurations per endpoint type
export const rateLimitConfigs = {
  // Strict limit for AI generation (expensive operations)
  aiGeneration: { windowMs: 60000, maxRequests: 5 }, // 5 per minute
  // Moderate limit for AI grading
  aiGrading: { windowMs: 60000, maxRequests: 20 }, // 20 per minute
  // Standard API limit
  api: { windowMs: 60000, maxRequests: 60 }, // 60 per minute
  // Auth endpoints (prevent brute force)
  auth: { windowMs: 300000, maxRequests: 10 }, // 10 per 5 minutes
};

// Clean up expired entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}, 60000); // Clean up every minute

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
  retryAfter?: number;
}

/**
 * Check if a request should be rate limited
 * @param identifier - Unique identifier (userId or IP)
 * @param endpoint - Endpoint type for config lookup
 * @param config - Optional custom config
 */
export function checkRateLimit(
  identifier: string,
  endpoint: keyof typeof rateLimitConfigs = "api",
  config?: RateLimitConfig
): RateLimitResult {
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
    logger.security("api.rate_limited", {
      userId: identifier,
      path: endpoint,
      message: `Rate limit exceeded: ${entry.count}/${maxRequests}`,
      metadata: { retryAfter },
    });
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
