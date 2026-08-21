import { Menu } from 'lucide-react';

export default function DashboardShell({ sidebar, title, subtitle, children, onMenuClick }) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.10),transparent_28%),linear-gradient(180deg,#020617,#0f172a)] text-white">
      <div className="mx-auto flex min-h-screen max-w-[1800px]">
        <div className="hidden w-[290px] xl:block">{sidebar}</div>
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex items-center justify-between border-b border-white/10 bg-slate-950/70 px-4 py-4 backdrop-blur xl:px-8">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onMenuClick}
                className="rounded-2xl border border-white/10 bg-white/5 p-3 text-slate-200 xl:hidden"
              >
                <Menu size={18} />
              </button>
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">CyberEscape</p>
                <h1 className="text-2xl font-bold">{title}</h1>
                {subtitle ? <p className="text-sm text-slate-400">{subtitle}</p> : null}
              </div>
            </div>
          </header>
          <main className="flex-1 px-4 py-6 xl:px-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
