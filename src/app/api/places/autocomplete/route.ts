"use server";

import { NextResponse } from "next/server";

const PLACES_ENDPOINT = "https://places.googleapis.com/v1/places:autocomplete";
const FIELD_MASK = [
  "suggestions.placePrediction.placeId",
  "suggestions.placePrediction.text",
  "suggestions.placePrediction.structuredFormat",
].join(",");

const PLACES_API_KEY =
  process.env.GOOGLE_PLACES_API_KEY ??
  process.env.GOOGLE_MAPS_API_KEY ??
  process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY ??
  "";

export async function POST(request: Request) {
  if (!PLACES_API_KEY) {
    return NextResponse.json(
      { error: "Google Places API key is not configured." },
      { status: 500 },
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON payload." },
      { status: 400 },
    );
  }

  const inputRaw = typeof body.input === "string" ? body.input : "";
  const trimmedInput = inputRaw.trim();
  if (trimmedInput.length < 3) {
    return NextResponse.json(
      { error: "Input must contain at least 3 characters." },
      { status: 400 },
    );
  }

  const payload = {
    input: trimmedInput,
    includedPrimaryTypes: Array.isArray(body.includedPrimaryTypes)
      ? body.includedPrimaryTypes
      : ["street_address"],
    languageCode:
      typeof body.languageCode === "string" ? body.languageCode : "en",
    regionCode: typeof body.regionCode === "string" ? body.regionCode : "US",
  };

  const response = await fetch(PLACES_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": PLACES_API_KEY,
      "X-Goog-FieldMask": FIELD_MASK,
    },
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  const data = await response.json();

  if (!response.ok) {
    return NextResponse.json(
      { error: data?.error?.message ?? "Failed to fetch addresses." },
      { status: response.status },
    );
  }

  return NextResponse.json(data, { status: 200 });
}
