import type { NormalizedLandmark } from "@mediapipe/tasks-vision";
import {
  YOLO_INPUT_HEIGHT,
  YOLO_INPUT_WIDTH,
  type PosePoint,
} from "../../yolo26Pose";
import type { PoseModel } from "./detectTypes";
import { minVisibility } from "./poseVisibility";

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

function getRenderedVideoRect(video: HTMLVideoElement) {
  const boxWidth = video.clientWidth;
  const boxHeight = video.clientHeight;
  const videoRatio = video.videoWidth / video.videoHeight;
  const boxRatio = boxWidth / boxHeight;

  if (videoRatio > boxRatio) {
    const width = boxWidth;
    const height = boxWidth / videoRatio;
    return {
      width,
      height,
      offsetX: 0,
      offsetY: (boxHeight - height) / 2,
    };
  }

  const height = boxHeight;
  const width = boxHeight * videoRatio;
  return {
    width,
    height,
    offsetX: (boxWidth - width) / 2,
    offsetY: 0,
  };
}

function normalizeYoloLandmarks(
  landmarks: Array<NormalizedLandmark | PosePoint>,
  video: HTMLVideoElement,
) {
  const modelScale = Math.min(
    YOLO_INPUT_WIDTH / video.videoWidth,
    YOLO_INPUT_HEIGHT / video.videoHeight,
  );
  const modelWidth = video.videoWidth * modelScale;
  const modelHeight = video.videoHeight * modelScale;
  const modelOffsetX = (YOLO_INPUT_WIDTH - modelWidth) / 2;
  const modelOffsetY = (YOLO_INPUT_HEIGHT - modelHeight) / 2;

  return landmarks.map((landmark) => ({
    ...landmark,
    x: (landmark.x * YOLO_INPUT_WIDTH - modelOffsetX) / modelWidth,
    y: (landmark.y * YOLO_INPUT_HEIGHT - modelOffsetY) / modelHeight,
  }));
}

export function drawPoseFrame(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  video: HTMLVideoElement,
  landmarks: Array<NormalizedLandmark | PosePoint> | null,
  model: PoseModel,
) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (!landmarks) return null;

  const normalizedLandmarks =
    model === "yolo26s" ? normalizeYoloLandmarks(landmarks, video) : landmarks;
  const { width, height, offsetX, offsetY } = getRenderedVideoRect(video);

  for (const [firstIndex, secondIndex] of poseConnections) {
    const first = normalizedLandmarks[firstIndex];
    const second = normalizedLandmarks[secondIndex];
    if (
      !first ||
      !second ||
      first.visibility < minVisibility ||
      second.visibility < minVisibility
    ) {
      continue;
    }

    ctx.beginPath();
    ctx.moveTo(offsetX + first.x * width, offsetY + first.y * height);
    ctx.lineTo(offsetX + second.x * width, offsetY + second.y * height);
    ctx.strokeStyle = "lime";
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  const visibleIndices = new Set([
    11, 12, 13, 14, 15, 16, 23, 24, 25, 26, 27, 28,
  ]);
  normalizedLandmarks.forEach((landmark, index) => {
    if (!visibleIndices.has(index)) return;
    ctx.beginPath();
    ctx.arc(
      offsetX + landmark.x * width,
      offsetY + landmark.y * height,
      5,
      0,
      2 * Math.PI,
    );
    ctx.fillStyle = "lime";
    ctx.fill();
  });

  return normalizedLandmarks;
}
