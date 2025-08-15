import type { NextApiRequest, NextApiResponse } from "next";
import { kvGet, kvSet, getSessionId } from "./_kv";
import dayjs from "dayjs";
import { xpNeeded, computeForm, ADULT_AGE_DAYS } from "./chao";

const STATS = ["swim","fly","run","power","stamina"] as const;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const session = getSessionId(req) || "anon";
  const throttleKey = `thr:${session}`;
  const now = Date.now();
  const last = await kvGet(throttleKey);
  if (last && now - last.value < 60_000) {
    const state = await kvGet("state");
    return res.status(200).json({ throttled: true, state });
  }

  let state = await kvGet("state");
  if (!state) {
    res.status(400).json({ error: "No state" });
    return;
  }

  // Age progression (~50 visits per 'day')
  const visitAgeIncrement = 1 / (ADULT_AGE_DAYS * 50);
  state.ageDays = Math.min(999, state.ageDays + visitAgeIncrement);

  // Random XP gain
  const s = STATS[Math.floor(Math.random() * STATS.length)] as typeof STATS[number];
  const base = 0.35;
  const rand = 0.8 + Math.random() * 0.4;
  const gain = base * rand;

  let { level, xp } = state.stats[s];
  xp += gain;
  while (xp >= xpNeeded(level) && level < 99) {
    xp -= xpNeeded(level);
    level += 1;
    state.happiness = Math.min(100, (state.happiness || 0) + 2);
  }
  state.stats[s] = { level, xp };

// add after Random XP gain block and before Evolution check:
  // Optional alignment nudge via query (?align=±N)
  const alignDelta = Number((req.query?.align as string) || 0);
  if (!Number.isNaN(alignDelta) && alignDelta !== 0) {
    state.alignment = Math.max(-100, Math.min(100, state.alignment + alignDelta));
  }

  // Evolution check
  const adult = state.ageDays >= ADULT_AGE_DAYS;
  const levels: Record<string, number> = {
    swim: state.stats.swim.level, fly: state.stats.fly.level,
    run: state.stats.run.level, power: state.stats.power.level, stamina: state.stats.stamina.level
  };
  state.form = computeForm(state.alignment, adult, levels);
  state.lastUpdatedAt = new Date().toISOString();

  await kvSet("state", state);
  await kvSet(throttleKey, { value: now });

  res.status(200).json({ throttled: false, state, changedStat: s, gain });
}
export const config = { runtime: "nodejs" };

