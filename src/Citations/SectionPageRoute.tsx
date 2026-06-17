import { useParams } from "react-router-dom";
import { sections } from "./Citations";
import SectionPage from "./SectionPage";

export default function SectionPageRoute() {
  const { id } = useParams();
  const section = sections.find((entry) => entry.id === id);

  if (!section) {
    return (
      <div className="py-12 text-center text-lg text-white">
        Section not found.
      </div>
    );
  }

  return (
    <SectionPage
      title={section.title}
      content={section.content}
      summary={section.summary}
      videoLink={section.videoLink}
      videoDescription={section.videoDescription}
      diagramImage={section.diagramImage ?? undefined}
      diagramDescription={section.diagramDescription ?? undefined}
    />
  );
}
