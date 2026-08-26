import {
  FilesetResolver,
  PoseLandmarker,
  type NormalizedLandmark,
} from "@mediapipe/tasks-vision";
import {
  COCO_KEYPOINT_NAMES,
  detectYolo26PoseOnCanvas,
} from "../yolo26Pose";
import type { ComparisonKeypoint } from "./modelComparisonTypes";

const MEDIAPIPE_LANDMARK_INDICES = [
  0, 2, 5, 7, 8, 11, 12, 13, 14, 15, 16, 23, 24, 25, 26, 27, 28,
];
const MEDIAPIPE_WASM_URL =
  "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.32/wasm";
const MEDIAPIPE_MODEL_URL =
  "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_full/float16/latest/pose_landmarker_full.task";

let imageLandmarkerPromise: Promise<PoseLandmarker> | null = null;

export function getImagePoseLandmarker(): Promise<PoseLandmarker> {
  if (!imageLandmarkerPromise) {
    imageLandmarkerPromise = FilesetResolver.forVisionTasks(
      MEDIAPIPE_WASM_URL,
    )
      .then((vision) =>
        PoseLandmarker.createFromOptions(vision, {
          baseOptions: { modelAssetPath: MEDIAPIPE_MODEL_URL },
          runningMode: "IMAGE",
          numPoses: 1,
        }),
      )
      .catch((error: unknown) => {
        imageLandmarkerPromise = null;
        throw error;
      });
  }
  return imageLandmarkerPromise;
}

function mapMediaPipeLandmarks(
  landmarks: NormalizedLandmark[] | undefined,
  width: number,
  height: number,
): ComparisonKeypoint[] | null {
  if (!landmarks) return null;

  return COCO_KEYPOINT_NAMES.map((name, index) => {
    const landmark = landmarks[MEDIAPIPE_LANDMARK_INDICES[index]];
    if (!landmark) {
      return { name, x: null, y: null, visibility: null, confidence: null };
    }

    return {
      name,
      x: Number.isFinite(landmark.x) ? landmark.x * width : null,
      y: Number.isFinite(landmark.y) ? landmark.y * height : null,
      visibility: landmark.visibility ?? null,
      confidence: null,
    };
  });
}

export function detectMediaPipeCocoPose(
  landmarker: PoseLandmarker,
  canvas: HTMLCanvasElement,
): ComparisonKeypoint[] | null {
  const landmarks = landmarker.detect(canvas).landmarks[0];
  return mapMediaPipeLandmarks(landmarks, canvas.width, canvas.height);
}

export async function detectYoloCocoPose(
  canvas: HTMLCanvasElement,
): Promise<ComparisonKeypoint[] | null> {
  const keypoints = await detectYolo26PoseOnCanvas(canvas);
  if (!keypoints) return null;

  return keypoints.map(({ name, x, y, confidence }) => ({
    name,
    x,
    y,
    visibility: null,
    confidence,
  }));
}
