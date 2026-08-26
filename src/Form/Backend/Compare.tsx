import { X } from "lucide-react";
import type { prevMeasurements } from "../types";

type CompareOverlayProps = CompareProps & {
  onClose: () => void;
};

interface CompareProps {
  prevMeasurements: prevMeasurements;
  ankleDistanceScore: number | null;
  kneeDistanceScore: number | null;
  flareScore: number | null;
  kneeFlareScore: number | null;
  kneeBendScore: number | null;
}

export default function Compare({
  prevMeasurements,
  ankleDistanceScore,
  kneeDistanceScore,
  flareScore,
  kneeFlareScore,
  kneeBendScore,
  onClose,
}: CompareOverlayProps) {
  const measurements = [
    {
      name: "Ankle Distance",
      previous: prevMeasurements.ankleDistanceScore,
      current: ankleDistanceScore,
    },
    {
      name: "Elbow Flare",
      previous: prevMeasurements.flareScore,
      current: flareScore,
    },
    {
      name: "Knee Bend",
      previous: prevMeasurements.kneeBendScore,
      current: kneeBendScore,
    },
    {
      name: "Knee Distance",
      previous: prevMeasurements.kneeDistanceScore,
      current: kneeDistanceScore,
    },
    {
      name: "Knee Flare",
      previous: prevMeasurements.kneeFlareScore,
      current: kneeFlareScore,
    },
  ];

  const formatScore = (score: number | null) => {
    return score !== null ? score.toFixed(0) : "—";
  };

  const getChange = (previous: number | null, current: number | null) => {
    if (previous === null || current === null) return null;
    return current - previous;
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/85 px-3 py-6 text-center backdrop-blur-sm sm:px-6 sm:py-10 lg:px-10"
      role="dialog"
      aria-modal="true"
      aria-labelledby="comparison-heading"
    >
      <div className="relative mx-auto flex min-h-full max-w-5xl flex-col items-center justify-center p-3 text-white sm:p-4 lg:p-6">
        <div className="w-full max-w-5xl">
          <div className="mb-8 flex items-center justify-between gap-4">
            <h1
              id="comparison-heading"
              className="text-3xl font-bold sm:text-4xl"
            >
              Shot Comparison
            </h1>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close comparison"
              className="inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-white/20 bg-zinc-900 text-zinc-100 transition hover:bg-zinc-800 hover:text-white"
            >
              <X size={20} />
            </button>
          </div>

          <div className="overflow-hidden rounded-2xl border border-orange-500/25 bg-zinc-950/80 shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-zinc-900/80">
                  <th className="px-4 py-4 text-left text-sm font-bold uppercase tracking-wider text-orange-300 sm:px-6">
                    Measurement
                  </th>

                  <th className="px-4 py-4 text-center text-sm font-bold uppercase tracking-wider text-zinc-300 sm:px-6">
                    Previous
                  </th>

                  <th className="px-4 py-4 text-center text-sm font-bold uppercase tracking-wider text-orange-300 sm:px-6">
                    Current
                  </th>

                  <th className="px-4 py-4 text-center text-sm font-bold uppercase tracking-wider text-zinc-300 sm:px-6">
                    Change
                  </th>
                </tr>
              </thead>

              <tbody>
                {measurements.map((measurement, index) => {
                  const change = getChange(
                    measurement.previous,
                    measurement.current,
                  );

                  return (
                    <tr
                      key={measurement.name}
                      className={
                        index !== measurements.length - 1
                          ? "border-b border-white/10"
                          : ""
                      }
                    >
                      <td className="px-4 py-5 text-left text-sm font-semibold text-white sm:px-6 sm:text-base">
                        {measurement.name}
                      </td>

                      <td className="px-4 py-5 text-center text-sm text-zinc-400 sm:px-6 sm:text-base">
                        {formatScore(measurement.previous)}
                      </td>

                      <td className="px-4 py-5 text-center text-sm font-bold text-orange-400 sm:px-6 sm:text-base">
                        {formatScore(measurement.current)}
                      </td>

                      <td className="px-4 py-5 text-center text-sm font-bold sm:px-6 sm:text-base">
                        {change === null ? (
                          <span className="text-zinc-500">—</span>
                        ) : (
                          <span
                            className={
                              change > 0
                                ? "text-green-400"
                                : change < 0
                                  ? "text-red-400"
                                  : "text-zinc-400"
                            }
                          >
                            {change > 0 ? "+" : ""}
                            {change.toFixed(0)}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="mt-4 rounded-xl border border-orange-500/15 bg-orange-500/5 px-4 py-3 text-left">
            <p className="text-sm leading-relaxed text-zinc-400">
              <span className="font-semibold text-orange-300">
                🏀 A quick note on the numbers:
              </span>{" "}
              Joint detection can vary slightly between shots due to camera
              angle, lighting, movement, and how the model identifies each body
              point. Small changes are normal, so focus on the overall trend
              rather than a single score.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
