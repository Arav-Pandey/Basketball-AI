import { Link } from "react-router-dom";

export default function Register() {
  return (
    <section className="flex min-h-[75vh] w-full items-center justify-center px-4 py-10 text-left text-white">
      <div
        className="w-full max-w-md space-y-5 rounded-2xl border border-orange-500/30 bg-slate-900/80 p-6 shadow-2xl backdrop-blur-xl sm:p-8"
      >
        <div className="text-center">
          <h1 className="text-3xl font-bold">Create an account</h1>
          <p className="mt-2 text-sm text-slate-300">
            Create an account securely with Auth0.
          </p>
        </div>

        <a
          href="/.netlify/functions/auth0-login?screen_hint=signup"
          className="block w-full rounded-lg bg-linear-to-r from-orange-500 to-amber-400 px-4 py-3 text-center font-bold text-slate-950 transition hover:brightness-110"
        >
          Continue to sign up
        </a>

        <p className="text-center text-sm text-slate-300">
          Already registered?{" "}
          <Link
            to="/login"
            className="font-semibold text-orange-300 underline hover:text-orange-200"
          >
            Log in
          </Link>
        </p>
      </div>
    </section>
  );
}
