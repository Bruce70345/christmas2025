"use client";

import { useEffect, useRef } from "react";

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement,
        options: {
          sitekey: string;
          callback?: (token: string) => void;
          "error-callback"?: () => void;
          "expired-callback"?: () => void;
        },
      ) => string;
      reset?: (widgetId?: string) => void;
      remove?: (widgetId: string) => void;
    };
  }
}

type TurnstileWidgetProps = {
  siteKey?: string;
  onVerify: (token: string) => void;
  onExpire?: () => void;
  onError?: (message: string) => void;
  resetSignal?: number;
  className?: string;
};

function loadTurnstileScript() {
  return new Promise<void>((resolve, reject) => {
    if (document.querySelector('script[src*="turnstile/v0/api.js"]')) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Turnstile script."));
    document.head.appendChild(script);
  });
}

export function TurnstileWidget({
  siteKey,
  onVerify,
  onExpire,
  onError,
  resetSignal,
  className,
}: TurnstileWidgetProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const widgetIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!siteKey) {
      return;
    }
    let cancelled = false;

    loadTurnstileScript()
      .then(() => {
        if (cancelled || !containerRef.current || !window.turnstile) {
          return;
        }
        widgetIdRef.current = window.turnstile.render(containerRef.current, {
          sitekey: siteKey,
          callback: (token: string) => {
            onVerify(token);
          },
          "expired-callback": () => {
            onExpire?.();
            if (widgetIdRef.current && window.turnstile?.reset) {
              window.turnstile.reset(widgetIdRef.current);
            }
          },
          "error-callback": () => {
            onError?.("Verification failed, please try again.");
          },
        });
      })
      .catch((err) => {
        onError?.(err instanceof Error ? err.message : "Unable to load captcha.");
      });

    return () => {
      cancelled = true;
      if (widgetIdRef.current && window.turnstile?.remove) {
        window.turnstile.remove(widgetIdRef.current);
      }
    };
  }, [siteKey, onVerify, onExpire, onError]);

  useEffect(() => {
    if (!resetSignal) return;
    if (widgetIdRef.current && window.turnstile?.reset) {
      window.turnstile.reset(widgetIdRef.current);
    }
  }, [resetSignal]);

  if (!siteKey) {
    return (
      <p className="text-xs text-red-300">
        Turnstile site key is missing. Unable to verify submissions.
      </p>
    );
  }

  return <div ref={containerRef} className={className} />;
}
