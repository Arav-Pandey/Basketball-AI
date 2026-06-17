import { useState } from "react";
import { MdBackHand } from "react-icons/md";
import { IoHandLeft } from "react-icons/io5";
import { useNavigate } from "react-router-dom";

interface Props {
  setDominantHand: React.Dispatch<
    React.SetStateAction<"left" | "right" | null>
  >;
}

export default function HandOverlay({ setDominantHand }: Props) {
  const [vis, setVis] = useState(true);
  const navigate = useNavigate();

  return (
    <div
      id="choice-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm text-white"
      style={{ visibility: vis ? "visible" : "hidden" }}
    >
      <div className="relative w-full max-w-2xl rounded-4xl border border-orange-400/20 bg-slate-950/95 p-8 shadow-[0_40px_120px_rgba(0,0,0,0.45)]">
        <button
          id="close-btn"
          className="absolute cursor-pointer right-5 top-5 inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-slate-900/80 text-xl text-white transition hover:bg-orange-500/20"
          onClick={() => navigate("/")}
          aria-label="Close hand selection"
        >
          ×
        </button>

        <div className="space-y-4 text-center">
          <div className="mx-auto inline-flex rounded-full border border-orange-300/30 bg-orange-500/10 px-4 py-2 text-sm uppercase tracking-[0.24em] text-orange-200">
            Shooting hand
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-white">
            Which hand do you shoot with?
          </h2>
          <p className="mx-auto max-w-2xl text-lg leading-7 text-slate-300">
            Knowing your shooting hand helps Basketball AI tailor the shot
            analysis to your natural motion.
          </p>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {/* id="arc-btn" */}
          <button
            id="left-hand-btn"
            className="group flex cursor-pointer flex-col items-center justify-center gap-3 rounded-[1.75rem] border border-white/10 bg-slate-900/80 p-6 text-white shadow-xl transition hover:-translate-y-1 hover:border-orange-400/40 hover:bg-orange-500/10"
            onClick={() => {
              setDominantHand("left");
              setVis(false);
            }}
          >
            <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-orange-500/15">
              <IoHandLeft size={36} />
            </div>
            <div>
              <p className="text-xl font-semibold">Left</p>
            </div>
          </button>

          <button
            id="form-btn"
            className="group cursor-pointer flex flex-col items-center justify-center gap-3 rounded-[1.75rem] border border-white/10 bg-slate-900/80 p-6 text-white shadow-xl transition hover:-translate-y-1 hover:border-orange-400/40 hover:bg-orange-500/10"
            onClick={() => {
              setDominantHand("right");
              setVis(false);
            }}
          >
            <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-orange-500/15">
              <MdBackHand size={36} />
            </div>
            <div>
              <p className="text-xl font-semibold">Right</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
