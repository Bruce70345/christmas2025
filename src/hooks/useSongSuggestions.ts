"use client";

import { useCallback, useEffect, useState } from "react";
import { useSignupSheet } from "@/hooks/useSignupSheet";

export type SongSuggestionStat = {
  title: string;
  count: number;
};

export function useSongSuggestions() {
  const { fetchEntries } = useSignupSheet();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<SongSuggestionStat[]>([]);

  const loadSuggestions = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const entries = await fetchEntries();
      const counts = new Map<string, number>();
      entries.forEach((entry) => {
        const key = (entry.songSuggestion ?? "").trim();
        if (!key) {
          return;
        }
        counts.set(key, (counts.get(key) ?? 0) + 1);
      });
      const stats: SongSuggestionStat[] = Array.from(counts.entries())
        .map(([title, count]) => ({ title, count }))
        .sort((a, b) => b.count - a.count || a.title.localeCompare(b.title));
      setSuggestions(stats);
    } catch (fetchError) {
      setError(
        fetchError instanceof Error
          ? fetchError.message
          : "Unable to load song suggestions.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [fetchEntries]);

  useEffect(() => {
    void loadSuggestions();
  }, [loadSuggestions]);

  return {
    suggestions,
    isLoading,
    error,
    refresh: loadSuggestions,
  };
}
