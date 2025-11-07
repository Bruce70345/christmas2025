import Image from "next/image";

export default function Explain() {

  return (
    <section className="banner-section min-h-[100vh] relative overflow-hidden p-[2rem] text-center lg:p-[4rem]]">
      <div className="space-y-5 w-[90vw] rounded-3xl border border-white/20 bg-white/5 text-left backdrop-blur p-[2rem] lg:p-[3rem] absolute top-[25%] left-1/2 -translate-x-1/2 lg:-translate-x-[-10%] lg:w-[40vw] lg:top-[55%] shadow-2xl">
          <p className="flex items-start gap-3">
            <span className="mt-[0.2rem] h-2 w-2 rounded-full bg-[#ffc840]" />
            <span>Christmas is always a lovely holiday, and I&apos;m planning to send Christmas cards to friends in 2025.</span>
          </p>
        <p className="pt-2 font-semibold text-[#ffc840]">
          Let&apos;s celebrate together, no matter where you are.
        </p>
      </div>
      <Image
        src="/graphs/cardsMB.png"
        alt="Stack of illustrated Christmas cards (mobile layout)"
        width={2400}
        height={2160}
        priority
        // sizes="(max-width: 767px) 80vw, (max-width: 1023px) 60vw, 40vw"
        className="w-full absolute bottom-[5%] left-0 lg:left-[5%] lg:w-[50vw] z-20"
      />
      <h2
        className="absolute top-[5%] left-[0%] z-10 w-full text-center text-[18vw] uppercase md:text-[14vw] lg:w-[80%] lg:top-[10%] lg:left-[30%] lg:text-[9vw]"
        // data-text="MUSIC LIST"
      >
        <span className="layered-text banner-title" data-text="Christmas Cards">
          Christmas Cards
        </span>
      </h2>
    </section>
  );
}
