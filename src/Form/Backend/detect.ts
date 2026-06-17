import {
  averageLowestKneeAngles,
  averageTopFrames,
  calculateAngle,
  calculateDistance,
  checkKeypointVisibility,
  emptyMeasurements,
  getSimilarity,
} from "./calculations";
import {
  getFlareFeedbackFromValues,
  getFeetDistanceFeedback,
  getKneeDistanceFeedback,
  getKneeFlareFeedback,
  getSimilarityFeedback,
} from "./feedbackFunctions";
import {
  scoreBendAngle,
  scoreElbowFlare,
  scoreFeetDistance,
  scoreKneeDistance,
  scoreKneeFlare,
} from "./scoringFunctions";
import type { DetectProps } from "../interfaces";

const minVis = 0.6;

const curryBaseline = {
  flare: 0.02,
  kneeAngle: 146.72,
};

const connections: [number, number][] = [
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

const topFrameCount = 5;
const kneeAngleAverageCount = 5;

export default function detect(props: DetectProps) {
  const {
    videoRef,
    canvasRef,
    poseLandmarker,
    animationFrameIdRef,
    latestMeasurementsRef,
    kneeFramesRef,
    topFramesRef,
    lowestKneeAngleRef,
    similarityRef,
    dominantHand,
    details,
    setFlareScore,
    setFlareFeedback,
    setFeetDistanceScore,
    setFeetFeedback,
    setKneeDistanceScore,
    setKneeFeedback,
    setKneeFlareScore,
    setKneeFlareFeedback,
    setKneeDirection,
    setBendScore,
    setSimilarityFeedback,
    setErrorFeedback,
    updateFeedbackFromLatestMeasurements,
  } = props;

  if (!videoRef.current || !canvasRef.current || !poseLandmarker) return;

  const video = videoRef.current;
  const canvas = canvasRef.current;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const scheduleNext = () => {
    animationFrameIdRef.current = requestAnimationFrame(() => detect(props));
  };

  if (video.paused || video.ended) {
    if (video.ended) {
      cancelAnimationFrame(animationFrameIdRef.current);

      const averagedLowestKnee = averageLowestKneeAngles(
        kneeFramesRef.current,
        kneeAngleAverageCount,
      );

      console.log("raw kneeFrames:", kneeFramesRef.current);
      console.log("min kneeFrame:", Math.min(...kneeFramesRef.current));

      const best = averageTopFrames(
        topFramesRef.current,
        averagedLowestKnee,
        topFrameCount,
      );

      if (!best) {
        similarityRef.current = null;
        return;
      }

      if (best.flare !== 0) {
        setFlareScore(scoreElbowFlare(best.flare, best.shoulderDistance));
        setFlareFeedback(
          getFlareFeedbackFromValues(
            best.flare,
            best.shoulderDistance,
            details,
          ),
        );
      }
      if (Number.isFinite(averagedLowestKnee)) {
        setBendScore(scoreBendAngle(averagedLowestKnee));
      }
      if (best.feetDistance !== 0 && best.shoulderDistance) {
        setFeetDistanceScore(
          scoreFeetDistance(best.feetDistance, best.shoulderDistance),
        );
        setFeetFeedback(
          getFeetDistanceFeedback(
            best.feetDistance,
            best.shoulderDistance,
            details,
          ),
        );
      }
      if (best.kneeDistance !== 0 && best.feetDistance) {
        setKneeDistanceScore(
          scoreKneeDistance(
            best.kneeDistance,
            best.feetDistance,
          ),
        );
        setKneeFeedback(
          getKneeDistanceFeedback(
            best.kneeDistance,
            best.feetDistance,
            details,
          ),
        );
      }
      if (best.kneeFlare !== 0) {
        setKneeFlareScore(scoreKneeFlare(best.kneeFlare));
      }

      if (best.flare !== 0 && best.wristY !== 0) {
        similarityRef.current = getSimilarity(best, curryBaseline);
        setSimilarityFeedback(getSimilarityFeedback(similarityRef.current));
      } else {
        similarityRef.current = null;
      }

      return;
    }

    if (video.paused) {
      scheduleNext();
      return;
    }
  }

  const results = poseLandmarker.detectForVideo(video, performance.now());

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (results.landmarks.length > 0) {
    const landmarks = results.landmarks[0];

    connections.forEach(([i, j]) => {
      const a = landmarks[i];
      const b = landmarks[j];
      if (!a || !b || a.visibility < minVis || b.visibility < minVis) return;

      ctx.beginPath();
      ctx.moveTo(a.x * video.clientWidth, a.y * video.clientHeight);
      ctx.lineTo(b.x * video.clientWidth, b.y * video.clientHeight);
      ctx.strokeStyle = "lime";
      ctx.lineWidth = 2;
      ctx.stroke();
    });

    const visibleIndices = new Set([
      11, 12, 13, 14, 15, 16, 23, 24, 25, 26, 27, 28,
    ]);
    landmarks.forEach((landmark: any, index: number) => {
      if (!visibleIndices.has(index)) return;
      ctx.beginPath();
      ctx.arc(
        landmark.x * video.clientWidth,
        landmark.y * video.clientHeight,
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
    const leftHip = landmarks[23];
    const rightHip = landmarks[24];
    const hip = dominantHand === "right" ? landmarks[24] : landmarks[23];
    const knee = dominantHand === "right" ? landmarks[26] : landmarks[25];
    const ankle = dominantHand === "right" ? landmarks[28] : landmarks[27];

    if (
      !shoulder ||
      !rightShoulder ||
      !leftShoulder ||
      !elbow ||
      !wrist ||
      !rightAnkle ||
      !leftAnkle ||
      !rightKnee ||
      !leftKnee ||
      !hip ||
      !knee ||
      !ankle
    ) {
      setErrorFeedback("⚠️ Unable to detect all keypoints.");
      scheduleNext();
      return;
    }

    const measurements = emptyMeasurements();
    const keypointsVisible = checkKeypointVisibility(
      {
        rightShoulder,
        leftShoulder,
        elbow,
        wrist,
        rightAnkle,
        leftAnkle,
        rightKnee,
        leftKnee,
      },
      minVis,
    );
    const anklesVisible =
      leftAnkle.visibility > minVis && rightAnkle.visibility > minVis;
    const kneesVisible =
      leftKnee.visibility > minVis && rightKnee.visibility > minVis;
    const hipsVisible =
      landmarks[23].visibility > minVis && landmarks[24].visibility > minVis;
    const shouldersVisible =
      rightShoulder.visibility > minVis && leftShoulder.visibility > minVis;
    const shootingArmVisible =
      shoulder.visibility > minVis &&
      elbow.visibility > minVis &&
      wrist.visibility > minVis;
    const bendVisible =
      hip.visibility > minVis &&
      knee.visibility > minVis &&
      ankle.visibility > minVis;

    setErrorFeedback(
      keypointsVisible ? null : "⚠️ Some keypoints not visible enough.",
    );

    if (bendVisible) {
      const kneeAngle = calculateAngle(hip, knee, ankle);
      kneeFramesRef.current.push(kneeAngle);
      if (kneeAngle < lowestKneeAngleRef.current) {
        lowestKneeAngleRef.current = kneeAngle;
      }
    }

    if (anklesVisible) {
      measurements.feetDistance = calculateDistance(rightAnkle, leftAnkle);
    }
    if (kneesVisible) {
      measurements.kneeDistance = calculateDistance(rightKnee, leftKnee);

      let currentKneeDirection: "right" | "left" | "forward" | null = null;
      let currentKneeFlare: number | null = null;

      if (hipsVisible) {
        measurements.hipDistance = calculateDistance(rightHip, leftHip);
        currentKneeFlare = Math.abs(hip.x - knee.x);
        currentKneeDirection =
          knee.x < hip.x ? "right" : knee.x > hip.x ? "left" : "forward";
        setKneeDirection(currentKneeDirection);
      }

      setKneeFlareFeedback(
        getKneeFlareFeedback(
          currentKneeFlare,
          details,
          measurements.hipDistance,
        ),
      );
      measurements.kneeFlare = currentKneeFlare;
    }
    if (shouldersVisible) {
      measurements.shoulderDistance = calculateDistance(
        rightShoulder,
        leftShoulder,
      );
    }

    if (
      shootingArmVisible &&
      shouldersVisible &&
      anklesVisible &&
      kneesVisible
    ) {
      measurements.flareDistance = Math.abs(elbow.x - shoulder.x);

      topFramesRef.current.push({
        wristY: wrist.y,
        flare: measurements.flareDistance,
        shoulderDistance: measurements.shoulderDistance ?? 0,
        feetDistance: measurements.feetDistance ?? 0,
        kneeDistance: measurements.kneeDistance ?? 0,
        kneeFlare: measurements.kneeFlare ?? 0,
        kneeAngle: bendVisible ? calculateAngle(hip, knee, ankle) : 0,
      });
    }

    latestMeasurementsRef.current = measurements;
    updateFeedbackFromLatestMeasurements();
  }

  scheduleNext();
}
