import { useEffect, useState } from "react";
import useGemini from "./utils/useGemini";

interface Props {
  contextList: string[];
  setContextList: React.Dispatch<React.SetStateAction<string[]>>;
}

export default function Feedback({ contextList, setContextList }: Props) {
  const { mutation } = useGemini();
  const [feedback, setFeedback] = useState({
    ankle: "Analyzing...",
    knees: "Analyzing...",
    arm: "Analyzing...",
    futureSteps: "Analyzing...",
  });
  const [gaveFeedback, setGaveFeedback] = useState(false);

  useEffect(() => {
    console.log("Inside of useEffect with this context:", contextList);
    if (!mutation) return;
    if (gaveFeedback) return;
    if (contextList.length === 0) return;

    mutation.mutate({
      text: "Give me feedback on my basketball shot based on the following context:",
      list: contextList,
    });

    setGaveFeedback(true);
  }, [contextList]);

  useEffect(() => {
    if (!mutation) return;

    if (mutation.status === "success" && mutation.data) {
      setFeedback(JSON.parse(mutation.data.resText));
      console.log("Gemini response:", mutation.data.resText);
      setContextList([]);
    }

    if (mutation.status === "error") {
      alert(
        "An error occurred while fetching Gemini feedback: " + mutation.error,
      );
    }
  }, [mutation?.status]);

  return (
    <div className="w-full px-4 sm:px-6 py-6 sm:py-8 text-white">
      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-6 sm:mb-8">
        Feedback
      </h1>

      <div className="overflow-x-auto rounded-lg border border-white/10">
        <table className="w-full border-collapse text-sm sm:text-base">
          <thead>
            <tr className="bg-orange-500/20 text-orange-200">
              <th className="border border-white/10 p-3 sm:p-4 text-left font-semibold">
                Ankle
              </th>
              <th className="border border-white/10 p-3 sm:p-4 text-left font-semibold">
                Knees
              </th>
              <th className="border border-white/10 p-3 sm:p-4 text-left font-semibold">
                Arm
              </th>
            </tr>
          </thead>

          <tbody>
            <tr>
              <td className="border border-white/10 p-3 sm:p-4 text-slate-200">
                {feedback.ankle}
              </td>
              <td className="border border-white/10 p-3 sm:p-4 text-slate-200">
                {feedback.knees}
              </td>
              <td className="border border-white/10 p-3 sm:p-4 text-slate-200">
                {feedback.arm}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="my-6 sm:my-8">
        <hr className="border-white/20" />
      </div>

      <div>
        <h2 className="text-lg sm:text-xl lg:text-2xl font-bold mb-3 sm:mb-4">
          Future Steps
        </h2>
        <p className="text-sm sm:text-base leading-6 sm:leading-7 text-slate-300 max-w-2xl">
          {feedback.futureSteps}
        </p>
      </div>
    </div>
  );
}
