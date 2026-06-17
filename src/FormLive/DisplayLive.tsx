import HandOverlay from "../HandOverlay";

interface Props {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  ankleFeedback: string | null;
  kneeFeedback: string | null;
  flareFeedback: string | null;
  bendFeedback: string | null;
  errorFeedback: string | null;
  setDominantHand: React.Dispatch<
    React.SetStateAction<"left" | "right" | null>
  >;
}

export default function DisplayLive({
  videoRef,
  canvasRef,
  ankleFeedback,
  kneeFeedback,
  flareFeedback,
  errorFeedback,
  setDominantHand,
  bendFeedback,
}: Props) {
  return (
    <div className="flex flex-col items-center w-full px-4 sm:px-6 py-6 sm:py-8">
      <HandOverlay setDominantHand={setDominantHand} />
      {/* Video + Canvas wrapper - responsive aspect ratio */}
      <div className="relative w-full max-w-2xl aspect-video bg-black rounded-xl sm:rounded-2xl overflow-hidden shadow-xl">
        {/*LIVE CAMERA FEED*/}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* AI OVERLAY */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full pointer-events-none"
        />
      </div>

      {/* Feedback text */}
      <div className="mt-6 sm:mt-8 w-full max-w-2xl mx-auto mb-5">
        <div className="rounded-xl sm:rounded-2xl border border-orange-500/30 bg-slate-900/70 p-4 sm:p-6 backdrop-blur-xl space-y-3 sm:space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <p className="text-orange-300 text-xs uppercase font-semibold tracking-widest">
                Ankle Placement
              </p>
              <p className="text-white text-xs sm:text-sm font-medium mt-1">
                {ankleFeedback === null || ankleFeedback === ""
                  ? "N/A"
                  : ankleFeedback}
              </p>
            </div>
            <div>
              <p className="text-orange-300 text-xs uppercase font-semibold tracking-widest">
                Knee Placement
              </p>
              <p className="text-white text-xs sm:text-sm font-medium mt-1">
                {kneeFeedback === null || kneeFeedback === ""
                  ? "N/A"
                  : kneeFeedback}
              </p>
            </div>
            <div>
              <p className="text-orange-300 text-xs uppercase font-semibold tracking-widest">
                Elbow Alignment
              </p>
              <p className="text-white text-xs sm:text-sm font-medium mt-1">
                {flareFeedback === null || flareFeedback === ""
                  ? "N/A"
                  : flareFeedback}
              </p>
            </div>
            <div>
              <p className="text-orange-300 text-xs uppercase font-semibold tracking-widest">
                Knee Bend
              </p>
              <p className="text-white text-xs sm:text-sm font-medium mt-1">
                {bendFeedback === null || bendFeedback === ""
                  ? "N/A"
                  : bendFeedback}
              </p>
            </div>
          </div>
          {errorFeedback !== null && errorFeedback !== "" && (
            <div className="border-t border-white/10 pt-4">
              <p className="text-orange-300 text-xs uppercase font-semibold tracking-widest">
                Error Feedback
              </p>
              <p className="text-white text-sm font-medium mt-1">
                {errorFeedback}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
