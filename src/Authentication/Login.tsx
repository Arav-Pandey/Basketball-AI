import { useSearchParams } from "react-router-dom";
import { ArrowRight, ShieldCheck } from "lucide-react";

export default function Login() {
  const [searchParams] = useSearchParams();

  const handleGuestLogin = () => {
    sessionStorage.setItem("guestMode", "true");
    window.location.href = "/home";
  };

  return (
    <section className="relative flex min-h-dvh w-full items-center justify-center px-5 py-8 text-left text-white sm:px-8">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(ellipse at 50% 40%, rgba(249, 115, 22, 0.14), transparent 48%), radial-gradient(ellipse at 12% 85%, rgba(234, 88, 12, 0.09), transparent 36%), radial-gradient(ellipse at 90% 12%, rgba(59, 130, 246, 0.07), transparent 35%)",
          }}
        />
        <svg
          viewBox="0 0 1440 900"
          preserveAspectRatio="xMidYMid slice"
          className="absolute inset-0 h-full w-full text-orange-100 opacity-[0.09]"
        >
          <g
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            vectorEffect="non-scaling-stroke"
          >
            <rect x="36" y="36" width="1368" height="828" rx="28" />
            <path d="M720 36v828M246 300v300h-210M1194 300v300h210" />
            <circle cx="720" cy="450" r="118" />
            <path d="M36 190a210 210 0 0 1 0 520M1404 190a210 210 0 0 0 0 520" />
            <path d="M36 335a82 82 0 0 1 0 230M1404 335a82 82 0 0 0 0 230" />
          </g>
        </svg>
        <div className="absolute left-1/2 top-1/2 size-[min(75vw,34rem)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-orange-400/10 blur-[100px]" />
      </div>
      <div className="relative z-10 w-full max-w-lg">
        <div className="flex items-center justify-center gap-4">
          <img
            src="/BasketballAI_Logo.png"
            alt=""
            className="size-16 object-contain sm:size-20"
          />
          <span className="text-2xl font-extrabold tracking-tight sm:text-3xl">
            Basketball AI
          </span>
        </div>

        <div className="mt-10 text-center sm:mt-12">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-orange-300">
            Welcome
          </p>
          <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">
            Ready to get better?
          </h1>
          <p className="mx-auto mt-4 max-w-md text-base leading-7 text-slate-300 sm:text-lg">
            Sign in to pick up your training, review your progress, and make
            every practice count.
          </p>
        </div>

        {searchParams.has("authError") && (
          <p
            role="alert"
            className="mt-8 rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm leading-6 text-red-200"
          >
            Login could not be completed. Please try again.
          </p>
        )}

        <a
          href="/.netlify/functions/auth0-login"
          className="group mx-auto mt-7 flex min-h-12 w-full max-w-sm items-center justify-center gap-2 rounded-xl bg-linear-to-r from-orange-400 to-amber-300 px-4 py-3 text-sm font-bold text-slate-950 shadow-lg shadow-orange-950/30 transition duration-200 hover:-translate-y-0.5 hover:from-orange-300 hover:to-amber-200 hover:shadow-xl hover:shadow-orange-950/40 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-orange-200 active:translate-y-0 sm:mt-8"
        >
          Continue to sign in
          <ArrowRight
            aria-hidden="true"
            size={18}
            className="transition-transform group-hover:translate-x-1"
          />
        </a>

        <div className="mt-6 flex items-center justify-center gap-2 text-sm text-slate-400">
          <ShieldCheck
            aria-hidden="true"
            size={17}
            className="text-orange-300"
          />
          <span>
            Secure sign-in with Auth0 and MongoDB Atlas. Your account stays
            protected.
          </span>
        </div>

        <p className="mt-10 text-center text-sm text-slate-400">
          Don't want to login in?{" "}
          <button
            onClick={handleGuestLogin}
            className="font-semibold text-orange-300 underline decoration-orange-300/40 underline-offset-4 transition hover:text-orange-200"
          >
            Continue as Guest
          </button>
        </p>
      </div>
    </section>
  );
}
