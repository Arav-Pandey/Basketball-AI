import type { NormalizedLandmark } from "@mediapipe/tasks-vision";
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
  const validAngles = angles.filter(Number.isFinite);
  if (validAngles.length === 0) return Infinity;

  const sampleCount = Math.min(
    validAngles.length,
    Math.max(count, Math.ceil(validAngles.length * 0.2)),
  );
  const lowest = [...validAngles]
    .sort((a, b) => a - b)
    .slice(0, sampleCount);

  // The median is less sensitive to one incorrectly predicted angle.
  return median(lowest);
}

interface KeypointVisibilityProps {
  rightShoulder: NormalizedLandmark;
  leftShoulder: NormalizedLandmark;
  elbow: NormalizedLandmark;
  wrist: NormalizedLandmark;
  rightAnkle: NormalizedLandmark;
  leftAnkle: NormalizedLandmark;
  rightKnee: NormalizedLandmark;
  leftKnee: NormalizedLandmark;
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

export interface Measurements {
  feetDistance: number | null;
  kneeDistance: number | null;
  shoulderDistance: number | null;
  hipDistance: number | null;
  flareDistance: number | null;
  kneeFlare: number | null;
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

export interface TopFrame {
  wristY: number;
  flare: number;
  shoulderDistance: number;
  feetDistance: number;
  kneeDistance: number;
  kneeFlare: number;
  kneeAngle: number;
}

function median(values: number[]): number {
  const sorted = values.filter(Number.isFinite).sort((a, b) => a - b);

  if (sorted.length === 0) return 0;

  const middle = Math.floor(sorted.length / 2);

  return sorted.length % 2 === 1
    ? sorted[middle]
    : (sorted[middle - 1] + sorted[middle]) / 2;
}

export function averageTopFrames(
  frames: TopFrame[],
  kneeAngle: number,
  topFrameCount: number,
) {
  if (frames.length === 0) return null;

  const visibleFrames = frames.filter((frame) => Number.isFinite(frame.wristY));
  if (visibleFrames.length === 0) return null;

  const sampleCount = Math.min(
    visibleFrames.length,
    Math.max(topFrameCount * 3, Math.ceil(visibleFrames.length * 0.2)),
  );
  const topFrames = [...visibleFrames]
    .sort((a, b) => a.wristY - b.wristY)
    .slice(0, sampleCount);

  const medianOf = (getValue: (frame: TopFrame) => number) =>
    median(topFrames.map(getValue));

  return {
    wristY: medianOf((frame) => frame.wristY),
    flare: medianOf((frame) => frame.flare),
    shoulderDistance: medianOf((frame) => frame.shoulderDistance),
    feetDistance: medianOf((frame) => frame.feetDistance),
    kneeDistance: medianOf((frame) => frame.kneeDistance),
    kneeFlare: medianOf((frame) => frame.kneeFlare),
    kneeAngle,
  };
}

interface MeasurementProps {
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
