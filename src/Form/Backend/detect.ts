import type { PosePoint } from "../../yolo26Pose";
import { YOLO_ANALYSIS_FPS, type DetectProps } from "./detectTypes";
import { drawPoseFrame } from "./drawPoseFrame";
import { finalizePoseAnalysis } from "./finalizePoseAnalysis";
import { updatePoseMeasurements } from "./updatePoseMeasurements";

export { YOLO_ANALYSIS_FPS } from "./detectTypes";
export type { DetectProps } from "./detectTypes";

export default async function detect(props: DetectProps): Promise<void> {
  const { videoRef, canvasRef, animationFrameIdRef } = props;
  const video = videoRef.current;
  const canvas = canvasRef.current;

  if (!video || !canvas || props.analysisFinalizedRef.current) {
    return;
  }

  const context = canvas.getContext("2d");
  if (!context) return;

  const scheduleNext = () => {
    animationFrameIdRef.current = requestAnimationFrame(() => {
      void detect(props);
    });
  };

  if (video.paused && !video.ended) {
    scheduleNext();
    return;
  }

  const isFinalFrame = video.ended;
  const mediaTime = video.currentTime;
  const yoloFrameIndex = Math.floor(mediaTime * YOLO_ANALYSIS_FPS);
  const isRepeatedFrame =
    mediaTime <= props.lastVideoTimeRef.current ||
    (!isFinalFrame &&
      yoloFrameIndex ===
        Math.floor(props.lastVideoTimeRef.current * YOLO_ANALYSIS_FPS));

  if (isRepeatedFrame) {
    if (isFinalFrame) {
      props.analysisFinalizedRef.current = true;
      cancelAnimationFrame(animationFrameIdRef.current);
      finalizePoseAnalysis(props);
      return;
    }
    scheduleNext();
    return;
  }

  props.lastVideoTimeRef.current = mediaTime;

  try {
    let landmarks: PosePoint[] | null;
    const poses = props.yoloPoseCacheRef.current;
    if (poses.has(yoloFrameIndex)) {
      landmarks = poses.get(yoloFrameIndex) ?? null;
    } else if (poses.has(yoloFrameIndex - 1)) {
      landmarks = poses.get(yoloFrameIndex - 1) ?? null;
    } else {
      landmarks = poses.get(yoloFrameIndex + 1) ?? null;
    }

    const normalizedLandmarks = drawPoseFrame(context, canvas, video, landmarks);
    if (
      normalizedLandmarks &&
      !updatePoseMeasurements(props, normalizedLandmarks)
    ) {
      if (isFinalFrame) {
        props.analysisFinalizedRef.current = true;
        cancelAnimationFrame(animationFrameIdRef.current);
        finalizePoseAnalysis(props);
        return;
      }
      scheduleNext();
      return;
    }
    if (isFinalFrame) {
      props.analysisFinalizedRef.current = true;
      cancelAnimationFrame(animationFrameIdRef.current);
      finalizePoseAnalysis(props);
      return;
    }
  } catch (error) {
    console.error("YOLO26s pose detection failed:", error);
    props.setErrorFeedback(
      "⚠️ YOLO26s pose detection failed. Check your connection and try again.",
    );
    cancelAnimationFrame(animationFrameIdRef.current);
    return;
  }

  scheduleNext();
}
