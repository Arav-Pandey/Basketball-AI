import { useEffect } from "react";

interface Props {
  title: string;
  content: string;
  summary: string;
  videoLink: string;
  videoDescription: string;
  diagramImage?: string;
  diagramDescription?: string;
}

export default function SectionPage({
  title,
  content,
  summary,
  videoLink,
  videoDescription,
  diagramImage,
  diagramDescription,
}: Props) {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  function toEmbedUrl(url: string): string {
    const match = url.match(/(?:v=|youtu\.be\/)([\w-]{11})/);
    return match ? `https://www.youtube.com/embed/${match[1]}` : url;
  }

  return (
    <div className="min-h-screen bg-linear-to-br px-6 py-12">
      <div className="mx-auto max-w-4xl">
        <div className="relative overflow-hidden rounded-3xl border border-orange-500/20 bg-zinc-900/80 shadow-2xl backdrop-blur-md">
          <div className="h-1 w-full bg-linear-to-r from-orange-500 via-amber-400 to-orange-600" />
          <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-orange-500/10 blur-3xl" />

          <div className="relative z-10 p-10">
            <div className="mb-4 rounded-2xl border border-orange-500/20 bg-orange-500/10 px-4 py-3">
              <p className="text-sm text-orange-100">
                If you came from deeper analysis, the page you were on is still
                open in another tab.
              </p>
            </div>

            <div className="mb-8 flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-500/15 text-3xl">
                🏀
              </div>
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-orange-400">
                  Basketball Fundamentals
                </p>
                <h1 className="mt-1 text-4xl font-bold text-white">{title}</h1>
              </div>
            </div>

            <div className="mb-8 rounded-2xl border border-orange-500/20 bg-orange-500/10 p-5">
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-orange-400">
                Summary
              </p>
              <p className="text-lg font-medium leading-8 text-orange-100">
                {summary}
              </p>
            </div>

            <div className="mb-8 overflow-hidden rounded-2xl border border-orange-500/20 bg-zinc-900/60 shadow-lg">
              <div className="border-b border-orange-500/20 bg-orange-500/10 px-5 py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-400">
                  Watch & Learn
                </p>
                <h2 className="mt-1 text-xl font-semibold text-white">
                  See These Concepts in Action
                </h2>
                <h3 className="mt-2 text-lg text-zinc-300">
                  {videoDescription}
                </h3>
              </div>

              <div className="aspect-video">
                <iframe
                  className="h-full w-full"
                  src={toEmbedUrl(videoLink)}
                  title={title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>
            </div>

            {diagramImage && diagramDescription && (
              <div className="mb-8 overflow-hidden rounded-2xl border border-orange-500/20 bg-zinc-900/60 shadow-lg">
                <div className="border-b border-orange-500/20 bg-orange-500/10 px-5 py-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-400">
                    Visual Breakdown
                  </p>
                  <h2 className="mt-1 text-xl font-semibold text-white">
                    Diagram
                  </h2>
                  <h3 className="mt-2 text-lg text-zinc-300">
                    {diagramDescription}
                  </h3>
                </div>

                <div className="flex items-center justify-center bg-zinc-950/40 p-4">
                  <img
                    src={diagramImage}
                    alt={diagramDescription || `${title} diagram`}
                    className="max-h-125 w-full rounded-lg object-contain"
                  />
                </div>
              </div>
            )}

            <div className="whitespace-pre-line text-lg leading-9 text-zinc-300 selection:bg-orange-500/40">
              {content}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
