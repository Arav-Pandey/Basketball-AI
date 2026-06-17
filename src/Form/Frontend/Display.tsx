import "./Display.css";
import HandOverlay from "../../HandOverlay";
import { AlertTriangle, Play, Pause } from "lucide-react";
import { useEffect, useState } from "react";
import VideoSlider from "./VideoSlider";
import FeedbackTable from "./FeedbackTable";
import type { DisplayProps } from "../interfaces";

function EmojiGuide({
  emoji,
  meaning,
  color,
}: {
  emoji: string;
  meaning: string;
  color: string;
}) {
  return (
    <div
      className="flex items-center gap-2 rounded-full border px-3 py-1.5"
      style={{
        borderColor: `hsl(${color} / 0.2)`,
        backgroundColor: `hsl(${color} / 0.1)`,
      }}
    >
      <span className="text-xl">{emoji}</span>

      <span
        className="text-sm font-semibold"
        style={{ color: `hsl(${color})` }}
      >
        {meaning}
      </span>
    </div>
  );
}

export default function Display({
  videoRef,
  canvasRef,
  rewatchFeedback,
  feetFeedback,
  flareFeedback,
  similarityFeedback,
  errorFeedback,
  flareScore,
  similarity,
  setDominantHand,
  bendFeedback,
  bendScore,
  kneeFeedback,
  kneeFlareFeedback,
  feetDistanceScore,
  kneeDistanceScore,
  kneeFlareScore,
  setDetails,
  details,
}: DisplayProps) {
  const [isPaused, setIsPaused] = useState(false);

  // Timeline state
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // Start at the top whenever this page/component is opened.
  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant",
    });
  }, []);

  // Keep React synchronized with the video.
  useEffect(() => {
    const video = videoRef.current;

    if (!video) return;

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
    };

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
    };

    const handleDurationChange = () => {
      setDuration(video.duration);
    };

    const handlePlay = () => {
      setIsPaused(false);
    };

    const handlePause = () => {
      setIsPaused(true);
    };

    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    video.addEventListener("durationchange", handleDurationChange);
    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePause);

    // In case metadata has already loaded before this effect ran.
    if (Number.isFinite(video.duration)) {
      setDuration(video.duration);
    }

    setCurrentTime(video.currentTime);

    return () => {
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      video.removeEventListener("durationchange", handleDurationChange);
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("pause", handlePause);
    };
  }, [videoRef]);

  const togglePause = () => {
    if (!videoRef.current) return;

    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPaused(false);
    } else {
      videoRef.current.pause();
      setIsPaused(true);
    }
  };

  const handleRewatch = () => {
    rewatchFeedback();
    setIsPaused(false);

    // Reset timeline to beginning
    setCurrentTime(0);
  };

  const handleSeek = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!videoRef.current) return;

    const newTime = Number(event.target.value);

    videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const progressPercent =
    duration > 0
      ? Math.min(100, Math.max(0, (currentTime / duration) * 100))
      : 0;

  return (
    <div className="flex w-full flex-col items-center px-4 py-6 sm:px-6 sm:py-8">
      <HandOverlay setDominantHand={setDominantHand} />

      <div className="grid w-full max-w-6xl grid-cols-[minmax(0,1fr)_minmax(0,4fr)_minmax(0,1fr)] items-center gap-3 sm:gap-6">
        {/* Pause / Resume */}
        <div className="min-w-0 justify-self-end">
          <button
            onClick={togglePause}
            className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-zinc-600 bg-zinc-800 px-3 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-zinc-700 hover:brightness-110 active:scale-95 sm:px-5 sm:py-4 sm:text-base"
          >
            {isPaused ? <Play size={18} /> : <Pause size={18} />}

            <span className="hidden sm:inline">
              {isPaused ? "Resume" : "Pause"}
            </span>
          </button>
        </div>

        <div className="relative w-full min-w-0">
          {/* Video */}
          <div className="relative w-full overflow-hidden rounded-xl bg-black shadow-xl ring-1 ring-orange-500/20 sm:rounded-2xl">
            <div className="aspect-video w-full">
              <video
                ref={videoRef}
                playsInline
                muted
                className="absolute inset-0 h-full w-full object-contain"
              />

              <canvas
                ref={canvasRef}
                className="pointer-events-none absolute inset-0 h-full w-full"
              />
            </div>
          </div>

          <VideoSlider
            currentTime={currentTime}
            duration={duration}
            progressPercent={progressPercent}
            handleSeek={handleSeek}
          />
        </div>

        {/* Rewatch */}
        <div className="min-w-0 justify-self-start">
          <button
            onClick={handleRewatch}
            className="cursor-pointer rounded-xl bg-linear-to-r from-orange-500 to-amber-400 px-3 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-orange-500/25 transition hover:scale-[1.02] hover:brightness-110 active:scale-95 sm:px-5 sm:py-4 sm:text-base"
          >
            <span className="hidden sm:inline">Rewatch Feedback</span>

            <span className="sm:hidden">Rewatch</span>
          </button>
        </div>
      </div>

      <h2 className="mt-5 text-center text-2xl">
        Wait for the video to be completely finished and then analyze the
        feedback.
      </h2>

      {details ? (
        <a>
          <p
            className="mt-6 cursor-pointer text-center text-base leading-7 text-orange-400 underline sm:mt-8 sm:text-lg lg:text-2xl"
            onClick={() => setDetails(false)}
          >
            Click Here to Hide Detailed Feedback!
          </p>
        </a>
      ) : (
        <a>
          <p
            className="mt-6 cursor-pointer text-center text-base leading-7 text-orange-400 underline sm:mt-8 sm:text-lg lg:text-2xl"
            onClick={() => setDetails(true)}
          >
            Click Here to Show Detailed Feedback!
          </p>
        </a>
      )}

      <div className="mx-auto mb-5 mt-8 w-full max-w-5xl sm:mt-12">
        <div className="rounded-3xl border border-orange-500/25 bg-zinc-950/80 p-4 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-xl sm:p-5">
          {/* Scoring Guide */}
          <div className="mb-4 flex flex-col gap-3 rounded-2xl border border-white/10 bg-zinc-900/70 px-4 py-3 sm:px-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="text-[14px] font-black uppercase tracking-[0.25em] text-orange-200">
                Scoring Guide
              </span>

              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <EmojiGuide emoji="😫" meaning="0-40 Poor" color="0 85% 55%" />

                <EmojiGuide
                  emoji="😐"
                  meaning="41-64 Average"
                  color="45 85% 55%"
                />

                <EmojiGuide
                  emoji="😊"
                  meaning="65-84 Above Average"
                  color="80 85% 55%"
                />

                <EmojiGuide
                  emoji="🤩"
                  meaning="85-100 Excellent"
                  color="145 85% 55%"
                />
              </div>
            </div>
          </div>

          <FeedbackTable
            feetFeedback={feetFeedback}
            flareFeedback={flareFeedback}
            similarityFeedback={similarityFeedback}
            flareScore={flareScore}
            similarity={similarity}
            bendFeedback={bendFeedback}
            bendScore={bendScore}
            feetDistanceScore={feetDistanceScore}
            kneeDistanceScore={kneeDistanceScore}
            kneeFeedback={kneeFeedback}
            kneeFlareFeedback={kneeFlareFeedback}
            kneeFlareScore={kneeFlareScore}
          />

          {errorFeedback && (
            <div className="mt-4 flex w-full items-start gap-4 rounded-xl border border-rose-500/40 bg-rose-950/30 p-4 shadow-[0_0_0_1px_rgba(244,63,94,0.12),0_12px_30px_rgba(244,63,94,0.12)] backdrop-blur-xl sm:rounded-2xl sm:p-5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-rose-500/15 sm:h-12 sm:w-12 sm:rounded-xl">
                <AlertTriangle className="h-5 w-5 text-rose-400 sm:h-6 sm:w-6" />
              </div>

              <div className="min-w-0 flex-1">
                <h3 className="mb-1 text-sm font-semibold text-rose-300 sm:text-base">
                  Something went wrong
                </h3>

                <p className="text-sm leading-relaxed text-rose-200/90 sm:text-base">
                  {errorFeedback}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
