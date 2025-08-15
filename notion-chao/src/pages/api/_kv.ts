import type { NextApiRequest } from "next";

const base = process.env.KV_REST_API_URL!;
const token = process.env.KV_REST_API_TOKEN!;
const roToken = process.env.KV_REST_API_READ_ONLY_TOKEN!;
const ns = process.env.KV_NAMESPACE || "chao";

type KVMethod = "GET" | "SET" | "DEL";

async function kvFetch(method: KVMethod, key: string, value?: any, readOnly=false) {
  const url = `${base}/get/${ns}:${key}`;
  const headers: Record<string,string> = { Authorization: `Bearer ${readOnly ? roToken : token}` };
  if (method === "GET") {
    const r = await fetch(url, { headers });
    if (!r.ok) return null;
    const j = await r.json();
    return j.result ? JSON.parse(j.result) : null;
  }
  if (method === "SET") {
    const r = await fetch(`${base}/set/${ns}:${key}`, {
      method: "POST",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({ value: JSON.stringify(value) })
    });
    return r.ok;
  }
  if (method === "DEL") {
    const r = await fetch(`${base}/del/${ns}:${key}`, { method: "POST", headers });
    return r.ok;
  }
}

export const kvGet = (k: string) => kvFetch("GET", k, undefined, true);
export const kvSet = (k: string, v: any) => kvFetch("SET", k, v, false);
export const kvDel = (k: string) => kvFetch("DEL", k, undefined, false);

export function getSessionId(req: NextApiRequest) {
  const cookie = req.headers.cookie || "";
  const match = cookie.match(/chao_session=([a-zA-Z0-9_-]+)/);
  return match?.[1] || null;
}
