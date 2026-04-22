import { useEffect, useState } from "react";
import { Facebook, Shield } from "lucide-react";

export default function SplashIntro({ onDone }: { onDone: () => void }) {
  const [progress, setProgress] = useState(0);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const total = 5000;
    const start = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / total);
      setProgress(p);
      if (p < 1) raf = requestAnimationFrame(tick);
      else {
        setExiting(true);
        setTimeout(onDone, 400);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [onDone]);

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-[#1877F2] via-[#1565C0] to-[#0D47A1] transition-opacity duration-400 ${
        exiting ? "opacity-0" : "opacity-100"
      }`}
    >
      <div className="relative">
        <div className="absolute inset-0 rounded-3xl bg-white/30 blur-2xl animate-pulse" />
        <div className="relative bg-white/15 backdrop-blur-md rounded-3xl p-7 border border-white/30 shadow-2xl">
          <div className="relative">
            <Facebook className="w-20 h-20 text-white" />
            <Shield
              className="absolute -bottom-1 -right-1 w-8 h-8 text-white drop-shadow-lg"
              fill="currentColor"
            />
          </div>
        </div>
      </div>

      <h1 className="mt-7 text-4xl font-black text-white tracking-tight drop-shadow-lg">
        DEVX BOOST
      </h1>
      <p className="text-white/80 text-sm mt-1 font-medium">Mass Automation Panel</p>

      <div className="mt-12 w-64 h-2 bg-white/20 rounded-full overflow-hidden shadow-inner">
        <div
          className="h-full bg-gradient-to-r from-white via-blue-100 to-white rounded-full transition-[width] duration-100 ease-out shadow-lg"
          style={{ width: `${Math.round(progress * 100)}%` }}
        />
      </div>
      <p className="mt-4 text-white/70 text-xs tracking-[0.3em] uppercase font-semibold">
        {progress < 0.25
          ? "Initializing"
          : progress < 0.5
          ? "Loading modules"
          : progress < 0.75
          ? "Connecting"
          : progress < 0.95
          ? "Almost ready"
          : "Welcome"}
      </p>
      <p className="mt-2 text-white/40 text-[10px] tracking-wider">
        {Math.round(progress * 100)}%
      </p>
    </div>
  );
}
