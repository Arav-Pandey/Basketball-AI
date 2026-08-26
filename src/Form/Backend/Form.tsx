import { useEffect, useLayoutEffect, useRef, useState } from "react";
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
import type { prevMeasurements as PrevMeasurements } from "../types";
import {
  getStoredPreviousMeasurements,
  savePreviousMeasurements,
} from "../../utils/useLocalStorage";
import { usePoseDetection } from "../../utils/usePoseDetection";
import type { PoseModel } from "./detect";

interface Props {
  videoURL: string;
  setVideoURL: React.Dispatch<React.SetStateAction<string>>;
  model: PoseModel;
}

export default function Form({ videoURL, setVideoURL, model }: Props) {
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
  const [flareScore, setFlareScore] = useState<number | null>(null);
  const [kneeFlareScore, setKneeFlareScore] = useState<number | null>(null);
  const [bendScore, setBendScore] = useState<number | null>(null);
  const [feetDistanceScore, setFeetDistanceScore] = useState<number | null>(
    null,
  );
  const [kneeDistanceScore, setKneeDistanceScore] = useState<number | null>(
    null,
  );
  const [dominantHand, setDominantHand] = useState<"left" | "right" | null>(
    null,
  );
  const [kneeDirection, setKneeDirection] = useState<
    "right" | "left" | "forward" | null
  >(null);
  const [details, setDetails] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const detailsRef = useRef(details);

  useLayoutEffect(() => {
    detailsRef.current = details;
  }, [details]);

  const [prevMeasurements, setPrevMeasurements] = useState<PrevMeasurements>(
    getStoredPreviousMeasurements,
  );

  useEffect(() => {
    savePreviousMeasurements(prevMeasurements, setErrorFeedback);
  }, [prevMeasurements]);

  const updateFeedbackFromLatestMeasurements = () =>
    updateFeedbackFromLatestMeasurementsFn({
      details: detailsRef.current,
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

  const {
    latestMeasurementsRef,
    similarityRef,
    lowestKneeAngleRef,
    lastVideoTimeRef,
    topFramesRef,
    kneeFramesRef,
    restartAnalysisRef,
  } = usePoseDetection({
    videoURL,
    model,
    dominantHand,
    details: detailsRef.current,
    videoRef,
    canvasRef,
    setErrorFeedback,
    updateFeedbackFromLatestMeasurements: () =>
      updateFeedbackFromLatestMeasurementsFn({
        details: detailsRef.current,
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
      }),
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
    setBendFeedback,
    setSimilarityFeedback,
    setIsAnalyzing,
    setAnalysisProgress,
  });

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
    lastVideoTimeRef.current = -1;
    void restartAnalysisRef.current().catch((error: unknown) => {
      console.error("Failed to restart pose analysis.", error);
      setErrorFeedback("⚠️ Unable to restart video analysis.");
    });
  };

  const retake = () => {
    const measurements: PrevMeasurements = {
      ankleDistanceScore: feetDistanceScore,
      kneeDistanceScore,
      flareScore,
      kneeFlareScore,
      kneeBendScore: bendScore,
    };

    setPrevMeasurements(measurements);
    savePreviousMeasurements(measurements, setErrorFeedback);

    setVideoURL("");
  };

  const hasPreviousMeasurements = Object.values(prevMeasurements).some(
    (score) => score !== null,
  );

  return (
    <Display
      videoRef={videoRef}
      canvasRef={canvasRef}
      rewatchFeedback={rewatchFeedback}
      retake={retake}
      prevMeasurements={prevMeasurements}
      hasPreviousMeasurements={hasPreviousMeasurements}
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
      isAnalyzing={isAnalyzing}
      analysisProgress={analysisProgress}
    />
  );
}
