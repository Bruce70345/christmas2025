"use client";

import Image from "next/image";
import { Loader2 } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { siSpotify, siYoutube } from "simple-icons";
import Marquee from "react-fast-marquee";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useYouTubeSongPlayer } from "@/hooks/useYouTubeSongPlayer";
import { useSongSuggestions } from "@/hooks/useSongSuggestions";

type IconProps = {
  className?: string;
};

function YoutubeIcon({ className = "size-5" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      role="img"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <path d={siYoutube.path} fill="currentColor" />
    </svg>
  );
}

function SpotifyIcon({ className = "size-6" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      role="img"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <path d={siSpotify.path} fill="currentColor" />
    </svg>
  );
}

type SongRowProps = {
  song: string;
  index: number;
  dense?: boolean;
  onOpenYouTube: () => void;
};

function SongRow({
  song,
  index,
  dense,
  onOpenYouTube,
}: SongRowProps) {
  const [isHighlighted, setIsHighlighted] = useState(false);
  const scrollOriginRef = useRef<number | null>(null);
  const wrapperClass = dense
    ? "text-[5vw] md:text-[2vw] gap-2"
    : "text-base md:text-lg gap-3";
  const buttonPadding = dense ? "p-1.5 md:p-2" : "p-2";
  const iconSize = dense ? "size-5" : "size-6";
  const label = `${index + 1}. ${song}`;
  const handleFocus = () => {
    setIsHighlighted(true);
    if (typeof window !== "undefined") {
      scrollOriginRef.current = window.scrollY;
    }
  };
  const handleBlur = () => {
    setIsHighlighted(false);
    scrollOriginRef.current = null;
  };

  useEffect(() => {
    if (!isHighlighted || typeof window === "undefined") {
      return;
    }
    const handleScroll = () => {
      const origin = scrollOriginRef.current ?? window.scrollY;
      const delta = Math.abs(window.scrollY - origin);
      if (delta > 24) {
        setIsHighlighted(false);
        scrollOriginRef.current = null;
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [isHighlighted]);

  return (
    <div
      className={`flex items-center ${wrapperClass}`}
      tabIndex={0}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onClick={handleFocus}
    >
      <div className="min-w-0 flex-1" title={label}>
        {isHighlighted ? (
          <Marquee gradient={false} speed={18} pauseOnHover className="[&>div]:flex">
            <span className="pr-12">{label}</span>
          </Marquee>
        ) : (
          <span className="block truncate">{label}</span>
        )}
      </div>
      <button
        type="button"
        aria-label="Open YouTube"
        onClick={onOpenYouTube}
        className={`rounded-full border border-white/20 text-white transition hover:bg-white/10 ${buttonPadding}`}
      >
        <YoutubeIcon className={iconSize} />
      </button>
    </div>
  );
}

type SongRowPlaceholderProps = {
  dense?: boolean;
};

function SongRowPlaceholder({ dense }: SongRowPlaceholderProps) {
  const wrapperClass = dense
    ? "text-[5vw] md:text-[2vw] gap-2"
    : "text-base md:text-lg gap-3";
  const buttonPadding = dense ? "p-1.5 md:p-2" : "p-2";
  const iconSize = dense ? "size-4" : "size-5";
  return (
    <div className={`flex items-center ${wrapperClass}`}>
      <div className="flex min-w-0 flex-1 items-center gap-3 text-white/60">
        <Loader2 className="size-6 animate-spin" />
        <span className="text-xs uppercase tracking-[0.3em]">Loading...</span>
      </div>
      <div
        className={`rounded-full border border-white/20 text-white ${buttonPadding}`}
      >
        <Loader2 className={`${iconSize} animate-spin`} />
      </div>
    </div>
  );
}

export default function Music() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const {
    suggestions,
    isLoading: isSuggestionLoading,
    error: suggestionError,
  } = useSongSuggestions();
  const {
    error: playerError,
    currentVideoId,
    currentSongTitle,
    openYouTube,
    stop,
  } = useYouTubeSongPlayer();
  const rankedSongs = useMemo(
    () => suggestions.map((item) => item.title),
    [suggestions],
  );
  const previewSongs = rankedSongs.slice(0, 3);

  return (
    <section className="banner-section relative grid min-h-[100svh] place-items-center overflow-hidden px-[6vw] py-[8vw] text-center md:px-[8vw] md:pb-[10vh] md:pt-[14vh]">
      <Image
        src="/graphs/musicGroup.png"
        alt="Festive musicians gathered on stage"
        width={2400}
        height={1970}
        className="pointer-events-none absolute bottom-[0%] z-10 w-[100vw] lg:w-[65vw] lg:right-[5%] lg:bottom-[-10%]"
      />
      <Image
        src="/graphs/musician.png"
        alt="Solo musician illustration"
        width={6490}
        height={8000}
        className="pointer-events-none absolute bottom-[0%] z-5 w-[60vw] left-[-15%] md:hidden "
      />
      <h2
        className="absolute top-[0%] z-10 w-full text-center text-[18vw] uppercase md:text-[14vw] lg:bottom-[0%] lg:left-[-10%] lg:top-auto lg:text-[13vw]"
        data-text="PLAYLIST"
      >
        <span
          className="layered-text banner-title"
          data-text="PLAYLIST"
        >
          PLAYLIST
        </span>
      </h2>
      <div className="absolute top-[17%] z-20 w-full max-w-[90vw] space-y-4 text-[5.2vw] font-semibold tracking-[0.12em] md:space-y-4 md:text-[2.4vw] lg:left-[10%] lg:top-[15%] lg:max-w-[60vw] lg:text-[2vw]">
        {playerError && <p className="text-sm text-red-300">{playerError}</p>}
        {suggestionError && (
          <p className="text-sm text-yellow-200">{suggestionError}</p>
        )}
        {isSuggestionLoading ? (
          <p className="text-xs uppercase tracking-[0.35em] text-white/70">
            Syncing song suggestions...
          </p>
        ) : rankedSongs.length === 0 ? (
          <p className="text-xs uppercase tracking-[0.35em] text-white/70">
            No song suggestions yet. Be the first!
          </p>
        ) : null}
        <a
          href="https://open.spotify.com/playlist/78RGRLghGmsJb2Jvl3fIAD?si=2c529a41328e489e&pt=9246f3beab8f0fd38c0091c305345b5d"
          target="_blank"
          rel="noreferrer"
          className="inline-flex w-full items-center gap-3 rounded-full border border-[#1ed760]/40 bg-black/40 px-5 py-2 text-left text-white shadow-sm shadow-black/20 backdrop-blur transition hover:bg-black/60"
        >
          <span className="text-[#1ed760] pl-2 md:pl-4">
            <SpotifyIcon />
          </span>
          <span className="text-[4vw] font-semibold tracking-[0.1em] md:text-[1.5vw] pl-2 md:pl-4">
            Add your favorites here! 
          </span>
        </a>
        <p className="text-[3.4vw] uppercase tracking-[0.35em] text-white/80 md:text-[1.2vw]">
          or check the songs people recommended instead
        </p>
        {(isSuggestionLoading ? [0, 1, 2] : previewSongs).map(
          (song, index) => (
            <div
              key={`${song ?? "loading"}-${index}`}
              className="rounded-full border border-white/30 bg-white/10 px-4 py-1.5 text-left text-white shadow-sm shadow-black/20 backdrop-blur md:py-2"
            >
              {isSuggestionLoading ? (
                <SongRowPlaceholder dense />
              ) : (
                <SongRow
                  song={song as string}
                  index={index}
                  dense
                  onOpenYouTube={() => openYouTube(index, song as string)}
                />
              )}
            </div>
          ),
        )}
        <div className="flex justify-start">
          <Dialog
            open={isDialogOpen}
            onOpenChange={(open) => {
              setIsDialogOpen(open);
              stop();
            }}
          >
            <DialogTrigger asChild>
              <button
                type="button"
                className="rounded-full border border-yellow-400 px-5 py-1.5 text-[4.4vw] font-semibold tracking-[0.1em] text-yellow-400 transition-colors hover:bg-yellow-400 hover:text-[#004369] md:py-2 md:text-[1.4vw]"
              >
                [MORE]
              </button>
            </DialogTrigger>
            <DialogContent
              className="bg-[#003453] h-[80vh]"
              onOpenAutoFocus={(event) => event.preventDefault()}
            >
              <DialogHeader>
                <DialogTitle className="mt-4 text-[#fff7ec] text-xl">
                  Christmas Craze
                </DialogTitle>
              </DialogHeader>
              <div className="panel-with-scrollbar mt-6 space-y-3 overflow-y-auto text-base font-semibold tracking-[0.08em] md:text-lg">
                {(isSuggestionLoading ? [0, 1, 2] : rankedSongs).map(
                  (song, index) => (
                    <div
                      key={`${song ?? "loading"}-${index}`}
                      className="rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-white"
                    >
                      {isSuggestionLoading ? (
                        <SongRowPlaceholder />
                      ) : (
                        <SongRow
                          song={song as string}
                          index={index}
                          onOpenYouTube={() => openYouTube(index, song as string)}
                        />
                      )}
                    </div>
                  ),
                )}
              </div>
              <DialogClose asChild>
                <button
                  type="button"
                  className="mt-6 w-full h-12 rounded-full bg-[#d7665d] py-3 text-sm font-semibold uppercase tracking-[0.3em] text-[#f8c024]"
                >
                  Close
                </button>
              </DialogClose>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </section>
  );
}
