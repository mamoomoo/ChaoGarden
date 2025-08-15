import { useEffect, useState } from "react";
import "../styles/globals.css";

export default function Debug() {
  const [state, setState] = useState<any>(null);
  async function load() {
    const r = await fetch("/api/chao");
    setState(await r.json());
  }
  async function increment() {
    const r = await fetch("/api/increment", { method: "POST" });
    const j = await r.json();
    setState(j.state);
  }

  // quick alignment nudge (client-only, dev helper): calls a tiny inline API via query string
  async function nudgeAlignment(delta: number) {
    const r = await fetch(`/api/increment?align=${delta}`, { method: "POST" });
    const j = await r.json();
    setState(j.state);
  }

  useEffect(()=>{ load(); },[]);

  return (
    <main className="min-h-screen p-6 text-gray-200">
      <div className="max-w-xl mx-auto space-y-4">
        <h1 className="text-xl font-semibold">Debug</h1>
        <pre className="bg-gray-900 p-3 rounded overflow-auto text-xs">{JSON.stringify(state, null, 2)}</pre>
        <div className="flex gap-2">
          <button className="btn" onClick={increment}>Increment</button>
          <button className="btn" onClick={()=>nudgeAlignment(5)}>Align +5</button>
          <button className="btn" onClick={()=>nudgeAlignment(-5)}>Align -5</button>
        </div>
        <p className="text-xs text-gray-400">
          Tip: open <code>/</code> (the widget) in another tab to see live updates.
        </p>
      </div>
    </main>
  );
}
