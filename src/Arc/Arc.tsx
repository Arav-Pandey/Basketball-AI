/*
import { useEffect, useRef, useState } from "react";
import { connectors, webrtc } from "@roboflow/inference-sdk";
import Display from "./Display";

interface Props {
  videoUrl: string;
  videoFile: File | null;
}

export default function Arc({ videoUrl, videoFile }: Props) {
  const connectionRef = useRef<Awaited<
    // Awaited because webrtc.useVideoFile is an async function
    ReturnType<typeof webrtc.useVideoFile> // typeof means "Give me a type of this function" and ReturnType gets the return type of the function
  > | null>(null);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [frameCount, setFrameCount] = useState(0);
  const [currentFrame, setCurrentFrame] = useState<string | null>(null);
  const [highestBasketball, setHighestBasketball] = useState<number | null>(
    null,
  );
  const fileRef = useRef<File | null>(null);
  const [rimHeight, setRimHeight] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [arcScore, setArcScore] = useState<number | null>(null);
  const [ballPositions, setBallPositions] = useState<
    { x: number; y: number; frame: number }[]
  >([]);
  const [releaseIndex, setReleaseIndex] = useState<number | null>(null);
  const [launchAngle, setLaunchAngle] = useState<number | null>(null);
  const frameCountRef = useRef(0);

  const idealArcByPosition = {
    PG: { min: 8, max: 12 },
    SG: { min: 10, max: 14 },
    PF: { min: 7, max: 11 },
    C: { min: 5, max: 9 },
  };

  const positionRef = useRef<"SG" | "PG" | "PF" | "C">("SG");

  useEffect(() => {
    if (!videoUrl && !videoFile) return;

    async function startProcessing() {
      try {
        let file: File;
        
        // Prefer using the File object directly (better for iPad/Safari)
        if (videoFile) {
          file = videoFile;
        } else {
          // Fallback to fetching from URL
          const res = await fetch(videoUrl);
          if (!res.ok) {
            throw new Error(`Failed to fetch video: ${res.statusText}`);
          }
          const blob = await res.blob();
          file = new File([blob], "video.mp4", { type: blob.type || "video/mp4" });
        }

        fileRef.current = file;
        processFile(file);
      } catch (error) {
        console.error("Error loading video:", error);
        alert("Failed to load video. Please try recording again.");
      }
    }

    if (highestBasketball !== null && rimHeight !== null) {
      setFeedback(
        getArcFeedback(highestBasketball, rimHeight, positionRef.current),
      );
      setArcScore(scoreArc(highestBasketball, rimHeight, positionRef.current));
    }

    startProcessing();
  }, [videoUrl, videoFile]);

  function getArcFeedback(
    highestBasketball: number,
    rimHeight: number,
    position: "PG" | "SG" | "PF" | "C",
  ) {
    const arcHeight = highestBasketball - rimHeight;
    const target = idealArcByPosition[position];

    if (arcHeight >= target.min && arcHeight <= target.max) {
      return "The basketball has great arc for your position! Nice shot! 🏀";
    }

    if (arcHeight < target.min) {
      return "Your shot arc is a little low for your position. Try getting more lift and follow-through! 🏀";
    }

    return "Your arc is a bit too high. Try a smoother, more direct release. 🏀";
  }

  function scoreArc(
    highestBasketball: number,
    rimHeight: number,
    position: "PG" | "SG" | "PF" | "C",
  ): number {
    const arcHeight = highestBasketball - rimHeight;
    const target = idealArcByPosition[position];
    const idealMid = (target.min + target.max) / 2;

    const difference = Math.abs(arcHeight - idealMid);

    if (difference <= 1) return 100;
    if (difference <= 3) return 85;
    if (difference <= 5) return 70;
    return 50;
  }

  async function processFile(file: File) {
    setProcessing(true);
    setFrameCount(0);

    const connector = connectors.withProxyUrl("/.netlify/functions/roboflow"); // Sends AI requests to netlify backend instead of straight to roboflow

    const VIDEO_OUTPUT = "output_image";
    connectionRef.current = await webrtc.useVideoFile({
      // Processes video
      file, // File getting used
      connector, // Where to send requests through
      wrtcParams: {
        // Parameters for roboflow
        workspaceName: "basketball-znuvc",
        workflowId: "detect-count-and-visualize-7",
        streamOutputNames: [], // No special streaming outputs
        dataOutputNames: [VIDEO_OUTPUT, ...["predictions"]].filter(
          // VIDEO_OUTPUT gives the object boxes
          (v, i, a) => a.indexOf(v) === i, //  Predictions gets the actual objects and their coordinates. Removes duplicate values
        ),
        processingTimeout: 3600, // Maximum time the server has to process the video. (1 hour)
        requestedPlan: "webrtc-gpu-medium", // Options: webrtc-gpu-small, webrtc-gpu-medium, webrtc-gpu-large
        requestedRegion: "us", // Options: us, eu, ap
        realtimeProcessing: false, // Process the whole video file NOT a live stream
      },
      onData: (data) => {
        frameCountRef.current++;
        const viz = data.serialized_output_data?.[VIDEO_OUTPUT]; // Accesses the video frame annotations
        if (viz?.value) setCurrentFrame(`data:image/jpeg;base64,${viz.value}`); // Converts the JPEG image returned from the backend to a browser image source
        const preds = data.serialized_output_data?.predictions?.predictions; // Returns an object detected

        if (preds) {
          preds.forEach((p: any) => {
            if (p.class === "basketball") {
              setBallPositions((prev) => [
                ...prev,
                { x: p.x, y: p.y, frame: frameCount },
              ]);

              if (ballPositions.length > 3 && releaseIndex === null) {
                console.log("Checking for release...");
                const p1 = ballPositions[ballPositions.length - 2];
                const p2 = ballPositions[ballPositions.length - 1];

                const dy = p1.y - p2.y; // upward movement

                if (dy > 8) {
                  // threshold (tune this)
                  setReleaseIndex(ballPositions.length - 1);
                }
              }

              if (
                releaseIndex !== null &&
                ballPositions.length > releaseIndex + 3
              ) {
                const p1 = ballPositions[releaseIndex];
                const p2 = ballPositions[releaseIndex + 3];

                const dx = p2.x - p1.x;
                const dy = p1.y - p2.y;

                const angle = Math.atan2(dy, dx) * (180 / Math.PI);
                setLaunchAngle(angle);
              }

              if (p.y < (highestBasketball ?? Infinity)) {
                setHighestBasketball(p.y);
              }
            }
            if (p.class === "rim") {
              setRimHeight(p.y);
            }
          });
        }
      },
      onUploadProgress: (sent, total) =>
        setProgress(Math.round((sent / total) * 100)),
      onComplete: () => setProcessing(false),
    });
  }

  const rewatch = () => {
    if (!fileRef.current) return;

    setFrameCount(0);
    setCurrentFrame(null);
    setHighestBasketball(null);
    processFile(fileRef.current);
  };

  return (
    <Display
      positionRef={positionRef}
      currentFrame={currentFrame}
      rewatch={rewatch}
      processing={processing}
      progress={progress}
      frameCount={frameCount}
      highestBasketball={highestBasketball}
      rimHeight={rimHeight}
      feedback={feedback}
      launchAngle={launchAngle}
    />
  );
}
*/
