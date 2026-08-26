export default function BackgroundLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="min-h-screen"
      style={{
        backgroundImage:
          "radial-gradient(circle at top right, rgba(255, 159, 67, 0.18), transparent 30%), radial-gradient(circle at bottom left, rgba(255, 99, 71, 0.12), transparent 35%), linear-gradient(to bottom right, #0f172a, #020617)",
        backgroundAttachment: "fixed",
      }}
    >
      {children}
    </div>
  );
}
