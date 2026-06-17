/*
import Recorder from "../Record";

interface Props {
  setActive: React.Dispatch<React.SetStateAction<string>>;
  setVideoURL: React.Dispatch<React.SetStateAction<string>>;
  videoURL: string;
  setVideoFile: React.Dispatch<React.SetStateAction<File | null>>;
}

export default function ArcHome({ setActive, setVideoURL, videoURL, setVideoFile }: Props) {
  const usePreview = () => {
    setActive("Arc");
  };

  return (
    <div className="w-full">
      <div className="px-4 sm:px-6 py-6 sm:py-8">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-3 sm:mb-4">Arc Corrector</h1>
        <div className="space-y-2 sm:space-y-4">
          <p className="text-sm sm:text-base text-slate-300 max-w-2xl">
            Welcome to the Arc Corrector. In this section, record a video of yourself shooting a basketball—make sure the basketball hoop and the ball in the air are both visible in the shot.
          </p>
          <p className="text-sm sm:text-base text-slate-300 max-w-2xl">
            Google Gemini will then give you feedback on how to improve your shot or confirm if your shot is already great.
          </p>
        </div>
      </div>

      <div className="px-4 sm:px-6">
        <Recorder
          setVideoURL={setVideoURL}
          videoURL={videoURL}
          usePreview={usePreview}
          setVideoFile={setVideoFile}
        />
      </div>
    </div>
  );
}
*/
