import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Brain from "./assets/Brain.png";
import DeepBrain from "./assets/DeepBrain.png";

export default function LiveOverlay() {
  const navigate = useNavigate();
  const [vis, setVis] = useState(true);

  return (
    <div
      id="choice-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm text-white p-4 sm:p-6"
      style={{ visibility: vis ? "visible" : "hidden" }}
    >
      <div className="relative w-full max-w-3xl overflow-hidden rounded-2xl sm:rounded-4xl border border-orange-400/20 bg-slate-950/95 p-6 sm:p-8 shadow-[0_40px_120px_rgba(0,0,0,0.45)]">
        <div className="absolute inset-x-0 top-0 h-16 sm:h-24 bg-linear-to-b from-orange-500/20 to-transparent" />
        <div className="absolute right-4 sm:right-6 top-4 sm:top-6 h-16 sm:h-24 w-16 sm:w-24 rounded-full bg-orange-500/10 blur-3xl" />
        <div className="absolute left-4 sm:left-6 bottom-4 sm:bottom-6 h-16 sm:h-20 w-16 sm:w-20 rounded-full bg-orange-500/10 blur-3xl" />

        <div className="relative space-y-4 sm:space-y-5 text-center">
          <div className="mx-auto inline-flex rounded-full border border-orange-300/30 bg-orange-500/10 px-3 sm:px-4 py-1 sm:py-2 text-xs uppercase tracking-[0.32em] text-orange-200">
            Select mode
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white">
            Deeper review or Live feedback?
          </h2>
        </div>

        <div className="mt-6 sm:mt-10 grid gap-3 sm:gap-4 sm:grid-cols-2">
          <button
            id="form-btn"
            className="group relative overflow-hidden rounded-xl cursor-pointer sm:rounded-[1.75rem] border border-white/10 bg-linear-to-br from-orange-500/15 via-slate-900/80 to-slate-950/95 p-4 sm:p-6 text-left shadow-xl transition hover:-translate-y-1 hover:border-orange-400/40 active:scale-95"
            onClick={() => {
              setVis(false);
            }}
          >
            <div className="absolute inset-y-0 left-0 w-1 bg-orange-400/80" />
            <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
              <div className="inline-flex h-16 sm:h-20 w-16 sm:w-20 items-center justify-center rounded-2xl sm:rounded-3xl bg-orange-500/20 shrink-0">
                <img
                  src={DeepBrain}
                  alt="Deeper"
                  className="h-12 sm:h-16 w-12 sm:w-16 object-contain"
                />
              </div>
              <div className="w-full">
                <p className="text-base sm:text-xl font-semibold text-white">
                  Deeper review
                </p>
                <p className="mt-1 sm:mt-2 text-xs sm:text-sm leading-5 sm:leading-6 text-slate-300">
                  {/* Record your session and get a full breakdown of body mechanics, release, and arc. */}
                  Record your session and get a full breakdown of body mechanics
                  and release.
                </p>
              </div>
            </div>
          </button>

          {/* id="arc-btn" */}
          <button
            id="live-btn"
            className="group relative overflow-hidden rounded-xl sm:rounded-[1.75rem] border cursor-pointer border-white/10 bg-linear-to-br from-slate-950/95 via-orange-500/10 to-slate-900/85 p-4 sm:p-6 text-left shadow-xl transition hover:-translate-y-1 hover:border-orange-400/40 active:scale-95"
            onClick={() => {
              setVis(false);
              navigate("/form-live");
            }}
          >
            <div className="absolute inset-y-0 left-0 w-1 bg-orange-400/80" />
            <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
              <div className="inline-flex h-16 sm:h-20 w-16 sm:w-20 items-center justify-center rounded-2xl sm:rounded-3xl bg-orange-500/20 shrink-0">
                <img
                  src={Brain}
                  alt="Live"
                  className="h-12 sm:h-16 w-12 sm:w-16 object-contain"
                />
              </div>
              <div className="w-full">
                <p className="text-base sm:text-xl font-semibold text-white">
                  Live feedback
                </p>
                <p className="mt-1 sm:mt-2 text-xs sm:text-sm leading-5 sm:leading-6 text-slate-300">
                  Coach your shot instantly as you film—perfect for quick
                  on-court improvements.
                </p>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
