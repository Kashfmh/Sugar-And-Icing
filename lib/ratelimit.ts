import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Create a new ratelimiter, that allows 10 requests per 10 seconds
export const ratelimit = new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(10, "10 s"),
    analytics: true,
    // Optional: Prefix for the keys used in redis. This is useful if you are sharing a redis
    // instance with other applications.
    prefix: "@upstash/ratelimit",
});
