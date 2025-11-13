"use client";

import { useEffect, useMemo, useReducer, useState } from "react";

type YouTubeSearchItem = {
  id: string;
  title: string;
  channelTitle: string;
  thumbnail: string;
};

type YouTubeSearchResponse = {
  items?: Array<{
    id?: {
      videoId?: string;
    };
    snippet?: {
      title?: string;
      channelTitle?: string;
      thumbnails?: {
        default?: { url?: string };
        medium?: { url?: string };
      };
    };
  }>;
};

type SearchState = {
  results: YouTubeSearchItem[];
  isLoading: boolean;
  error: string | null;
};

type SearchAction =
  | { type: "RESET" }
  | { type: "START" }
  | { type: "SUCCESS"; payload: YouTubeSearchItem[] }
  | { type: "ERROR"; payload: string };

const API_ENDPOINT = "https://www.googleapis.com/youtube/v3/search";

function useDebouncedValue<T>(value: T, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

const initialState: SearchState = {
  results: [],
  isLoading: false,
  error: null,
};

function searchReducer(_: SearchState, action: SearchAction): SearchState {
  switch (action.type) {
    case "RESET":
      return initialState;
    case "START":
      return {
        results: [],
        isLoading: true,
        error: null,
      };
    case "SUCCESS":
      return {
        results: action.payload,
        isLoading: false,
        error: null,
      };
    case "ERROR":
      return {
        results: [],
        isLoading: false,
        error: action.payload,
      };
    default:
      return initialState;
  }
}

export function useYouTubeSearch(query: string, debounceMs = 500) {
  const [state, dispatch] = useReducer(searchReducer, initialState);
  const { results, isLoading, error } = state;
  const debouncedQuery = useDebouncedValue(query, debounceMs);
  const apiKey = useMemo(() => process.env.NEXT_PUBLIC_YOUTUBE_API_KEY, []);

  useEffect(() => {
    const trimmedQuery = debouncedQuery.trim();

    if (trimmedQuery.length < 3) {
      dispatch({ type: "RESET" });
      return;
    }

    if (!apiKey) {
      dispatch({ type: "ERROR", payload: "YouTube API key is missing." });
      return;
    }

    const controller = new AbortController();
    const url = new URL(API_ENDPOINT);
    url.searchParams.set("part", "snippet");
    url.searchParams.set("type", "video");
    url.searchParams.set("maxResults", "10");
    url.searchParams.set("q", trimmedQuery);
    url.searchParams.set("key", apiKey);

    dispatch({ type: "START" });

    fetch(url.toString(), { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) {
          const message = await response.text();
          throw new Error(message || "Failed to search YouTube.");
        }
        return response.json() as Promise<YouTubeSearchResponse>;
      })
      .then((data) => {
        const items: YouTubeSearchItem[] = (data.items ?? [])
          .map((item) => ({
            id: item.id?.videoId ?? "",
            title: item.snippet?.title ?? "Untitled",
            channelTitle: item.snippet?.channelTitle ?? "Unknown Artist",
            thumbnail:
              item.snippet?.thumbnails?.default?.url ??
              item.snippet?.thumbnails?.medium?.url ??
              "",
          }))
          .filter((item) => Boolean(item.id));

        dispatch({ type: "SUCCESS", payload: items });
      })
      .catch((fetchError: Error) => {
        if (fetchError.name === "AbortError") return;
        dispatch({
          type: "ERROR",
          payload: fetchError.message ?? "Unknown error",
        });
      });

    return () => controller.abort();
  }, [debouncedQuery, apiKey]);

  return { results, isLoading, error };
}

export type { YouTubeSearchItem };
