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
    details,
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

  if (best.shoulderDistance > 0) {
    setFlareScore(scoreElbowFlare(best.flare, best.shoulderDistance));
    setFlareFeedback(
      getFlareFeedbackFromValues(
        best.flare,
        best.shoulderDistance,
        details,
      ),
    );
  }
  if (Number.isFinite(averagedLowestKnee)) {
    setBendScore(scoreBendAngle(averagedLowestKnee));
    setBendFeedback(getBendFeedback(averagedLowestKnee, details));
  } else {
    setBendFeedback("⚠️ Unable to detect knee bend.");
  }
  if (best.feetDistance !== 0 && best.shoulderDistance) {
    setFeetDistanceScore(
      scoreFeetDistance(best.feetDistance, best.shoulderDistance),
    );
    setFeetFeedback(
      getFeetDistanceFeedback(
        best.feetDistance,
        best.shoulderDistance,
        details,
      ),
    );
  }
  if (best.kneeDistance !== 0 && best.feetDistance) {
    setKneeDistanceScore(scoreKneeDistance(best.kneeDistance, best.feetDistance));
    setKneeFeedback(
      getKneeDistanceFeedback(best.kneeDistance, best.feetDistance, details),
    );
  }
  setKneeFlareScore(scoreKneeFlare(best.kneeFlare));

  if (best.flare !== 0 && best.wristY !== 0) {
    similarityRef.current = getSimilarity(best, curryBaseline);
    setSimilarityFeedback(getSimilarityFeedback(similarityRef.current));
  } else {
    similarityRef.current = null;
  }
}
