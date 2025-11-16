"use client";

import { useState, type ComponentPropsWithoutRef } from "react";
import { useSignupSheet } from "@/hooks/useSignupSheet";
import type { SignupEntry } from "@/types/signup";

type DevSheetDownloadTriggerProps = ComponentPropsWithoutRef<"span"> & {
  filenamePrefix?: string;
};

function entriesToExcelLikeContent(entries: SignupEntry[]) {
  const header = [
    "Timestamp",
    "Name",
    "Address",
    "Postcard Theme",
    "Contact",
    "Song Suggestion",
  ];

  const escapeCell = (value: string | undefined) => {
    const normalized = value ?? "";
    const sanitized = normalized.replace(/\r?\n/g, " ");
    return `"${sanitized.replace(/"/g, '""')}"`;
  };

  const rows = entries.map((entry) => [
    escapeCell(entry.timestamp),
    escapeCell(entry.name),
    escapeCell(entry.address),
    escapeCell(entry.postcardTheme),
    escapeCell(entry.contact),
    escapeCell(entry.songSuggestion),
  ]);

  return [header.map((cell) => `"${cell}"`).join(","), ...rows.map((row) => row.join(","))].join("\r\n");
}

export function DevSheetDownloadTrigger({
  children,
  filenamePrefix = "christmas-signups",
  className,
  ...rest
}: DevSheetDownloadTriggerProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const { fetchEntries } = useSignupSheet();
  const isDevMode = process.env.NODE_ENV !== "production";

  const handleDownload = async () => {
    if (!isDevMode || isDownloading) return;
    setIsDownloading(true);
    try {
      const entries = await fetchEntries();
      if (!entries.length) {
        console.info("No signup entries available yet.");
        return;
      }
      const csv = entriesToExcelLikeContent(entries);
      const fileContent = `\ufeff${csv}`;
      const blob = new Blob([fileContent], {
        type: "text/csv;charset=utf-8",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      link.download = `${filenamePrefix}-${timestamp}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (downloadError) {
      console.error("Download failed:", downloadError);
    } finally {
      setIsDownloading(false);
    }
  };

  if (!isDevMode) {
    return (
      <span className={className} {...rest}>
        {children}
      </span>
    );
  }

  return (
    <button
      type="button"
      {...rest}
      className={`${className ?? ""} bg-transparent p-0 text-inherit border-0 outline-none cursor-pointer ${isDownloading ? "opacity-70" : ""}`}
      onClick={handleDownload}
      title={isDownloading ? "Preparing download..." : "Download dev sheet"}
    >
      {children}
    </button>
  );
}
