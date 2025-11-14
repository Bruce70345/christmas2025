"use client";

import { useCallback, useState } from "react";
import type { SignupPayload } from "@/types/signup";

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

  return {
    submitSignup,
    isSubmitting,
    error,
    isSuccess,
    resetStatus,
  };
}
