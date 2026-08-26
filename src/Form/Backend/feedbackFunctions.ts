import {
  scoreBendAngle,
  scoreElbowFlare,
  scoreFeetDistance,
  scoreKneeDistance,
  scoreKneeFlare,
} from "./scoringFunctions";

export function getBendFeedback(angle: number) {
  const MIN = 128;
  const MAX = 138;
  const score = scoreBendAngle(angle);

  if (score === 100) return "Good bend! Keep it up!";

  const isSlight = score >= 65;
  if (angle < MIN)
    return `${isSlight ? "Slightly reduce" : "Reduce"} your knee bend (aim around 128–138°).`;

  if (angle > MAX)
    return `${isSlight ? "Slightly increase" : "Increase"} your knee bend (aim around 128–138°).`;

  return "Good bend! Keep it up!";
}

export function getFeetDistanceFeedback(
  feetDistance: number | null,
  shoulderDistance: number | null,
) {
  if (feetDistance === null) return "Unable to detect feet distance.";
  if (shoulderDistance === null) return "Unable to detect shoulder distance.";

  const score = scoreFeetDistance(feetDistance, shoulderDistance);
  if (score === 100) return "Good feet placement! Keep it up!";

  const isSlight = score >= 65;
  const MIN = shoulderDistance;
  const MAX = shoulderDistance * 1.3;

  if (feetDistance < MIN)
    return `${isSlight ? "Feet are slightly too close" : "Feet are way too close"} together. Try keeping your feet a little wider than your shoulder distance.`;

  if (feetDistance > MAX)
    return `Feet are ${isSlight ? "slightly " : "much "}too far apart. Try bringing your feet closer together, closer to shoulder-width apart.`;

  return "Good feet placement! Keep it up!";
}

export function getFlareFeedbackFromValues(
  flareDistance: number | null,
  shoulderDistance: number | null,
) {
  if (flareDistance === null)
    return "Arms not fully visible. Unable to calculate elbow flare.";
  if (shoulderDistance === null) return "Unable to detect shoulder distance.";

  const score = scoreElbowFlare(flareDistance, shoulderDistance);
  if (score === 100) return "Good elbow alignment! Keep it up!";

  if (score < 65)
    return "Elbow is flaring off of the shooting shoulder too much. Try to keep your shooting elbow directly under the ball.";

  return "Elbow is slightly flaring off the shooting shoulder. Consider keeping your elbow directly under the ball.";
}

export function getKneeFlareFeedback(kneeFlare: number | null) {
  if (kneeFlare === null)
    return "Knees or hips not fully visible. Unable to calculate knee flare feedback.";

  const score = scoreKneeFlare(kneeFlare);
  if (score === 100) return "Good knee alignment! Keep it up!";

  if (score < 65)
    return "Knees are flaring outward too much. Try keeping your knees more in line with your hips and toes.";

  return "Knees are slightly flaring outward. Consider keeping them more aligned during your shot.";
}

export function getKneeDirectionFeedback(
  dominantHand: "right" | "left" | null,
  kneeDirection: "right" | "left" | "forward" | null,
) {
  if (dominantHand === null) return "Dominant Hand not selected.";
  if (kneeDirection === null)
    return "Knee Direction was not able to be calculated.";

  const isRightHand = dominantHand === "right";
  const correctKnee = isRightHand ? "left" : "right";
  const targetClock = isRightHand ? "10-12" : "12-2";

  if (kneeDirection === correctKnee)
    return `Overall Knee Direction is good! Make sure your knees are pointing at ${targetClock} o'clock.`;

  return `Knee is not facing in the right direction. Since you are a ${dominantHand} handed shooter, keep your knees facing at ${targetClock} o'clock`;
}

export function getKneeDistanceFeedback(
  kneeDistance: number | null,
  hipDistance: number | null,
) {
  if (kneeDistance === null)
    return "Knee distance was unable to be calculated.";
  if (hipDistance === null || hipDistance <= 0)
    return "Hip distance was unable to be calculated.";

  const score = scoreKneeDistance(kneeDistance, hipDistance);
  if (score === 100) return "Good knee distance! Keep it up!";

  const MIN = hipDistance * 0.9;
  const MAX = hipDistance;
  const isSlight = score !== null && score >= 65;

  if (kneeDistance < MIN)
    return `Knees are ${isSlight ? "slightly too close" : "too close"} together. Try keeping them just a little closer than your hip width.`;

  if (kneeDistance > MAX)
    return `Knee distance is ${isSlight ? "slightly too wide" : "too wide"}. Try keeping your knees just a little closer than your hip width.`;

  return "Good knee distance! Keep it up!";
}

export function getSimilarityFeedback(similarity: number) {
  const same = `You have ${similarity}% resemblance to Stephen Curry's shot.`;
  if (similarity >= 90) return `Amazing! ${same}`;
  if (similarity >= 75) return `Great! ${same}`;
  if (similarity >= 60) return `Good! ${same}`;
  if (similarity >= 40)
    return `Not quite similar to Stephen Curry's shot. ${same}`;
  return `Not at all similar to Stephen Curry's form yet. ${same}`;
}
