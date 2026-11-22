import { useRef, useState } from "react";
import sampleVideo from "../../../assets/Final_Shot.mp4";
import useHelper from "../../../utils/useHelper";
import Display from "./Display";

interface Props {
  setVideoURL: React.Dispatch<React.SetStateAction<string>>;
  videoURL: string;
  onUsePreview: (videoURL: string) => void;
  setVideoFile?: React.Dispatch<React.SetStateAction<File | null>>;
}

export default function Recorder({
  setVideoURL,
  videoURL,
  onUsePreview,
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
    <Display
      fileInputRef={fileInputRef}
      recording={recording}
      isDragging={isDragging}
      setIsDragging={setIsDragging}
      handleDrop={handleDrop}
      handleVideoFile={handleVideoFile}
      uploadedFileName={uploadedFileName}
      uploadedFileURL={uploadedFileURL}
      videoURL={videoURL}
      uploadError={uploadError}
      videoRef={videoRef}
      toggleRecording={toggleRecording}
      flipCamera={flipCamera}
      useSampleVideo={useSampleVideo}
      loadingSample={loadingSample}
      clearPreview={clearPreview}
      onUsePreview={onUsePreview}
      secondaryButtonClass={secondaryButtonClass}
    />
  );
}
