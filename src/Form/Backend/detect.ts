import type { NormalizedLandmark } from "@mediapipe/tasks-vision";
import type { PosePoint } from "../../yolo26Pose";
import { YOLO_ANALYSIS_FPS, type DetectProps } from "./detectTypes";
import { drawPoseFrame } from "./drawPoseFrame";
import { finalizePoseAnalysis } from "./finalizePoseAnalysis";
import { updatePoseMeasurements } from "./updatePoseMeasurements";

export { YOLO_ANALYSIS_FPS } from "./detectTypes";
export type { DetectProps, PoseModel } from "./detectTypes";

export default async function detect(props: DetectProps): Promise<void> {
  const { videoRef, canvasRef, poseLandmarker, animationFrameIdRef } = props;
  const video = videoRef.current;
  const canvas = canvasRef.current;

  if (!video || !canvas || (props.model === "mediapipe" && !poseLandmarker)) {
    return;
  }

  const context = canvas.getContext("2d");
  if (!context) return;

  const scheduleNext = () => {
    animationFrameIdRef.current = requestAnimationFrame(() => {
      void detect(props);
    });
  };

  if (video.paused || video.ended) {
    if (video.ended) {
      cancelAnimationFrame(animationFrameIdRef.current);
      finalizePoseAnalysis(props);
      return;
    }

    scheduleNext();
    return;
  }

  const mediaTime = video.currentTime;
  const yoloFrameIndex = Math.floor(mediaTime * YOLO_ANALYSIS_FPS);
  const isRepeatedFrame =
    mediaTime <= props.lastVideoTimeRef.current ||
    (props.model === "yolo26s" &&
      yoloFrameIndex ===
        Math.floor(props.lastVideoTimeRef.current * YOLO_ANALYSIS_FPS));

  if (isRepeatedFrame) {
    scheduleNext();
    return;
  }

  props.lastVideoTimeRef.current = mediaTime;

  try {
    let landmarks: NormalizedLandmark[] | PosePoint[] | null;
    if (props.model === "mediapipe") {
      if (!poseLandmarker) {
        throw new Error("MediaPipe pose detector is unavailable.");
      }
      landmarks =
        poseLandmarker.detectForVideo(video, Math.round(mediaTime * 1000))
          .landmarks[0] ?? null;
    } else {
      const poses = props.yoloPoseCacheRef.current;
      if (poses.has(yoloFrameIndex)) {
        landmarks = poses.get(yoloFrameIndex) ?? null;
      } else if (poses.has(yoloFrameIndex - 1)) {
        landmarks = poses.get(yoloFrameIndex - 1) ?? null;
      } else {
        landmarks = poses.get(yoloFrameIndex + 1) ?? null;
      }
    }

    const normalizedLandmarks = drawPoseFrame(
      context,
      canvas,
      video,
      landmarks,
      props.model,
    );
    if (
      normalizedLandmarks &&
      !updatePoseMeasurements(props, normalizedLandmarks)
    ) {
      scheduleNext();
      return;
    }
  } catch (error) {
    console.error(`${props.model} pose detection failed:`, error);
    props.setErrorFeedback(
      props.model === "yolo26s"
        ? "⚠️ YOLO26s pose detection failed. Check your connection and try again."
        : "⚠️ MediaPipe pose detection failed.",
    );
    cancelAnimationFrame(animationFrameIdRef.current);
    return;
  }

  scheduleNext();
}
