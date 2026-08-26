import { useEffect, useRef } from "react";
import type { DetectProps } from "../Form/Backend/detect";
import {
  emptyMeasurements,
  type KneeFrame,
  type Measurements,
  type TopFrame,
} from "../Form/Backend/calculations";
import { normalizeYoloLandmarks } from "../Form/Backend/drawPoseFrame";
import { updatePoseMeasurements } from "../Form/Backend/updatePoseMeasurements";
import detect, { YOLO_ANALYSIS_FPS } from "../Form/Backend/detect";
import { detectYolo26Pose, type PosePoint } from "../yolo26Pose";
import type { CompletedAnalysis } from "../Career/careerSessions";

interface UsePoseDetectionProps {
  videoURL: string;
  dominantHand: "left" | "right" | null;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  setErrorFeedback: React.Dispatch<React.SetStateAction<string | null>>;
  updateFeedbackFromLatestMeasurements: () => void;
  setFlareScore: React.Dispatch<React.SetStateAction<number | null>>;
  setFlareFeedback: React.Dispatch<React.SetStateAction<string | null>>;
  setFeetDistanceScore: React.Dispatch<React.SetStateAction<number | null>>;
  setFeetFeedback: React.Dispatch<React.SetStateAction<string | null>>;
  setKneeDistanceScore: React.Dispatch<React.SetStateAction<number | null>>;
  setKneeFeedback: React.Dispatch<React.SetStateAction<string | null>>;
  setKneeFlareScore: React.Dispatch<React.SetStateAction<number | null>>;
  setKneeFlareFeedback: React.Dispatch<React.SetStateAction<string | null>>;
  setKneeDirection: React.Dispatch<
    React.SetStateAction<"right" | "left" | "forward" | null>
  >;
  setBendScore: React.Dispatch<React.SetStateAction<number | null>>;
  setBendFeedback: React.Dispatch<React.SetStateAction<string | null>>;
  setSimilarityFeedback: React.Dispatch<React.SetStateAction<string | null>>;
  onAnalysisComplete: (analysis: CompletedAnalysis) => void;
  setIsAnalyzing: React.Dispatch<React.SetStateAction<boolean>>;
  setAnalysisProgress: React.Dispatch<React.SetStateAction<number>>;
}

function seekVideoTo(
  video: HTMLVideoElement,
  timestamp: number,
  force = false,
) {
  if (!force && Math.abs(video.currentTime - timestamp) <= 0.001) {
    if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
      return Promise.resolve();
    }

    return new Promise<void>((resolve, reject) => {
      const onLoadedData = () => {
        video.removeEventListener("error", onError);
        resolve();
      };
      const onError = () => {
        video.removeEventListener("loadeddata", onLoadedData);
        reject(new Error("Unable to load the video frame."));
      };

      video.addEventListener("loadeddata", onLoadedData, { once: true });
      video.addEventListener("error", onError, { once: true });
      if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
        video.removeEventListener("loadeddata", onLoadedData);
        video.removeEventListener("error", onError);
        resolve();
      }
    });
  }

  return new Promise<void>((resolve, reject) => {
    const onSeeked = () => {
      video.removeEventListener("error", onError);
      resolve();
    };
    const onError = () => {
      video.removeEventListener("seeked", onSeeked);
      reject(new Error("Unable to seek through the video."));
    };

    video.addEventListener("seeked", onSeeked, { once: true });
    video.addEventListener("error", onError, { once: true });
    video.currentTime = timestamp;
  });
}

