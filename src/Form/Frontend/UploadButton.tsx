import { useRef, useState } from "react";
import { RiVideoUploadLine } from "react-icons/ri";

interface UploadButtonProps {
  setVideoURL: React.Dispatch<React.SetStateAction<string>>;
  setVideoFile?: React.Dispatch<React.SetStateAction<File | null>>;
}

export default function UploadButton({
  setVideoURL,
  setVideoFile,
}: UploadButtonProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setVideoURL(url);
      setVideoFile?.(file);
      setFileName(file.name);
    }
  };

  return (
    <button
      onClick={handleButtonClick}
      className="group relative w-full sm:w-72 cursor-pointer overflow-hidden rounded-2xl border border-orange-500/40 bg-linear-to-r from-zinc-900 to-zinc-800 px-8 py-4 sm:py-5 text-white transition-all duration-300 hover:border-orange-400 hover:bg-orange-500/10 active:scale-95"
    >
      <span className="relative flex flex-row items-center justify-center gap-3">
        <RiVideoUploadLine
          size={28}
          className="shrink-0 text-slate-400 transition-transform duration-300 ease-out group-hover:-translate-y-1 group-hover:text-orange-400"
        />
        <span className="flex flex-col items-start text-left">
          <span className="text-sm font-semibold tracking-wide text-slate-200 transition-colors duration-200 group-hover:text-orange-200 sm:text-base">
            Upload a video
          </span>
          <span className="text-xs text-slate-500 group-hover:text-orange-300/70 sm:text-sm">
            {fileName ?? "MP4, MOV, or WebM"}
          </span>
        </span>
      </span>

      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        onChange={handleFileChange}
        accept="video/*"
      />
    </button>
  );
}
