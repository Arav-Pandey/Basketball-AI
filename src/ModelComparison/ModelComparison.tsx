import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Download,
  ImageUp,
  LoaderCircle,
  Play,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { PoseLandmarker } from "@mediapipe/tasks-vision";
import { COCO_KEYPOINT_NAMES } from "../yolo26Pose";
import {
  detectMediaPipeCocoPose,
  detectYoloCocoPose,
  getImagePoseLandmarker,
} from "./inference";
import {
  createComparisonCsv,
  formatCoordinate,
  formatQuality,
  formatTimestamp,
  jointAngles,
  KEYPOINT_CONNECTIONS,
  LOW_CONFIDENCE_THRESHOLD,
  LOW_VISIBILITY_THRESHOLD,
  MANUAL_RATINGS,
} from "./modelComparisonUtils";
import type {
  ComparedFrame,
  ComparisonKeypoint,
  ExtractedFrame,
  ManualRating,
} from "./modelComparisonTypes";

const DEFAULT_FRAME_COUNT = 8;
const MAX_VIDEO_FRAMES = 15;

function clampVideoFrameCount(value: number): number {
  if (!Number.isFinite(value)) return DEFAULT_FRAME_COUNT;
  return Math.max(1, Math.min(MAX_VIDEO_FRAMES, Math.floor(value)));
}

interface SelectedMedia {
  file: File;
  url: string;
  kind: "image" | "video";
}

type RatingsByFrame = Record<
  number,
  { mediapipe?: ManualRating; yolo?: ManualRating }
>;

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Unexpected model error.";
}

function waitForVideoEvent(
  video: HTMLVideoElement,
  eventName: "loadedmetadata" | "loadeddata" | "seeked",
): Promise<void> {
  if (
    (eventName === "loadedmetadata" &&
      video.readyState >= HTMLMediaElement.HAVE_METADATA) ||
    (eventName === "loadeddata" &&
      video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA)
  ) {
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    const cleanup = () => {
      video.removeEventListener(eventName, handleSuccess);
      video.removeEventListener("error", handleError);
    };
    const handleSuccess = () => {
      cleanup();
      resolve();
    };
    const handleError = () => {
      cleanup();
      reject(
        new Error(
          video.error?.message || "The selected video could not be decoded.",
        ),
      );
    };

    video.addEventListener(eventName, handleSuccess, { once: true });
    video.addEventListener("error", handleError, { once: true });
  });
}

