import type { NormalizedLandmark } from "@mediapipe/tasks-vision";

export interface MeasurementProps {
  details: boolean;
  latestMeasurementsRef: React.MutableRefObject<Measurements>;
  lowestKneeAngleRef: React.MutableRefObject<number | null>;
  kneeDirection: "right" | "left" | "forward" | null;
  setFlareFeedback: React.Dispatch<React.SetStateAction<string | null>>;
  setFeetFeedback: React.Dispatch<React.SetStateAction<string | null>>;
  setKneeFeedback: React.Dispatch<React.SetStateAction<string | null>>;
  setKneeFlareFeedback: React.Dispatch<React.SetStateAction<string | null>>;
  setKneeDirectionFeedback: React.Dispatch<React.SetStateAction<string | null>>;
  setBendFeedback: React.Dispatch<React.SetStateAction<string | null>>;
  dominantHand: "right" | "left" | null;
  getFlareFeedbackFromValues: (
    flareDistance: number | null,
    shoulderDistance: number | null,
    details: boolean,
  ) => string;
  getFeetDistanceFeedback: (
    feetDistance: number | null,
    shoulderDistance: number | null,
    details: boolean,
  ) => string;
  getKneeDistanceFeedback: (
    kneeDistance: number | null,
    feetDistance: number | null,
    details: boolean,
  ) => string;
  getBendFeedback: (lowestKneeAngle: number, details: boolean) => string;
  getKneeFlareFeedback: (
    kneeFlare: number | null,
    details: boolean,
    hipDistance: number | null,
  ) => string;
  getKneeDirectionFeedback: (
    dominantHand: "right" | "left" | null,
    kneeDirection: "right" | "left" | "forward" | null,
  ) => string;
}

export interface DisplayProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  rewatchFeedback: () => void;
  feetFeedback: string | null;
  flareFeedback: string | null;
  kneeDirectionFeedback: string | null;
  similarityFeedback: string | null;
  errorFeedback: string | null;
  flareScore: number | null;
  kneeFlareScore: number | null;
  similarity: React.RefObject<number | null>;
  setDominantHand: React.Dispatch<
    React.SetStateAction<"left" | "right" | null>
  >;
  bendFeedback: string | null;
  bendScore: number | null;
  feetDistanceScore: number | null;
  kneeDistanceScore: number | null;
  kneeFeedback: string | null;
  kneeFlareFeedback: string | null;
  setDetails: React.Dispatch<React.SetStateAction<boolean>>;
  details: boolean;
}

export interface FeedbackTableProps {
  feetFeedback: string | null;
  flareFeedback: string | null;
  bendFeedback: string | null;
  kneeFeedback: string | null;
  kneeFlareFeedback: string | null;
  feetDistanceScore: number | null;
  flareScore: number | null;
  bendScore: number | null;
  kneeDistanceScore: number | null;
  kneeFlareScore: number | null;
  similarityFeedback: string | null;
  similarity: React.MutableRefObject<number | null>;
}

export interface DetectProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  poseLandmarker: any;
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
  setSimilarityFeedback: React.Dispatch<React.SetStateAction<string | null>>;
  setErrorFeedback: React.Dispatch<React.SetStateAction<string | null>>;
  updateFeedbackFromLatestMeasurements: () => void;
}

export interface TopFrame {
  wristY: number;
  flare: number;
  shoulderDistance: number;
  feetDistance: number;
  kneeDistance: number;
  kneeFlare: number;
  kneeAngle: number;
}

export interface KeypointVisibilityProps {
  rightShoulder: NormalizedLandmark;
  leftShoulder: NormalizedLandmark;
  elbow: NormalizedLandmark;
  wrist: NormalizedLandmark;
  rightAnkle: NormalizedLandmark;
  leftAnkle: NormalizedLandmark;
  rightKnee: NormalizedLandmark;
  leftKnee: NormalizedLandmark;
}

export interface Measurements {
  feetDistance: number | null;
  kneeDistance: number | null;
  shoulderDistance: number | null;
  hipDistance: number | null;
  flareDistance: number | null;
  kneeFlare: number | null;
}

export interface HelperProps {
  setVideoURL: React.Dispatch<React.SetStateAction<string>>;
  setVideoFile?: React.Dispatch<React.SetStateAction<File | null>>;
  streamRef: React.MutableRefObject<MediaStream | null>;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  facingMode: "user" | "environment";
  setRecording: React.Dispatch<React.SetStateAction<boolean>>;
  chunksRef: React.MutableRefObject<Blob[]>;
  mediaRecorderRef: React.MutableRefObject<MediaRecorder | null>;
}
