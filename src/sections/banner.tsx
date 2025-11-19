import Image from "next/image";
import { DevSheetDownloadTrigger } from "@/components/dev-sheet-download-trigger";
import { SnowfallLayer } from "@/components/snowfall-layer";

export default function Banner() {
  return (
    <section className="banner-section relative grid min-h-[100vh] place-items-center overflow-hidden px-[6vw] pb-[8vh] pt-[12vh] text-center md:px-[8vw] md:pb-[10vh] md:pt-[14vh] lg:px-[6vw] lg:pb-[8vh] lg:pt-[12vh]">
      <SnowfallLayer className="z-[6]" />
      <Image
        src="/graphs/banner.png"
        alt="Illustrated gathering of Greek gods"
        width={2400}
        height={2361}
        priority
        className="z-0 absolute w-[100vw] xs:w-[60vw] bottom-[10%] md:w-[45vw] md:left-[10%]"
      />
      <Image
        src="/graphs/moon.svg"
        alt="Crescent moon"
        width={1240}
        height={1180}
        className="absolute left-[20%] top-[2%] z-[5] w-[26vw] min-w-[6rem] max-w-[11rem] md:left-[70%] md:top-[12vh] md:w-[18vw] md:max-w-[10rem] lg:left-[70%] lg:top-[10vh]"
      />
      <Image
        src="/graphs/cloud.png"
        alt=""
        width={2620}
        height={630}
        aria-hidden="true"
        className="absolute right-[45%] top-[3%] z-[4] w-[30vw] max-w-[13rem] md:right-[15%] md:top-[14vh] md:w-[18vw]"
      />
      <Image
        src="/graphs/cloud.png"
        alt=""
        width={2620}
        height={630}
        aria-hidden="true"
        className="absolute left-[5%] top-[10%] z-[10] w-[36vw] max-w-[16rem] md:left-[60%] md:top-[20vh] md:w-[22vw]"
      />
      <p className="absolute right-[5%] top-[15%] z-10 text-right text-[10vw] md:text-[7vw] lg:text-[7vw] lg:top-[45%] lg:-translate-y-1/2 max-text-[200px]">
        <DevSheetDownloadTrigger
          className="layered-text banner-kicker"
          data-text="W/ BRUCE"
        >
          W/ BRUCE
        </DevSheetDownloadTrigger>
      </p>
      <h1
        className="absolute top-[22%] z-10 w-full text-center text-[18vw] uppercase md:text-[14vw] lg:bottom-[5%] lg:top-auto lg:text-[13vw]"
        data-text="CHRISTMAS"
      >
        <span className="layered-text banner-title" data-text="CHRISTMAS">
          CHRISTMAS
        </span>
      </h1>
    </section>
  );
}
