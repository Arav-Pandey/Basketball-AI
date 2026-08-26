import type { PoseLandmarker } from "@mediapipe/tasks-vision";
import type { Measurements, TopFrame } from "./calculations";
import type { PosePoint } from "../../yolo26Pose";

export type PoseModel = "mediapipe" | "yolo26s";

export const YOLO_ANALYSIS_FPS = 10;

export interface DetectProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  poseLandmarker: PoseLandmarker | null;
  model: PoseModel;
  yoloPoseCacheRef: React.MutableRefObject<Map<number, PosePoint[] | null>>;
  animationFrameIdRef: React.MutableRefObject<number>;
  latestMeasurementsRef: React.MutableRefObject<Measurements>;
  kneeFramesRef: React.MutableRefObject<number[]>;
  topFramesRef: React.MutableRefObject<TopFrame[]>;
  lowestKneeAngleRef: React.MutableRefObject<number>;
  similarityRef: React.MutableRefObject<number | null>;
  dominantHand: "right" | "left" | null;
  details: boolean;
  setFlareScore: React.Dispatch<React.SetStateAction<number | null>>;
  setFlareFeedback: React.Dispatch<React.SetStateAction<string | null>>;
  setFeetDistanceScore: React.Dispatch<React.SetStateAction<number | null>>;
  setFeetFeedback: React.Dispatch<React.SetStateAction<string | null>>;
  setKneeDistanceScore: React.Dispatch<React.SetStateAction<number | null>>;
  setKneeFeedback: React.Dispatch<React.SetStateAction<string | null>>;
  setKneeFlareScore: React.Dispatch<React.SetStateAction<number | null>>;
  setKneeFlareFeedback: React.Dispatch<React.SetStateAction<string | null>>;
  setKneeDirection: React.Dispatch<
    React.SetStateAction<"right" | "left" | "forward" | null>
  >;
  setBendScore: React.Dispatch<React.SetStateAction<number | null>>;
  setBendFeedback: React.Dispatch<React.SetStateAction<string | null>>;
  setSimilarityFeedback: React.Dispatch<React.SetStateAction<string | null>>;
  setErrorFeedback: React.Dispatch<React.SetStateAction<string | null>>;
  updateFeedbackFromLatestMeasurements: () => void;
  lastVideoTimeRef: React.MutableRefObject<number>;
}
