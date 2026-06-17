function formatTime(time: number): string {
  if (!Number.isFinite(time)) return "0:00";

  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);

  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

interface Props {
  currentTime: number;
  duration: number;
  progressPercent: number;
  handleSeek: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function VideoSlider({
  currentTime,
  duration,
  progressPercent,
  handleSeek,
}: Props) {
  return (
    <div className="mt-2 w-full">
      <div className="flex items-center gap-2">
        {/* Current Time */}
        <span className="w-10 shrink-0 text-right text-xs font-medium tabular-nums text-zinc-400">
          {formatTime(currentTime)}
        </span>

        {/* Slider */}
        <input
          type="range"
          min="0"
          max={duration || 0}
          step="0.01"
          value={currentTime}
          onChange={handleSeek}
          disabled={!duration}
          aria-label="Video timeline"
          className="video-timeline w-full"
          style={
            {
              "--progress": `${progressPercent}%`,
            } as React.CSSProperties
          }
        />

        {/* Duration */}
        <span className="w-10 shrink-0 text-xs font-medium tabular-nums text-zinc-400">
          {formatTime(duration)}
        </span>
      </div>
    </div>
  );
}
