export function getBendFeedback(angle: number, details: boolean) {
  // Ideal range: 125–140° based on proficient shooters (~133° average)
  const MIN = 125;
  const MAX = 140;

  if (angle < MIN)
    return !details
      ? "Reduce your knee bend (aim around 125–140°)."
      : `Decrease your bend by ${(MIN - angle).toFixed(1)}° (aim around 125–140°).`;

  if (angle > MAX)
    return !details
      ? "Bend your knees more (aim around 125–140°)."
      : `Increase your bend by ${(angle - MAX).toFixed(1)}° (aim around 125–140°).`;

  return !details
    ? "Good bend! Keep it up!"
    : `Good bend! Keep aiming for 125-140°.`;
}

// FIXED: MIN/MAX now match scoreFeetDistance's 0.95x–1.4x shoulder-width band
// (previously 1.05x–1.5x, which disagreed with the score function).
export function getFeetDistanceFeedback(
  feetDistance: number | null,
  shoulderDistance: number | null,
  details: boolean,
) {
  if (feetDistance === null) return "Unable to detect feet distance.";
  if (shoulderDistance === null) return "Unable to detect shoulder distance.";

  const MIN = shoulderDistance * 0.95;
  const MAX = shoulderDistance * 1.4;

  const percentDiff =
    ((feetDistance - shoulderDistance) / shoulderDistance) * 100;
  const percentAbs = Math.abs(percentDiff).toFixed(1);
  const direction = percentDiff >= 0 ? "wider" : "closer";

  if (feetDistance < MIN)
    return !details
      ? "Feet are too close together. Try keeping your feet a little wider than your shoulder distance."
      : `Feet are too close together (${percentAbs}% ${direction} than your shoulder width). Try keeping your feet a little wider than your shoulder distance.`;

  if (feetDistance > MAX)
    return !details
      ? "Feet are too far apart. Try bringing your feet closer together, closer to shoulder-width apart."
      : `Feet are too far apart (${percentAbs}% ${direction} than your shoulder width). Try bringing your feet closer together, closer to shoulder-width apart.`;

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

  const WARN = shoulderDistance * 0.1; // Just to warn the user that the flare is starting to show
  const MAX = shoulderDistance * 0.22; // where it’s clearly problematic

  const percentDiff = Math.abs(
    ((flareDistance - shoulderDistance) / shoulderDistance) * 100,
  ).toFixed(1);

  if (flareDistance > MAX)
    return !details
      ? "Elbow is flaring off of the shooting shoulder too much. Try to keep your shooting elbow directly under the ball."
      : `Elbow is flaring off the shooting shoulder too much (${percentDiff}% of shoulder width). Try keeping your elbow directly under the ball.`;

  if (flareDistance > WARN)
    return !details
      ? "Elbow is slightly flaring off the shooting shoulder. Consider keeping your elbow directly under the ball."
      : `Elbow is slightly flaring off the shooting shoulder (${percentDiff}% of the shoulder width). Consider keeping your elbow directly under the ball.`;

  return !details
    ? "Good elbow alignment! Keep it up!"
    : `Good elbow alignment! Keep your elbow underneath the ball.`;
}

export function getKneeFlareFeedback(
  kneeFlare: number | null,
  details: boolean,
  hipDistance: number | null,
) {
  if (kneeFlare === null)
    return "Knees or hips not fully visible. Unable to calculate knee flare feedback.";

  const WARN = 0.18; // Slight knee flare
  const MAX = 0.3; // Clearly excessive knee flare

  const percentDiff = hipDistance
    ? ((kneeFlare / hipDistance) * 100).toFixed(1)
    : null;

  if (kneeFlare > MAX)
    return !details
      ? "Knees are flaring outward too much. Try keeping your knees more in line with your hips and toes."
      : `Knees are flaring outward too much (${percentDiff}% of hip width). Try keeping your knees more in line with your hips and toes.`;

  if (kneeFlare > WARN)
    return !details
      ? "Knees are slightly flaring outward. Consider keeping them more aligned during your shot."
      : `Knees are slightly flaring outward (${percentDiff}% of hip width). Consider keeping them more aligned during your shot.`;

  return !details
    ? "Good knee alignment! Keep it up!"
    : `Good knee alignment! Keep your knees aligned with your hips and toes.`;
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

  const MIN = feetDistance * 0.95;
  const MAX = feetDistance * 1.05;
  // Keep the feedback severity proportional to the score. These bounds map
  // to a score of roughly 65%, so above-average scores use gentler wording.
  const SLIGHTLY_NARROW = feetDistance * 0.775;
  const SLIGHTLY_WIDE = feetDistance * 1.225;

  const percentDiff = ((kneeDistance - feetDistance) / feetDistance) * 100;
  const percentAbs = Math.abs(percentDiff).toFixed(1);
  const direction = percentDiff >= 0 ? "wider" : " closer";

  if (kneeDistance < SLIGHTLY_NARROW)
    return !details
      ? "Knees too caved inward. Try keeping them aligned over your feet."
      : `Knees too caved inward (${percentAbs}% ${direction} than your feet distance). Try keeping them aligned over your feet.`;

  if (kneeDistance > SLIGHTLY_WIDE)
    return !details
      ? "Knee distance is too wide. Try keeping them aligned over your feet."
      : `Knee distance is too wide (${percentAbs}% ${direction} than your feet distance). Try keeping them aligned over your feet.`;

  if (kneeDistance < MIN)
    return !details
      ? "Knees are slightly caved inward. Try keeping them aligned over your feet."
      : `Knees are slightly caved inward (${percentAbs}% ${direction} than your feet distance). Try keeping them aligned over your feet.`;

  if (kneeDistance > MAX)
    return !details
      ? "Knee distance is slightly too wide. Try keeping them aligned over your feet."
      : `Knee distance is slightly too wide (${percentAbs}% ${direction} than your feet distance). Try keeping them aligned over your feet.`;

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
