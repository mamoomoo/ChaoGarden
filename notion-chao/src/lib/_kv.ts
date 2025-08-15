import type { NextApiRequest } from "next";
import { kv } from "@vercel/kv";

const ns = process.env.KV_NAMESPACE || "chao";

export async function kvGet(key: string) {
  return kv.get(`${ns}:${key}`);
}

export async function kvSet(key: string, value: any) {
  // kv client will serialize JSON for you
  await kv.set(`${ns}:${key}`, value);
  return true;
}

export async function kvDel(key: string) {
  await kv.del(`${ns}:${key}`);
  return true;
}

// read the browser session cookie
export function getSessionId(req: NextApiRequest) {
  const cookie = req.headers.cookie || "";
  const match = cookie.match(/chao_session=([a-zA-Z0-9_-]+)/);
  return match?.[1] || null;
}