async function extractVideoFrames(
  url: string,
  requestedFrameCount: number,
): Promise<ExtractedFrame[]> {
  const frameCount = clampVideoFrameCount(requestedFrameCount);
  const video = document.createElement("video");
  video.preload = "auto";
  video.muted = true;
  video.playsInline = true;
  video.src = url;
  video.load();

  try {
    await waitForVideoEvent(video, "loadedmetadata");
    if (!Number.isFinite(video.duration) || video.duration <= 0) {
      throw new Error("The video duration could not be read.");
    }
    if (video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) {
      await waitForVideoEvent(video, "loadeddata");
    }

    const duration = video.duration;
    const times =
      frameCount === 1
        ? [duration / 2]
        : Array.from({ length: frameCount }, (_, index) =>
            Math.min(
              (duration * index) / (frameCount - 1),
              Math.max(0, duration - 0.001),
            ),
          );
    const frames: ExtractedFrame[] = [];

    for (let index = 0; index < times.length; index += 1) {
      const timestamp = times[index];
      if (Math.abs(video.currentTime - timestamp) > 0.001) {
        const seeked = waitForVideoEvent(video, "seeked");
        video.currentTime = timestamp;
        await seeked;
      }

      const width = video.videoWidth;
      const height = video.videoHeight;
      if (!width || !height) {
        throw new Error("The video frame has invalid dimensions.");
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext("2d");
      if (!context) throw new Error("Could not extract a video frame.");
      context.drawImage(video, 0, 0, width, height);
      frames.push({
        frameNumber: index + 1,
        timestamp,
        width,
        height,
        imageUrl: canvas.toDataURL("image/png"),
      });
    }

    return frames.slice(0, MAX_VIDEO_FRAMES);
  } finally {
    video.pause();
    video.removeAttribute("src");
    video.load();
  }
}

async function extractImageFrame(url: string): Promise<ExtractedFrame> {
  const image = new Image();
  image.src = url;
  try {
    await image.decode();
  } catch (error) {
    throw new Error(
      `The selected image could not be decoded: ${getErrorMessage(error)}`,
    );
  }

  if (!image.naturalWidth || !image.naturalHeight) {
    throw new Error("The selected image has invalid dimensions.");
  }
  const canvas = document.createElement("canvas");
  canvas.width = image.naturalWidth;
  canvas.height = image.naturalHeight;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Could not prepare the selected image.");
  context.drawImage(image, 0, 0);

  return {
    frameNumber: 1,
    timestamp: 0,
    width: canvas.width,
    height: canvas.height,
    imageUrl: canvas.toDataURL("image/png"),
  };
}

async function canvasFromImageUrl(
  imageUrl: string,
  width: number,
  height: number,
): Promise<HTMLCanvasElement> {
  const image = new Image();
  image.src = imageUrl;
  try {
    await image.decode();
  } catch (error) {
    throw new Error(
      `An extracted frame could not be decoded: ${getErrorMessage(error)}`,
    );
  }
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Could not prepare an extracted frame.");
  context.drawImage(image, 0, 0, width, height);
  return canvas;
}

function getPoint(
  keypoints: ComparisonKeypoint[] | null,
  index: number,
): ComparisonKeypoint | null {
  return keypoints?.[index] ?? null;
}

function drawSkeleton(
  context: CanvasRenderingContext2D,
  keypoints: ComparisonKeypoint[] | null,
  color: string,
  model: "mediapipe" | "yolo",
  width: number,
  height: number,
): void {
  if (!keypoints) return;
  const isVisible = (
    point: ComparisonKeypoint | null,
  ): point is ComparisonKeypoint & { x: number; y: number } => {
    if (!point || point.x === null || point.y === null) return false;
    const quality =
      model === "mediapipe" ? point.visibility : point.confidence;
    const threshold =
      model === "mediapipe"
        ? LOW_VISIBILITY_THRESHOLD
        : LOW_CONFIDENCE_THRESHOLD;
    return quality === null || quality >= threshold;
  };

  context.strokeStyle = color;
  context.fillStyle = color;
  context.lineWidth = Math.max(2, Math.max(width, height) / 400);
  context.lineCap = "round";
  context.lineJoin = "round";

  for (const [firstIndex, secondIndex] of KEYPOINT_CONNECTIONS) {
    const first = getPoint(keypoints, firstIndex);
    const second = getPoint(keypoints, secondIndex);
    if (!isVisible(first) || !isVisible(second)) continue;
    context.beginPath();
    context.moveTo(first.x, first.y);
    context.lineTo(second.x, second.y);
    context.stroke();
  }

  const radius = Math.max(3, Math.max(width, height) / 240);
  keypoints.forEach((point) => {
    if (!isVisible(point)) return;
    context.beginPath();
    context.arc(point.x, point.y, radius, 0, Math.PI * 2);
    context.fill();
  });
}

function PoseImagePanel({
  title,
  frame,
  mediapipe,
  yolo,
  mode,
  error,
}: {
  title: string;
  frame: ComparedFrame;
  mediapipe: ComparisonKeypoint[] | null;
  yolo: ComparisonKeypoint[] | null;
  mode: "mediapipe" | "yolo" | "overlay";
  error: string | null;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hasDetection =
    mode === "overlay" ? Boolean(mediapipe || yolo) : Boolean(
      mode === "mediapipe" ? mediapipe : yolo,
    );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let active = true;
    const image = new Image();
    image.onload = () => {
      if (!active) return;
      canvas.width = frame.width;
      canvas.height = frame.height;
      const context = canvas.getContext("2d");
      if (!context) return;
      context.clearRect(0, 0, canvas.width, canvas.height);
      if (mode === "mediapipe" || mode === "overlay") {
        drawSkeleton(
          context,
          mediapipe,
          "#ff8a24",
          "mediapipe",
          frame.width,
          frame.height,
        );
      }
      if (mode === "yolo" || mode === "overlay") {
        drawSkeleton(
          context,
          yolo,
          "#22d3ee",
          "yolo",
          frame.width,
          frame.height,
        );
      }
    };
    image.src = frame.imageUrl;

    return () => {
      active = false;
      image.onload = null;
    };
  }, [frame, mediapipe, mode, yolo]);

  return (
    <div className="min-w-0 rounded-2xl border border-white/10 bg-zinc-900/70 p-3 sm:p-4">
      <h3 className="mb-3 text-sm font-black uppercase tracking-wider text-orange-200">
        {title}
      </h3>
      <div className="relative overflow-hidden rounded-xl bg-black">
        <img
          src={frame.imageUrl}
          alt={`Selected video frame ${frame.frameNumber}`}
          className="block h-auto w-full"
        />
        <canvas
          ref={canvasRef}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 h-full w-full"
        />
      </div>
      {error ? (
        <p role="status" className="mt-3 text-sm text-amber-200">
          {error}
        </p>
      ) : (
        !hasDetection && (
          <p className="mt-3 text-sm text-zinc-400">
            {mode === "overlay"
              ? "Neither model detected a person in this frame."
              : "No person was detected in this frame."}
          </p>
        )
      )}
    </div>
  );
}

