"use client";

import { useMemo } from "react";
import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";

const SNOWFLAKE_COUNT = 120;
const BASE_SEED = 97;
const MIN_FALL_DURATION = 35; // seconds
const FALL_DURATION_VARIANCE = 16;
const MAX_DELAY = 45;

type Snowflake = {
  id: number;
  size: number;
  left: number;
  duration: number;
  delay: number;
  opacity: number;
  drift: number;
};

function seededRandom(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

const createSnowflakes = (): Snowflake[] =>
  Array.from({ length: SNOWFLAKE_COUNT }).map((_, index) => {
    const seed = BASE_SEED + index * 997;
    const sizeRand = seededRandom(seed);
    const leftRand = seededRandom(seed + 1);
    const durationRand = seededRandom(seed + 2);
    const delayRand = seededRandom(seed + 3);
    const opacityRand = seededRandom(seed + 4);
    const driftRand = seededRandom(seed + 5);

    return {
      id: index,
      size: sizeRand * 3 + 1.5,
      left: leftRand * 100,
      duration: durationRand * FALL_DURATION_VARIANCE + MIN_FALL_DURATION,
      delay: delayRand * -MAX_DELAY,
      opacity: opacityRand * 0.4 + 0.3,
      drift: driftRand * 12 - 6,
    };
  });

type SnowfallLayerProps = {
  className?: string;
};

type SnowflakeStyle = CSSProperties & {
  "--snow-drift"?: string;
};

function toCssValue(value: number, unit = "", decimals = 4) {
  return `${value.toFixed(decimals)}${unit}`;
}

export function SnowfallLayer({ className }: SnowfallLayerProps) {
  const snowflakes = useMemo(() => createSnowflakes(), []);

  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 z-[2] overflow-hidden select-none",
        className
      )}
      aria-hidden={true}
    >
      {snowflakes.map((flake) => {
        const style: SnowflakeStyle = {
          left: toCssValue(flake.left, "%"),
          width: toCssValue(flake.size, "px"),
          height: toCssValue(flake.size, "px"),
          animationDuration: toCssValue(flake.duration, "s", 3),
          animationDelay: toCssValue(flake.delay, "s", 3),
          opacity: toCssValue(flake.opacity, "", 3),
          "--snow-drift": toCssValue(flake.drift, "vw"),
        };
        return <span key={flake.id} className="snowfall-flake" style={style} />;
      })}
    </div>
  );
}
