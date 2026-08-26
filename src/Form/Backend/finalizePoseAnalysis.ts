import {
  averageLowestKneeAngles,
  averageTopFrames,
  getSimilarity,
} from "./calculations";
import {
  getBendFeedback,
  getFlareFeedbackFromValues,
  getFeetDistanceFeedback,
  getKneeDistanceFeedback,
  getSimilarityFeedback,
} from "./feedbackFunctions";
import {
  scoreBendAngle,
  scoreElbowFlare,
  scoreFeetDistance,
  scoreKneeDistance,
  scoreKneeFlare,
} from "./scoringFunctions";
import type { DetectProps } from "./detectTypes";

const curryBaseline = {
  flare: 0.02,
  kneeAngle: 146.72,
};
const topFrameCount = 5;
const kneeAngleAverageCount = 5;

export function finalizePoseAnalysis(props: DetectProps) {
  const {
    kneeFramesRef,
    topFramesRef,
    similarityRef,
    setErrorFeedback,
    setFlareScore,
    setFlareFeedback,
    setBendScore,
    setBendFeedback,
    setFeetDistanceScore,
    setFeetFeedback,
    setKneeDistanceScore,
    setKneeFeedback,
    setKneeFlareScore,
    setSimilarityFeedback,
  } = props;

  const averagedLowestKnee = averageLowestKneeAngles(
    kneeFramesRef.current,
    kneeAngleAverageCount,
  );
  const best = averageTopFrames(
    topFramesRef.current,
    averagedLowestKnee,
    topFrameCount,
  );

  if (!best) {
    similarityRef.current = null;
    setErrorFeedback("⚠️ Unable to detect enough pose landmarks for feedback.");
    return;
  }

  let flareScore: number | null = null;
  if (best.shoulderDistance > 0) {
    flareScore = scoreElbowFlare(best.flare, best.shoulderDistance);
    setFlareFeedback(
      getFlareFeedbackFromValues(
        best.flare,
        best.shoulderDistance,
      ),
    );
  }
  setFlareScore(flareScore);

  let bendScore: number | null = null;
  if (Number.isFinite(averagedLowestKnee)) {
    bendScore = scoreBendAngle(averagedLowestKnee);
    setBendFeedback(getBendFeedback(averagedLowestKnee));
  } else {
    setBendFeedback("⚠️ Unable to detect knee bend.");
  }
  setBendScore(bendScore);

  let feetDistanceScore: number | null = null;
  if (best.feetDistance !== 0 && best.shoulderDistance) {
    feetDistanceScore = scoreFeetDistance(
      best.feetDistance,
      best.shoulderDistance,
    );
    setFeetFeedback(
      getFeetDistanceFeedback(
        best.feetDistance,
        best.shoulderDistance,
      ),
    );
  }
  setFeetDistanceScore(feetDistanceScore);

  let kneeDistanceScore: number | null = null;
  if (best.kneeDistance !== 0 && best.hipDistance) {
    kneeDistanceScore = scoreKneeDistance(
      best.kneeDistance,
      best.hipDistance,
    );
    setKneeFeedback(
      getKneeDistanceFeedback(best.kneeDistance, best.hipDistance),
    );
  }
  setKneeDistanceScore(kneeDistanceScore);

  const kneeFlareScore = Number.isFinite(best.kneeFlare)
    ? scoreKneeFlare(best.kneeFlare)
    : null;
  setKneeFlareScore(kneeFlareScore);

  if (best.flare !== 0 && best.wristY !== 0) {
    similarityRef.current = getSimilarity(best, curryBaseline);
    setSimilarityFeedback(getSimilarityFeedback(similarityRef.current));
  } else {
    similarityRef.current = null;
  }

  props.onAnalysisComplete({
    scores: {
      flareScore,
      bendScore,
      feetDistanceScore,
      kneeDistanceScore,
      kneeFlareScore,
      similarityScore: similarityRef.current,
    },
  });
}
