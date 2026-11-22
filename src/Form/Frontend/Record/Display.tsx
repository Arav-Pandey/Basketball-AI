import { GiBasketballBall } from "react-icons/gi";
import {
  RiCameraSwitchLine,
  RiCheckLine,
  RiCloseLine,
  RiFilmLine,
  RiStopCircleFill,
} from "react-icons/ri";

interface Props {
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  recording: boolean;
  isDragging: boolean;
  setIsDragging: (isDragging: boolean) => void;
  handleDrop: (event: React.DragEvent<HTMLDivElement>) => void;
  handleVideoFile: (file: File) => void;
  uploadedFileName: string | null;
  uploadedFileURL: string | null;
  videoURL: string | null;
  uploadError: string | null;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  toggleRecording: () => void;
  flipCamera: () => void;
  useSampleVideo: () => void;
  loadingSample: boolean;
  clearPreview: () => void;
  onUsePreview: (videoURL: string) => void;
  secondaryButtonClass: (disabled: boolean) => string;
}

export default function Display({
  fileInputRef,
  recording,
  isDragging,
  setIsDragging,
  handleDrop,
  handleVideoFile,
  uploadedFileName,
  uploadedFileURL,
  videoURL,
  uploadError,
  videoRef,
  toggleRecording,
  flipCamera,
  useSampleVideo,
  loadingSample,
  clearPreview,
  onUsePreview,
  secondaryButtonClass,
}: Props) {
  return (
  <div className="flex min-h-[75vh] w-full flex-col items-center justify-center px-3 py-8 text-center text-white sm:px-6 sm:py-10">
    <div className="relative w-full max-w-3xl">
      <div className="pointer-events-none absolute -right-12 top-0 h-48 w-48 rounded-full bg-orange-500/10 blur-3xl sm:-right-24 sm:h-64 sm:w-64" />
      <div className="relative space-y-5 sm:space-y-7">
        {/* Header */}
        <div className="space-y-2 border-b border-orange-400/20 pb-5 text-center sm:space-y-3 sm:pb-7">
          <div className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.25em] text-orange-300 sm:text-xs">
            <GiBasketballBall className="text-orange-400" size={16} />
            <span>Shot Workspace</span>
            <span className="text-orange-500/60">/</span>
            <span className="text-slate-400">Capture</span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl lg:text-4xl">
            Record or Upload Your Shot
          </h1>
          <p className="mx-auto max-w-2xl text-sm leading-6 text-slate-300 sm:text-base sm:leading-7">
            Record a shot with your camera, or drag and drop an existing video
            below. Keep your full body visible from a front angle for the best
            form analysis.
          </p>
        </div>

        {/* Live camera */}
        <div className="relative mx-auto max-w-xl overflow-hidden rounded-xl border border-orange-300/20 bg-slate-950/80 p-2 shadow-[0_0_40px_rgba(249,115,22,0.08)] sm:rounded-2xl sm:p-3">
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
              if (!recording && (event.key === "Enter" || event.key === " ")) {
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
              <div className="relative mx-auto aspect-video w-full max-w-2xl overflow-hidden rounded-xl border border-white/10 bg-slate-950/80 p-2 shadow-xl sm:rounded-2xl sm:p-3">
                <video
                  src={videoURL}
                  controls
                  playsInline
                  className="h-full w-full rounded-lg object-contain sm:rounded-xl"
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
