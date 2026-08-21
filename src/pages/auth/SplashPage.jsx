import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function SplashPage() {
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setProgress((value) => {
        const next = Math.min(100, value + 2);
        if (next === 100) {
          window.clearInterval(timer);
          window.setTimeout(() => navigate('/auth/login', { replace: true }), 900);
        }
        return next;
      });
    }, 100);

    return () => window.clearInterval(timer);
  }, [navigate]);

  return (
    <div className="fixed inset-0 overflow-hidden bg-[#020617]">
      <img
        src="/cyberescape-splash.png"
        alt="CyberEscape splash screen"
        className="absolute inset-0 h-full w-full object-contain object-[50%_38%] scale-[0.96] sm:scale-[1.0] md:scale-[1.03]"
      />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.06),transparent_45%)]" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#020617] via-[#020617]/70 to-transparent" />

      <div className="absolute bottom-[5.5%] left-1/2 w-[min(32vw,280px)] -translate-x-1/2 text-center">
        <div className="rounded-2xl border border-cyan-400/20 bg-slate-950/74 px-2 py-1.5 shadow-[0_0_20px_rgba(34,211,238,0.08)] backdrop-blur sm:px-2.5 sm:py-2">
          <div className="mb-1.5 flex items-center justify-between text-[10px] text-slate-300 sm:text-[11px]">
            <span>Loading secure environment...</span>
            <span>{progress}%</span>
          </div>
          <div className="mx-auto h-2 w-[min(100%,180px)] overflow-hidden rounded-full bg-slate-800/90 ring-1 ring-cyan-400/10 sm:w-[min(100%,200px)]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-teal-400 to-blue-500 transition-all duration-150"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="mt-1 text-[11px] font-semibold tracking-wide text-cyan-200/90 sm:text-xs">Loading...</p>
        </div>
      </div>
    </div>
  );
}
