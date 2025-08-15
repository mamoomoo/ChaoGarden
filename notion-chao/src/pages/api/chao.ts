import type { NextApiRequest, NextApiResponse } from "next";
import { kvGet, kvSet } from "./_kv";
import dayjs from "dayjs";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") return res.status(405).end();
  let state = await kvGet("state");
  if (!state) {
    state = makeDefaultChao();
    await kvSet("state", state);
  }
  res.status(200).json(state);
}

function makeDefaultChao() {
  const now = new Date().toISOString();
  return {
    id: "babygirl",
    name: "Babygirl",
    immortal: true,
    createdAt: now,
    lastUpdatedAt: now,
    ageDays: 0,
    happiness: 0,
    alignment: 0, // neutral
    stats: ["swim","fly","run","power","stamina"].reduce((acc,k)=>({ ...acc, [k]: { level: 1, xp: 0 } }),{} as any),
    form: computeForm(0, false, {swim:1,fly:1,run:1,power:1,stamina:1})
  };
}

export function xpNeeded(level: number) { return 100 * level; }
export const ADULT_AGE_DAYS = 7;

export function computeForm(alignment: number, adult: boolean, levels: Record<string, number>) {
  const stage = adult ? "adult" : "child";
  const a = alignment <= -30 ? "dark" : alignment >= 30 ? "hero" : "neutral";
  const order = ["power","run","fly","swim"]; // will pick highest; ties → balanced
  let top = "balanced";
  if (adult) {
    let best = -1;
    for (const key of order) {
      const val = levels[key];
      if (val > best) { best = val; top = key; }
    }
    if (levels["power"]===levels["run"] && levels["run"]===levels["fly"] && levels["fly"]===levels["swim"]) {
      top = "balanced";
    }
  }
  const specialization = adult ? top : "balanced";
  const spriteKey = `${a}_${stage}_${specialization}`;
  const config = { runtime: "nodejs" };
  return { stage, alignment: a, specialization, spriteKey };
}
