import SectionCard from "./Citations/Card";
import { sections } from "./Citations/Citations";

export default function Demo() {
  return (
    <div className="w-full min-h-screen pb-20 pt-20 overflow-hidden bg-black px-3 text-center sm:px-6 lg:px-10">
      <div className="relative flex min-h-screen flex-col items-center justify-start p-3 text-white sm:p-4 lg:p-6">
        <div className="w-full max-w-6xl">
          <div className="relative overflow-hidden rounded-3xl border border-orange-500/20 bg-linear-to-br from-zinc-900 via-neutral-900 to-black p-10 shadow-[0_0_35px_rgba(249,115,22,0.15)]">
            {/* Accent */}
            <div className="absolute left-0 top-0 h-1 w-full bg-linear-to-r from-orange-500 via-amber-400 to-orange-600" />

            {/* Glow */}
            <div className="absolute -right-20 -top-20 h-60 w-60 rounded-full bg-orange-500/10 blur-3xl" />

            <div className="relative z-10 text-center">
              <p className="text-sm uppercase tracking-[0.35em] text-orange-400">
                Basketball AI
              </p>

              <h1 className="mt-3 text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
                Our Focus
              </h1>

              <p className="mt-6 text-base leading-7 text-zinc-300 sm:mt-8 sm:text-lg sm:leading-8 lg:text-xl lg:leading-9">
                Basketball AI brings a premium basketball training experience
                directly to your browser. Using computer vision and
                biomechanical analysis, it evaluates your shooting form,
                identifies areas for improvement, and delivers personalized
                feedback to help you become a more consistent shooter.
              </p>
            </div>
          </div>
        </div>
        <div className="mt-12 w-full max-w-6xl sm:mt-16">
          <h2 className="mb-6 text-center text-2xl font-bold sm:text-3xl">
            How Basketball AI Works
          </h2>

          <div className="grid gap-6 md:grid-cols-3">
            <div className="group rounded-3xl border border-orange-500/20 bg-linear-to-br from-zinc-900 via-neutral-900 to-black p-6 text-center transition hover:-translate-y-2 hover:border-orange-400 hover:shadow-[0_0_30px_rgba(249,115,22,0.2)] sm:p-7">
              <div className="mb-4 text-4xl">🎥</div>

              <p className="text-orange-400 uppercase tracking-[0.2em] text-sm">
                Step 1
              </p>

              <h3 className="mt-2 text-2xl font-bold text-white">
                Analyze Your Shot
              </h3>

              <p className="mt-4 leading-7 text-zinc-400">
                Upload or record your jump shot. Basketball AI detects your
                body, basketball, and shooting motion frame by frame.
              </p>
            </div>

            <div className="group rounded-3xl border border-orange-500/20 bg-linear-to-br from-zinc-900 via-neutral-900 to-black p-7 transition hover:-translate-y-2 hover:border-orange-400 hover:shadow-[0_0_30px_rgba(249,115,22,0.2)]">
              <div className="mb-4 text-4xl">📊</div>

              <p className="text-orange-400 uppercase tracking-[0.2em] text-sm">
                Step 2
              </p>

              <h3 className="mt-2 text-2xl font-bold text-white">
                Receive Detailed Feedback
              </h3>

              <p className="mt-4 leading-7 text-zinc-400">
                Your mechanics are evaluated across multiple areas including
                balance, foot placement, knee bend, elbow alignment, and release
                mechanics.
              </p>
            </div>

            <div className="group rounded-3xl border border-orange-500/20 bg-linear-to-br from-zinc-900 via-neutral-900 to-black p-7 transition hover:-translate-y-2 hover:border-orange-400 hover:shadow-[0_0_30px_rgba(249,115,22,0.2)]">
              <div className="mb-4 text-4xl">🏀</div>

              <p className="text-orange-400 uppercase tracking-[0.2em] text-sm">
                Step 3
              </p>

              <h3 className="mt-2 text-2xl font-bold text-white">
                Compare to the Pros
              </h3>

              <p className="mt-4 leading-7 text-zinc-400">
                See which NBA player's shooting mechanics most closely resemble
                yours and understand where your form differs from elite
                shooters.
              </p>
            </div>
          </div>
        </div>
        <div className="w-full max-w-6xl">
          <h1 className="mt-12 mb-8 text-center text-2xl font-bold sm:mt-16 sm:text-3xl lg:text-4xl">
            Sources
          </h1>
          {/* Cards with previews  */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {sections.map((section) => (
              <SectionCard key={section.id} section={section} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
