"use client";

import { useCallback, useState } from "react";
import type { SignupEntry, SignupPayload } from "@/types/signup";

type SubmissionResult = {
  success?: boolean;
  error?: string;
};

export function useSignupSheet() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const submitSignup = useCallback(async (payload: SignupPayload) => {
    setIsSubmitting(true);
    setError(null);
    setIsSuccess(false);

    try {
      const response = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = (await response.json().catch(() => ({}))) as SubmissionResult;
      if (!response.ok || !data.success) {
        throw new Error(data.error ?? "Fetch error, try later.");
      }

      setIsSuccess(true);
      return true;
    } catch (submitError) {
      const message =
        submitError instanceof Error
          ? submitError.message
          : "Fetch error, try later.";
      setError(message);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const resetStatus = useCallback(() => {
    setError(null);
    setIsSuccess(false);
  }, []);

  const fetchEntries = useCallback(async () => {
    const response = await fetch("/api/signup");
    const data = (await response.json().catch(() => ({}))) as {
      entries?: SignupEntry[];
      error?: string;
    };

    if (!response.ok) {
      throw new Error(data.error ?? "Unable to load entries.");
    }

    return data.entries ?? [];
  }, []);

  return {
    submitSignup,
    isSubmitting,
    error,
    isSuccess,
    resetStatus,
    fetchEntries,
  };
}
