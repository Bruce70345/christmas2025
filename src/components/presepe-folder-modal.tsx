"use client";

import { useState } from "react";
import Image from "next/image";
import { Folder, X } from "lucide-react";

const presepeSvgFiles = [
  "3Dotors.svg",
  "angel.svg",
  "babyAngel.svg",
  "bush.svg",
  "camel.svg",
  "cow.svg",
  "dotorsNgits.svg",
  "glow.svg",
  "horse.svg",
  "josephStick.svg",
  "josephTorch.svg",
  "josphAndMaria.svg",
  "lamb.svg",
  "mariaNbabyG.svg",
  "mariapray.svg",
  "star.svg",
  "window.svg",
];

export function PresepeFolderModal() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        aria-label="Open presepe assets"
        onClick={() => {
          console.log("folder clicked");
          setOpen(true);
        }}
        className="rounded-full border border-white/60 bg-white/10 p-3 text-white backdrop-blur transition hover:bg-white/30"
      >
        <Folder className="h-5 w-5" />
      </button>
      {open && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-5 py-10"
          onClick={() => setOpen(false)}
        >
          <div
            className="relative max-h-[80vh] w-full max-w-5xl overflow-y-auto rounded-3xl border border-white/20 bg-[#072642] p-6 text-white panel-with-scrollbar"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-4">
              <p className="text-lg font-semibold uppercase tracking-wide">
                Presepe Assets
              </p>
              <button
                type="button"
                aria-label="Close presepe assets"
                onClick={() => setOpen(false)}
                className="rounded-full border border-white/40 p-2 hover:bg-white/10"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {presepeSvgFiles.map((file) => (
                <div
                  key={file}
                  className="flex flex-col items-center gap-2 rounded-2xl border border-white/10 bg-white/5 p-3 text-center"
                >
                  <Image
                    src={`/graphs/presepe/${file}`}
                    alt={file.replace(/\.svg$/i, "").replace(/([A-Z])/g, " $1")}
                    width={180}
                    height={180}
                    className="h-28 w-full object-contain"
                  />
                  {/* <span className="text-xs uppercase tracking-wide text-white/70">
                    {file.replace(".svg", "")}
                  </span> */}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

