import { useEffect, useRef, useState } from "react";
import { PoseLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";
import {
  calculateAngle,
  calculateDistance,
} from "../Form/Backend/calculations";
import DisplayLive from "./DisplayLive";

export default function FormLive() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

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
    let animationFrameId: number;

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
          detect();
        };
      } catch {
        setErrorFeedback("⚠️ Unable to access camera.");
      }
    }

    function detect() {
      if (!videoRef.current || !canvasRef.current || !poseLandmarker) return;

      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const results = poseLandmarker.detectForVideo(video, performance.now());

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (results.landmarks.length > 0) {
        const landmarks = results.landmarks[0];

        // Draw landmarks
        landmarks.forEach((landmark) => {
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

        const shoulder =
          dominantHand === "right" ? landmarks[12] : landmarks[11];
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

        const shoulderVisible = shoulder.visibility > 0.1;
        const elbowVisible = elbow.visibility > 0.1;
        const wristVisible = wrist.visibility > 0.1;
        const shouldersVisible =
          rightShoulder.visibility > 0.1 && leftShoulder.visibility > 0.1;
        const anklesVisible =
          leftAnkle.visibility > 0.1 && rightAnkle.visibility > 0.1;
        const kneesVisible =
          leftKnee.visibility > 0.1 && rightKnee.visibility > 0.1;
        const hipVisible = hip.visibility > 0.1;

        const keypointsVisibleEnough =
          rightShoulder.visibility >= 0.4 &&
          leftShoulder.visibility >= 0.4 &&
          elbow.visibility >= 0.4 &&
          wrist.visibility >= 0.4 &&
          rightAnkle.visibility >= 0.4 &&
          leftAnkle.visibility >= 0.4 &&
          rightKnee.visibility >= 0.4 &&
          leftKnee.visibility >= 0.4 &&
          hip.visibility >= 0.4 &&
          knee.visibility >= 0.4 &&
          ankle.visibility >= 0.4;

        setErrorFeedback(
          keypointsVisibleEnough ? "" : "⚠️ Keypoints not visible enough.",
        );

        let ankleDistance: number | null = null;
        let kneeDistance: number | null = null;
        let shoulderDistance: number | null = null;
        let flareDistance: number | null = null;
        let elbowAngle: number | null = null;
        let kneeAngle: number | null = null;

        if (hipVisible && kneesVisible && anklesVisible) {
          kneeAngle = calculateAngle(hip, knee, ankle);
        }

        if (shouldersVisible) {
          shoulderDistance = calculateDistance(rightShoulder, leftShoulder);
        }

        if (elbowVisible && shoulderVisible && wristVisible) {
          elbowAngle = calculateAngle(shoulder, elbow, wrist);
          flareDistance = Math.abs(elbow.x - shoulder.x);
        }

        if (anklesVisible) {
          ankleDistance = calculateDistance(rightAnkle, leftAnkle);
        }

        if (kneesVisible) {
          kneeDistance = calculateDistance(rightKnee, leftKnee);
        }

        // --- ELBOW ---
        if (
          !elbowVisible ||
          !shoulderVisible ||
          !wristVisible ||
          flareDistance === null ||
          elbowAngle === null
        ) {
          setFlareFeedback(
            "⚠️ Arms not fully visible. Unable to calculate elbow feedback.",
          );
        } else if (flareDistance > 0.15) {
          setFlareFeedback("⚠️ Elbow too wide");
        } else if (flareDistance < 0.01) {
          setFlareFeedback("⚠️ Elbow is too inside");
        } else if (elbowAngle < 40) {
          setFlareFeedback("⚠️ Arm angle too tight");
        } else {
          setFlareFeedback("✅ Good elbow alignment");
        }

        // --- ANKLES ---
        if (!anklesVisible) {
          setAnkleFeedback("⚠️ Unable to detect ankles.");
        } else if (!shouldersVisible || shoulderDistance === null) {
          setAnkleFeedback("⚠️ Unable to calculate shoulder distance.");
        } else if (ankleDistance === null) {
          setAnkleFeedback("⚠️ Unable to calculate ankle distance.");
        } else if (ankleDistance < shoulderDistance - 0.05) {
          setAnkleFeedback("⚠️ Feet too close");
        } else if (ankleDistance > shoulderDistance + 0.05) {
          setAnkleFeedback("⚠️ Feet too far");
        } else {
          setAnkleFeedback("✅ Good foot spacing");
        }

        // --- KNEES ---
        if (!kneesVisible) {
          setKneeFeedback("⚠️ Unable to detect knees.");
        } else if (!shouldersVisible) {
          setKneeFeedback("⚠️ Unable to calculate shoulder distance.");
        } else if (!kneeDistance) {
          setKneeFeedback("⚠️ Unable to calculate knee distance.");
        } else if (!shoulderDistance) {
          setKneeFeedback("⚠️ Unable to calculate shoulder distance.");
        } else if (kneeDistance < shoulderDistance - 0.08) {
          setKneeFeedback("⚠️ Knees too close");
        } else if (kneeDistance > shoulderDistance + 0.08) {
          setKneeFeedback("⚠️ Knees too far");
        } else {
          setKneeFeedback("✅ Good knee alignment");
        }
        // --- BEND ---
        if (!kneeAngle) {
          setBendFeedback("⚠️ Unable to calculate knee bend.");
        } else if (kneeAngle < 90) {
          setBendFeedback("⚠️ Knee bend too deep.");
        } else if (kneeAngle > 120) {
          setBendFeedback("⚠️ Knee bend too shallow.");
        } else {
          setBendFeedback("✅ Good knee bend.");
        }
      }
      animationFrameId = requestAnimationFrame(detect);
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
