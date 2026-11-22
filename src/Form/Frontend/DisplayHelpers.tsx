import type { NavigateFunction } from "react-router-dom";
import type { prevMeasurements } from "../types";

export interface DisplayProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  rewatchFeedback: () => void;
  retake: () => void;
  prevMeasurements: prevMeasurements;
  hasPreviousMeasurements: boolean;
  feetFeedback: string | null;
  flareFeedback: string | null;
  kneeDirectionFeedback: string | null;
  similarityFeedback: string | null;
  errorFeedback: string | null;
  flareScore: number | null;
  kneeFlareScore: number | null;
  similarity: React.RefObject<number | null>;
  setDominantHand: React.Dispatch<
    React.SetStateAction<"left" | "right" | null>
  >;
  bendFeedback: string | null;
  bendScore: number | null;
  feetDistanceScore: number | null;
  kneeDistanceScore: number | null;
  kneeFeedback: string | null;
  kneeFlareFeedback: string | null;
  isAnalyzing: boolean;
  analysisProgress: number;
  onCareerClick: () => void;
}

export const togglePause = (
  videoRef: React.RefObject<HTMLVideoElement | null>,
  isAnalyzing: boolean,
  setIsPaused: React.Dispatch<React.SetStateAction<boolean>>,
) => {
  if (!videoRef.current || isAnalyzing) return;

  if (videoRef.current.paused) {
    videoRef.current.play();
    setIsPaused(false);
  } else {
    videoRef.current.pause();
    setIsPaused(true);
  }
};

export const handleRewatch = (
  isAnalyzing: boolean,
  setIsPaused: React.Dispatch<React.SetStateAction<boolean>>,
  rewatchFeedback: () => void,
  setCurrentTime: React.Dispatch<React.SetStateAction<number>>,
) => {
  if (isAnalyzing) return;
  rewatchFeedback();
  setIsPaused(false);

  // Reset timeline to beginning
  setCurrentTime(0);
};

export const handleRetake = (
  isAnalyzing: boolean,
  navigate: NavigateFunction,
  retake: () => void,
) => {
  if (isAnalyzing) return;
  retake();
  navigate("/form-home");
};

export const handleSeek = (
  event: React.ChangeEvent<HTMLInputElement>,
  videoRef: React.RefObject<HTMLVideoElement | null>,
  isAnalyzing: boolean,
  setCurrentTime: React.Dispatch<React.SetStateAction<number>>,
) => {
  if (!videoRef.current || isAnalyzing) return;

  const newTime = Number(event.target.value);

  videoRef.current.currentTime = newTime;
  setCurrentTime(newTime);
};

export const handleTimeUpdate = (
  setCurrentTime: React.Dispatch<React.SetStateAction<number>>,
  video: HTMLVideoElement,
) => {
  setCurrentTime(video.currentTime);
};

export const handleLoadedMetadata = (
  video: HTMLVideoElement,
  setDuration: React.Dispatch<React.SetStateAction<number>>,
) => {
  setDuration(video.duration);
};

export const handleDurationChange = (
  video: HTMLVideoElement,
  setDuration: React.Dispatch<React.SetStateAction<number>>,
) => {
  setDuration(video.duration);
};

export const handlePlay = (
  setIsPaused: React.Dispatch<React.SetStateAction<boolean>>,
) => {
  setIsPaused(false);
};

export const handlePause = (
  setIsPaused: React.Dispatch<React.SetStateAction<boolean>>,
) => {
  setIsPaused(true);
};

export function EmojiGuide({
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
