import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import LiveOverlay from "../../LiveOverlay";
import Recorder from "./Record";

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

  const handleUsePreview = () => {
    setVideoURL(videoURL);
    navigate("/form");
  };

  return (
    <div className="w-full">
      <LiveOverlay />
      <div className="px-4 sm:px-6">
        <Recorder
          setVideoURL={setVideoURL}
          videoURL={videoURL}
          onUsePreview={handleUsePreview}
        />
      </div>
    </div>
  );
}
