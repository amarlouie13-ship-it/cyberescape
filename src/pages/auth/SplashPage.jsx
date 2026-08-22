import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function SplashScreen() {
  const navigate = useNavigate();
  const [progress, setProgress] = useState(1);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (ready) return undefined;

    const timer = window.setInterval(() => {
      setProgress((current) => {
        if (current >= 100) {
          window.clearInterval(timer);
          setReady(true);
          window.setTimeout(() => {
            navigate('/login', { replace: true });
          }, 500);
          return 100;
        }

        return current + 1;
      });
    }, 40);

    return () => window.clearInterval(timer);
  }, [navigate, ready]);

  return (
    <div className="fixed inset-0 overflow-hidden bg-[#010914]">
      <div
        className="
          relative
          m-1
          h-[calc(100vh-8px)]
          w-[calc(100vw-8px)]
          overflow-hidden
          rounded-[22px]
          border-2
          border-cyan-400/70
          bg-[#020b17]
          shadow-[0_0_0_1px_rgba(34,211,238,0.25),0_0_26px_rgba(34,211,238,0.18)]
          before:absolute
          before:inset-0
          before:rounded-[20px]
          before:border
          before:border-cyan-300/20
          before:content-['']
          after:absolute
          after:inset-0
          after:bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.08),transparent_55%)]
          after:content-['']
        "
      >
        <img
          src="/cyberescape-splash.png"
          alt="CyberEscape"
          className="
            absolute
            inset-0
            h-full
            w-full
            object-cover
            object-center
          "
        />

        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(2,11,23,0.12),rgba(2,11,23,0.38))]" />

        <div className="pointer-events-none absolute inset-0 rounded-[22px] shadow-[inset_0_0_70px_rgba(2,132,199,0.12)]" />

        <div
          className="
            absolute
            bottom-4
            left-1/2
            w-[min(92vw,520px)]
            -translate-x-1/2
            rounded-2xl
            border
            border-cyan-400/30
            bg-slate-950/78
            px-4
            py-3.5
            backdrop-blur-md
            shadow-[0_0_24px_rgba(34,211,238,0.12)]
            sm:bottom-6
            sm:px-5
            sm:py-4
          "
        >
          <div className="mb-3 flex items-center justify-between gap-3 text-[11px] text-slate-200 sm:text-sm">
            <p className="truncate">Loading secure environment...</p>
            <p className="shrink-0 font-semibold text-cyan-300">{ready ? 'Ready!' : `${progress}%`}</p>
          </div>

          <div className="h-3 w-full overflow-hidden rounded-full bg-slate-800/90 ring-1 ring-cyan-400/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-teal-400 to-blue-500 transition-all duration-150 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>

          <p className="mt-2 text-center text-[11px] font-semibold tracking-wide text-cyan-200/90 sm:text-xs">
            {ready ? 'Ready!' : 'Loading...'}
          </p>
        </div>
      </div>
    </div>
  );
}
