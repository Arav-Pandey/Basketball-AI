import { COCO_KEYPOINT_NAMES } from "../yolo26Pose";
import type {
  ComparisonKeypoint,
  ComparedFrame,
  ManualRating,
} from "./modelComparisonTypes";

export const LOW_VISIBILITY_THRESHOLD = 0.3;
export const LOW_CONFIDENCE_THRESHOLD = 0.3;

export const KEYPOINT_CONNECTIONS: Array<[number, number]> = [
  [5, 6],
  [5, 7],
  [7, 9],
  [6, 8],
  [8, 10],
  [5, 11],
  [6, 12],
  [11, 12],
  [11, 13],
  [13, 15],
  [12, 14],
  [14, 16],
  [0, 1],
  [0, 2],
  [1, 3],
  [2, 4],
];

export const MANUAL_RATINGS: ManualRating[] = [
  "Good",
  "Partially correct",
  "Poor",
  "Unclear",
];

export function formatTimestamp(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds - minutes * 60;
  return `${minutes}:${remainingSeconds.toFixed(1).padStart(4, "0")}`;
}

export function formatCoordinate(value: number | null): string {
  return value === null || !Number.isFinite(value) ? "—" : value.toFixed(1);
}

export function formatQuality(value: number | null): string {
  return value === null || !Number.isFinite(value)
    ? "—"
    : `${(value * 100).toFixed(1)}%`;
}

function getPoint(
  keypoints: ComparisonKeypoint[] | null,
  name: string,
): ComparisonKeypoint | null {
  return keypoints?.find((keypoint) => keypoint.name === name) ?? null;
}

export function calculateJointAngle(
  keypoints: ComparisonKeypoint[] | null,
  firstName: string,
  centerName: string,
  lastName: string,
): number | null {
  const first = getPoint(keypoints, firstName);
  const center = getPoint(keypoints, centerName);
  const last = getPoint(keypoints, lastName);
  if (
    first?.x === null ||
    first?.y === null ||
    center?.x === null ||
    center?.y === null ||
    last?.x === null ||
    last?.y === null ||
    !first ||
    !center ||
    !last
  ) {
    return null;
  }
  if (
    !Number.isFinite(first.x) ||
    !Number.isFinite(first.y) ||
    !Number.isFinite(center.x) ||
    !Number.isFinite(center.y) ||
    !Number.isFinite(last.x) ||
    !Number.isFinite(last.y)
  ) {
    return null;
  }

  const firstVector = { x: first.x - center.x, y: first.y - center.y };
  const lastVector = { x: last.x - center.x, y: last.y - center.y };
  const firstLength = Math.hypot(firstVector.x, firstVector.y);
  const lastLength = Math.hypot(lastVector.x, lastVector.y);
  if (firstLength === 0 || lastLength === 0) return null;

  const cosine =
    (firstVector.x * lastVector.x + firstVector.y * lastVector.y) /
    (firstLength * lastLength);
  if (!Number.isFinite(cosine)) return null;
  return (Math.acos(Math.max(-1, Math.min(1, cosine))) * 180) / Math.PI;
}

export function jointAngles(keypoints: ComparisonKeypoint[] | null) {
  return [
    {
      name: "Left elbow",
      angle: calculateJointAngle(
        keypoints,
        "Left shoulder",
        "Left elbow",
        "Left wrist",
      ),
    },
    {
      name: "Right elbow",
      angle: calculateJointAngle(
        keypoints,
        "Right shoulder",
        "Right elbow",
        "Right wrist",
      ),
    },
    {
      name: "Left knee",
      angle: calculateJointAngle(
        keypoints,
        "Left hip",
        "Left knee",
        "Left ankle",
      ),
    },
    {
      name: "Right knee",
      angle: calculateJointAngle(
        keypoints,
        "Right hip",
        "Right knee",
        "Right ankle",
      ),
    },
  ];
}

function escapeCsv(value: string | number | null): string {
  if (value === null) return "";
  const text = String(value);
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

export function createComparisonCsv(
  frames: ComparedFrame[],
  ratings: Record<number, { mediapipe?: ManualRating; yolo?: ManualRating }>,
): string {
  const header = [
    "Frame Number",
    "Timestamp (seconds)",
    "Model",
    "Keypoint",
    "X (pixels)",
    "Y (pixels)",
    "Visibility",
    "Confidence",
    "Left elbow (degrees)",
    "Right elbow (degrees)",
    "Left knee (degrees)",
    "Right knee (degrees)",
    "Manual evaluation",
  ];
  const rows: Array<Array<string | number | null>> = [header];

  for (const frame of frames) {
    for (const model of ["mediapipe", "yolo"] as const) {
      const keypoints = frame[model];
      const angles = jointAngles(keypoints).map(({ angle }) => angle);
      for (const name of COCO_KEYPOINT_NAMES) {
        const keypoint = getPoint(keypoints, name);
        rows.push([
          frame.frameNumber,
          frame.timestamp.toFixed(3),
          model === "mediapipe" ? "MediaPipe" : "YOLO26s-Pose",
          name,
          keypoint?.x ?? null,
          keypoint?.y ?? null,
          keypoint?.visibility ?? null,
          keypoint?.confidence ?? null,
          ...angles,
          ratings[frame.frameNumber]?.[model] ?? null,
        ]);
      }
    }
  }

  return rows.map((row) => row.map(escapeCsv).join(",")).join("\r\n");
}
