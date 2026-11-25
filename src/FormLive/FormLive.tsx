import { useEffect, useRef, useState } from "react";
import { PoseLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";
import detect from "./detect";
import DisplayLive from "./DisplayLive";

const poseConnections: [number, number][] = [
  [11, 12],
  [11, 13],
  [13, 15],
  [12, 14],
  [14, 16],
  [11, 23],
  [12, 24],
  [23, 24],
  [23, 25],
  [25, 27],
  [24, 26],
  [26, 28],
];

export default function FormLive() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const VIS_THRESHOLD = 0.4;

  const [ankleFeedback, setAnkleFeedback] = useState("");
  const [kneeFeedback, setKneeFeedback] = useState("");
  const [flareFeedback, setFlareFeedback] = useState("");
  const [bendFeedback, setBendFeedback] = useState("");
  const [errorFeedback, setErrorFeedback] = useState("");
  const [dominantHand, setDominantHand] = useState<"left" | "right" | null>(
    null,
  );

  useEffect(() => {
    if (dominantHand === null) {
      console.log("Dominant hand not selected yet.", dominantHand);
      return;
    }
    let poseLandmarker: PoseLandmarker;
    let animationFrameId = 0;

    async function init() {
      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm", // Downloads the WASM files so that the AI model can run in the browser
      );

      poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath:
            "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_full/float16/latest/pose_landmarker_full.task",
        },
        runningMode: "VIDEO",
        numPoses: 1,
      });

      setupCamera();
    }

    async function setupCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });

        if (!videoRef.current) return;

        videoRef.current.srcObject = stream;

        videoRef.current.onloadedmetadata = () => {
          const video = videoRef.current!;
          const canvas = canvasRef.current!;

          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;

          video.play();
          detect({
            videoRef,
            canvasRef,
            poseLandmarker,
            dominantHand,
            setAnkleFeedback,
            setKneeFeedback,
            setFlareFeedback,
            setBendFeedback,
            setErrorFeedback,
            poseConnections,
            VIS_THRESHOLD,
            animationFrameId,
          });
        };
      } catch {
        setErrorFeedback("⚠️ Unable to access camera.");
      }
    }

    init();

    return () => cancelAnimationFrame(animationFrameId);
  }, [dominantHand]);

  return (
    <DisplayLive
      videoRef={videoRef}
      canvasRef={canvasRef}
      ankleFeedback={ankleFeedback}
      kneeFeedback={kneeFeedback}
      flareFeedback={flareFeedback}
      bendFeedback={bendFeedback}
      errorFeedback={errorFeedback}
      setDominantHand={setDominantHand}
    />
  );
}
