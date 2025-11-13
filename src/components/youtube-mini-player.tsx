"use client";

type YouTubeMiniPlayerProps = {
  videoId: string | null;
  title?: string | null;
  onClose?: () => void;
};

export function YouTubeMiniPlayer({
  videoId,
  title,
  onClose,
}: YouTubeMiniPlayerProps) {
  if (!videoId) return null;

  return (
    <div className="fixed bottom-6 right-6 z-40 w-[280px] rounded-3xl border border-white/20 bg-black/70 p-3 text-white shadow-2xl backdrop-blur">
      <div className="mb-1 flex items-center justify-between text-[10px] uppercase tracking-[0.3em] text-white/60">
        <span>Now Playing</span>
        <button
          type="button"
          onClick={onClose}
          className="rounded-full px-2 py-1 text-white/60 transition hover:bg-white/10 hover:text-white"
        >
          Close
        </button>
      </div>
      <p className="mb-2 text-xs font-semibold text-white/90">
        {title ?? "YouTube"}
      </p>
      <div className="relative w-full overflow-hidden rounded-2xl pb-[56.25%]">
        <iframe
          src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
          title={title ?? "YouTube player"}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute left-0 top-0 h-full w-full"
        />
      </div>
    </div>
  );
}
