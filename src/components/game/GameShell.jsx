import { Clock3, PauseCircle } from 'lucide-react';

export default function GameShell({ title, timer, left, center, right, onPause }) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.1),transparent_25%),linear-gradient(180deg,#020617,#0f172a)] px-4 py-4 text-white lg:px-6">
      <div className="mx-auto max-w-[1800px]">
        <header className="mb-4 flex items-center justify-between rounded-3xl border border-white/10 bg-slate-950/70 px-4 py-4 backdrop-blur">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">CyberEscape</p>
            <h1 className="text-2xl font-bold">{title}</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-slate-200">
              <Clock3 size={18} />
              <span>{timer}</span>
            </div>
            <button type="button" onClick={onPause} className="flex items-center gap-2 rounded-2xl bg-cyan-400 px-4 py-2 font-semibold text-slate-950">
              <PauseCircle size={18} />
              Pause
            </button>
          </div>
        </header>

        <div className="grid gap-4 xl:grid-cols-[0.85fr_1.4fr_0.85fr]">
          <section className="rounded-3xl border border-white/10 bg-slate-900/80 p-5">{left}</section>
          <section className="rounded-3xl border border-cyan-400/20 bg-slate-900/90 p-5 shadow-glow">{center}</section>
          <section className="rounded-3xl border border-white/10 bg-slate-900/80 p-5">{right}</section>
        </div>
      </div>
    </div>
  );
}
