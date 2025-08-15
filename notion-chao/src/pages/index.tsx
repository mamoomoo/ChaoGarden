import { useEffect, useMemo, useRef, useState } from "react";
import Head from "next/head";
import "../styles/globals.css";

type Stat = { level: number; xp: number };
type State = {
  id: string; name: string; createdAt: string; lastUpdatedAt: string;
  ageDays: number; happiness: number; alignment: number; immortal: boolean;
  stats: Record<"swim"|"fly"|"run"|"power"|"stamina", Stat>;
  form: { stage: string; alignment: string; specialization: string; spriteKey: string };
};

const STAT_LIST = ["swim","fly","run","power","stamina"] as const;
const COLOR_BY_ALIGN: Record<string,string> = { hero: "from-blue-500", dark:"from-violet-500", neutral:"from-green-500" };

export default function Widget() {
  const [state, setState] = useState<State | null>(null);
  const [levelUp, setLevelUp] = useState<string | null>(null);
  const initial = useRef(true);

  async function fetchState() {
    const r = await fetch("/api/chao");
    const s = await r.json();
    setState(s);
  }
  async function increment() {
    const r = await fetch("/api/increment", { method: "POST" });
    const j = await r.json();
    if (j.state) {
      const prev = state;
      if (prev) {
        const k = j.changedStat;
        const prevLv = prev.stats[k].level;
        const nextLv = j.state.stats[k].level;
        if (nextLv > prevLv) {
          setLevelUp(k);
          setTimeout(()=>setLevelUp(null), 1200);
        }
      }
      setState(j.state);
    }
  }

  useEffect(()=>{ fetchState(); },[]);
  useEffect(()=>{
    if (initial.current && state) {
      initial.current = false;
      increment(); // visit = small XP
    }
  },[state]);

  const spriteSrc = useMemo(()=>{
    if (!state) return "/assets/placeholder.png";
    const { spriteKey } = state.form;
    const map: Record<string,string> = {
      "neutral_child_balanced": "/assets/sprites/child_neutral_balanced.png",
      "hero_child_balanced": "/assets/sprites/child_hero_balanced.png",
      "dark_child_balanced": "/assets/sprites/child_dark_balanced.png",
      "neutral_adult_balanced": "/assets/sprites/adult_neutral_balanced.png",
      "neutral_adult_swim": "/assets/sprites/adult_neutral_swim.png",
      "neutral_adult_fly": "/assets/sprites/adult_neutral_fly.png",
      "neutral_adult_run": "/assets/sprites/adult_neutral_run.png",
      "neutral_adult_power": "/assets/sprites/adult_neutral_power.png",
      "hero_adult_balanced": "/assets/sprites/adult_hero_balanced.png",
      "hero_adult_swim": "/assets/sprites/adult_hero_swim.png",
      "hero_adult_fly": "/assets/sprites/adult_hero_fly.png",
      "hero_adult_run": "/assets/sprites/adult_hero_run.png",
      "hero_adult_power": "/assets/sprites/adult_hero_power.png",
      "dark_adult_balanced": "/assets/sprites/adult_dark_balanced.png",
      "dark_adult_swim": "/assets/sprites/adult_dark_swim.png",
      "dark_adult_fly": "/assets/sprites/adult_dark_fly.png",
      "dark_adult_run": "/assets/sprites/adult_dark_run.png",
      "dark_adult_power": "/assets/sprites/adult_dark_power.png"
    };
    return map[spriteKey] || "/assets/placeholder.png";
  },[state]);

  return (
    <>
      <Head><title>Chao Widget</title><meta name="viewport" content="width=device-width, initial-scale=1" /></Head>
      <main className="min-h-screen grid place-items-center p-4">
        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-lg font-semibold">{state?.name ?? "Babygirl"}</div>
              <div className="text-xs text-gray-400">
                Age: {state ? state.ageDays.toFixed(2) : "0.00"} days ·
                Form: {state?.form.alignment}/{state?.form.stage}/{state?.form.specialization}
              </div>
            </div>
            <button className="btn" onClick={()=>increment()}>Train</button>
          </div>

          <div className="relative bg-gray-900 rounded-lg overflow-hidden mb-4 grid place-items-center"
               style={{height: 220, backgroundImage: "url(/bg.png)", backgroundSize:"cover"}}>
            <img src={spriteSrc} alt="Chao" className="h-40 object-contain mt-4 drop-shadow-[0_6px_6px_rgba(0,0,0,0.5)]" />
            {levelUp && (
              <div className="absolute top-6 right-6 text-pink-300 text-3xl animate-pulse">❤</div>
            )}
          </div>

          <div className="space-y-1">
            {STAT_LIST.map((k)=> {
              const lv = state?.stats[k].level ?? 1;
              const xp = state?.stats[k].xp ?? 0;
              const need = 100 * lv;
              const pct = Math.min(100, Math.round((xp/
import { useEffect, useMemo, useRef, useState } from "react";
import Head from "next/head";
import "../styles/globals.css";

type Stat = { level: number; xp: number };
type State = {
  id: string; name: string; createdAt: string; lastUpdatedAt: string;
  ageDays: number; happiness: number; alignment: number; immortal: boolean;
  stats: Record<"swim"|"fly"|"run"|"power"|"stamina", Stat>;
  form: { stage: string; alignment: "neutral"|"hero"|"dark"; specialization: string; spriteKey: string };
};

const STAT_LIST = ["swim","fly","run","power","stamina"] as const;
const FRIENDLY_NAME: Record<typeof STAT_LIST[number], string> = {
  swim: "Swim", fly: "Fly", run: "Run", power: "Power", stamina: "Stamina"
};

function ensureSessionCookie() {
  if (typeof document === "undefined") return;
  const has = document.cookie.includes("chao_session=");
  if (!has) {
    const id = Math.random().toString(36).slice(2);
    const in1yr = new Date(Date.now() + 365*24*3600*1000).toUTCString();
    document.cookie = `chao_session=${id}; expires=${in1yr}; path=/; SameSite=Lax`;
  }
}

export default function Widget() {
  const [state, setState] = useState<State | null>(null);
  const [levelUp, setLevelUp] = useState<string | null>(null);
  const initial = useRef(true);

  async function fetchState() {
    const r = await fetch("/api/chao");
    const s = await r.json();
    setState(s);
  }
  async function increment() {
    const r = await fetch("/api/increment", { method: "POST" });
    const j = await r.json();
    if (j.state) {
      // level-up heart
      if (state && j.changedStat) {
        const k = j.changedStat as typeof STAT_LIST[number];
        const prevLv = state.stats[k].level;
        const nextLv = j.state.stats[k].level;
        if (nextLv > prevLv) {
          setLevelUp(k);
          setTimeout(()=>setLevelUp(null), 1200);
        }
      }
      setState(j.state);
    }
  }

  useEffect(()=>{
    ensureSessionCookie();
    fetchState();
  },[]);

  useEffect(()=>{
    if (initial.current && state) {
      initial.current = false;
      increment(); // visit = small XP
    }
  },[state]);

  const spriteSrc = useMemo(()=>{
    if (!state) return "/assets/placeholder.png";
    const { spriteKey } = state.form;
    const map: Record<string,string> = {
      "neutral_child_balanced": "/assets/sprites/child_neutral_balanced.png",
      "hero_child_balanced": "/assets/sprites/child_hero_balanced.png",
      "dark_child_balanced": "/assets/sprites/child_dark_balanced.png",
      "neutral_adult_balanced": "/assets/sprites/adult_neutral_balanced.png",
      "neutral_adult_swim": "/assets/sprites/adult_neutral_swim.png",
      "neutral_adult_fly": "/assets/sprites/adult_neutral_fly.png",
      "neutral_adult_run": "/assets/sprites/adult_neutral_run.png",
      "neutral_adult_power": "/assets/sprites/adult_neutral_power.png",
      "hero_adult_balanced": "/assets/sprites/adult_hero_balanced.png",
      "hero_adult_swim": "/assets/sprites/adult_hero_swim.png",
      "hero_adult_fly": "/assets/sprites/adult_hero_fly.png",
      "hero_adult_run": "/assets/sprites/adult_hero_run.png",
      "hero_adult_power": "/assets/sprites/adult_hero_power.png",
      "dark_adult_balanced": "/assets/sprites/adult_dark_balanced.png",
      "dark_adult_swim": "/assets/sprites/adult_dark_swim.png",
      "dark_adult_fly": "/assets/sprites/adult_dark_fly.png",
      "dark_adult_run": "/assets/sprites/adult_dark_run.png",
      "dark_adult_power": "/assets/sprites/adult_dark_power.png"
    };
    return map[spriteKey] || "/assets/placeholder.png";
  },[state]);

  const alignColor = state?.form.alignment === "hero"
    ? "from-blue-500"
    : state?.form.alignment === "dark"
    ? "from-violet-500"
    : "from-green-500";

  return (
    <>
      <Head>
        <title>Chao Widget</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <main className="min-h-screen grid place-items-center p-4">
        <div className="card w-[360px]">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-lg font-semibold">{state?.name ?? "Babygirl"}</div>
              <div className="text-xs text-gray-400">
                Age: {state ? state.ageDays.toFixed(2) : "0.00"} days ·{" "}
                {state ? `${state.form.alignment}/${state.form.stage}/${state.form.specialization}` : "neutral/child/balanced"}
              </div>
            </div>
            <button className="btn" onClick={()=>increment()}>Train</button>
          </div>

          <div
            className="relative rounded-lg overflow-hidden mb-4 grid place-items-center"
            style={{
              height: 220,
              background: "url(/bg.png) center/cover, #0a0f1a"
            }}
          >
            <img
              src={spriteSrc}
              alt="Chao"
              className="h-40 object-contain mt-6 drop-shadow-[0_6px_6px_rgba(0,0,0,0.5)]"
            />
            {levelUp && (
              <div className="absolute top-5 right-5 text-pink-300 text-3xl animate-pulse select-none">❤</div>
            )}
          </div>

          <div className="space-y-1">
            {STAT_LIST.map((k)=> {
              const lv = state?.stats[k].level ?? 1;
              const xp = state?.stats[k].xp ?? 0;
              const need = 100 * lv;
              const pct = Math.min(100, Math.round((xp/need) * 100));
              const barColor =
                state?.form.alignment === "hero" ? "bg-blue-500" :
                state?.form.alignment === "dark" ? "bg-violet-500" : "bg-green-500";
              return (
                <div key={k} className="stat-row">
                  <div className="w-20 stat-label">{FRIENDLY_NAME[k]}</div>
                  <div className="flex-1 stat-bar">
                    <div
                      className={`stat-fill ${barColor}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="w-16 text-right text-xs text-gray-300">
                    Lv {lv}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-4 flex items-center justify-between">
            <div className="text-xs text-gray-400">
              Happiness: {state?.happiness ?? 0}
            </div>
            <a className="text-xs underline text-gray-400 hover:text-gray-200" href="/debug">debug</a>
          </div>
        </div>
      </main>
    </>
  );
}
