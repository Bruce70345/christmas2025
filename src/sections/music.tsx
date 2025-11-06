"use client";

import Image from "next/image";
import { useState } from "react";
import { Pause, Play } from "lucide-react";
import { siYoutube } from "simple-icons";
import Marquee from "react-fast-marquee";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

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

function YoutubeIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      role="img"
      aria-hidden="true"
      focusable="false"
      className="size-5"
    >
      <path d={siYoutube.path} fill="currentColor" />
    </svg>
  );
}

type SongRowProps = {
  song: string;
  index: number;
  isActive: boolean;
  dense?: boolean;
  onTogglePlay: () => void;
  onOpenYouTube: () => void;
};

function SongRow({
  song,
  index,
  isActive,
  dense,
  onTogglePlay,
  onOpenYouTube,
}: SongRowProps) {
  const wrapperClass = dense
    ? "text-[5vw] md:text-[2vw] gap-2"
    : "text-base md:text-lg gap-3";
  const buttonPadding = dense ? "p-1.5 md:p-2" : "p-2";
  const iconSize = dense ? "size-4 md:size-5" : "size-5";

  return (
    <div className={`flex items-center ${wrapperClass}`}>
      <div className="min-w-0 flex-1" title={`${index + 1}. ${song}`}>
        {isActive ? (
          <Marquee gradient={false} speed={18} pauseOnHover className="[&>div]:flex">
            <span className="pr-12">
              {index + 1}. {song}
            </span>
          </Marquee>
        ) : (
          <span className="block truncate">
            {index + 1}. {song}
          </span>
        )}
      </div>
      <button
        type="button"
        aria-label={isActive ? "Pause song" : "Play song"}
        onClick={onTogglePlay}
        className={`rounded-full border border-white/20 text-white transition hover:bg-white/10 ${buttonPadding}`}
      >
        {isActive ? (
          <Pause className={iconSize} />
        ) : (
          <Play className={iconSize} />
        )}
      </button>
      <button
        type="button"
        aria-label="Open YouTube"
        onClick={onOpenYouTube}
        className={`rounded-full border border-white/20 text-white transition hover:bg-white/10 ${buttonPadding}`}
      >
        <YoutubeIcon />
      </button>
    </div>
  );
}

export default function Music() {
  const [activeSongIndex, setActiveSongIndex] = useState<number | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleTogglePlay = (index: number) => {
    if (activeSongIndex === index) {
      console.log("Pause song", songs[index]);
      setActiveSongIndex(null);
    } else {
      console.log("Play song", songs[index]);
      setActiveSongIndex(index);
    }
  };

  const handleOpenYouTube = (index: number) => {
    console.log("YouTube link", songs[index]);
  };

  return (
    <section className="banner-section relative grid min-h-[100svh] place-items-center overflow-hidden px-[6vw] pb-[8vh] pt-[12vh] text-center md:px-[8vw] md:pb-[10vh] md:pt-[14vh] lg:px-[6vw] lg:pb-[8vh] lg:pt-[12vh]">
      <Image
        src="/graphs/musicGroup.png"
        alt="Festive musicians gathered on stage"
        width={240}
        height={197}
        className="pointer-events-none absolute bottom-[10%] z-10 w-[100vw] lg:w-[65vw] lg:right-[5%] lg:bottom-[-10%]"
      />
      <Image
        src="/graphs/musician.png"
        alt="Solo musician illustration"
        width={649}
        height={800}
        className="pointer-events-none absolute bottom-[10%] z-5 w-[60vw] left-[-15%] md:hidden "
      />
      <h2
        className="absolute top-[5%] z-10 w-full text-center text-[18vw] uppercase md:text-[14vw] lg:bottom-[0%] lg:top-auto lg:text-[13vw]"
        data-text="MUSIC LIST"
      >
        <span
          className="layered-text banner-title"
          data-text="MUSIC LIST"
        >
          MUSIC LIST
        </span>
      </h2>
      <div className="absolute top-[20%] z-20 w-full max-w-[90vw] space-y-4 text-[5.2vw] font-semibold tracking-[0.12em] md:space-y-3 md:text-[2.4vw] lg:left-[10%] lg:top-[20%] lg:max-w-[60vw] lg:text-[2vw]">
        {songs.slice(0, 3).map((song, index) => (
          <div
            key={`${song}-${index}`}
            className="rounded-full border border-white/30 bg-white/10 px-4 py-2 text-left text-white shadow-sm shadow-black/20 backdrop-blur"
          >
            <SongRow
              song={song}
              index={index}
              dense
              isActive={activeSongIndex === index}
              onTogglePlay={() => handleTogglePlay(index)}
              onOpenYouTube={() => handleOpenYouTube(index)}
            />
          </div>
        ))}
        <div className="flex justify-start">
          <Dialog
            open={isDialogOpen}
            onOpenChange={(open) => {
              setIsDialogOpen(open);
              setActiveSongIndex(null);
            }}
          >
            <DialogTrigger asChild>
              <button
                type="button"
                className="rounded-full border border-yellow-400 px-5 py-2 text-[4.4vw] font-semibold tracking-[0.1em] text-yellow-400 transition-colors hover:bg-yellow-400 hover:text-[#004369] md:text-[1.4vw]"
              >
                [MORE]
              </button>
            </DialogTrigger>
            <DialogContent className="bg-[#003453] h-[80vh]">
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
                      isActive={activeSongIndex === index}
                      onTogglePlay={() => handleTogglePlay(index)}
                      onOpenYouTube={() => handleOpenYouTube(index)}
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
    </section>
  );
}
