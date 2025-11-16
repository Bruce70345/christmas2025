"use client";

import { useState, type FormEvent } from "react";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { SongSearchField } from "@/components/song-search-field";
import { AddressSearchField } from "@/components/address-search-field";
import { useSignupSheet } from "@/hooks/useSignupSheet";

export default function Signup() {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [postcardTheme, setPostcardTheme] = useState("");
  const [songSuggestion, setSongSuggestion] = useState("");
  const [contact, setContact] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { submitSignup, isSubmitting, isSuccess, resetStatus } =
    useSignupSheet();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);

    const trimmedName = name.trim();
    const trimmedAddress = address.trim();

    const missingMessages: string[] = [];
    if (!trimmedName) {
      missingMessages.push("Please enter your name.");
    }
    if (!trimmedAddress) {
      missingMessages.push("Please provide your full address.");
    }
    if (!postcardTheme) {
      missingMessages.push("Please pick a postcard theme.");
    }

    if (missingMessages.length > 0) {
      setFormError(missingMessages.join("\n"));
      setIsDialogOpen(true);
      return;
    }

    const trimmedContact = contact.trim();
    const trimmedSong = songSuggestion.trim();

    const { success, message } = await submitSignup({
      name: trimmedName,
      address: trimmedAddress,
      postcardTheme,
      contact: trimmedContact || undefined,
      songSuggestion: trimmedSong || undefined,
    });

    if (success) {
      setIsDialogOpen(true);
      setName("");
      setAddress("");
      setPostcardTheme("");
      setSongSuggestion("");
      setContact("");
    } else {
      setFormError(message ?? "Something went wrong, please try again.");
      setIsDialogOpen(true);
    }
  };

  const handleDialogChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      resetStatus();
      setFormError(null);
    }
  };

  return (
    <section className="banner-section min-h-[100vh] relative p-[6vw]">
      <div className="absolute z-20 w-[90vw] top-[17%] -translate-0.5 lg:-translate-0 lg:right-[4%] lg:w-fit lg:top-[20%]">
        <div className="w-full max-w-md rounded-[40px] border border-white/10 bg-white/5 p-6 text-left text-white shadow-2xl backdrop-blur">
          <form className="space-y-3" onSubmit={handleSubmit}>
            <label className="text-xs font-semibold tracking-[0.2em] text-white/70">
              NAME <span className="text-[#ffc840]">*</span>
            </label>
            <Input
              id="name"
              type="name"
              placeholder="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="w-full rounded-full border border-white/20 bg-transparent px-4 py-3 text-sm text-white placeholder:text-white/40 focus:border-[#ffc840] focus:outline-none"
            />

            <label className="text-xs font-semibold tracking-[0.2em] text-white/70">
              ADDRESS <span className="text-[#ffc840]">*</span>
            </label>
            <AddressSearchField
              id="address"
              value={address}
              onValueChange={setAddress}
            />

            <label className="text-xs font-semibold tracking-[0.2em] text-white/70">
              EXPECTING POSTCARD THEME <span className="text-[#ffc840]">*</span>
            </label>
            <div className="flex flex-wrap gap-3 px-2 rounded-full border border-white/20">
              {["Christmas", "Taiwan"].map((theme) => (
                <label
                  key={theme}
                  className={`flex cursor-pointer items-center gap-2 rounded-full px-4 py-2 text-xs uppercase tracking-[0.2em] ${
                    postcardTheme === theme
                      ? ""
                      : "text-white/70 hover:border-[#ffc840]/60 ring-0"
                  }`}
                >
                  <input
                    type="radio"
                    name="postcardTheme"
                    value={theme}
                    checked={postcardTheme === theme}
                    onChange={() => setPostcardTheme(theme)}
                    className="accent-[#d7665d] w-2 h-2"
                  />
                  {theme}
                </label>
              ))}
            </div>

            <label className="text-xs font-semibold tracking-[0.2em] text-white/70">
              EMAIL or INSTA
            </label>
            <Input
              id="contact"
              type="text"
              placeholder="email or insta (optional)"
              value={contact}
              onChange={(event) => setContact(event.target.value)}
              className="w-full rounded-full border border-white/20 bg-transparent px-4 py-3 text-sm text-white placeholder:text-white/40 focus:border-[#ffc840] focus:outline-none"
            />

            <label className="text-xs font-semibold tracking-[0.2em] text-white/70">
              SONG SUGGESTION
            </label>
            <SongSearchField
              id="songSuggestion"
              value={songSuggestion}
              onValueChange={setSongSuggestion}
            />
            <p className="text-xs px-4">
              All data will be kept private and deleted once the Christmas cards
              are sent.
            </p>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="mt-2 w-full rounded-full bg-[#d7665d] py-3 text-sm font-semibold uppercase tracking-[0.3em] text-[#f8c024] transition hover:bg-[#f8c024] hover:text-[#d7665d] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "SENDING..." : "SEND"}
            </Button>
            <Dialog open={isDialogOpen} onOpenChange={handleDialogChange}>
              <DialogContent className="bg-[#1b0f1a]/90 text-white border-white/10">
                <DialogHeader>
                  {isSuccess ? (
                    <>
                      <DialogTitle className="text-xl tracking-wide text-[#f8c024]">
                        Merry Christmas!
                      </DialogTitle>
                      <DialogDescription className="text-white/80">
                        So happy to celebrate this Christmas with you! Merry
                        Christmas 聖誕快樂
                      </DialogDescription>
                    </>
                  ) : (
                    <>
                      <DialogTitle className="text-xl tracking-wide text-[#f8c024]">
                        Hmm, something is missing
                      </DialogTitle>
                      <DialogDescription className="text-white/80 whitespace-pre-line">
                        {formError ??
                          "Please double check the required fields."}
                      </DialogDescription>
                    </>
                  )}
                </DialogHeader>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button className="w-full rounded-full bg-[#f8c024] text-[#d7665d] hover:bg-[#ffd867]">
                      CLOSE
                    </Button>
                  </DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </form>
        </div>
      </div>
      <h2
        className="absolute top-[5%] left-0 z-10 w-full text-center text-[15vw] uppercase md:text-[14vw] lg:left-[-14%] lg:text-[9vw]"
        data-text="LET'S DO IT!"
      >
        <span className="layered-text banner-title" data-text="LET'S DO IT!">
          LET&apos;s DO IT!
        </span>
      </h2>

      <Image
        src="/graphs/signUp.png"
        alt="Festive friends writing Christmas cards"
        width={2400}
        height={1056}
        priority
        className="pointer-events-none absolute bottom-[10%] lg:bottom-[15%] lg:left-[5%] left-0 z-10 w-full lg:w-[55vw] transform scale-x-[-1] rotate-345"
      />
    </section>
  );
}
