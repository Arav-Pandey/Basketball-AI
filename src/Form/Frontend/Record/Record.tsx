import { useRef, useState } from "react";
import sampleVideo from "../../../assets/Final_Shot.mp4";
import {
  RiStopCircleFill,
  RiCameraSwitchLine,
  RiFilmLine,
  RiCloseLine,
  RiCheckLine,
} from "react-icons/ri";
import { GiBasketballBall } from "react-icons/gi";
import useHelper from "../../../utils/useHelper";
import type { PoseModel } from "../../Backend/detect";

interface Props {
  setVideoURL: React.Dispatch<React.SetStateAction<string>>;
  videoURL: string;
  onUsePreview: (videoURL: string) => void;
  model: PoseModel;
  onModelChange: (model: PoseModel) => void;
  setVideoFile?: React.Dispatch<React.SetStateAction<File | null>>;
}

export default function Recorder({
  setVideoURL,
  videoURL,
  onUsePreview,
  model,
  onModelChange,
  setVideoFile,
}: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  const [recording, setRecording] = useState(false);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");
  const [loadingSample, setLoadingSample] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [uploadedFileName, setUploadedFileName] = useState("");
  const [uploadedFileURL, setUploadedFileURL] = useState("");

  const clearPreview = () => {
    if (videoURL.startsWith("blob:")) {
      URL.revokeObjectURL(videoURL);
    }
    setVideoURL("");
    setVideoFile?.(null);
    setUploadedFileName("");
    setUploadedFileURL("");
    setUploadError("");
  };

  const handleVideoFile = (file: File) => {
    setUploadError("");

    const isVideo =
      file.type.startsWith("video/") ||
      /\.(mp4|mov|webm|m4v|avi|mkv|ogv)$/i.test(file.name);

    if (!isVideo) {
      setUploadError("Please choose a video file, such as MP4, MOV, or WebM.");
      return;
    }

    if (recording) {
      setUploadError("Stop recording before uploading a video.");
      return;
    }

    if (videoURL.startsWith("blob:")) {
      URL.revokeObjectURL(videoURL);
    }

    const url = URL.createObjectURL(file);
    setVideoFile?.(file);
    setVideoURL(url);
    setUploadedFileName(file.name);
    setUploadedFileURL(url);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);

    if (recording) return;

    const file = event.dataTransfer.files?.[0];
    if (file) handleVideoFile(file);
  };

  useHelper({
    setVideoURL,
    setVideoFile,
    streamRef,
    videoRef,
    facingMode,
    setRecording,
    chunksRef,
    mediaRecorderRef,
  });

  const toggleRecording = () => {
    if (!mediaRecorderRef.current) return;

    if (!recording) {
      mediaRecorderRef.current.start();
      setRecording(true);
    } else {
      mediaRecorderRef.current.stop();
      setRecording(false);
    }
  };

  const flipCamera = async () => {
    if (recording) {
      alert("Stop recording before flipping the camera");
      return;
    }
    const newMode = facingMode === "user" ? "environment" : "user";
    setFacingMode(newMode);
  };

  const useSampleVideo = async () => {
    if (recording) return;
    setLoadingSample(true);
    setUploadError("");

    try {
      const response = await fetch(sampleVideo);
      if (!response.ok) throw new Error("Sample video request failed");

      const blob = await response.blob();
      const file = new File([blob], "sample-shot.mp4", {
        type: blob.type || "video/mp4",
      });

      if (videoURL.startsWith("blob:")) {
        URL.revokeObjectURL(videoURL);
      }

      const url = URL.createObjectURL(file);
      setVideoFile?.(file);
      setVideoURL(url);
      setUploadedFileName(file.name);
      setUploadedFileURL(url);
    } catch (error) {
      console.error("Failed to load sample video:", error);
      alert("Couldn't load the sample video. Please try again.");
    } finally {
      setLoadingSample(false);
    }
  };

  const secondaryButtonClass = (disabled: boolean) =>
    `w-full sm:w-72 inline-flex items-center justify-center gap-3 rounded-2xl border px-8 py-4 sm:py-5 text-sm sm:text-base font-semibold transition-all duration-300 active:scale-95 ${
      disabled
        ? "border-zinc-700 bg-zinc-800 text-zinc-500 cursor-not-allowed"
        : "border-orange-500/40 bg-linear-to-r from-zinc-900 to-zinc-800 text-orange-300 hover:border-orange-400 hover:bg-orange-500/10 hover:text-orange-200 cursor-pointer"
    }`;

  return (
    <div className="flex min-h-[75vh] w-full flex-col items-center justify-center px-2 py-3 text-center text-white sm:px-4 sm:py-6">
      <div className="relative w-full max-w-3xl overflow-hidden rounded-2xl border border-orange-500/30 bg-slate-900/70 p-3 shadow-[0_30px_80px_rgba(0,0,0,0.35)] backdrop-blur-xl sm:rounded-3xl sm:p-5 lg:p-8">
        {/* Ambient court lighting */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,159,67,0.18),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(255,99,71,0.12),transparent_35%)]" />

        <div className="relative space-y-4 sm:space-y-6">
          {/* Header */}
          <div className="space-y-1.5 text-center sm:space-y-3">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-orange-500/30 bg-orange-500/10 px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.15em] text-orange-300 sm:text-[10px]">
              <GiBasketballBall className="text-orange-400" size={12} />
              Form Check
            </div>
            <h1 className="text-lg font-extrabold tracking-tight text-white sm:text-xl lg:text-2xl">
              Record or Upload Your Shot
            </h1>
            <h3 className="mx-auto max-w-lg text-xs leading-5 text-slate-300 sm:text-sm sm:leading-6 lg:text-base">
              Record a shot with your camera, or drag and drop an existing video
              below. Keep your full body visible for the best form analysis.
            </h3>
          </div>

          <div className="mx-auto w-full max-w-2xl rounded-xl border border-orange-400/20 bg-slate-950/60 p-3 text-left sm:p-4">
            <label
              htmlFor="record-pose-model"
              className="block text-sm font-bold text-orange-200 sm:text-base"
            >
              Choose an analysis model
            </label>
            <select
              id="record-pose-model"
              value={model}
              onChange={(event) =>
                onModelChange(event.target.value as PoseModel)
              }
              className="mt-2 w-full rounded-lg border border-zinc-600 bg-zinc-900 px-3 py-2.5 text-sm font-semibold text-white outline-none focus:border-orange-400 sm:text-base"
            >
              <option value="mediapipe">MediaPipe Pose Landmarker</option>
              <option value="yolo26s">YOLO26s-Pose</option>
            </select>
            <ul className="mt-2 space-y-1 text-xs leading-5 text-slate-300 sm:text-sm">
              <li>
                <span className="font-semibold text-white">MediaPipe:</span>{" "}
                quicker analysis, best for a fast check.
              </li>
              <li>
                <span className="font-semibold text-white">YOLO26s:</span>{" "}
                slower analysis, but typically more accurate pose detection.
              </li>
            </ul>
          </div>

          {/* Live camera */}
          <div className="relative max-w-2xl mx-auto overflow-hidden rounded-xl border border-white/10 bg-slate-950/80 p-2 shadow-xl sm:rounded-2xl sm:p-3">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full rounded-lg sm:rounded-xl"
            />
            {recording && (
              <div className="absolute right-3 top-3 flex items-center gap-1.5 rounded-full bg-red-500/90 px-2.5 py-1 shadow-lg shadow-red-500/30 sm:right-3 sm:top-3 sm:px-3 sm:py-1.5">
                <span className="relative flex h-2 w-2 sm:h-2 sm:w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-200 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-red-100" />
                </span>
                <span className="font-mono text-[10px] font-bold tracking-wider text-white sm:text-xs">
                  REC
                </span>
              </div>
            )}
          </div>

          {/* Drag-and-drop video upload (Kept at smaller size per previous request) */}
          <div className="space-y-1.5 text-left">
            <input
              ref={fileInputRef}
              type="file"
              accept="video/*,.mp4,.mov,.webm,.m4v,.avi,.mkv"
              className="hidden"
              onChange={(event) => {
                const file = event.currentTarget.files?.[0];
                if (file) handleVideoFile(file);
                event.currentTarget.value = "";
              }}
            />

            <div
              role="button"
              tabIndex={recording ? -1 : 0}
              aria-label="Drag and drop a video file here, or click to choose a video"
              aria-disabled={recording}
              onClick={() => {
                if (!recording) fileInputRef.current?.click();
              }}
              onKeyDown={(event) => {
                if (
                  !recording &&
                  (event.key === "Enter" || event.key === " ")
                ) {
                  event.preventDefault();
                  fileInputRef.current?.click();
                }
              }}
              onDragEnter={(event) => {
                event.preventDefault();
                if (!recording) setIsDragging(true);
              }}
              onDragOver={(event) => {
                event.preventDefault();
                if (!recording) setIsDragging(true);
              }}
              onDragLeave={(event) => {
                event.preventDefault();
                setIsDragging(false);
              }}
              onDrop={handleDrop}
              className={`flex min-h-28 w-full flex-col items-center justify-center rounded-xl border-2 border-dashed px-3 py-4 transition-colors sm:min-h-32 sm:py-5 ${
                recording
                  ? "cursor-not-allowed border-zinc-700 bg-slate-950/40 opacity-60"
                  : isDragging
                    ? "cursor-pointer border-orange-300 bg-orange-500/15"
                    : "cursor-pointer border-orange-500/40 bg-slate-950/50 hover:border-orange-400 hover:bg-orange-500/5"
              }`}
            >
              <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-full border border-orange-400/30 bg-orange-500/10 text-orange-300 sm:h-10 sm:w-10">
                <RiFilmLine size={20} />
              </div>
              <p className="text-sm font-bold text-white sm:text-base">
                {isDragging
                  ? "Drop your video here"
                  : "Drag and drop your video here"}
              </p>
              <p className="mt-0.5 text-xs text-slate-300">
                or{" "}
                <span className="font-semibold text-orange-300">
                  click to browse
                </span>
              </p>
              <p className="mt-1 text-[11px] text-slate-500">
                MP4, MOV, WebM, M4V, AVI, MKV
              </p>
              {uploadedFileName && uploadedFileURL === videoURL && (
                <p className="mt-2 max-w-full break-all text-xs text-orange-200">
                  Selected: {uploadedFileName}
                </p>
              )}
            </div>
            {uploadError && (
              <p role="alert" className="text-xs text-red-300">
                {uploadError}
              </p>
            )}
          </div>

          {/* Controls (Buttons keep their exact original size) */}
          <div className="space-y-3">
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
              <button
                onClick={toggleRecording}
                className={`inline-flex w-full cursor-pointer items-center justify-center gap-3 rounded-2xl px-8 py-4 text-sm font-semibold shadow-lg transition-all duration-300 active:scale-95 sm:w-72 sm:py-5 sm:text-base ${
                  recording
                    ? "bg-red-600 text-white shadow-red-500/30 hover:bg-red-700"
                    : "bg-linear-to-r from-orange-500 via-amber-500 to-orange-600 text-white hover:scale-[1.03] hover:shadow-xl hover:shadow-orange-500/40"
                }`}
              >
                {recording ? (
                  <>
                    <RiStopCircleFill size={24} />
                    Stop Recording
                  </>
                ) : (
                  <>
                    <GiBasketballBall size={22} />
                    Start Recording
                  </>
                )}
              </button>

              <button
                onClick={flipCamera}
                disabled={recording}
                className={secondaryButtonClass(recording)}
              >
                <RiCameraSwitchLine size={24} />
                Flip Camera
              </button>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
              <button
                onClick={useSampleVideo}
                disabled={recording || loadingSample}
                className={secondaryButtonClass(recording || loadingSample)}
              >
                <RiFilmLine
                  size={24}
                  className={loadingSample ? "animate-spin" : ""}
                />
                {loadingSample ? "Loading..." : "Use Sample Video"}
              </button>
            </div>
          </div>

          {/* Preview Section */}
          {videoURL && (
            <div className="space-y-3 border-t border-white/10 pt-4 sm:space-y-4 sm:pt-6">
              <div>
                <h2 className="mb-2 text-base font-bold text-white sm:mb-3 sm:text-xl">
                  Video Preview
                </h2>
                <div className="relative max-w-2xl mx-auto overflow-hidden rounded-xl border border-white/10 bg-slate-950/80 p-2 shadow-xl sm:rounded-2xl sm:p-3">
                  <video
                    src={videoURL}
                    controls
                    playsInline
                    className="w-full rounded-lg sm:rounded-xl"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2.5 sm:flex-row sm:justify-center sm:gap-3">
                <button
                  onClick={clearPreview}
                  className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-6 py-3 text-xs font-semibold text-white transition hover:bg-red-500/20 active:scale-95 sm:w-auto sm:px-7 sm:py-3.5 sm:text-sm"
                >
                  <RiCloseLine size={18} />
                  Remove
                </button>

                <button
                  onClick={() => onUsePreview(videoURL)}
                  className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-linear-to-r from-green-500 to-emerald-500 px-6 py-3 text-xs font-semibold text-white shadow-lg shadow-green-500/25 transition hover:scale-[1.01] hover:brightness-110 active:scale-95 sm:w-auto sm:px-7 sm:py-3.5 sm:text-sm"
                >
                  <RiCheckLine size={18} />
                  Use This Video
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