export function usePoseDetection(props: UsePoseDetectionProps) {
  const {
    videoURL,
    dominantHand,
    videoRef,
    canvasRef,
    setErrorFeedback,
    updateFeedbackFromLatestMeasurements,
    setIsAnalyzing,
    setAnalysisProgress,
    ...setters
  } = props;

  const startDetectingRef = useRef<() => void>(() => {});
  const restartAnalysisRef = useRef<() => Promise<void>>(async () => {});
  const topFramesRef = useRef<TopFrame[]>([]);
  const kneeFramesRef = useRef<KneeFrame[]>([]);
  const latestMeasurementsRef = useRef<Measurements>(emptyMeasurements());
  const similarityRef = useRef<number | null>(null);
  const lowestKneeAngleRef = useRef<number>(Infinity);
  const animationFrameIdRef = useRef<number>(0);
  const lastVideoTimeRef = useRef(-1);
  const analysisFinalizedRef = useRef(false);
  const yoloPoseCacheRef = useRef<Map<number, PosePoint[] | null>>(new Map());

  useEffect(() => {
    if (!videoURL || dominantHand === null) return;

    const video = videoRef.current;
    if (!video) return;

    let cancelled = false;
    const playbackRate = 0.6;
    setIsAnalyzing(true);
    videoRef.current?.pause();

    async function init() {
      if (video) {
        video.crossOrigin = "anonymous";
        video.onloadedmetadata = () => {
          topFramesRef.current = [];
          kneeFramesRef.current = [];
          latestMeasurementsRef.current = emptyMeasurements();
          lowestKneeAngleRef.current = Infinity;
          similarityRef.current = null;
          lastVideoTimeRef.current = -1;
          analysisFinalizedRef.current = false;

          const canvas = canvasRef.current;
          if (!canvas) {
            setErrorFeedback("⚠️ Unable to prepare video analysis.");
            return;
          }
          canvas.width = video.clientWidth;
          canvas.height = video.clientHeight;

          const detectProps: DetectProps = {
            videoRef,
            canvasRef,
            yoloPoseCacheRef,
            analysisFinalizedRef,
            animationFrameIdRef,
            lastVideoTimeRef,
            latestMeasurementsRef,
            kneeFramesRef,
            topFramesRef,
            lowestKneeAngleRef,
            similarityRef,
            dominantHand,
            setErrorFeedback,
            updateFeedbackFromLatestMeasurements,
            ...setters,
          };

          const rebuildMeasurements = () => {
            topFramesRef.current = [];
            kneeFramesRef.current = [];
            latestMeasurementsRef.current = emptyMeasurements();
            lowestKneeAngleRef.current = Infinity;

            const cachedPoses = [...yoloPoseCacheRef.current.entries()].sort(
              ([firstFrame], [secondFrame]) => firstFrame - secondFrame,
            );
            for (const [, pose] of cachedPoses) {
              if (!pose) continue;
              updatePoseMeasurements(
                detectProps,
                normalizeYoloLandmarks(pose, video),
              );
            }
          };

          startDetectingRef.current = () => detect(detectProps);
          video.playbackRate = playbackRate;

          restartAnalysisRef.current = async () => {
            cancelAnimationFrame(animationFrameIdRef.current);
            video.pause();
            analysisFinalizedRef.current = false;
            lastVideoTimeRef.current = -1;
            rebuildMeasurements();
            await seekVideoTo(video, 0);
            video.playbackRate = playbackRate;
            await video.play();
          };

          const startPlayback = async () => {
            if (cancelled) return;
            await seekVideoTo(video, 0);
            if (cancelled) return;
            lastVideoTimeRef.current = -1;
            video.playbackRate = playbackRate;
            setIsAnalyzing(false);
            video.onplaying = () => startDetectingRef.current();
            try {
              await video.play();
            } catch (err) {
              console.error("Playback failed:", err);
              setErrorFeedback("⚠️ Unable to play video analysis.");
            }
          };

          setIsAnalyzing(true);
          setAnalysisProgress(0);
          yoloPoseCacheRef.current.clear();
          let totalSeekMs = 0;
          let totalSessionLoadMs = 0;
          let totalPreprocessingMs = 0;
          let totalInferenceMs = 0;
          let executionProvider: string | null = null;
          let samples = 0;

          void (async () => {
            try {
              if (!Number.isFinite(video.duration)) {
                throw new Error("Video duration is unavailable.");
              }
              const frameCount = Math.max(
                1,
                Math.floor(video.duration * YOLO_ANALYSIS_FPS) + 1,
              );

              for (let frame = 0; frame < frameCount; frame += 1) {
                if (cancelled) return;
                const timestamp =
                  frame === frameCount - 1
                    ? Math.max(0, video.duration - 0.001)
                    : frame / YOLO_ANALYSIS_FPS;
                const seekStarted = performance.now();
                await seekVideoTo(video, timestamp);
                totalSeekMs += performance.now() - seekStarted;
                if (cancelled) return;

                const pose = await detectYolo26Pose(video, (timings) => {
                  executionProvider = timings.executionProvider;
                  totalSessionLoadMs += timings.sessionLoadMs;
                  totalPreprocessingMs += timings.preprocessingMs;
                  totalInferenceMs += timings.inferenceMs;
                  samples += 1;
                });
                if (cancelled) return;
                yoloPoseCacheRef.current.set(frame, pose);
                setAnalysisProgress((frame + 1) / frameCount);
              }

              rebuildMeasurements();

              console.info("YOLO26s-Pose analysis performance", {
                executionProvider,
                samples,
                sampleRate: YOLO_ANALYSIS_FPS,
                seekingMs: Math.round(totalSeekMs),
                sessionLoadMs: Math.round(totalSessionLoadMs),
                preprocessingMs: Math.round(totalPreprocessingMs),
                inferenceMs: Math.round(totalInferenceMs),
              });
              await startPlayback();
            } catch (err) {
              if (cancelled) return;
              console.error("YOLO analysis failed:", err);
              setIsAnalyzing(false);
              setErrorFeedback(
                "⚠️ Unable to complete YOLO analysis. Check your connection and try again.",
              );
            }
          })();
        };
        video.src = videoURL;
      }
    }

    void init().catch((err) => {
      console.error("Initialization failed:", err);
      setErrorFeedback("⚠️ Unable to initialize pose detection.");
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(animationFrameIdRef.current);
      if (video) {
        video.onloadedmetadata = null;
        video.onplaying = null;
      }
    };
  }, [videoURL, dominantHand]);

  return {
    topFramesRef,
    kneeFramesRef,
    latestMeasurementsRef,
    similarityRef,
    lowestKneeAngleRef,
    animationFrameIdRef,
    lastVideoTimeRef,
    restartAnalysisRef,
    yoloPoseCacheRef,
  };
}
