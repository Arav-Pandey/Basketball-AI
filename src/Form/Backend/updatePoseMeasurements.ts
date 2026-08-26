import type { NormalizedLandmark } from "@mediapipe/tasks-vision";
import type { PosePoint } from "../../yolo26Pose";
import {
  calculateAngle,
  calculateDistance,
  checkKeypointVisibility,
  emptyMeasurements,
} from "./calculations";
import { getKneeFlareFeedback } from "./feedbackFunctions";
import type { DetectProps } from "./detectTypes";
import { minVisibility } from "./poseVisibility";

type Landmark = NormalizedLandmark | PosePoint;

export function updatePoseMeasurements(
  props: DetectProps,
  landmarks: Landmark[],
): boolean {
  const {
    dominantHand,
    details,
    kneeFramesRef,
    lowestKneeAngleRef,
    topFramesRef,
    setErrorFeedback,
    setKneeDirection,
    setKneeFlareFeedback,
    latestMeasurementsRef,
    updateFeedbackFromLatestMeasurements,
  } = props;

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
  const rightHip = landmarks[24];
  const leftHip = landmarks[23];
  const hip = dominantHand === "right" ? rightHip : leftHip;
  const knee = dominantHand === "right" ? rightKnee : leftKnee;
  const ankle = dominantHand === "right" ? rightAnkle : leftAnkle;

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
    return false;
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
    minVisibility,
  );
  const anklesVisible =
    leftAnkle.visibility > minVisibility &&
    rightAnkle.visibility > minVisibility;
  const kneesVisible =
    leftKnee.visibility > minVisibility && rightKnee.visibility > minVisibility;
  const hipsVisible =
    landmarks[23].visibility > minVisibility &&
    landmarks[24].visibility > minVisibility;
  const shouldersVisible =
    rightShoulder.visibility > minVisibility &&
    leftShoulder.visibility > minVisibility;
  const shootingArmVisible =
    shoulder.visibility > minVisibility &&
    elbow.visibility > minVisibility &&
    wrist.visibility > minVisibility;
  const bendVisible =
    hip.visibility > minVisibility &&
    knee.visibility > minVisibility &&
    ankle.visibility > minVisibility;

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
      getKneeFlareFeedback(currentKneeFlare, details, measurements.hipDistance),
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
    kneesVisible &&
    hipsVisible
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
  return true;
}
