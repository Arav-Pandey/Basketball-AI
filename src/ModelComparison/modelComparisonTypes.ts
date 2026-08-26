export interface ComparisonKeypoint {
  name: string;
  x: number | null;
  y: number | null;
  visibility: number | null;
  confidence: number | null;
}

export type ManualRating =
  | "Good"
  | "Partially correct"
  | "Poor"
  | "Unclear";

export interface ExtractedFrame {
  frameNumber: number;
  timestamp: number;
  width: number;
  height: number;
  imageUrl: string;
}

export interface ComparedFrame extends ExtractedFrame {
  mediapipe: ComparisonKeypoint[] | null;
  yolo: ComparisonKeypoint[] | null;
  mediapipeError: string | null;
  yoloError: string | null;
}
