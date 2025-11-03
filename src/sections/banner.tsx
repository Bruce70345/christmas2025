export default function Banner() {
  return (
    <section className="banner-section relative grid min-h-[100svh] place-items-center overflow-hidden px-[6vw] pb-[8vh] pt-[12vh] text-center md:px-[8vw] md:pb-[10vh] md:pt-[14vh] lg:px-[6vw] lg:pb-[8vh] lg:pt-[12vh]">
      <p className="absolute right-[5%] top-[20%] text-right text-[10vw] md:text-[7vw] lg:text-[7vw] lg:top-[45%] lg:-translate-y-1/2 max-text-[200px]">
        <span
          className="layered-text banner-kicker"
          data-text="W/ BRUCE"
        >
          W/ BRUCE
        </span>
      </p>
      <h1
        className="absolute left-[50%] top-[30%] w-full -translate-x-1/2 text-center text-[18vw] uppercase md:text-[22vw] lg:bottom-[10%] lg:top-auto lg:left-[50%] lg:max-w-none lg:-translate-x-1/2 lg:text-[14vw]"
        data-text="CHRISTMAS"
      >
        <span className="layered-text banner-title" data-text="CHRISTMAS">
          CHRISTMAS
        </span>
      </h1>
    </section>
  );
}
