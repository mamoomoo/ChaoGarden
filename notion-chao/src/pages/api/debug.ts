// Force Node runtime
export const config = { runtime: "nodejs" };

import type { NextApiRequest, NextApiResponse } from "next";
import { kv } from "@vercel/kv";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Example: fetch all keys starting with "chao"
    // Adjust pattern to match your KV key style
    const keys = await kv.keys("chao:*");
    const data: Record<string, any> = {};

    for (const key of keys) {
      data[key] = await kv.get(key);
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
