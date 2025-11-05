'use client';

import { useEffect, useRef, useState } from "react";
import Marquee from "react-fast-marquee";

const songs = [
  "HERE COMES SANTA CLAUS",
  "LAST CRISTMAS",
  "ALL I WANT FOR CHRIS IS YOU",
  "LAST CRISTMAS",
];

function SongLine({ text }: { text: string }) {
  const lineRef = useRef<HTMLParagraphElement | null>(null);
  const [shouldScroll, setShouldScroll] = useState(false);

  useEffect(() => {
    const el = lineRef.current;
    if (!el) return;

    const update = () => {
      setShouldScroll(el.scrollWidth > el.clientWidth + 1);
    };

    update();

    const observer = new ResizeObserver(() => update());
    observer.observe(el);
    return () => observer.disconnect();
  }, [text]);

  return (
    <p
      ref={lineRef}
      className="overflow-hidden text-start whitespace-nowrap"
    >
      {shouldScroll ? (
        <Marquee
          gradient={false}
          pauseOnHover
          speed={20}
          className="max-w-full"
        >
          <span className="pr-5">{text}</span>
        </Marquee>
      ) : (
        <span>{text}</span>
      )}
    </p>
  );
}

export default function Music() {
  return (
    <section className="banner-section relative grid min-h-[100svh] place-items-center overflow-hidden px-[6vw] pb-[8vh] pt-[12vh] text-center md:px-[8vw] md:pb-[10vh] md:pt-[14vh] lg:px-[6vw] lg:pb-[8vh] lg:pt-[12vh]">
      <h2
        className="absolute top-[10%] z-10 w-full text-center text-[18vw] uppercase md:text-[14vw] lg:bottom-[0%] lg:top-auto lg:text-[13vw]"
        data-text="MUSIC LIST"
      >
        <span className="layered-text banner-title tracking-[2rem]" data-text="MUSIC LIST">
          MUSIC LIST
        </span>
      </h2>
      <div className="absolute w-full max-w-[90vw] space-y-[3vh] text-[6vw] font-semibold tracking-[0.15em] md:mt-[10vh] md:max-w-[90vw] md:text-[4vw] lg:max-w-[80vw] lg:text-[2vw]">
        {songs.slice(0, 3).map((song) => (
          <SongLine key={song} text={song} />
        ))}
      </div>
    </section>
  );
}
