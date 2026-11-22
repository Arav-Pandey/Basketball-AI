import "./Display.css";
import HandOverlay from "../../HandOverlay";
import { AlertTriangle, ArrowRight, Play, Pause } from "lucide-react";
import { useEffect, useState } from "react";
import VideoSlider from "./VideoSlider";
import FeedbackTable from "./FeedbackTable";
import Compare from "../Backend/Compare";
import OverallScoreHeader from "../Backend/OverallScoreHeader";
import {
  EmojiGuide,
  handleDurationChange,
  handleLoadedMetadata,
  handlePause,
  handlePlay,
  handleRetake,
  handleRewatch,
  handleSeek,
  handleTimeUpdate,
  togglePause,
  type DisplayProps,
} from "./DisplayHelpers";

export default function Display({
  videoRef,
  canvasRef,
  rewatchFeedback,
  retake,
  prevMeasurements,
  hasPreviousMeasurements,
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
  isAnalyzing,
  analysisProgress,
  onCareerClick,
}: DisplayProps) {
  const [isPaused, setIsPaused] = useState(false);
  const [showComparison, setShowComparison] = useState(false);

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

    video.addEventListener("timeupdate", () =>
      handleTimeUpdate(setCurrentTime, video),
    );
    video.addEventListener("loadedmetadata", () =>
      handleLoadedMetadata(video, setDuration),
    );
    video.addEventListener("durationchange", () =>
      handleDurationChange(video, setDuration),
    );
    video.addEventListener("play", () => handlePlay(setIsPaused));
    video.addEventListener("pause", () => handlePause(setIsPaused));

    // In case metadata has already loaded before this effect ran.
    if (Number.isFinite(video.duration)) {
      setDuration(video.duration);
    }

    setCurrentTime(video.currentTime);

    return () => {
      video.removeEventListener("timeupdate", () =>
        handleTimeUpdate(setCurrentTime, video),
      );
      video.removeEventListener("loadedmetadata", () =>
        handleLoadedMetadata(video, setDuration),
      );
      video.removeEventListener("durationchange", () =>
        handleDurationChange(video, setDuration),
      );
      video.removeEventListener("play", () => handlePlay(setIsPaused));
      video.removeEventListener("pause", () => handlePause(setIsPaused));
    };
  }, [videoRef]);

  const progressPercent =
    duration > 0
      ? Math.min(100, Math.max(0, (currentTime / duration) * 100))
      : 0;

  return (
    <div className="flex w-full flex-col items-center px-4 py-6 sm:px-6 sm:py-8">
      <HandOverlay setDominantHand={setDominantHand} />

      <OverallScoreHeader
        bendScore={bendScore}
        flareScore={flareScore}
        kneeFlareScore={kneeFlareScore}
        feetDistanceScore={feetDistanceScore}
        kneeDistanceScore={kneeDistanceScore}
      />

      <div className="grid w-full max-w-6xl grid-cols-2 items-center gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,4fr)_minmax(0,1fr)] sm:gap-6">
        {/* Pause / Resume */}
        <div className="col-start-1 row-start-2 min-w-0 justify-self-stretch sm:col-auto sm:row-auto sm:justify-self-end">
          <button
            onClick={() => togglePause(videoRef, isAnalyzing, setIsPaused)}
            disabled={isAnalyzing}
            className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-zinc-600 bg-zinc-800 px-2 py-3 text-xs font-semibold text-white shadow-lg transition hover:bg-zinc-700 hover:brightness-110 active:scale-95 sm:w-auto sm:px-5 sm:py-4 sm:text-base"
          >
            {isPaused ? <Play size={18} /> : <Pause size={18} />}

            <span className="hidden sm:inline">
              {isPaused ? "Resume" : "Pause"}
            </span>
          </button>
          {hasPreviousMeasurements && (
            <button
              onClick={() => setShowComparison(true)}
              className="mt-2 w-full cursor-pointer rounded-xl border-2 border-orange-500 bg-zinc-900 px-2 py-2 text-xs font-bold tracking-wide text-orange-500 shadow-md shadow-orange-500/10 transition hover:scale-[1.02] hover:bg-orange-500 hover:text-zinc-950 hover:shadow-orange-500/30 active:scale-95 sm:mt-10 sm:w-auto sm:px-4 sm:py-2 sm:text-base"
            >
              Show Comparison
            </button>
          )}
        </div>

        <div className="relative col-span-2 row-start-1 w-full min-w-0 sm:col-span-1 sm:col-start-2 sm:row-auto">
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

              {isAnalyzing && (
                <div
                  className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 bg-slate-950/95 px-6 text-center"
                  role="status"
                  aria-live="polite"
                >
                  <div className="h-10 w-10 animate-spin rounded-full border-4 border-orange-300/25 border-t-orange-300" />
                  <div>
                    <p className="text-xl font-bold text-white">
                      Loading analysis
                    </p>
                    <p className="mt-1 text-sm text-slate-300">
                      Preparing pose data before playback
                    </p>
                  </div>
                  <div className="w-full max-w-xs">
                    <div
                      className="h-2 overflow-hidden rounded-full bg-white/10"
                      role="progressbar"
                      aria-label="Analysis progress"
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-valuenow={Math.round(analysisProgress * 100)}
                    >
                      <div
                        className="h-full rounded-full bg-orange-400 transition-[width] duration-150"
                        style={{ width: `${analysisProgress * 100}%` }}
                      />
                    </div>
                    <p className="mt-2 text-xs text-slate-400">
                      {Math.round(analysisProgress * 100)}%
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <VideoSlider
            currentTime={currentTime}
            duration={duration}
            progressPercent={progressPercent}
            handleSeek={(event) =>
              handleSeek(event, videoRef, isAnalyzing, setCurrentTime)
            }
          />
        </div>

        {/* Rewatch + Retake */}
        <div className="col-start-2 row-start-2 flex min-w-0 flex-col items-center gap-2 justify-self-stretch sm:col-auto sm:row-auto sm:gap-3 sm:justify-self-start">
          <button
            onClick={() =>
              handleRewatch(
                isAnalyzing,
                setIsPaused,
                rewatchFeedback,
                setCurrentTime,
              )
            }
            disabled={isAnalyzing}
            className="w-full cursor-pointer rounded-xl bg-linear-to-r from-orange-500 to-amber-400 px-2 py-3 text-xs font-semibold text-slate-950 shadow-lg shadow-orange-500/25 transition hover:scale-[1.02] hover:brightness-110 active:scale-95 sm:w-auto sm:px-5 sm:py-4 sm:text-base"
          >
            <span className="hidden sm:inline">Rewatch Feedback</span>
            <span className="sm:hidden">Rewatch</span>
          </button>

          <button
            onClick={() => handleRetake(isAnalyzing, navigate, retake)}
            disabled={isAnalyzing}
            className="mt-0 w-full cursor-pointer rounded-xl border-2 border-orange-500 bg-zinc-900 px-2 py-2 text-xs font-bold tracking-wide text-orange-500 shadow-md shadow-orange-500/10 transition hover:scale-[1.02] hover:bg-orange-500 hover:text-zinc-950 hover:shadow-orange-500/30 active:scale-95 sm:mt-10 sm:w-auto sm:px-5 sm:py-2 sm:text-base"
          >
            Retake
          </button>
        </div>
      </div>

      <h2 className="mt-5 px-2 text-center text-base sm:text-2xl">
        Wait for the video to be completely finished and then analyze the
        feedback.
      </h2>

      <div className="mx-auto mb-5 mt-8 w-full max-w-5xl sm:mt-12">
        <div className="rounded-3xl border border-orange-500/25 bg-zinc-950/80 p-4 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-xl sm:p-5">
          <div className="mb-4 flex justify-end">
            <button
              type="button"
              onClick={onCareerClick}
              className="inline-flex items-center gap-2 rounded-xl border border-orange-500/30 bg-orange-500/10 px-4 py-2 text-sm font-bold text-orange-200 transition hover:border-orange-400/50 hover:bg-orange-500/15 hover:text-white active:scale-95"
            >
              View Career
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>

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
                  meaning="41-64 Mediocre"
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

      {showComparison && (
        <Compare
          prevMeasurements={prevMeasurements}
          ankleDistanceScore={feetDistanceScore}
          kneeDistanceScore={kneeDistanceScore}
          flareScore={flareScore}
          kneeFlareScore={kneeFlareScore}
          kneeBendScore={bendScore}
          onClose={() => setShowComparison(false)}
        />
      )}
    </div>
  );
}
