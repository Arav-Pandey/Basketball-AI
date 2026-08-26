import { useEffect, useRef } from "react";
import { PoseLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";
import type { DetectProps, PoseModel } from "../Form/Backend/detect";
import {
  emptyMeasurements,
  type Measurements,
  type TopFrame,
} from "../Form/Backend/calculations";
import detect, { YOLO_ANALYSIS_FPS } from "../Form/Backend/detect";
import { detectYolo26Pose, type PosePoint } from "../yolo26Pose";

interface UsePoseDetectionProps {
  videoURL: string;
  model: PoseModel;
  dominantHand: "left" | "right" | null;
  details: boolean;
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
  setIsAnalyzing: React.Dispatch<React.SetStateAction<boolean>>;
  setAnalysisProgress: React.Dispatch<React.SetStateAction<number>>;
}

function seekVideoTo(video: HTMLVideoElement, timestamp: number) {
  if (Math.abs(video.currentTime - timestamp) <= 0.001) {
    return Promise.resolve();
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
    model,
    dominantHand,
    details,
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
  const kneeFramesRef = useRef<number[]>([]);
  const latestMeasurementsRef = useRef<Measurements>(emptyMeasurements());
  const similarityRef = useRef<number | null>(null);
  const lowestKneeAngleRef = useRef<number>(Infinity);
  const animationFrameIdRef = useRef<number>(0);
  const lastVideoTimeRef = useRef(-1);
  const yoloPoseCacheRef = useRef<Map<number, PosePoint[] | null>>(new Map());

  useEffect(() => {
    if (!videoURL || dominantHand === null) return;

    const video = videoRef.current;
    if (!video) return;

    let cancelled = false;
    let poseLandmarker: PoseLandmarker | null = null;
    let createPoseLandmarker: (() => Promise<PoseLandmarker>) | null = null;
    setIsAnalyzing(model === "yolo26s");
    videoRef.current?.pause();

    async function init() {
      if (model === "mediapipe") {
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.32/wasm",
        );
        createPoseLandmarker = () =>
          PoseLandmarker.createFromOptions(vision, {
            baseOptions: {
              modelAssetPath:
                "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_full/float16/latest/pose_landmarker_full.task",
            },
            runningMode: "VIDEO",
            numPoses: 1,
          });
        poseLandmarker = await createPoseLandmarker();
      }

      restartAnalysisRef.current = async () => {
        if (!video) return;

        cancelAnimationFrame(animationFrameIdRef.current);
        video.pause();

        if (createPoseLandmarker) {
          poseLandmarker?.close();
          poseLandmarker = await createPoseLandmarker();
        }

        video.currentTime = 0;
        lastVideoTimeRef.current = -1;
        video.playbackRate = 0.8;
        await video.play();
      };

      if (video) {
        video.crossOrigin = "anonymous";
        video.onloadedmetadata = () => {
          topFramesRef.current = [];
          kneeFramesRef.current = [];
          latestMeasurementsRef.current = emptyMeasurements();
          lowestKneeAngleRef.current = Infinity;
          similarityRef.current = null;
          lastVideoTimeRef.current = -1;

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
            poseLandmarker,
            model,
            yoloPoseCacheRef,
            animationFrameIdRef,
            lastVideoTimeRef,
            latestMeasurementsRef,
            kneeFramesRef,
            topFramesRef,
            lowestKneeAngleRef,
            similarityRef,
            dominantHand,
            details,
            setErrorFeedback,
            updateFeedbackFromLatestMeasurements,
            ...setters,
          };

          startDetectingRef.current = () => detect(detectProps);
          video.playbackRate = 0.8;

          const startPlayback = async () => {
            if (cancelled) return;
            await seekVideoTo(video, 0);
            if (cancelled) return;
            lastVideoTimeRef.current = -1;
            setIsAnalyzing(false);
            video.onplaying = () => startDetectingRef.current();
            try {
              await video.play();
            } catch (err) {
              console.error("Playback failed:", err);
              setErrorFeedback("⚠️ Unable to play video analysis.");
            }
          };

          if (model === "yolo26s") {
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
                  Math.ceil(video.duration * YOLO_ANALYSIS_FPS),
                );

                for (let frame = 0; frame < frameCount; frame += 1) {
                  if (cancelled) return;
                  const timestamp = Math.min(
                    frame / YOLO_ANALYSIS_FPS,
                    video.duration,
                  );
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
          } else {
            void startPlayback();
          }
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
      poseLandmarker?.close();
    };
  }, [videoURL, dominantHand, model]);

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
