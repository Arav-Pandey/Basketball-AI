import type { NormalizedLandmark } from "@mediapipe/tasks-vision";
import type {
  KeypointVisibilityProps,
  MeasurementProps,
  Measurements,
  TopFrame,
} from "../interfaces";
import type { curry, user } from "../types";

export function getSimilarity(user: user, curry: curry) {
  function normalize(diff: number, tolerance: number) {
    return Math.max(0, 1 - diff / tolerance);
  }

  const flareScore = normalize(Math.abs(user.flare - curry.flare), 0.1);

  const kneeScore = normalize(
    Math.abs(user.kneeAngle - curry.kneeAngle),
    15, // degrees
  );

  const total = flareScore * 0.65 + kneeScore * 0.35;

  return Math.round(total * 100);
}

export function calculateDistance(a: any, b: any) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

export function calculateAngle(
  a: NormalizedLandmark,
  b: NormalizedLandmark,
  c: NormalizedLandmark,
) {
  const ba = {
    x: a.x - b.x,
    y: a.y - b.y,
    z: a.z - b.z,
  };

  const bc = {
    x: c.x - b.x,
    y: c.y - b.y,
    z: c.z - b.z,
  };

  const dot = ba.x * bc.x + ba.y * bc.y + ba.z * bc.z;

  const magBA = Math.hypot(ba.x, ba.y, ba.z);
  const magBC = Math.hypot(bc.x, bc.y, bc.z);

  if (magBA === 0 || magBC === 0) {
    return 0;
  }

  const cosine = Math.max(-1, Math.min(1, dot / (magBA * magBC)));

  return Math.acos(cosine) * (180 / Math.PI);
}
export function averageLowestKneeAngles(angles: number[], count: number) {
  if (angles.length === 0) return Infinity;
  const sorted = [...angles].sort((a, b) => a - b);
  const lowest = sorted.slice(0, count);
  return lowest.reduce((sum, a) => sum + a, 0) / lowest.length;
}

export function checkKeypointVisibility(
  {
    rightShoulder,
    leftShoulder,
    elbow,
    wrist,
    rightAnkle,
    leftAnkle,
    rightKnee,
    leftKnee,
  }: KeypointVisibilityProps,
  threshold: number,
) {
  if (
    rightShoulder.visibility < threshold ||
    leftShoulder.visibility < threshold ||
    elbow.visibility < threshold ||
    wrist.visibility < threshold ||
    rightAnkle.visibility < threshold ||
    leftAnkle.visibility < threshold ||
    rightKnee.visibility < threshold ||
    leftKnee.visibility < threshold
  ) {
    return false;
  }
  return true;
}

export function emptyMeasurements(): Measurements {
  return {
    feetDistance: null,
    kneeDistance: null,
    shoulderDistance: null,
    hipDistance: null,
    flareDistance: null,
    kneeFlare: null,
  };
}

export function averageTopFrames(
  frames: TopFrame[],
  kneeAngle: number,
  topFrameCount: number,
) {
  const topFrames = [...frames]
    .sort((a, b) => a.wristY - b.wristY)
    .slice(0, topFrameCount);

  if (topFrames.length === 0) return null;

  const total = topFrames.reduce(
    (acc, frame) => ({
      wristY: acc.wristY + frame.wristY,
      flare: acc.flare + frame.flare,
      shoulderDistance: acc.shoulderDistance + frame.shoulderDistance,
      feetDistance: acc.feetDistance + frame.feetDistance,
      kneeDistance: acc.kneeDistance + frame.kneeDistance,
      kneeFlare: acc.kneeFlare + frame.kneeFlare,
    }),
    {
      wristY: 0,
      flare: 0,
      shoulderDistance: 0,
      feetDistance: 0,
      kneeDistance: 0,
      kneeFlare: 0,
    },
  );

  return {
    wristY: total.wristY / topFrames.length,
    flare: total.flare / topFrames.length,
    shoulderDistance: total.shoulderDistance / topFrames.length,
    feetDistance: total.feetDistance / topFrames.length,
    kneeDistance: total.kneeDistance / topFrames.length,
    kneeFlare: total.kneeFlare / topFrames.length,
    kneeAngle,
  };
}

export function updateFeedbackFromLatestMeasurements({
  details,
  latestMeasurementsRef,
  lowestKneeAngleRef,
  kneeDirection,
  setFlareFeedback,
  setFeetFeedback,
  setKneeFeedback,
  setKneeFlareFeedback,
  setKneeDirectionFeedback,
  setBendFeedback,
  dominantHand,
  getBendFeedback,
  getFlareFeedbackFromValues,
  getFeetDistanceFeedback,
  getKneeDistanceFeedback,
  getKneeFlareFeedback,
  getKneeDirectionFeedback,
}: MeasurementProps) {
  const measurements = latestMeasurementsRef.current;
  const hasMeasurementData =
    measurements.feetDistance !== null ||
    measurements.kneeDistance !== null ||
    measurements.shoulderDistance !== null ||
    measurements.flareDistance !== null ||
    measurements.kneeFlare !== null ||
    Number.isFinite(lowestKneeAngleRef.current) ||
    kneeDirection !== null;

  if (!hasMeasurementData) return;

  setFlareFeedback(
    getFlareFeedbackFromValues(
      measurements.flareDistance,
      measurements.shoulderDistance,
      details,
    ),
  );
  setFeetFeedback(
    getFeetDistanceFeedback(
      measurements.feetDistance,
      measurements.shoulderDistance,
      details,
    ),
  );
  setKneeFeedback(
    getKneeDistanceFeedback(
      measurements.kneeDistance,
      measurements.feetDistance,
      details,
    ),
  );
  setKneeFlareFeedback(
    getKneeFlareFeedback(
      measurements.kneeFlare,
      details,
      measurements.hipDistance,
    ),
  );
  setKneeDirectionFeedback(
    getKneeDirectionFeedback(dominantHand, kneeDirection),
  );

  const lowestKneeAngle = lowestKneeAngleRef.current;
  if (typeof lowestKneeAngle === "number" && Number.isFinite(lowestKneeAngle)) {
    setBendFeedback(getBendFeedback(lowestKneeAngle, details));
  } else {
    setBendFeedback("⚠️ Unable to detect knee bend.");
  }
}
