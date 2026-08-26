import { AlertTriangle, ArrowLeft, Film } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import sampleVideo from "../../assets/Final_Shot.mp4";

interface Props {
  setVideoURL: React.Dispatch<React.SetStateAction<string>>;
  setVideoFile?: React.Dispatch<React.SetStateAction<File | null>>;
}

export default function NoVid({ setVideoURL, setVideoFile }: Props) {
  const navigate = useNavigate();
  const [loadingSample, setLoadingSample] = useState(false);

  const useSampleVideo = async () => {
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
      navigate("/form");
    } catch (error) {
      console.error("Failed to load sample video:", error);
      alert("Couldn't load the sample video. Please try again.");
    } finally {
      setLoadingSample(false);
    }
  };

  return (
    <div className="flex min-h-[70vh] w-full items-center justify-center px-4 py-10 sm:px-6">
      <div className="w-full max-w-xl text-center rounded-4xl border border-rose-400/25 bg-zinc-950/80 p-8 shadow-[0_20px_70px_rgba(0,0,0,0.35)] backdrop-blur-xl sm:p-10">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-500/15 text-rose-300 sm:h-18 sm:w-18">
          <AlertTriangle className="h-8 w-8 sm:h-9 sm:w-9" />
        </div>

        <h2 className="text-2xl font-black text-white sm:text-3xl">
          No video attached
        </h2>

        <p className="mt-3 text-base leading-7 text-zinc-300 sm:text-lg">
          There is no video to analyze yet. Upload or select a video first, then
          come back here to view your feedback.
        </p>

        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <button
            onClick={() => navigate("/form-home")}
            className="cursor-pointer inline-flex items-center justify-center gap-2 rounded-2xl border border-white/15 bg-zinc-900/80 px-4 py-2.5 text-sm font-semibold text-zinc-100 shadow-md shadow-black/20 transition-all hover:-translate-y-0.5 hover:bg-zinc-800/80 hover:text-white active:scale-95"
          >
            <ArrowLeft className="h-4 w-4" /> Go Back
          </button>

          <button
            onClick={useSampleVideo}
            disabled={loadingSample}
            className={`cursor-pointer inline-flex items-center justify-center gap-2 rounded-2xl border px-4 py-2.5 text-sm font-semibold shadow-md shadow-black/20 transition-all active:scale-95 ${
              loadingSample
                ? "border-white/10 bg-zinc-900/50 text-zinc-400 cursor-not-allowed"
                : "border-sky-400/30 bg-sky-500/10 text-white hover:-translate-y-0.5 hover:bg-sky-500/20"
            }`}
          >
            <Film className="h-4 w-4" />{" "}
            {loadingSample ? "Loading..." : "Use Sample Video"}
          </button>
        </div>
      </div>
    </div>
  );
}
