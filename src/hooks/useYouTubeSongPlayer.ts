"use client";

import { useCallback, useRef, useState } from "react";

type VideoInfo = {
  videoId: string;
  title: string;
};

type UseYouTubeSongPlayerReturn = {
  activeIndex: number | null;
  isLoading: boolean;
  error: string | null;
  currentVideoId: string | null;
  currentSongTitle: string | null;
  togglePlay: (index: number, query: string) => void;
  openYouTube: (index: number, query: string) => void;
  stop: () => void;
};

const API_ENDPOINT = "/api/youtube/search";

export function useYouTubeSongPlayer(): UseYouTubeSongPlayerReturn {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [currentVideoId, setCurrentVideoId] = useState<string | null>(null);
  const [currentSongTitle, setCurrentSongTitle] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const cacheRef = useRef<Record<string, VideoInfo>>({});

  const resetState = useCallback(() => {
    setActiveIndex(null);
    setCurrentVideoId(null);
    setCurrentSongTitle(null);
    setIsLoading(false);
  }, []);

  const performSearch = useCallback(
    async (query: string) => {
      const trimmedQuery = query.trim();
      if (trimmedQuery.length < 3) {
        throw new Error("Song name must have at least 3 characters.");
      }

      const cacheKey = trimmedQuery.toLowerCase();
      if (cacheRef.current[cacheKey]) {
        return cacheRef.current[cacheKey];
      }

      const params = new URLSearchParams({
        query: trimmedQuery,
        maxResults: "1",
      });
      const response = await fetch(`${API_ENDPOINT}?${params.toString()}`);
      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || "Unable to fetch YouTube results.");
      }

      const data = await response.json();
      const firstItem = data?.items?.[0];
      const videoId = firstItem?.id?.videoId;
      if (!videoId) {
        throw new Error("No YouTube video found for this song.");
      }
      const title = firstItem?.snippet?.title ?? trimmedQuery;
      const videoInfo: VideoInfo = { videoId, title };
      cacheRef.current[cacheKey] = videoInfo;
      return videoInfo;
    },
    []
  );

  const togglePlay = useCallback(
    async (index: number, query: string) => {
      if (activeIndex === index) {
        resetState();
        return;
      }
      try {
        setIsLoading(true);
        setError(null);
        const videoInfo = await performSearch(query);
        setActiveIndex(index);
        setCurrentVideoId(videoInfo.videoId);
        setCurrentSongTitle(videoInfo.title);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
        resetState();
      } finally {
        setIsLoading(false);
      }
    },
    [activeIndex, performSearch, resetState]
  );

  const openYouTube = useCallback(
    async (index: number, query: string) => {
      try {
        setError(null);
        const videoInfo = await performSearch(query);
        if (typeof window !== "undefined") {
          window.open(`https://www.youtube.com/watch?v=${videoInfo.videoId}`, "_blank", "noopener,noreferrer");
        }
        setActiveIndex(index);
        setCurrentVideoId(videoInfo.videoId);
        setCurrentSongTitle(videoInfo.title);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      }
    },
    [performSearch]
  );

  return {
    activeIndex,
    isLoading,
    error,
    currentVideoId,
    currentSongTitle,
    togglePlay,
    openYouTube,
    stop: resetState,
  };
}
