interface DefinitionTooltipProps {
  term: string;
  title: string;
  definition: string;
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
}

export default function DefinitionTooltip({
  term,
  title,
  definition,
  isOpen,
  onOpen,
  onClose,
}: DefinitionTooltipProps) {
  return (
    <span className="relative inline-block">
      {/* Clicking toggles between close and open */}
      <button
        type="button"
        onClick={isOpen ? onClose : onOpen}
        className="font-semibold text-orange-300 underline decoration-orange-400/70 transition hover:text-orange-200 cursor-pointer"
      >
        {term}
      </button>

      {isOpen && (
        <div className="absolute left-1/2 top-full z-10 mt-2 w-60 sm:w-72 -translate-x-1/2 rounded-[1.75rem] border border-white/10 bg-slate-950/95 p-3 sm:p-4 text-xs sm:text-sm text-slate-200 shadow-2xl">
          {/* Arrow */}
          <div className="absolute left-1/2 top-0 h-3 w-3 sm:h-4 sm:w-4 -translate-x-1/2 -translate-y-1/2 rotate-45 rounded-sm border-t border-l border-white/10 bg-slate-950/95" />

          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer absolute right-2 top-2 inline-flex h-6 w-6 items-center justify-center rounded-full text-slate-300 hover:bg-white/10 hover:text-white sm:right-3 sm:top-3 sm:h-7 sm:w-7"
            aria-label="Close definition"
          >
            ×
          </button>

          {/* Title */}
          <p className="font-medium text-white tracking-wide">{title}</p>

          {/* Definition */}
          <p className="mt-2 font-normal text-slate-300 leading-normal tracking-wide">
            {definition}
          </p>
        </div>
      )}
    </span>
  );
}
