'use client';

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import Marquee from "react-fast-marquee";

const songs = [
  "HERE COMES SANTA CLAUS cklj dwkdmwkld mdkwdmwkld mdklwmdqwkldm mdkwqmdlkqwd mdkwmdlkwq mkdwmlkqwd",
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
      const viewportWidth =
        typeof window !== "undefined" ? window.innerWidth : el.clientWidth;
      const maxWidth =
        viewportWidth >= 768 ? viewportWidth * 0.6 : el.clientWidth;
      setShouldScroll(el.scrollWidth > maxWidth + 1);
    };

    update();

    const observer = new ResizeObserver(() => update());
    observer.observe(el);
    window.addEventListener("resize", update);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", update);
    };
  }, [text]);

  return (
    <div
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
          <span className="pr-24">{text}</span>
        </Marquee>
      ) : (
        <span>{text}</span>
      )}
    </div>
  );
}

export default function Music() {
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
        <span className="layered-text banner-title tracking-[2rem]" data-text="MUSIC LIST">
          MUSIC LIST
        </span>
      </h2>
      <div className="absolute top-[20%] z-20 w-full max-w-[90vw] space-y-[5%] text-[6vw] font-semibold tracking-[0.15em] md:text-[4vw] lg:left-[10%] lg:top-[20%] lg:max-w-[60vw] lg:text-[3vw]">
        {songs.slice(0, 3).map((song) => (
          <SongLine key={song} text={song} />
        ))}
      <div className="w-full flex felx-start">
      <button type="button" className="p-2 text-start tracking-[0em] text-yellow-500">
          {"[MORE]"}
      </button>
      </div></div>

    </section>
  );
}
