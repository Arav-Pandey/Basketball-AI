import {
  scoreBendAngle,
  scoreElbowFlare,
  scoreFeetDistance,
  scoreKneeDistance,
  scoreKneeFlare,
} from "./scoringFunctions";

export function getBendFeedback(angle: number, details: boolean) {
  const MIN = 128;
  const MAX = 138;
  const score = scoreBendAngle(angle);

  if (score === 100)
    return !details
      ? "Good bend! Keep it up!"
      : "Good bend! Keep aiming for 128–138°.";

  const isSlight = score >= 65;
  if (angle < MIN)
    return !details
      ? `${isSlight ? "Slightly reduce" : "Reduce"} your knee bend (aim around 128–138°).`
      : `${isSlight ? "Slightly decrease" : "Decrease"} your bend by ${(MIN - angle).toFixed(1)}° (aim around 128–138°).`;

  if (angle > MAX)
    return !details
      ? `${isSlight ? "Slightly increase" : "Increase"} your knee bend (aim around 128–138°).`
      : `${isSlight ? "Slightly increase" : "Increase"} your bend by ${(angle - MAX).toFixed(1)}° (aim around 128–138°).`;

  return !details
    ? "Good bend! Keep it up!"
    : "Good bend! Keep aiming for 128–138°.";
}

export function getFeetDistanceFeedback(
  feetDistance: number | null,
  shoulderDistance: number | null,
  details: boolean,
) {
  if (feetDistance === null) return "Unable to detect feet distance.";
  if (shoulderDistance === null) return "Unable to detect shoulder distance.";

  const score = scoreFeetDistance(feetDistance, shoulderDistance);
  if (score === 100)
    return !details
      ? "Good feet placement! Keep it up!"
      : "Good feet placement! Keep your feet 1.0–1.3 times your shoulder width apart.";

  const isSlight = score >= 65;
  const MIN = shoulderDistance;
  const MAX = shoulderDistance * 1.3;

  const percentDiff =
    ((feetDistance - shoulderDistance) / shoulderDistance) * 100;
  const percentAbs = Math.abs(percentDiff).toFixed(1);
  const direction = percentDiff >= 0 ? "wider" : "closer";

  if (feetDistance < MIN)
    return !details
      ? `${isSlight ? "Feet are slightly too close" : "Feet are much too close"} together. Try keeping your feet a little wider than your shoulder distance.`
      : `Feet are ${isSlight ? "slightly " : "much "}too close together (${percentAbs}% ${direction} than your shoulder width). Try keeping your feet a little wider than your shoulder distance.`;

  if (feetDistance > MAX)
    return !details
      ? `Feet are ${isSlight ? "slightly " : "much "}too far apart. Try bringing your feet closer together, closer to shoulder-width apart.`
      : `Feet are ${isSlight ? "slightly " : "much "}too far apart (${percentAbs}% ${direction} than your shoulder width). Try bringing your feet closer together, closer to shoulder-width apart.`;

  return !details
    ? "Good feet placement! Keep it up!"
    : `Good feet placement (${percentAbs}% ${direction} than your shoulder width)! Keep it up!`;
}

export function getFlareFeedbackFromValues(
  flareDistance: number | null,
  shoulderDistance: number | null,
  details: boolean,
) {
  if (flareDistance === null)
    return "Arms not fully visible. Unable to calculate elbow flare.";
  if (shoulderDistance === null) return "Unable to detect shoulder distance.";

  const score = scoreElbowFlare(flareDistance, shoulderDistance);
  if (score === 100)
    return !details
      ? "Good elbow alignment! Keep it up!"
      : "Good elbow alignment! Keep your elbow underneath the ball.";

  const percentDiff = Math.abs(
    (flareDistance / shoulderDistance) * 100,
  ).toFixed(1);

  if (score < 65)
    return !details
      ? "Elbow is flaring off of the shooting shoulder too much. Try to keep your shooting elbow directly under the ball."
      : `Elbow is flaring off the shooting shoulder too much (${percentDiff}% of shoulder width). Try keeping your elbow directly under the ball.`;

  return !details
    ? "Elbow is slightly flaring off the shooting shoulder. Consider keeping your elbow directly under the ball."
    : `Elbow is slightly flaring off the shooting shoulder (${percentDiff}% of the shoulder width). Consider keeping your elbow directly under the ball.`;
}

export function getKneeFlareFeedback(
  kneeFlare: number | null,
  details: boolean,
  hipDistance: number | null,
) {
  if (kneeFlare === null)
    return "Knees or hips not fully visible. Unable to calculate knee flare feedback.";

  const score = scoreKneeFlare(kneeFlare);
  if (score === 100)
    return !details
      ? "Good knee alignment! Keep it up!"
      : "Good knee alignment! Keep your knees aligned with your hips and toes.";

  const percentDiff = hipDistance
    ? ((kneeFlare / hipDistance) * 100).toFixed(1)
    : null;

  if (score < 65)
    return !details
      ? "Knees are flaring outward too much. Try keeping your knees more in line with your hips and toes."
      : `Knees are flaring outward too much (${percentDiff}% of hip width). Try keeping your knees more in line with your hips and toes.`;

  return !details
    ? "Knees are slightly flaring outward. Consider keeping them more aligned during your shot."
    : `Knees are slightly flaring outward (${percentDiff}% of hip width). Consider keeping them more aligned during your shot.`;
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
  feetDistance: number | null,
  details: boolean,
) {
  if (kneeDistance === null)
    return "Knee distance was unable to be calculated.";
  if (feetDistance === null)
    return "Feet distance was unable to be calculated.";

  const score = scoreKneeDistance(kneeDistance, feetDistance);
  if (score === 100)
    return !details
      ? "Good knee distance! Keep it up!"
      : "Good knee distance! Keep your knees aligned over your feet.";

  const MIN = feetDistance * 0.95;
  const MAX = feetDistance * 1.05;
  const isSlight = score !== null && score >= 65;

  const percentDiff = ((kneeDistance - feetDistance) / feetDistance) * 100;
  const percentAbs = Math.abs(percentDiff).toFixed(1);
  const direction = percentDiff >= 0 ? "wider" : " closer";

  if (kneeDistance < MIN)
    return !details
      ? `Knees are ${isSlight ? "slightly caved inward" : "too caved inward"}. Try keeping them aligned over your feet.`
      : `Knees are ${isSlight ? "slightly caved inward" : "too caved inward"} (${percentAbs}% ${direction} than your feet distance). Try keeping them aligned over your feet.`;

  if (kneeDistance > MAX)
    return !details
      ? `Knee distance is ${isSlight ? "slightly too wide" : "too wide"}. Try keeping them aligned over your feet.`
      : `Knee distance is ${isSlight ? "slightly too wide" : "too wide"} (${percentAbs}% ${direction} than your feet distance). Try keeping them aligned over your feet.`;

  return !details
    ? "Good knee distance! Keep it up!"
    : "Good knee distance! Keep your knees aligned over your feet.";
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
