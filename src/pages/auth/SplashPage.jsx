import { useEffect, useState } from "react";
import splashImage from "../assets/cyberescape-splash.png";

export default function SplashScreen() {
  const [progress, setProgress] = useState(1);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((current) => {
        if (current >= 100) {
          clearInterval(timer);

          // Change this to your login route if needed
          setTimeout(() => {
            window.location.href = "/login";
          }, 500);

          return 100;
        }

        return current + 1;
      });
    }, 40);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen w-full bg-[#010914] flex items-center justify-center overflow-hidden">
      
      {/* MAXIMUM OUTER BORDER */}
      <div
        className="
          relative
          w-[100vw]
          h-[100vh]
          max-w-none
          border-2
          border-cyan-500/60
          rounded-[24px]
          overflow-hidden
          bg-[#020b17]
          shadow-[0_0_35px_rgba(0,200,255,0.25)]
        "
      >
        {/* BACKGROUND IMAGE */}
        <img
          src={splashImage}
          alt="CyberEscape"
          className="
            absolute
            inset-0
            w-full
            h-full
            object-cover
            object-center
          "
        />

        {/* DARK OVERLAY */}
        <div className="absolute inset-0 bg-black/5" />

        {/* LOADING SECTION */}
        <div
          className="
            absolute
            bottom-6
            left-1/2
            -translate-x-1/2
            w-[90%]
            max-w-[520px]
            rounded-2xl
            border
            border-cyan-500/40
            bg-[#020b18]/95
            px-5
            py-4
            backdrop-blur-sm
            shadow-[0_0_25px_rgba(0,200,255,0.12)]
          "
        >
          {/* TEXT + PERCENTAGE */}
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm text-slate-200">
              Loading secure environment...
            </p>

            <p className="text-sm font-semibold text-cyan-300">
              {progress}%
            </p>
          </div>

          {/* LOADING BAR */}
          <div className="h-3 w-full overflow-hidden rounded-full bg-slate-800">
            <div
              className="
                h-full
                rounded-full
                bg-gradient-to-r
                from-cyan-500
                via-sky-400
                to-cyan-300
                transition-all
                duration-100
                shadow-[0_0_12px_rgba(34,211,238,0.8)]
              "
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* LOADING TEXT */}
          <p className="mt-3 text-center font-semibold text-cyan-300">
            {progress < 100 ? "Loading..." : "System Ready"}
          </p>
        </div>
      </div>
    </div>
  );
}