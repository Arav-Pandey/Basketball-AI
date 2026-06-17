import { useEffect, useRef, useState } from "react";
import { PoseLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";
import Display from "../Frontend/Display";
import {
  emptyMeasurements,
  updateFeedbackFromLatestMeasurements as updateFeedbackFromLatestMeasurementsFn,
} from "./calculations";
import NoVid from "../Frontend/NoVid";
import {
  getBendFeedback,
  getFeetDistanceFeedback,
  getFlareFeedbackFromValues,
  getKneeDirectionFeedback,
  getKneeDistanceFeedback,
  getKneeFlareFeedback,
} from "./feedbackFunctions";
import detect from "./detect";
import type { DetectProps, Measurements, TopFrame } from "../interfaces";

interface Props {
  videoURL: string;
  setVideoURL: React.Dispatch<React.SetStateAction<string>>;
}

export default function Form({ videoURL, setVideoURL }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [feetFeedback, setFeetFeedback] = useState<string | null>(null);
  const [flareFeedback, setFlareFeedback] = useState<string | null>(null);
  const [bendFeedback, setBendFeedback] = useState<string | null>(null);
  const [kneeFeedback, setKneeFeedback] = useState<string | null>(null);
  const [kneeFlareFeedback, setKneeFlareFeedback] = useState<string | null>(
    null,
  );
  const [kneeDirectionFeedback, setKneeDirectionFeedback] = useState<
    string | null
  >(null);
  const [similarityFeedback, setSimilarityFeedback] = useState<string | null>(
    null,
  );
  const [errorFeedback, setErrorFeedback] = useState<string | null>(null);
  const startDetectingRef = useRef<() => void>(() => {});
  const [flareScore, setFlareScore] = useState<number | null>(null);
  const [kneeFlareScore, setKneeFlareScore] = useState<number | null>(null);
  const [bendScore, setBendScore] = useState<number | null>(null);
  const [feetDistanceScore, setFeetDistanceScore] = useState<number | null>(
    null,
  );
  const [kneeDistanceScore, setKneeDistanceScore] = useState<number | null>(
    null,
  );
  const topFramesRef = useRef<TopFrame[]>([]);
  const kneeFramesRef = useRef<number[]>([]);
  const latestMeasurementsRef = useRef<Measurements>(emptyMeasurements());
  const similarityRef = useRef<number | null>(null);
  const lowestKneeAngleRef = useRef<number>(Infinity);
  const animationFrameIdRef = useRef<number>(0);
  const [dominantHand, setDominantHand] = useState<"left" | "right" | null>(
    null,
  );
  const [kneeDirection, setKneeDirection] = useState<
    "right" | "left" | "forward" | null
  >(null);
  const [details, setDetails] = useState(false);

  const updateFeedbackFromLatestMeasurements = () =>
    updateFeedbackFromLatestMeasurementsFn({
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
    });

  useEffect(() => {
    updateFeedbackFromLatestMeasurements();
  }, [dominantHand, kneeDirection]);

  useEffect(() => {
    if (!videoURL || dominantHand === null) return;

    let poseLandmarker: PoseLandmarker;

    async function init() {
      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.32/wasm",
      );

      poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath:
            "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_full/float16/latest/pose_landmarker_full.task",
        },
        runningMode: "VIDEO",
        numPoses: 1,
      });

      setupVideo();
    }

    function buildDetectProps(): DetectProps {
      return {
        videoRef,
        canvasRef,
        poseLandmarker,
        animationFrameIdRef,
        latestMeasurementsRef,
        kneeFramesRef,
        topFramesRef,
        lowestKneeAngleRef,
        similarityRef,
        dominantHand,
        details,
        setFlareScore,
        setFlareFeedback,
        setFeetDistanceScore,
        setFeetFeedback,
        setKneeDistanceScore,
        setKneeFeedback,
        setKneeFlareScore,
        setKneeFlareFeedback,
        setKneeDirection,
        setBendScore,
        setSimilarityFeedback,
        setErrorFeedback,
        updateFeedbackFromLatestMeasurements,
      };
    }

    function setupVideo() {
      if (!videoRef.current) return;

      videoRef.current.src = videoURL;
      videoRef.current.crossOrigin = "anonymous";

      videoRef.current.onloadedmetadata = () => {
        const video = videoRef.current!;
        const canvas = canvasRef.current!;

        topFramesRef.current = [];
        latestMeasurementsRef.current = emptyMeasurements();
        lowestKneeAngleRef.current = Infinity;
        similarityRef.current = null;

        canvas.width = video.clientWidth;
        canvas.height = video.clientHeight;

        startDetectingRef.current = () => detect(buildDetectProps());

        video.play();
        video.onplaying = () => {
          startDetectingRef.current();
        };
      };
    }

    init();

    return () => cancelAnimationFrame(animationFrameIdRef.current);
  }, [videoURL, dominantHand, details]);

  if (!videoURL) return <NoVid setVideoURL={setVideoURL} />;

  const rewatchFeedback = () => {
    if (!videoRef.current) return;

    setFeetFeedback(null);
    setFlareFeedback(null);
    setBendFeedback(null);
    setKneeFeedback(null);
    setKneeFlareFeedback(null);
    setKneeDirectionFeedback(null);
    setErrorFeedback(null);
    setFlareScore(null);
    setKneeFlareScore(null);
    setBendScore(null);
    setFeetDistanceScore(null);
    setKneeDistanceScore(null);
    topFramesRef.current = [];
    kneeFramesRef.current = [];
    latestMeasurementsRef.current = emptyMeasurements();
    similarityRef.current = null;
    lowestKneeAngleRef.current = Infinity;

    setKneeDirection(null);

    videoRef.current.currentTime = 0;
    videoRef.current.play();

    startDetectingRef.current();
  };

  return (
    <Display
      videoRef={videoRef}
      canvasRef={canvasRef}
      rewatchFeedback={rewatchFeedback}
      feetFeedback={feetFeedback}
      flareFeedback={flareFeedback}
      bendFeedback={bendFeedback}
      similarityFeedback={similarityFeedback}
      errorFeedback={errorFeedback}
      flareScore={flareScore}
      kneeFlareScore={kneeFlareScore}
      bendScore={bendScore}
      feetDistanceScore={feetDistanceScore}
      kneeDistanceScore={kneeDistanceScore}
      similarity={similarityRef}
      setDominantHand={setDominantHand}
      kneeFeedback={kneeFeedback}
      kneeFlareFeedback={kneeFlareFeedback}
      kneeDirectionFeedback={kneeDirectionFeedback}
      setDetails={setDetails}
      details={details}
    />
  );
}
