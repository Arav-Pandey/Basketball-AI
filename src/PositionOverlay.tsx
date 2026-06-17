import { useState } from "react";
import BigMan from "./assets/BigMan.png";
import PointGuard from "./assets/PointGuard.png";
import PowerForward from "./assets/PowerForward.png";
import ShootingGuard from "./assets/ShootingGuard.png";

interface Props {
  positionRef: React.RefObject<string>;
}

export default function PositionOverlay({ positionRef }: Props) {
  const [vis, setVis] = useState(true);

  const options = [
    { label: "Point Guard", value: "point guard", image: PointGuard },
    { label: "Shooting Guard", value: "shooting guard", image: ShootingGuard },
    { label: "Power Forward", value: "power forward", image: PowerForward },
    { label: "Big Man", value: "big man", image: BigMan },
  ];

  return (
    <div
      id="choice-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm text-white"
      style={{ visibility: vis ? "visible" : "hidden" }}
    >
      <div className="relative w-full max-w-4xl rounded-[2rem] border border-orange-400/20 bg-slate-950/95 p-8 shadow-[0_40px_120px_rgba(0,0,0,0.45)]">
        <button
          id="close-btn"
          className="absolute right-5 top-5 inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-slate-900/80 text-xl text-white transition hover:bg-orange-500/20"
          onClick={() => {
            setVis(false);
            window.location.reload();
          }}
          aria-label="Close position selection"
        >
          ×
        </button>

        <div className="relative space-y-4 text-center">
          <div className="mx-auto inline-flex rounded-full border border-orange-300/30 bg-orange-500/10 px-4 py-2 text-sm uppercase tracking-[0.24em] text-orange-200">
            Player profile
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-white">
            What position do you play?
          </h2>
          <p className="mx-auto max-w-2xl text-sm leading-7 text-slate-300">
            Help Basketball AI tune its feedback by selecting your court role.
          </p>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {options.map((option) => (
            <button
              key={option.value}
              className="group flex items-center gap-4 rounded-[1.75rem] border border-white/10 bg-slate-900/80 p-5 text-left shadow-xl transition hover:-translate-y-1 hover:border-orange-400/30 hover:bg-orange-500/10"
              onClick={() => {
                positionRef.current = option.value;
                setVis(false);
              }}
            >
              <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-orange-500/15">
                <img
                  src={option.image}
                  alt={option.label}
                  className="h-16 w-16 object-contain"
                />
              </div>
              <div>
                <p className="text-xl font-semibold text-white">
                  {option.label}
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  {option.label === "Point Guard" &&
                    "Control the offense and set your rhythm."}
                  {option.label === "Shooting Guard" &&
                    "Attack the rim and knock down perimeter shots."}
                  {option.label === "Power Forward" &&
                    "Dominate the paint and create physical scoring chances."}
                  {option.label === "Big Man" &&
                    "Anchor the defense and finish strong around the rim."}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
