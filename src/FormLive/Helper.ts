export const getFlareFeedback = (
  elbowVisible: boolean,
  shoulderVisible: boolean,
  wristVisible: boolean,
  flareDistance: number | null,
  elbowAngle: number | null,
) => {
  if (
    !elbowVisible ||
    !shoulderVisible ||
    !wristVisible ||
    flareDistance === null ||
    elbowAngle === null
  )
    return "⚠️ Arms not fully visible. Unable to calculate elbow feedback.";
  if (flareDistance > 0.15) return "⚠️ Elbow too wide";
  if (flareDistance < 0.01) return "⚠️ Elbow is tucked inside too much";
  if (elbowAngle < 40) return "⚠️ Arm angle too tight";
  return "✅ Good elbow alignment";
};

export const getAnkleFeedback = (
  anklesVisible: boolean,
  shouldersVisible: boolean,
  ankleDistance: number | null,
  shoulderDistance: number | null,
) => {
  if (!anklesVisible) return "⚠️ Unable to detect ankles.";
  if (!shouldersVisible || shoulderDistance === null)
    return "⚠️ Unable to calculate shoulder distance.";
  if (ankleDistance === null) return "⚠️ Unable to calculate ankle distance.";
  if (ankleDistance < shoulderDistance - 0.05) return "⚠️ Feet too close";
  if (ankleDistance > shoulderDistance + 0.05) return "⚠️ Feet too far";
  return "✅ Good foot spacing";
};

export const getKneeFeedback = (
  kneesVisible: boolean,
  hipsVisible: boolean,
  hipDistance: number | null,
  kneeDistance: number | null,
) => {
  if (!kneesVisible) return "⚠️ Unable to detect knees.";
  if (!hipsVisible || !hipDistance)
    return "⚠️ Unable to calculate hip distance.";
  if (!kneeDistance) return "⚠️ Unable to calculate knee distance.";
  if (kneeDistance < hipDistance * 0.9) return "⚠️ Knees too close";
  if (kneeDistance > hipDistance) return "⚠️ Knees too far";
  return "✅ Good knee spacing";
};

export const getBendFeedback = (kneeAngle: number | null) => {
  if (!kneeAngle) return "⚠️ Unable to calculate knee bend.";
  if (kneeAngle < 90) return "⚠️ Knee bend too deep.";
  if (kneeAngle > 120) return "⚠️ Knee bend too shallow.";
  return "✅ Good knee bend.";
};
