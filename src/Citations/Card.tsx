import { Link } from "react-router-dom";
import { type Section } from "./Citations";

interface Props {
  section: Section;
}

export default function SectionCard({ section }: Props) {
  return (
    <Link
      to={`/sections/${section.id}`}
      className=" cursor-pointer
        group
        relative
        overflow-hidden
        rounded-3xl
        border border-orange-500/20
        bg-linear-to-br from-zinc-900 via-neutral-900 to-black
        p-7
        text-left
        transition-all
        duration-300
        hover:-translate-y-2
        hover:border-orange-400
        hover:shadow-[0_0_35px_rgba(249,115,22,0.25)]
      "
    >
      {/* Orange accent bar */}
      <div className="absolute left-0 top-0 h-1 w-full bg-linear-to-r from-orange-500 via-amber-400 to-orange-600" />

      {/* Glow */}
      <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-orange-500/10 blur-3xl transition-all duration-300 group-hover:bg-orange-500/20" />

      <div className="relative z-10">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-wide text-white">
            {section.title}
          </h2>

          <div className="rounded-full bg-orange-500/15 p-2 text-orange-400 transition group-hover:scale-110">
            🏀
          </div>
        </div>

        <p className="leading-7 text-zinc-400">{section.description}</p>

        <div className="mt-6 flex items-center gap-2 text-orange-400 transition-all group-hover:translate-x-2">
          <span className="text-sm font-semibold uppercase tracking-widest">
            Learn More
          </span>
          <span className="text-lg">→</span>
        </div>
      </div>
    </Link>
  );
}
