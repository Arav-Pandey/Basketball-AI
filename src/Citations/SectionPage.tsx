import { useEffect } from "react";

interface Props {
  title: string;
  content: string;
  summary: string;
  videoLink: string;
  videoDescription: string;
}

export default function SectionPage({
  title,
  content,
  summary,
  videoLink,
  videoDescription,
}: Props) {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  function toEmbedUrl(url: string): string {
    const match = url.match(/(?:v=|youtu\.be\/)([\w-]{11})/);
    return match ? `https://www.youtube.com/embed/${match[1]}` : url;
  }

  return (
    <div className="min-h-screen w-full px-4 py-16 sm:px-6 sm:py-20">
      <div className="mx-auto max-w-4xl">
        <div className="relative">
          <div className="relative z-10">
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

            <div className="mb-8 w-full mx-auto max-w-4xl overflow-hidden rounded-2xl border border-orange-500/20 bg-zinc-900/60 shadow-lg">
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

              <div className="w-full max-w-3xl aspect-video mx-auto">
                <iframe
                  className="h-full w-full rounded-lg"
                  src={toEmbedUrl(videoLink)}
                  title={title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>
            </div>

            {content && (
              <div className="mb-8 mx-auto w-full max-w-4xl overflow-hidden rounded-2xl border border-orange-500/30 bg-zinc-900/60 shadow-[0_0_20px_-6px_rgba(249,115,22,0.2)] backdrop-blur-sm">
                <div className="bg-orange-500/10 px-6 py-5 whitespace-pre-line text-base leading-relaxed text-zinc-200 selection:bg-orange-500/40 selection:text-orange-100 sm:text-lg sm:leading-8">
                  {content}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
