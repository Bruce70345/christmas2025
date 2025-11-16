"use server";

import { NextResponse } from "next/server";

const API_ENDPOINT = "https://www.googleapis.com/youtube/v3/search";
const API_KEY =
  process.env.YOUTUBE_API_KEY ??
  "";

export async function GET(request: Request) {
  if (!API_KEY) {
    return NextResponse.json(
      { error: "YouTube API key is not configured." },
      { status: 500 },
    );
  }

  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query")?.trim();
  if (!query || query.length < 3) {
    return NextResponse.json(
      { error: "Query must contain at least 3 characters." },
      { status: 400 },
    );
  }

  const maxResultsParam = searchParams.get("maxResults") ?? "10";
  const safeMaxResults = Math.min(
    Math.max(Number.parseInt(maxResultsParam, 10) || 10, 1),
    25,
  ).toString();

  const url = new URL(API_ENDPOINT);
  url.searchParams.set("part", "snippet");
  url.searchParams.set("type", "video");
  url.searchParams.set("maxResults", safeMaxResults);
  url.searchParams.set("q", query);
  url.searchParams.set("key", API_KEY);

  const response = await fetch(url.toString(), { cache: "no-store" });
  const data = await response.json();

  if (!response.ok) {
    return NextResponse.json(
      { error: data?.error?.message ?? "Failed to fetch YouTube data." },
      { status: response.status },
    );
  }

  return NextResponse.json(data, { status: 200 });
}
