import { useState } from "react";
import { PlayCircle } from "lucide-react";
import Steph from "./assets/Steph_Image.png";
import { useNavigate } from "react-router-dom";

export default function Home({ onCareerClick }: { onCareerClick: () => void }) {
  const navigate = useNavigate();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleGetStarted = async () => {
    const isGuest = sessionStorage.getItem("guestMode") === "true";

    // Guests can proceed without Auth0 verification
    if (isGuest) {
      navigate("/form-home");
      return;
    }

    // Otherwise, verify the Auth0 session
    try {
      const response = await fetch("/.netlify/functions/auth", {
        credentials: "same-origin",
        cache: "no-store",
      });

      if (response.status === 401) {
        window.alert("Log in or go to login page and continue as guest.");
        return;
      }

      if (!response.ok) {
        window.alert("Unable to verify login. Please try again.");
        return;
      }

      navigate("/form-home");
    } catch {
      window.alert("Unable to verify login. Please try again.");
    }
  };

  const handleSignOut = async () => {
    setIsSigningOut(true);
    window.location.assign("/.netlify/functions/logout");
  };

  return (
    <>
      <div className="flex min-h-screen w-full flex-col items-center justify-center text-center text-white">
        <div className="relative min-h-screen w-full overflow-hidden p-3 pb-24 sm:p-5 sm:pb-24 lg:p-8 lg:pb-8">
          <div className="mb-6 flex flex-col items-center gap-4 sm:mb-8 sm:flex-row sm:justify-between sm:gap-6">
            <img
              src="/BasketballAI_Logo.png"
              alt="Logo"
              className="h-13 w-auto sm:h-20 lg:h-26"
            />
            <h1 className="text-center text-2xl font-bold sm:text-3xl md:text-4xl lg:text-8xl">
              Basketball AI
            </h1>
            <img
              src="/BasketballAI_Logo.png"
              alt="Logo"
              className="hidden h-13 w-auto sm:block sm:h-20 lg:h-26"
            />
          </div>

          <div className="relative grid gap-6 sm:gap-10 lg:grid-cols-[1.4fr_1fr] lg:items-center">
            <div className="flex flex-col items-center space-y-6 text-center sm:space-y-8">
              <div className="space-y-4">
                <div className="relative mx-auto max-w-2xl">
                  <h2 className="text-xl font-bold tracking-wide text-white sm:text-2xl md:text-3xl lg:text-4xl">
                    Get better shooting accuracy with smarter and deeper
                    feedback on your shot
                  </h2>
                  <a
                    href="/demo"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-6 inline-flex items-center gap-2 text-base leading-7 text-orange-300 underline decoration-orange-400/60 underline-offset-4 transition hover:text-orange-100 sm:mt-8 sm:text-lg lg:text-2xl"
                  >
                    <PlayCircle
                      className="h-5 w-5 shrink-0"
                      aria-hidden="true"
                    />
                    Instructions Page
                  </a>
                </div>
              </div>

              <div className="mt-5 flex w-full flex-col items-center gap-4 sm:mt-8">
                <div className="grid w-full max-w-md grid-cols-2 gap-3 sm:gap-5">
                  <button
                    onClick={() => void handleGetStarted()}
                    className="inline-flex min-h-12 cursor-pointer items-center justify-center whitespace-nowrap rounded-full bg-linear-to-r from-orange-500 to-amber-400 px-3 py-3 text-sm font-semibold text-slate-950 shadow-xl shadow-orange-500/25 transition hover:scale-[1.02] hover:brightness-110 active:scale-95 sm:min-h-16 sm:px-8 sm:py-4 sm:text-2xl"
                  >
                    Get Started
                  </button>
                  <button
                    onClick={onCareerClick}
                    className="inline-flex min-h-12 cursor-pointer items-center justify-center whitespace-nowrap rounded-full border border-orange-400/60 px-3 py-3 text-sm font-semibold text-orange-200 transition hover:bg-orange-500/10 active:scale-95 sm:min-h-16 sm:px-8 sm:py-4 sm:text-2xl"
                  >
                    My Career
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => void handleSignOut()}
                  disabled={isSigningOut}
                  className="cursor-pointer rounded-full border border-white/25 px-5 py-2 text-sm font-semibold text-slate-300 transition hover:border-white/50 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isSigningOut ? "Signing out..." : "Sign out"}
                </button>
              </div>
            </div>

            <div className="relative hidden lg:flex items-center justify-center mb-4">
              <div className="absolute -inset-4 rounded-4xl bg-linear-to-br from-orange-500/25 via-transparent to-slate-900/20 blur-3xl" />

              <div className="relative overflow-hidden rounded-4xl border border-white/10 bg-slate-950/80 p-2 sm:p-3 shadow-xl">
                <img
                  src={Steph}
                  alt="Basketball illustration"
                  className="relative mx-auto h-48 sm:h-52 lg:h-60 w-auto object-contain rounded-2xl"
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
