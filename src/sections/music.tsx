export default function Music() {

  const songs = [
  "HERE COMES SANTA CLAUS",
  "LAST CRISTMAS",
  "ALL I WANT FOR CHRIS IS YOU",
  "LAST CRISTMAS"
];
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
      <div className="absolute w-full max-w-[90vw] space-y-[3vh] overflow-hidden break-words text-[6vw] font-semibold tracking-[0.15em] md:mt-[10vh] md:max-w-[90vw] md:text-[4vw] lg:max-w-[80vw] lg:text-[2vw]">
        {songs.slice(0, 3).map((song) => (
          <p key={song} className="truncate text-start">
            {song}
          </p>
        ))}
      </div>
    </section>
  );
}
