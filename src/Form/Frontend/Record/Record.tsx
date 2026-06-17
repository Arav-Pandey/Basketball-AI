import { useRef, useState } from "react";
import UploadButton from "../UploadButton";
import sampleVideo from "../../../assets/Feet_Close_Shot.mp4";
import {
  RiStopCircleFill,
  RiCameraSwitchLine,
  RiFilmLine,
  RiCloseLine,
  RiCheckLine,
} from "react-icons/ri";
import { GiBasketballBall } from "react-icons/gi";
import useHelper from "./useHelper";

interface Props {
  setVideoURL: React.Dispatch<React.SetStateAction<string>>;
  videoURL: string;
  usePreview: (videoURL: string) => void;
  setVideoFile?: React.Dispatch<React.SetStateAction<File | null>>;
}

export default function Recorder({
  setVideoURL,
  videoURL,
  usePreview,
  setVideoFile,
}: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  const [recording, setRecording] = useState(false);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");
  const [loadingSample, setLoadingSample] = useState(false);

  const clearPreview = () => {
    if (videoURL) {
      URL.revokeObjectURL(videoURL);
    }
    setVideoURL("");
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
    try {
      const response = await fetch(sampleVideo);
      const blob = await response.blob();
      const file = new File([blob], "sample-shot.mp4", {
        type: blob.type || "video/mp4",
      });

      setVideoFile?.(file);

      const url = URL.createObjectURL(blob);
      setVideoURL(url);
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
    <div className="flex min-h-[80vh] w-full flex-col items-center justify-center px-2 py-4 text-center text-white sm:px-4 sm:py-8">
      <div className="relative w-full max-w-4xl overflow-hidden rounded-2xl border border-orange-500/30 bg-slate-900/70 p-3 shadow-[0_40px_100px_rgba(0,0,0,0.35)] backdrop-blur-xl sm:rounded-4xl sm:p-6 lg:p-10">
        {/* Ambient court lighting */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,159,67,0.18),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(255,99,71,0.12),transparent_35%)]" />

        <div className="relative space-y-6 sm:space-y-8">
          {/* Header */}
          <div className="space-y-2 text-center sm:space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-orange-300 sm:text-xs">
              <GiBasketballBall className="text-orange-400" size={14} />
              Form Check
            </div>
            <h1 className="text-xl font-extrabold tracking-tight text-white sm:text-2xl lg:text-3xl">
              Record Your Shot
            </h1>
            <h3 className="mx-auto max-w-xl text-sm leading-6 text-slate-300 sm:text-base sm:leading-8 lg:text-xl">
              Position your camera in front of you, capture your full body,
              press record, and shoot a basketball (or pretend). You can use
              your device's front or back camera.
            </h3>
          </div>

          {/* Live camera */}
          <div className="relative overflow-hidden rounded-xl sm:rounded-4xl border border-white/10 bg-slate-950/80 p-3 sm:p-4 shadow-xl">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full rounded-lg sm:rounded-2xl"
            />
            {recording && (
              <div className="absolute top-3 sm:top-4 right-3 sm:right-4 flex items-center gap-2 rounded-full bg-red-500/90 px-3 sm:px-4 py-1.5 sm:py-2 shadow-lg shadow-red-500/30">
                <span className="relative flex h-2 w-2 sm:h-2.5 sm:w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-200 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full bg-red-100" />
                </span>
                <span className="font-mono text-xs sm:text-sm font-bold tracking-wider text-white">
                  REC
                </span>
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="space-y-4">
            {/* Top Row — primary action */}
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <button
                onClick={toggleRecording}
                className={`w-full sm:w-72 cursor-pointer inline-flex items-center justify-center gap-3 rounded-2xl px-8 py-4 sm:py-5 text-sm sm:text-base font-semibold transition-all duration-300 active:scale-95 shadow-lg ${
                  recording
                    ? "bg-red-600 hover:bg-red-700 text-white shadow-red-500/30"
                    : "bg-linear-to-r from-orange-500 via-amber-500 to-orange-600 text-white hover:scale-[1.03] hover:shadow-orange-500/40 hover:shadow-xl"
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

            {/* Bottom Row — secondary actions */}
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <UploadButton
                setVideoURL={setVideoURL}
                setVideoFile={setVideoFile}
              />

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
            <div className="space-y-4 sm:space-y-6 border-t border-white/10 pt-6 sm:pt-8">
              <div>
                <h2 className="mb-3 text-lg font-bold text-white sm:mb-4 sm:text-2xl">
                  Recording Preview
                </h2>
                <div className="relative overflow-hidden rounded-xl sm:rounded-4xl border border-white/10 bg-slate-950/80 p-3 sm:p-4 shadow-xl">
                  <video
                    src={videoURL}
                    controls
                    className="w-full rounded-lg sm:rounded-2xl"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:justify-center sm:gap-4">
                {/* Remove button */}
                <button
                  onClick={() => clearPreview()}
                  className="w-full cursor-pointer inline-flex items-center justify-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-8 py-4 text-sm sm:text-base font-semibold text-white transition hover:bg-red-500/20 active:scale-95 sm:w-auto sm:px-9 sm:py-5"
                >
                  <RiCloseLine size={20} />
                  Remove
                </button>

                {/* Use button */}
                <button
                  onClick={() => usePreview(videoURL)}
                  className="w-full cursor-pointer inline-flex items-center justify-center gap-2 rounded-full bg-linear-to-r from-green-500 to-emerald-500 px-8 py-4 text-sm sm:text-base font-semibold text-white shadow-lg shadow-green-500/25 transition hover:scale-[1.01] hover:brightness-110 active:scale-95 sm:w-auto sm:px-9 sm:py-5"
                >
                  <RiCheckLine size={20} />
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
