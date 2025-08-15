// Force Node runtime to avoid Edge JSON limits
export const config = { runtime: "nodejs" };

import type { NextApiRequest, NextApiResponse } from "next";
import { Redis } from "@upstash/redis";

// Initialize Redis client using environment variables
const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Get all keys with "chao:" prefix
    const keys = await redis.keys<string>("chao:*");
    const data: Record<string, any> = {};

    for (const key of keys) {
      data[key] = await redis.get(key);
    }

    res.status(200).json({
      status: "ok",
      keysFound: keys.length,
      data,
    });
  } catch (err: any) {
    console.error("Debug endpoint error:", err);
    res.status(500).json({
      status: "error",
      message: err?.message || "Unknown error",
    });
  }
}
