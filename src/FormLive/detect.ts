import type { PoseLandmarker } from "@mediapipe/tasks-vision";
import {
  calculateAngle,
  calculateDistance,
} from "../Form/Backend/calculations";
import {
  getAnkleFeedback,
  getBendFeedback,
  getFlareFeedback,
  getKneeFeedback,
} from "./Helper";

interface Props {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  poseLandmarker: PoseLandmarker;
  dominantHand: "left" | "right" | null;
  setAnkleFeedback: React.Dispatch<React.SetStateAction<string>>;
  setKneeFeedback: React.Dispatch<React.SetStateAction<string>>;
  setFlareFeedback: React.Dispatch<React.SetStateAction<string>>;
  setBendFeedback: React.Dispatch<React.SetStateAction<string>>;
  setErrorFeedback: React.Dispatch<React.SetStateAction<string>>;
  poseConnections: [number, number][];
  VIS_THRESHOLD: number;
  animationFrameId: number;
}

export default function detect({
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
}: Props) {
  if (!videoRef.current || !canvasRef.current || !poseLandmarker) return;

  const video = videoRef.current;
  const canvas = canvasRef.current;
  const aspectRatio = video.videoWidth / video.videoHeight;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  if (!Number.isFinite(aspectRatio) || aspectRatio <= 0) {
    setErrorFeedback("⚠️ Unable to read video dimensions for pose analysis.");
    return;
  }

  const results = poseLandmarker.detectForVideo(video, performance.now());

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (results.landmarks.length > 0) {
    const landmarks = results.landmarks[0];
    const visibleLandmarks = new Set([
      11,
      12,
      dominantHand === "right" ? 14 : 13,
      dominantHand === "right" ? 16 : 15,
      dominantHand === "right" ? 24 : 23,
      25,
      26,
      27,
      28,
    ]);

    poseConnections.forEach(([firstIndex, secondIndex]) => {
      const first = landmarks[firstIndex];
      const second = landmarks[secondIndex];
      if (
        !first ||
        !second ||
        first.visibility <= VIS_THRESHOLD ||
        second.visibility <= VIS_THRESHOLD
      ) {
        return;
      }

      ctx.beginPath();
      ctx.moveTo(first.x * canvas.width, first.y * canvas.height);
      ctx.lineTo(second.x * canvas.width, second.y * canvas.height);
      ctx.strokeStyle = "lime";
      ctx.lineWidth = 2;
      ctx.stroke();
    });

    landmarks.forEach((landmark, index) => {
      if (
        !visibleLandmarks.has(index) ||
        landmark.visibility <= VIS_THRESHOLD
      ) {
        return;
      }

      ctx.beginPath();
      ctx.arc(
        landmark.x * canvas.width,
        landmark.y * canvas.height,
        5,
        0,
        2 * Math.PI,
      );
      ctx.fillStyle = "lime";
      ctx.fill();
    });

    const shoulder = dominantHand === "right" ? landmarks[12] : landmarks[11];
    const rightShoulder = landmarks[12];
    const leftShoulder = landmarks[11];
    const elbow = dominantHand === "right" ? landmarks[14] : landmarks[13];
    const wrist = dominantHand === "right" ? landmarks[16] : landmarks[15];
    const rightAnkle = landmarks[28];
    const leftAnkle = landmarks[27];
    const rightKnee = landmarks[26];
    const leftKnee = landmarks[25];
    const hip = dominantHand === "right" ? landmarks[24] : landmarks[23];
    const knee = dominantHand === "right" ? landmarks[26] : landmarks[25];
    const ankle = dominantHand === "right" ? landmarks[28] : landmarks[27];

    const shoulderVisible = shoulder.visibility >= VIS_THRESHOLD;

    const elbowVisible = elbow.visibility >= VIS_THRESHOLD;

    const wristVisible = wrist.visibility >= VIS_THRESHOLD;

    const shouldersVisible =
      rightShoulder.visibility >= VIS_THRESHOLD &&
      leftShoulder.visibility >= VIS_THRESHOLD;
    const anklesVisible =
      leftAnkle.visibility >= VIS_THRESHOLD &&
      rightAnkle.visibility >= VIS_THRESHOLD;
    const kneesVisible =
      leftKnee.visibility >= VIS_THRESHOLD &&
      rightKnee.visibility > VIS_THRESHOLD;
    const hipsVisible =
      landmarks[23].visibility > VIS_THRESHOLD &&
      landmarks[24].visibility >= VIS_THRESHOLD;
    const hipVisible = hip.visibility >= VIS_THRESHOLD;

    const keypointsVisibleEnough =
      rightShoulder.visibility >= VIS_THRESHOLD &&
      leftShoulder.visibility >= VIS_THRESHOLD &&
      elbow.visibility >= VIS_THRESHOLD &&
      wrist.visibility >= VIS_THRESHOLD &&
      rightAnkle.visibility >= VIS_THRESHOLD &&
      leftAnkle.visibility >= VIS_THRESHOLD &&
      rightKnee.visibility >= VIS_THRESHOLD &&
      leftKnee.visibility >= VIS_THRESHOLD &&
      hip.visibility >= VIS_THRESHOLD &&
      knee.visibility >= VIS_THRESHOLD &&
      ankle.visibility >= VIS_THRESHOLD;

    setErrorFeedback(
      keypointsVisibleEnough ? "" : "⚠️ Keypoints not visible enough.",
    );

    let ankleDistance: number | null = null;
    let kneeDistance: number | null = null;
    let hipDistance: number | null = null;
    let shoulderDistance: number | null = null;
    let flareDistance: number | null = null;
    let elbowAngle: number | null = null;
    let kneeAngle: number | null = null;

    if (hipVisible && kneesVisible && anklesVisible) {
      kneeAngle = calculateAngle(hip, knee, ankle, aspectRatio);
    }

    if (shouldersVisible) {
      shoulderDistance = calculateDistance(
        rightShoulder,
        leftShoulder,
        aspectRatio,
      );
    }

    if (elbowVisible && shoulderVisible && wristVisible) {
      elbowAngle = calculateAngle(shoulder, elbow, wrist, aspectRatio);
      flareDistance = Math.abs(elbow.x - shoulder.x) * aspectRatio;
    }

    if (anklesVisible) {
      ankleDistance = calculateDistance(rightAnkle, leftAnkle, aspectRatio);
    }

    if (kneesVisible) {
      kneeDistance = calculateDistance(rightKnee, leftKnee, aspectRatio);
    }
    if (hipsVisible) {
      hipDistance = calculateDistance(
        landmarks[24],
        landmarks[23],
        aspectRatio,
      );
    }

    setFlareFeedback(
      getFlareFeedback(
        elbowVisible,
        shoulderVisible,
        wristVisible,
        flareDistance,
        elbowAngle,
      ),
    );

    setAnkleFeedback(
      getAnkleFeedback(
        anklesVisible,
        shouldersVisible,
        ankleDistance,
        shoulderDistance,
      ),
    );

    setKneeFeedback(
      getKneeFeedback(kneesVisible, hipsVisible, hipDistance, kneeDistance),
    );

    setBendFeedback(getBendFeedback(kneeAngle));
  } else {
    setFlareFeedback("⚠️ Unable to detect arms. Please reposition yourself.");

    setAnkleFeedback("⚠️ Unable to detect ankles.");
    setKneeFeedback("⚠️ Unable to detect knees.");
    setBendFeedback("⚠️ Unable to calculate knee bend.");

    setErrorFeedback("⚠️ Person not detected.");
  }
  animationFrameId = requestAnimationFrame(() =>
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
    }),
  );
}
