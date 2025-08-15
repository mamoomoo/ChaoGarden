export const config = { runtime: "nodejs" };

import type { NextApiRequest } from "next";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
});

const ns = process.env.KV_NAMESPACE || "chao";

export async function kvGet(key: string) {
  return redis.get(`${ns}:${key}`);
}

export async function kvSet(key: string, value: any) {
  await redis.set(`${ns}:${key}`, value);
  return true;
}

export async function kvDel(key: string) {
  await redis.del(`${ns}:${key}`);
  return true;
}

export function getSessionId(req: NextApiRequest) {
  const cookie = req.headers.cookie || "";
  const match = cookie.match(/chao_session=([a-zA-Z0-9_-]+)/);
  return match?.[1] || null;
}