function KeypointTable({
  frame,
}: {
  frame: ComparedFrame;
}) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-white/10">
      <table className="w-full min-w-[900px] text-left text-xs sm:text-sm">
        <thead className="bg-zinc-900 text-[10px] uppercase tracking-wider text-zinc-300 sm:text-xs">
          <tr>
            <th className="px-3 py-3">Keypoint</th>
            <th className="px-3 py-3">MediaPipe X</th>
            <th className="px-3 py-3">MediaPipe Y</th>
            <th className="px-3 py-3">Visibility</th>
            <th className="px-3 py-3">MP status</th>
            <th className="px-3 py-3">YOLO X</th>
            <th className="px-3 py-3">YOLO Y</th>
            <th className="px-3 py-3">Confidence</th>
            <th className="px-3 py-3">YOLO status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {COCO_KEYPOINT_NAMES.map((name, index) => {
            const mediapipe = getPoint(frame.mediapipe, index);
            const yolo = getPoint(frame.yolo, index);
            const mpMissing =
              !mediapipe || mediapipe.x === null || mediapipe.y === null;
            const yoloMissing = !yolo || yolo.x === null || yolo.y === null;
            const mpLow =
              !mpMissing &&
              mediapipe.visibility !== null &&
              mediapipe.visibility < LOW_VISIBILITY_THRESHOLD;
            const yoloLow =
              !yoloMissing &&
              yolo.confidence !== null &&
              yolo.confidence < LOW_CONFIDENCE_THRESHOLD;
            return (
              <tr key={name} className="text-zinc-200">
                <th scope="row" className="whitespace-nowrap px-3 py-2.5 font-semibold">
                  {name}
                </th>
                <td className="px-3 py-2.5 tabular-nums">
                  {formatCoordinate(mediapipe?.x ?? null)}
                </td>
                <td className="px-3 py-2.5 tabular-nums">
                  {formatCoordinate(mediapipe?.y ?? null)}
                </td>
                <td className="px-3 py-2.5 tabular-nums">
                  {formatQuality(mediapipe?.visibility ?? null)}
                </td>
                <td className={mpLow ? "px-3 py-2.5 text-amber-300" : "px-3 py-2.5 text-zinc-400"}>
                  {mpMissing ? "Missing" : mpLow ? "Low visibility" : "Detected"}
                </td>
                <td className="px-3 py-2.5 tabular-nums">
                  {formatCoordinate(yolo?.x ?? null)}
                </td>
                <td className="px-3 py-2.5 tabular-nums">
                  {formatCoordinate(yolo?.y ?? null)}
                </td>
                <td className="px-3 py-2.5 tabular-nums">
                  {formatQuality(yolo?.confidence ?? null)}
                </td>
                <td className={yoloLow ? "px-3 py-2.5 text-amber-300" : "px-3 py-2.5 text-zinc-400"}>
                  {yoloMissing ? "Missing" : yoloLow ? "Low confidence" : "Detected"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function AngleTable({ frame }: { frame: ComparedFrame }) {
  const mediapipeAngles = jointAngles(frame.mediapipe);
  const yoloAngles = jointAngles(frame.yolo);

  return (
    <>
      <div className="overflow-x-auto rounded-2xl border border-white/10">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead className="bg-zinc-900 text-xs uppercase tracking-wider text-zinc-300">
            <tr>
              <th className="px-4 py-3">Joint</th>
              <th className="px-4 py-3">MediaPipe</th>
              <th className="px-4 py-3">YOLO26s-Pose</th>
              <th className="px-4 py-3">Absolute difference</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {mediapipeAngles.map((measurement, index) => {
              const yoloAngle = yoloAngles[index].angle;
              const difference =
                measurement.angle === null || yoloAngle === null
                  ? null
                  : Math.abs(measurement.angle - yoloAngle);
              return (
                <tr key={measurement.name}>
                  <th scope="row" className="px-4 py-3 font-semibold text-zinc-200">
                    {measurement.name}
                  </th>
                  <td className="px-4 py-3 tabular-nums text-zinc-300">
                    {measurement.angle === null
                      ? "—"
                      : `${measurement.angle.toFixed(1)}°`}
                  </td>
                  <td className="px-4 py-3 tabular-nums text-zinc-300">
                    {yoloAngle === null ? "—" : `${yoloAngle.toFixed(1)}°`}
                  </td>
                  <td className="px-4 py-3 tabular-nums text-orange-200">
                    {difference === null ? "—" : `${difference.toFixed(1)}°`}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-xs leading-5 text-zinc-500">
        Angle differences are numerical comparisons only and do not establish
        that either model is inaccurate.
      </p>
    </>
  );
}

function EvaluationPanel({
  frames,
  ratings,
  onRate,
}: {
  frames: ComparedFrame[];
  ratings: RatingsByFrame;
  onRate: (
    frameNumber: number,
    model: "mediapipe" | "yolo",
    rating: ManualRating,
  ) => void;
}) {
  const ratingCounts = (model: "mediapipe" | "yolo") =>
    MANUAL_RATINGS.map((rating) => ({
      rating,
      count: frames.filter(
        (frame) => ratings[frame.frameNumber]?.[model] === rating,
      ).length,
    }));

  return (
    <section className="rounded-3xl border border-orange-500/25 bg-zinc-950/80 p-4 sm:p-6">
      <h2 className="text-lg font-black uppercase tracking-wider text-orange-200">
        Subjective visual evaluation
      </h2>
      <p className="mt-1 text-sm leading-6 text-zinc-400">
        These ratings are subjective visual evaluations, not scientifically
        measured accuracy. Ratings can be changed at any time.
      </p>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        {(["mediapipe", "yolo"] as const).map((model) => (
          <div
            key={model}
            className="rounded-2xl border border-white/10 bg-white/[0.025] p-4"
          >
            <h3 className="font-bold text-white">
              {model === "mediapipe" ? "MediaPipe" : "YOLO26s-Pose"}
            </h3>
            <div className="mt-3 space-y-3">
              {frames.map((frame) => (
                <div
                  key={frame.frameNumber}
                  className="flex flex-col gap-2 border-t border-white/10 pt-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <span className="text-xs text-zinc-400">
                    Frame {frame.frameNumber} ·{" "}
                    {formatTimestamp(frame.timestamp)}
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {MANUAL_RATINGS.map((rating) => {
                      const selected =
                        ratings[frame.frameNumber]?.[model] === rating;
                      return (
                        <button
                          key={rating}
                          type="button"
                          aria-pressed={selected}
                          onClick={() =>
                            onRate(frame.frameNumber, model, rating)
                          }
                          className={`rounded-lg border px-2 py-1.5 text-xs font-semibold transition ${
                            selected
                              ? "border-orange-400 bg-orange-500/20 text-orange-100"
                              : "border-white/10 text-zinc-400 hover:border-white/25 hover:text-white"
                          }`}
                        >
                          {rating}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2 border-t border-white/10 pt-4 sm:grid-cols-4">
              {ratingCounts(model).map(({ rating, count }) => (
                <div key={rating} className="rounded-xl bg-zinc-900/80 p-2.5">
                  <p className="text-[11px] text-zinc-400">{rating}</p>
                  <p className="mt-1 font-bold text-white">{count}</p>
                </div>
              ))}
            </div>
            <p className="mt-3 text-xs text-zinc-400">
              Good:{" "}
              {frames.length
                ? `${Math.round(
                    (ratingCounts(model).find((item) => item.rating === "Good")
                      ?.count ?? 0) /
                      frames.length *
                      100,
                  )}% of selected frames`
                : "0%"}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function ModelComparison() {
  const navigate = useNavigate();
  const [media, setMedia] = useState<SelectedMedia | null>(null);
  const [videoFrameCount, setVideoFrameCount] = useState(DEFAULT_FRAME_COUNT);
  const [frames, setFrames] = useState<ComparedFrame[]>([]);
  const [selectedFrameIndex, setSelectedFrameIndex] = useState(0);
  const [ratings, setRatings] = useState<RatingsByFrame>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState({ finished: 0, total: 0 });
  const [status, setStatus] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [view, setView] = useState<"side-by-side" | "overlay">(
    "side-by-side",
  );
  const operationId = useRef(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaUrl = media?.url;

  useEffect(
    () => () => {
      if (mediaUrl) URL.revokeObjectURL(mediaUrl);
    },
    [mediaUrl],
  );

  useEffect(
    () => () => {
      operationId.current += 1;
    },
    [],
  );

  const handleFile = (file: File | undefined) => {
    if (!file) return;
    const lowerName = file.name.toLowerCase();
    const isImage =
      file.type === "image/png" ||
      file.type === "image/jpeg" ||
      /\.(png|jpe?g)$/.test(lowerName);
    const isVideo =
      file.type.startsWith("video/") ||
      /\.(mp4|mov|m4v|webm|ogv|avi|mkv)$/.test(lowerName);
    if (!isImage && !isVideo) {
      setErrorMessage("Choose a PNG/JPG image or a browser-supported video.");
      return;
    }

    operationId.current += 1;
    setMedia({
      file,
      url: URL.createObjectURL(file),
      kind: isImage ? "image" : "video",
    });
    setFrames([]);
    setSelectedFrameIndex(0);
    setRatings({});
    setErrorMessage(null);
    setStatus("");
    setProgress({ finished: 0, total: 0 });
    setVideoFrameCount(DEFAULT_FRAME_COUNT);
  };

  const runComparison = async () => {
    if (!media || isProcessing) return;
    const currentOperationId = ++operationId.current;
    setIsProcessing(true);
    setFrames([]);
    setRatings({});
    setSelectedFrameIndex(0);
    setErrorMessage(null);
    setStatus("Extracting selected frames…");
    setProgress({ finished: 0, total: 0 });

    try {
      const safeFrameCount = clampVideoFrameCount(videoFrameCount);
      const extracted =
        media.kind === "image"
          ? [await extractImageFrame(media.url)]
          : await extractVideoFrames(media.url, safeFrameCount);
      if (currentOperationId !== operationId.current) return;

      const framesToProcess = extracted.slice(0, MAX_VIDEO_FRAMES);
      if (framesToProcess.length === 0) {
        throw new Error("No frames could be extracted from this media.");
      }
      setProgress({
        finished: 0,
        total: framesToProcess.length * 2,
      });
      setStatus("Loading models and comparing selected frames…");

      let landmarker: PoseLandmarker | null = null;
      let mediapipeFailure: string | null = null;
      try {
        landmarker = await getImagePoseLandmarker();
      } catch (error) {
        mediapipeFailure = getErrorMessage(error);
      }
      if (currentOperationId !== operationId.current) return;

      let yoloAvailable = true;
      let yoloFailure: string | null = null;
      let finishedSteps = 0;
      const comparedFrames: ComparedFrame[] = [];

      for (const frame of framesToProcess) {
        if (currentOperationId !== operationId.current) return;
        const canvas = await canvasFromImageUrl(
          frame.imageUrl,
          frame.width,
          frame.height,
        );
        if (currentOperationId !== operationId.current) {
          canvas.width = 0;
          canvas.height = 0;
          return;
        }
        let mediapipe: ComparisonKeypoint[] | null = null;
        let yolo: ComparisonKeypoint[] | null = null;
        let frameMediaPipeError: string | null = mediapipeFailure;
        let frameYoloError: string | null = yoloFailure;

        try {
          if (landmarker) {
            try {
              mediapipe = detectMediaPipeCocoPose(landmarker, canvas);
            } catch (error) {
              frameMediaPipeError = getErrorMessage(error);
              mediapipeFailure = frameMediaPipeError;
              landmarker = null;
            }
          }
          finishedSteps += 1;
          setProgress({
            finished: finishedSteps,
            total: framesToProcess.length * 2,
          });

          if (yoloAvailable) {
            try {
              yolo = await detectYoloCocoPose(canvas);
            } catch (error) {
              frameYoloError = getErrorMessage(error);
              yoloFailure = frameYoloError;
              yoloAvailable = false;
            }
          }
          finishedSteps += 1;
          setProgress({
            finished: finishedSteps,
            total: framesToProcess.length * 2,
          });
        } finally {
          canvas.width = 0;
          canvas.height = 0;
        }

        comparedFrames.push({
          frameNumber: frame.frameNumber,
          timestamp: frame.timestamp,
          width: frame.width,
          height: frame.height,
          imageUrl: frame.imageUrl,
          mediapipe,
          yolo,
          mediapipeError: frameMediaPipeError,
          yoloError: frameYoloError,
        });
      }

      if (currentOperationId !== operationId.current) return;
      setFrames(comparedFrames);
      setStatus(
        comparedFrames.length > 1
          ? "Comparison complete. Select a thumbnail to inspect another frame."
          : "Comparison complete.",
      );
      if (mediapipeFailure || yoloFailure) {
        setErrorMessage(
          `Some model results are unavailable. MediaPipe: ${
            mediapipeFailure ?? "ready"
          } · YOLO26s-Pose: ${yoloFailure ?? "ready"}`,
        );
      }
    } catch (error) {
      if (currentOperationId !== operationId.current) return;
      console.error("Model comparison failed.", error);
      setErrorMessage(getErrorMessage(error));
      setStatus("");
    } finally {
      if (currentOperationId === operationId.current) {
        setIsProcessing(false);
      }
    }
  };

  const handleRate = (
    frameNumber: number,
    modelName: "mediapipe" | "yolo",
    rating: ManualRating,
  ) => {
    setRatings((current) => ({
      ...current,
      [frameNumber]: {
        ...current[frameNumber],
        [modelName]: rating,
      },
    }));
  };

  const exportCsv = () => {
    if (frames.length === 0) return;
    const csv = createComparisonCsv(frames, ratings);
    const blob = new Blob([`\uFEFF${csv}`], {
      type: "text/csv;charset=utf-8",
    });
    const downloadUrl = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = downloadUrl;
    anchor.download = "hoopcorrector-model-comparison.csv";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000);
  };

  const selectedFrame = frames[selectedFrameIndex] ?? null;
  const progressPercent =
    progress.total > 0
      ? Math.round((progress.finished / progress.total) * 100)
      : 0;

  return (
    <div className="w-full max-w-6xl px-3 pb-12 pt-16 text-left text-white sm:px-6 sm:pt-20">
      <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-2 text-xs font-black uppercase tracking-[0.35em] text-orange-300">
            Basketball AI
          </p>
          <h1 className="text-3xl font-black tracking-tight sm:text-5xl">
            MODEL <span className="text-orange-400">COMPARISON</span>
          </h1>
          <p className="mt-2 text-sm text-zinc-400">
            Compare MediaPipe PoseLandmarker with the app&apos;s existing
            YOLO26s-Pose model.
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate("/form-home")}
          className="inline-flex items-center justify-center gap-2 self-start rounded-xl border border-white/15 bg-zinc-900/70 px-4 py-2.5 text-sm font-semibold text-zinc-200 transition hover:bg-zinc-800 sm:self-auto"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to analysis
        </button>
      </header>

      <section className="rounded-3xl border border-orange-500/25 bg-zinc-950/80 p-4 shadow-[0_20px_60px_rgba(0,0,0,0.3)] sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0 flex-1">
            <label
              htmlFor="model-comparison-file"
              className="mb-2 block text-sm font-bold text-zinc-100"
            >
              Upload an image or video
            </label>
            <input
              ref={fileInputRef}
              id="model-comparison-file"
              type="file"
              accept="image/png,image/jpeg,video/*,.mov"
              disabled={isProcessing}
              onChange={(event) => {
                handleFile(event.currentTarget.files?.[0]);
                event.currentTarget.value = "";
              }}
              className="block w-full cursor-pointer rounded-xl border border-white/10 bg-zinc-900 px-3 py-2.5 text-sm text-zinc-300 file:mr-3 file:rounded-lg file:border-0 file:bg-orange-500/15 file:px-3 file:py-2 file:font-semibold file:text-orange-200 hover:file:bg-orange-500/25 disabled:cursor-not-allowed disabled:opacity-50"
            />
            <p className="mt-2 text-xs leading-5 text-zinc-500">
              Files stay in this browser; only model weights are loaded from
              their existing providers.
            </p>
          </div>

          {media?.kind === "video" && (
            <div className="w-full lg:w-64">
              <div className="flex items-center justify-between gap-3">
                <label
                  htmlFor="comparison-frame-count"
                  className="text-sm font-bold text-zinc-200"
                >
                  Selected frames
                </label>
                <span className="rounded-lg bg-zinc-900 px-2.5 py-1 text-sm font-bold tabular-nums text-orange-200">
                  {videoFrameCount}
                </span>
              </div>
              <input
                id="comparison-frame-count"
                type="range"
                min={1}
                max={MAX_VIDEO_FRAMES}
                step={1}
                value={videoFrameCount}
                disabled={isProcessing}
                onChange={(event) =>
                  setVideoFrameCount(
                    clampVideoFrameCount(Number(event.currentTarget.value)),
                  )
                }
                className="mt-3 w-full accent-orange-400"
              />
              <p className="text-xs text-zinc-500">
                Choose 1–15 frames; 8 selected by default.
              </p>
            </div>
          )}

          <button
            type="button"
            disabled={!media || isProcessing}
            onClick={() => void runComparison()}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-linear-to-r from-orange-500 to-amber-400 px-5 py-3 font-bold text-slate-950 shadow-lg shadow-orange-500/20 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isProcessing ? (
              <LoaderCircle className="h-5 w-5 animate-spin" />
            ) : (
              <Play className="h-5 w-5" />
            )}
            {isProcessing ? "Comparing…" : "Run comparison"}
          </button>
        </div>

        {media && (
          <p className="mt-4 truncate rounded-xl border border-white/10 bg-white/[0.025] px-3 py-2 text-xs text-zinc-400">
            {media.file.name}
            {media.kind === "image"
              ? " · 1 image frame"
              : ` · will sample ${clampVideoFrameCount(videoFrameCount)} frames`}
          </p>
        )}

        {isProcessing && (
          <div
            className="mt-5"
            role="status"
            aria-live="polite"
            aria-label="Model comparison progress"
          >
            <div className="mb-2 flex items-center justify-between gap-3 text-xs text-zinc-300">
              <span>{status}</span>
              <span className="tabular-nums">{progressPercent}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-orange-400 transition-[width]"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}
        {!isProcessing && status && (
          <p role="status" className="mt-4 text-sm text-emerald-200">
            {status}
          </p>
        )}
        {errorMessage && (
          <p
            role="alert"
            className="mt-4 rounded-xl border border-amber-400/30 bg-amber-500/10 px-4 py-3 text-sm leading-6 text-amber-100"
          >
            {errorMessage}
          </p>
        )}
      </section>

      {frames.length > 0 && (
        <>
          {frames.length > 1 && (
            <section className="mt-6 rounded-3xl border border-white/10 bg-zinc-950/70 p-4 sm:p-5">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                <h2 className="font-bold text-white">Selected frames</h2>
                <span className="text-xs text-zinc-400">
                  Frame {selectedFrameIndex + 1} of {frames.length}
                </span>
              </div>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {frames.map((frame, index) => (
                  <button
                    key={`${frame.frameNumber}-${frame.timestamp}`}
                    type="button"
                    aria-current={index === selectedFrameIndex ? "true" : undefined}
                    onClick={() => setSelectedFrameIndex(index)}
                    className={`w-28 shrink-0 rounded-xl border p-1.5 text-left transition sm:w-36 ${
                      index === selectedFrameIndex
                        ? "border-orange-400 bg-orange-500/10"
                        : "border-white/10 bg-zinc-900 hover:border-white/25"
                    }`}
                  >
                    <img
                      src={frame.imageUrl}
                      alt=""
                      className="aspect-video w-full rounded-lg object-cover"
                    />
                    <span className="mt-1.5 block text-[11px] font-semibold text-zinc-200">
                      Frame {frame.frameNumber}
                    </span>
                    <span className="block text-[10px] text-zinc-500">
                      {formatTimestamp(frame.timestamp)}
                    </span>
                  </button>
                ))}
              </div>
            </section>
          )}

          {selectedFrame && (
            <>
              <section className="mt-6 rounded-3xl border border-white/10 bg-zinc-950/70 p-4 sm:p-6">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-black text-white">
                      Frame {selectedFrame.frameNumber}
                    </h2>
                    <p className="text-sm text-zinc-400">
                      Timestamp {formatTimestamp(selectedFrame.timestamp)} ·{" "}
                      {selectedFrame.width} × {selectedFrame.height} pixels
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {frames.length > 1 && (
                      <>
                        <button
                          type="button"
                          disabled={selectedFrameIndex === 0}
                          onClick={() =>
                            setSelectedFrameIndex((index) =>
                              Math.max(0, index - 1),
                            )
                          }
                          className="inline-flex items-center gap-1 rounded-lg border border-white/10 px-3 py-2 text-xs font-semibold text-zinc-200 hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <ChevronLeft className="h-4 w-4" />
                          Previous
                        </button>
                        <button
                          type="button"
                          disabled={selectedFrameIndex >= frames.length - 1}
                          onClick={() =>
                            setSelectedFrameIndex((index) =>
                              Math.min(frames.length - 1, index + 1),
                            )
                          }
                          className="inline-flex items-center gap-1 rounded-lg border border-white/10 px-3 py-2 text-xs font-semibold text-zinc-200 hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          Next
                          <ChevronRight className="h-4 w-4" />
                        </button>
                      </>
                    )}
                    <button
                      type="button"
                      onClick={exportCsv}
                      className="inline-flex items-center gap-2 rounded-lg border border-orange-400/30 bg-orange-500/10 px-3 py-2 text-xs font-semibold text-orange-100 hover:bg-orange-500/20"
                    >
                      <Download className="h-4 w-4" />
                      Export CSV
                    </button>
                  </div>
                </div>

                <div className="mb-4 flex flex-wrap items-center gap-2">
                  <span className="mr-1 text-xs text-zinc-400">View:</span>
                  {(
                    [
                      ["side-by-side", "Side by side"],
                      ["overlay", "Overlay comparison"],
                    ] as const
                  ).map(([value, label]) => (
                    <button
                      key={value}
                      type="button"
                      aria-pressed={view === value}
                      onClick={() => setView(value)}
                      className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${
                        view === value
                          ? "border-orange-400/60 bg-orange-500/15 text-orange-100"
                          : "border-white/10 text-zinc-400 hover:text-white"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                  <span className="ml-auto flex flex-wrap gap-3 text-xs">
                    <span className="text-orange-300">● MediaPipe</span>
                    <span className="text-cyan-300">● YOLO26s-Pose</span>
                  </span>
                </div>

                {view === "side-by-side" ? (
                  <div className="grid gap-4 md:grid-cols-2">
                    <PoseImagePanel
                      title="MediaPipe PoseLandmarker"
                      frame={selectedFrame}
                      mediapipe={selectedFrame.mediapipe}
                      yolo={selectedFrame.yolo}
                      mode="mediapipe"
                      error={selectedFrame.mediapipeError}
                    />
                    <PoseImagePanel
                      title="YOLO26s-Pose"
                      frame={selectedFrame}
                      mediapipe={selectedFrame.mediapipe}
                      yolo={selectedFrame.yolo}
                      mode="yolo"
                      error={selectedFrame.yoloError}
                    />
                  </div>
                ) : (
                  <div className="mx-auto max-w-4xl">
                    <PoseImagePanel
                      title="Overlay comparison · MediaPipe orange · YOLO26s cyan"
                      frame={selectedFrame}
                      mediapipe={selectedFrame.mediapipe}
                      yolo={selectedFrame.yolo}
                      mode="overlay"
                      error={
                        selectedFrame.mediapipeError ??
                        selectedFrame.yoloError
                      }
                    />
                  </div>
                )}
              </section>

              <section className="mt-6 rounded-3xl border border-white/10 bg-zinc-950/70 p-4 sm:p-6">
                <h2 className="mb-4 text-lg font-black text-white">
                  COCO keypoint coordinates
                </h2>
                <p className="mb-4 text-xs leading-5 text-zinc-400">
                  Pixel coordinates are relative to the original frame.
                  MediaPipe visibility and YOLO confidence are different
                  measures and are shown separately.
                </p>
                <KeypointTable frame={selectedFrame} />
              </section>

              <section className="mt-6 rounded-3xl border border-white/10 bg-zinc-950/70 p-4 sm:p-6">
                <h2 className="mb-4 text-lg font-black text-white">
                  Joint angle comparison
                </h2>
                <AngleTable frame={selectedFrame} />
              </section>
            </>
          )}

          <div className="mt-6">
            <EvaluationPanel
              frames={frames}
              ratings={ratings}
              onRate={handleRate}
            />
          </div>
        </>
      )}

      {!media && frames.length === 0 && !isProcessing && (
        <div className="mt-6 flex flex-col items-center rounded-3xl border border-dashed border-white/15 bg-zinc-950/50 px-5 py-12 text-center">
          <ImageUp className="h-9 w-9 text-orange-300" aria-hidden="true" />
          <p className="mt-3 font-semibold text-zinc-200">
            Choose an image or video to begin
          </p>
          <p className="mt-1 max-w-lg text-sm leading-6 text-zinc-500">
            Video processing samples only the selected frames, evenly spaced
            across its duration. Results are kept in page state, so frame
            navigation does not rerun inference.
          </p>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="mt-4 rounded-xl border border-orange-400/30 bg-orange-500/10 px-4 py-2 text-sm font-bold text-orange-100 hover:bg-orange-500/20"
          >
            Select media
          </button>
        </div>
      )}
    </div>
  );
}
