import { useState } from "react";
import { useNavigate } from "react-router-dom";
import formButton from "./assets/BasketballForm.png";
// import arcButton from "./assets/BasketballArc.png";

export default function Overlay() {
  const navigate = useNavigate();
  const [vis, setVis] = useState(true);

  return (
    <div
      id="choice-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm text-white p-4 sm:p-6"
      style={{ visibility: vis ? "visible" : "hidden" }}
    >
      <div className="relative w-full max-w-3xl rounded-2xl sm:rounded-4xl border border-orange-400/20 bg-slate-950/95 p-6 sm:p-8 shadow-[0_40px_120px_rgba(0,0,0,0.45)]">
        <div className="absolute inset-x-0 top-0 h-16 sm:h-24 bg-linear-to-b from-orange-500/20 to-transparent rounded-t-2xl sm:rounded-t-4xl" />

        <div className="relative space-y-4 sm:space-y-6 text-center">
          <div className="mx-auto inline-flex rounded-full border border-orange-300/30 bg-orange-500/10 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm uppercase tracking-[0.24em] text-orange-200">
            Training mode
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            {/* Work on form or arc like a pro. */}
            Work on form like a pro.
          </h2>
          <p className="mx-auto max-w-2xl text-xs sm:text-sm leading-6 sm:leading-7 text-slate-300">
            {/* Choose the path that fits your session: polish your shooting form or fine-tune your shot arc for more consistent makes. */}
            Choose the path that fits your session: polish your shooting form
            for more consistent makes.
          </p>
        </div>

        {/* <div className="mt-6 sm:mt-8 grid gap-3 sm:gap-4 sm:grid-cols-2"> */}
        <div className="mt-6 sm:mt-8 grid gap-3 sm:gap-4">
          <button
            id="form-btn"
            className="group flex flex-col items-center gap-3 sm:gap-4 rounded-xl sm:rounded-[1.75rem] border border-white/10 bg-linear-to-br from-orange-500/15 via-slate-900/80 to-slate-950/90 p-4 sm:p-6 text-left shadow-xl transition hover:-translate-y-1 hover:border-orange-400/40 active:scale-95"
            onClick={() => {
              setVis(false);
              navigate("/form-home");
            }}
          >
            <div className="inline-flex h-16 sm:h-20 w-16 sm:w-20 items-center justify-center rounded-2xl sm:rounded-3xl bg-orange-500/20">
              <img
                src={formButton}
                alt="Form"
                className="h-12 sm:h-16 w-12 sm:w-16 object-contain"
              />
            </div>
            <div className="w-full">
              <p className="text-base sm:text-xl font-semibold text-white">
                Form training
              </p>
              <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm leading-5 sm:leading-6 text-slate-300">
                Improve your posture, release, and balance with focused form
                feedback.
              </p>
            </div>
          </button>

          {/* <button */}
          {/*   id="arc-btn" */}
          {/*   className="group flex flex-col items-center gap-3 sm:gap-4 rounded-xl sm:rounded-[1.75rem] border border-white/10 bg-gradient-to-br from-slate-900/90 via-orange-500/10 to-slate-950/95 p-4 sm:p-6 text-left shadow-xl transition hover:-translate-y-1 hover:border-orange-400/40 active:scale-95" */}
          {/*   onClick={() => { */}
          {/*     setActive("ArcHome"); */}
          {/*     setVis(false); */}
          {/*   }} */}
          {/* > */}
          {/*   <div className="inline-flex h-16 sm:h-20 w-16 sm:w-20 items-center justify-center rounded-2xl sm:rounded-3xl bg-orange-500/20"> */}
          {/*     <img src={arcButton} alt="Arc" className="h-12 sm:h-16 w-12 sm:w-16 object-contain" /> */}
          {/*   </div> */}
          {/*   <div className="w-full"> */}
          {/*     <p className="text-base sm:text-xl font-semibold text-white">Arc training</p> */}
          {/*     <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm leading-5 sm:leading-6 text-slate-300"> */}
          {/*       Track shot trajectory and height so you can shape the perfect arc. */}
          {/*     </p> */}
          {/*   </div> */}
          {/* </button> */}
        </div>
      </div>
    </div>
  );
}
