import type { prevMeasurements as PrevMeasurements } from "../Form/types";

const PREVIOUS_MEASUREMENTS_STORAGE_KEY = "prevMeasurements";

const emptyPreviousMeasurements = (): PrevMeasurements => ({
  ankleDistanceScore: null,
  kneeDistanceScore: null,
  flareScore: null,
  kneeFlareScore: null,
  kneeBendScore: null,
});

const isScore = (value: unknown): value is number | null =>
  value === null || (typeof value === "number" && Number.isFinite(value));

export function getStoredPreviousMeasurements(): PrevMeasurements {
  if (typeof window === "undefined") return emptyPreviousMeasurements();

  try {
    const storedMeasurements: unknown = JSON.parse(
      window.localStorage.getItem(PREVIOUS_MEASUREMENTS_STORAGE_KEY) ?? "null",
    );

    if (
      typeof storedMeasurements !== "object" ||
      storedMeasurements === null ||
      !isScore(
        (storedMeasurements as Record<string, unknown>).ankleDistanceScore,
      ) ||
      !isScore(
        (storedMeasurements as Record<string, unknown>).kneeDistanceScore,
      ) ||
      !isScore((storedMeasurements as Record<string, unknown>).flareScore) ||
      !isScore(
        (storedMeasurements as Record<string, unknown>).kneeFlareScore,
      ) ||
      !isScore((storedMeasurements as Record<string, unknown>).kneeBendScore)
    ) {
      return emptyPreviousMeasurements();
    }

    return storedMeasurements as PrevMeasurements;
  } catch (error) {
    console.error("Failed to load previous measurements:", error);
    return emptyPreviousMeasurements();
  }
}

export function savePreviousMeasurements(
  measurements: PrevMeasurements,
  onError?: (message: string) => void,
) {
  try {
    window.localStorage.setItem(
      PREVIOUS_MEASUREMENTS_STORAGE_KEY,
      JSON.stringify(measurements),
    );
  } catch (error) {
    console.error(
      "Unable to save previous measurements to localStorage:",
      error,
    );
    onError?.(
      "Previous measurements could not be saved between sessions, but you can continue using the app.",
    );
  }
}
