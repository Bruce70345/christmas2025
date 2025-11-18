"use client"

import Image from "next/image";
import { Save } from "lucide-react";
import { PresepeFolderModal } from "@/components/presepe-folder-modal";

export default function Presepe() {
  return (
    <section className="banner-section min-h-[100vh] relative p-[6vw]">
      <div className="absolute right-[6%] top-[2%] z-20 flex gap-3">
        <PresepeFolderModal />
        <button
          type="button"
          aria-label="Save presepe"
          onClick={() => console.log("save clicked")}
          className="rounded-full border border-white/60 bg-white/10 p-3 text-white backdrop-blur transition hover:bg-white/30"
        >
          <Save className="h-5 w-5" />
        </button>
      </div>
      <h2
        className="absolute top-[7%] left-0 z-10 w-full text-center text-[15vw] uppercase md:text-[14vw] lg:left-[-14%] lg:text-[9vw]"
        data-text="UR PRESEPE"
      >
        <span className="layered-text banner-title" data-text="UR PRESEPE">
          UR PRESEPE
        </span>
      </h2>
      <Image
        src="/graphs/presepe/frame.svg"
        alt="frame"
        width={1240}
        height={1180}
        className="absolute left-1/2 top-[52%] z-[5] w-full max-w-[52rem] -translate-x-1/2 -translate-y-1/2 md:top-[50%] md:w-[80vw] md:max-w-[66rem] lg:top-[48%] lg:w-[65vw] lg:max-w-[76rem]"
      />
    </section>
  );
}
