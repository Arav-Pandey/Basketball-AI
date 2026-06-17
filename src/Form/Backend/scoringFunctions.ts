export function scoreElbowFlare(
  flareDistance: number,
  shoulderDistance: number,
): number {
  const WARN = shoulderDistance * 0.18;
  const MAX = shoulderDistance * 0.32;

  if (flareDistance <= WARN) return 100;
  if (flareDistance >= MAX) return 0;

  const score = 100 * (1 - (flareDistance - WARN) / (MAX - WARN));
  return Math.max(0, Math.min(100, Math.round(score)));
}

export function scoreKneeFlare(kneeFlare: number): number {
  const ideal = 0; // perfectly aligned knee over hip
  const maxError = 0.3; // matches MAX in getKneeFlareFeedback (was 1.5)

  const error = Math.abs(kneeFlare - ideal);
  const score = 100 * (1 - error / maxError);

  return Math.max(0, Math.min(100, Math.round(score)));
}

export function scoreBendAngle(angle: number): number {
  const idealMin = 125;
  const idealMax = 140;

  // Perfect zone: no error
  if (angle >= idealMin && angle <= idealMax) return 100;

  // Distance outside the ideal window
  const error = angle < idealMin ? idealMin - angle : angle - idealMax;

  const maxError = 45; // beyond this, score bottoms out at 40
  const minScore = 40;

  const decay = (100 - minScore) * (error / maxError);
  const score = 100 - decay;

  return Math.max(minScore, Math.min(100, Math.round(score)));
}

export function scoreKneeDistance(
  kneeDistance: number,
  feetDistance: number | null,
): number | null {
  if (feetDistance === null) return null;

  const ratio = kneeDistance / feetDistance;

  const idealMin = 0.95;
  const idealMax = 1.05;

  if (ratio >= idealMin && ratio <= idealMax) return 100;

  const error = ratio < idealMin ? idealMin - ratio : ratio - idealMax;

  const maxError = 0.3;
  const minScore = 40;

  const decay = (100 - minScore) * (error / maxError);
  const score = 100 - decay;

  return Math.max(minScore, Math.min(100, Math.round(score)));
}

export function scoreFeetDistance(
  feetDistance: number,
  shoulderDistance: number,
): number {
  const ratio = feetDistance / shoulderDistance;

  const idealMin = 0.95;
  const idealMax = 1.4;

  if (ratio >= idealMin && ratio <= idealMax) return 100;

  const error = ratio < idealMin ? idealMin - ratio : ratio - idealMax;

  const maxError = 0.3;
  const minScore = 40;

  const decay = (100 - minScore) * (error / maxError);
  const score = 100 - decay;

  return Math.max(minScore, Math.min(100, Math.round(score)));
}
