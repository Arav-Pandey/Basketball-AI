import { useEffect, useRef, useState } from "react";
import Steph from "./assets/Steph_Image.png";
import Logo from "./assets/Logo.png";
import { useNavigate } from "react-router-dom";

export default function Home() {
  // const [activeDefinition, setActiveDefinition] = useState<"form" | "arc" | null>(null);
  const navigate = useNavigate();
  const [activeDefinition, setActiveDefinition] = useState<"form" | null>(null);
  const definitionRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        activeDefinition &&
        definitionRef.current &&
        !definitionRef.current.contains(event.target as Node)
      ) {
        setActiveDefinition(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [activeDefinition]);

  return (
    <>
      <div className="flex min-h-[80vh] w-full flex-col items-center justify-center px-2 py-3 text-center text-white sm:px-4 sm:py-5">
        <div className="relative w-full overflow-hidden rounded-2xl border border-orange-500/30 bg-slate-900/70 p-3 shadow-[0_40px_100px_rgba(0,0,0,0.35)] backdrop-blur-xl sm:rounded-4xl sm:p-5 lg:p-8">
          <div className="mb-6 flex flex-col items-center gap-4 sm:mb-8 sm:flex-row sm:justify-between sm:gap-6">
            <img
              src={Logo}
              alt="Logo"
              className="h-16 w-auto sm:h-24 lg:h-30"
            />
            <h1 className="text-center text-4xl font-bold sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl">
              Basketball AI
            </h1>
            <img
              src={Logo}
              alt="Logo"
              className="hidden h-16 w-auto sm:block sm:h-24 lg:h-30"
            />
          </div>

          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,159,67,0.18),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(255,99,71,0.12),transparent_35%)]" />
          <div className="relative grid gap-6 sm:gap-10 lg:grid-cols-[1.4fr_1fr] lg:items-center">
            <div className="flex flex-col items-center space-y-6 text-center sm:space-y-8">
              <div className="space-y-4">
                <div className="relative mx-auto max-w-2xl" ref={definitionRef}>
                  <h2 className="text-xl font-bold tracking-wide text-white sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl">
                    Get better shooting accuracy with smarter and deeper
                    feedback on your shot
                    {/* and{' '}
                  <span className="relative inline-block">
                    <button
                      type="button"
                      onClick={() => setActiveDefinition("arc")}
                      className="font-semibold text-orange-300 underline decoration-orange-400/70 transition hover:text-orange-200"
                    >
                      arc
                    </button>
                    {activeDefinition === "arc" && (
                      <div className="absolute left-1/2 top-full z-10 mt-2 w-60 sm:w-72 -translate-x-1/2 rounded-[1.75rem] border border-white/10 bg-slate-950/95 p-3 sm:p-4 text-xs sm:text-sm text-slate-200 shadow-2xl">
                        <div className="absolute left-1/2 top-0 h-3 w-3 sm:h-4 sm:w-4 -translate-x-1/2 -translate-y-1/2 rotate-45 rounded-sm bg-slate-950/95 border-t border-l border-white/10" />
                        <button
                          type="button"
                          onClick={() => setActiveDefinition(null)}
                          className="absolute right-2 top-2 sm:right-3 sm:top-3 inline-flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-full text-slate-300 hover:bg-white/10 hover:text-white"
                          aria-label="Close definition"
                        >
                          ×
                        </button>
                        <p className="font-semibold text-white">Arc</p>
                        <p className="mt-2 text-slate-300">
                          Arc is the path the ball follows toward the basket — the height and curve that help the shot land softly and accurately.
                        </p>
                      </div>
                    )}
                  </span>{' '} */}
                  </h2>
                  <a
                    href="/demo"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-6 inline-block text-base leading-7 text-orange-400 underline sm:mt-8 sm:text-lg lg:text-2xl"
                  >
                    Click Here to Learn More!
                  </a>
                </div>
              </div>

              <div className="mt-8 flex flex-col items-center justify-center gap-3 text-xl sm:mt-12 sm:flex-row sm:gap-4 sm:text-2xl">
                <button
                  onClick={() => navigate("/form-home")}
                  className="w-full cursor-pointer inline-flex items-center justify-center rounded-full bg-linear-to-r from-orange-500 to-amber-400 px-6 py-3 font-semibold text-slate-950 shadow-xl shadow-orange-500/25 transition hover:scale-[1.02] hover:brightness-110 active:scale-95 sm:w-auto sm:px-8 sm:py-4 sm:text-2xl"
                >
                  Get Started
                </button>
              </div>
            </div>

            <div className="relative hidden lg:flex items-center justify-center mb-4">
              <div className="absolute -inset-4 rounded-4xl bg-linear-to-br from-orange-500/25 via-transparent to-slate-900/20 blur-3xl" />

              <div className="relative overflow-hidden rounded-4xl border border-white/10 bg-slate-950/80 p-2 sm:p-3 shadow-xl">
                <img
                  src={Steph}
                  alt="Basketball illustration"
                  className="relative mx-auto h-60 sm:h-66 lg:h-72 w-auto object-contain"
                />
                <div className="mt-2 sm:mt-3 rounded-2xl sm:rounded-3xl bg-slate-900/85 p-3 sm:p-4 text-xl sm:text-s text-slate-300 ring-1 ring-white/10">
                  <p className="font-semibold text-white">
                    {" "}
                    Compare to the Pros{" "}
                  </p>
                  <p className="mt-2 text-slate-400">
                    {" "}
                    Compare to the Greats of Basketball{" "}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
