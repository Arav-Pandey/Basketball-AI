import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
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
import {
  isCareerSession,
  saveCareerSession,
} from "../../Career/careerSessions";
import type { CompletedAnalysis } from "../../Career/careerSessions";

interface Props {
  videoURL: string;
  setVideoURL: React.Dispatch<React.SetStateAction<string>>;
  analysisId: string;
}

export default function Form({
  videoURL,
  setVideoURL,
  analysisId,
}: Props) {
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
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const savingAnalysisIdsRef = useRef(new Set<string>());

  const onAnalysisComplete = useCallback(
    async ({ scores }: CompletedAnalysis) => {
      if (savingAnalysisIdsRef.current.has(analysisId)) return;
      savingAnalysisIdsRef.current.add(analysisId);

      try {
        const response = await fetch("/.netlify/functions/career-sessions", {
          method: "POST",
          credentials: "same-origin",
          cache: "no-store",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ analysisId, scores }),
          signal: AbortSignal.timeout(15_000),
        });
        const result: unknown = await response.json();

        if (
          !response.ok ||
          typeof result !== "object" ||
          result === null ||
          !("session" in result) ||
          !isCareerSession(result.session) ||
          !("profileCacheKey" in result) ||
          typeof result.profileCacheKey !== "string"
        ) {
          const message =
            typeof result === "object" &&
            result !== null &&
            "error" in result &&
            typeof result.error === "string"
              ? result.error
              : "Career history could not be saved.";
          throw new Error(message);
        }

        saveCareerSession(result.session, result.profileCacheKey);
      } catch (error) {
        console.error("Could not save career session to the user profile.", error);
        setErrorFeedback(
          "⚠️ Analysis finished, but career history could not be saved to your profile. Please check your connection and try again.",
        );
      } finally {
        savingAnalysisIdsRef.current.delete(analysisId);
      }
    },
    [analysisId],
  );

  const [prevMeasurements, setPrevMeasurements] = useState<PrevMeasurements>(
    getStoredPreviousMeasurements,
  );

  useEffect(() => {
    savePreviousMeasurements(prevMeasurements, setErrorFeedback);
  }, [prevMeasurements]);

  const updateFeedbackFromLatestMeasurements = () =>
    updateFeedbackFromLatestMeasurementsFn({
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
    dominantHand,
    videoRef,
    canvasRef,
    setErrorFeedback,
    updateFeedbackFromLatestMeasurements: () =>
      updateFeedbackFromLatestMeasurementsFn({
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
    onAnalysisComplete,
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
      isAnalyzing={isAnalyzing}
      analysisProgress={analysisProgress}
    />
  );
}
