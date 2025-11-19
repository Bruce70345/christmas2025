import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { MaterialAudioPlayer } from "@/components/material-audio-player";
import { Toaster } from "@/components/ui/toaster";

const anton = localFont({
  src: [
    {
      path: "../../public/Anton/Anton-Regular.ttf",
      weight: "400",
      style: "normal",
    },
  ],
  variable: "--font-display",
  display: "swap",
});

const robotoMono = localFont({
  src: [
    {
      path: "../../public/Roboto_Mono/RobotoMono-VariableFont_wght.ttf",
      weight: "100 700",
      style: "normal",
    },
    {
      path: "../../public/Roboto_Mono/RobotoMono-Italic-VariableFont_wght.ttf",
      weight: "100 700",
      style: "italic",
    },
  ],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Christmas W/Bruce 2025",
  description: "Join with me this Christmas, Christmas card from Taiwan",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full bg-[#004369] text-slate-900">
      <body
        className={`${robotoMono.variable} ${anton.variable} antialiased min-h-screen `}
      >
        {children}
        <MaterialAudioPlayer />
        <Toaster />
      </body>
    </html>
  );
}
