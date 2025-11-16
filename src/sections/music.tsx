"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
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
import { YouTubeMiniPlayer } from "@/components/youtube-mini-player";

const songs = [
  "HERE COMES SANTA CLAUS (SYNTH EDIT)",
  "LAST CRISTMAS",
  "ALL I WANT FOR CHRIS IS YOU",
  "MIDNIGHT HOT COCOA JAZZ",
  "SNOW GLOW DISCO BREAK",
  "FROSTY BASEMENT JAM",
  "CAROL OF THE BASS DRUM",
  "FIREPLACE SLOW DANCE",
  "FROSTY BASEMENT JAM",
  "CAROL OF THE BASS DRUM",
  "FIREPLACE SLOW DANCE",
  "FROSTY BASEMENT JAM",
  "CAROL OF THE BASS DRUM",
  "FIREPLACE SLOW DANCE",
];

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
  const wrapperClass = dense
    ? "text-[5vw] md:text-[2vw] gap-2"
    : "text-base md:text-lg gap-3";
  const buttonPadding = dense ? "p-1.5 md:p-2" : "p-2";
  const iconSize = dense ? "size-5" : "size-6";
  const label = `${index + 1}. ${song}`;
  const handleFocus = () => setIsHighlighted(true);
  const handleBlur = () => setIsHighlighted(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    const handleScroll = () => {
      setIsHighlighted(false);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

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

export default function Music() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const {
    error,
    currentVideoId,
    currentSongTitle,
    openYouTube,
    stop,
  } = useYouTubeSongPlayer();

  return (
    <section className="banner-section relative grid min-h-[100svh] place-items-center overflow-hidden px-[6vw] py-[8vw] text-center md:px-[8vw] md:pb-[10vh] md:pt-[14vh]">
      <Image
        src="/graphs/musicGroup.png"
        alt="Festive musicians gathered on stage"
        width={2400}
        height={1970}
        className="pointer-events-none absolute bottom-[5%] z-10 w-[100vw] lg:w-[65vw] lg:right-[5%] lg:bottom-[-10%]"
      />
      <Image
        src="/graphs/musician.png"
        alt="Solo musician illustration"
        width={6490}
        height={8000}
        className="pointer-events-none absolute bottom-[5%] z-5 w-[60vw] left-[-15%] md:hidden "
      />
      <h2
        className="absolute top-[3%] z-10 w-full text-center text-[18vw] uppercase md:text-[14vw] lg:bottom-[0%] lg:left-[-10%] lg:top-auto lg:text-[13vw]"
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
        {error && <p className="text-sm text-red-300">{error}</p>}
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
        {songs.slice(0, 3).map((song, index) => (
          <div
            key={`${song}-${index}`}
            className="rounded-full border border-white/30 bg-white/10 px-4 py-1.5 text-left text-white shadow-sm shadow-black/20 backdrop-blur md:py-2"
          >
            <SongRow
              song={song}
              index={index}
              dense
              onOpenYouTube={() => openYouTube(index, song)}
            />
          </div>
        ))}
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
                {songs.map((song, index) => (
                  <div
                    key={`${song}-${index}`}
                    className="rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-white"
                  >
                    <SongRow
                      song={song}
                      index={index}
                      onOpenYouTube={() => openYouTube(index, song)}
                    />
                  </div>
                ))}
              </div>
              <DialogClose asChild>
                <button
                  type="button"
                  className="mt-6 w-full rounded-full bg-[#d7665d] py-3 text-sm font-semibold uppercase tracking-[0.3em] text-[#f8c024]"
                >
                  Close
                </button>
              </DialogClose>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      <YouTubeMiniPlayer
        videoId={currentVideoId}
        title={currentSongTitle}
        onClose={stop}
      />
    </section>
  );
}
