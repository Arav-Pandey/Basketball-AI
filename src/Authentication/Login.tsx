import { useSearchParams } from "react-router-dom";

export default function Login() {
  const [searchParams] = useSearchParams();

  return (
    <section className="flex min-h-[75vh] w-full items-center justify-center px-4 py-10 text-left text-white">
      <div className="w-full max-w-md space-y-5 rounded-2xl border border-orange-500/30 bg-slate-900/80 p-6 shadow-2xl backdrop-blur-xl sm:p-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Log in</h1>
          <p className="mt-2 text-sm text-slate-300">
            Sign in with your account.
          </p>
        </div>

        {searchParams.has("authError") && (
          <p role="alert" className="text-sm text-red-300">
            Login could not be completed. Please try again.
          </p>
        )}
        <a
          href="/.netlify/functions/auth0-login"
          className="block w-full rounded-lg bg-linear-to-r from-orange-500 to-amber-400 px-4 py-3 text-center font-bold text-slate-950 transition hover:brightness-110"
        >
          Continue with Auth0
        </a>
        <p className="text-center text-sm text-slate-400">
          This login is securely managed by Auth0, a widely trusted authentication service. If you’re unsure, you’re welcome to look into Auth0 before continuing.
        </p>
      </div>
    </section>
  );
}
