import { useMutation } from "@tanstack/react-query";

interface Props {
  text: string;
  list: string[];
}

export default function useGemini() {
  console.log("Setting up Gemini mutation...");
  try {
    const mutation = useMutation({
      mutationKey: ["geminiRes"],
      mutationFn: async ({ text, list }: Props) => {
        const res = await fetch(`/.netlify/functions/gemini`, {
          method: "POST",
          body: JSON.stringify({
            text: text,
            listContext: list,
          }),
        });
        if (!res.ok) {
          const errorText = await res.text(); // safer
          throw new Error(
            `Server error ${res.status}: ${errorText || "No response body"}`,
          );
        }
        const result = await res.json();
        return result;
      },
    });

    return { status: "success" as const, mutation };
  } catch (error) {
    alert(
      "An error occurred while setting up Gemini: " +
        (error instanceof Error ? error.message : String(error)),
    );
    return { status: "error" as const, mutation: null };
  }
}
