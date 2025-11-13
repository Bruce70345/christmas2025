"use client";

import { useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import {
  useAddressSearch,
  type AddressPrediction,
} from "@/hooks/useAddressSearch";

type AddressSearchFieldProps = {
  id?: string;
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  className?: string;
};

export function AddressSearchField({
  id = "address",
  value,
  onValueChange,
  placeholder = "Search your address",
  className,
}: AddressSearchFieldProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const blurTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const { results, isLoading, error } = useAddressSearch(value, 500);

  const cancelBlurTimeout = () => {
    if (blurTimeoutRef.current) {
      clearTimeout(blurTimeoutRef.current);
      blurTimeoutRef.current = null;
    }
  };

  const handleSelect = (prediction: AddressPrediction) => {
    onValueChange(prediction.description);
    setIsDropdownOpen(false);
    cancelBlurTimeout();
    inputRef.current?.blur();
  };

  const handleFocus = () => {
    cancelBlurTimeout();
    if (value.trim()) {
      setIsDropdownOpen(true);
    }
  };

  const handleBlur = () => {
    blurTimeoutRef.current = setTimeout(() => {
      setIsDropdownOpen(false);
    }, 150);
  };

  const shouldShowDropdown =
    isDropdownOpen && (isLoading || results.length > 0 || error);

  return (
    <div className={`relative ${className ?? ""}`}>
      <Input
        id={id}
        ref={inputRef}
        type="text"
        value={value}
        placeholder={placeholder}
        className="w-full rounded-full border border-white/20 bg-transparent px-4 py-3 text-sm text-white placeholder:text-white/40 focus:border-[#ffc840] focus:outline-none"
        onFocus={handleFocus}
        onBlur={handleBlur}
        onChange={(event) => {
          const newValue = event.target.value;
          onValueChange(newValue);
          setIsDropdownOpen(Boolean(newValue.trim()));
        }}
        autoComplete="off"
      />
      {shouldShowDropdown && (
        <div className="panel-with-scrollbar absolute left-0 right-0 top-[calc(100%+0.5rem)] z-30 max-h-72 overflow-y-auto rounded-3xl border border-white/20 bg-[#1b0f1a]/95 p-3 text-white shadow-2xl backdrop-blur">
          {isLoading && (
            <p className="px-3 py-2 text-sm text-white/70">
              Searching addresses...
            </p>
          )}
          {!isLoading && error && (
            <p className="px-3 py-2 text-sm text-red-300">{error}</p>
          )}
          {!isLoading && !error && results.length === 0 && (
            <p className="px-3 py-2 text-sm text-white/70">
              No address found. Try another keyword.
            </p>
          )}
          {!isLoading &&
            !error &&
            results.slice(0, 10).map((prediction) => (
              <button
                key={prediction.id}
                type="button"
                className="w-full rounded-2xl px-4 py-3 text-left transition hover:bg-white/10"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => handleSelect(prediction)}
              >
                <p className="text-sm font-semibold">{prediction.mainText}</p>
                <p className="text-xs text-white/70">{prediction.secondaryText}</p>
              </button>
            ))}
        </div>
      )}
    </div>
  );
}
