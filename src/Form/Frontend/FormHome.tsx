import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import LiveOverlay from "../../LiveOverlay";
import Recorder from "./Record/Record";

interface Props {
  setVideoURL: React.Dispatch<React.SetStateAction<string>>;
  videoURL: string;
}

export default function FormHome({ setVideoURL, videoURL }: Props) {
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "auto", // or "smooth"
    });
  }, []);

  const navigate = useNavigate();

  const usePreview = () => {
    setVideoURL(videoURL);
    navigate("/form");
  };

  return (
    <div className="w-full">
      <LiveOverlay />
      <div className="flex flex-col items-center px-2 py-4 text-center text-xl sm:px-6 sm:py-8">
        <h1 className="mb-2 text-2xl font-bold text-white sm:mb-4 sm:text-3xl lg:text-5xl">
          Welcome to the Deeper Analysis Page
        </h1>
      </div>

      <div className="px-4 sm:px-6">
        <Recorder
          setVideoURL={setVideoURL}
          videoURL={videoURL}
          usePreview={usePreview}
        />
      </div>
    </div>
  );
}
