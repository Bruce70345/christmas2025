"use client";

import { useEffect, useReducer, useState } from "react";

type AddressPrediction = {
  id: string;
  description: string;
  mainText: string;
  secondaryText: string;
};

type PlacesAutocompleteResponse = {
  suggestions?: Array<{
    placePrediction?: {
      placeId?: string;
      text?: {
        text?: string;
      };
      structuredFormat?: {
        mainText?: { text?: string };
        secondaryText?: { text?: string };
      };
    };
  }>;
  status?: string;
  error?: {
    message?: string;
  };
};

type AddressState = {
  results: AddressPrediction[];
  isLoading: boolean;
  error: string | null;
};

type AddressAction =
  | { type: "RESET" }
  | { type: "START" }
  | { type: "SUCCESS"; payload: AddressPrediction[] }
  | { type: "ERROR"; payload: string };

const API_ENDPOINT = "/api/places/autocomplete";

function useDebouncedValue<T>(value: T, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

const initialState: AddressState = {
  results: [],
  isLoading: false,
  error: null,
};

function addressReducer(_: AddressState, action: AddressAction): AddressState {
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

export function useAddressSearch(query: string, debounceMs = 500) {
  const [state, dispatch] = useReducer(addressReducer, initialState);
  const { results, isLoading, error } = state;
  const debouncedQuery = useDebouncedValue(query, debounceMs);

  useEffect(() => {
    const trimmedQuery = debouncedQuery.trim();

    if (trimmedQuery.length < 3) {
      dispatch({ type: "RESET" });
      return;
    }

    const controller = new AbortController();

    dispatch({ type: "START" });

    fetch(API_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        input: trimmedQuery,
        includedPrimaryTypes: ["street_address"],
        languageCode: "en",
        regionCode: "US",
      }),
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) {
          const message = await response.text();
          throw new Error(message || "Failed to search addresses.");
        }
        return response.json() as Promise<PlacesAutocompleteResponse>;
      })
      .then((data) => {
        if (data.status && data.status !== "OK") {
          throw new Error(data.error?.message || `Places API error: ${data.status}`);
        }

        const items: AddressPrediction[] = (data.suggestions ?? [])
          .map((suggestion) => ({
            id: suggestion.placePrediction?.placeId ?? "",
            description:
              suggestion.placePrediction?.text?.text ?? "Unknown address",
            mainText:
              suggestion.placePrediction?.structuredFormat?.mainText?.text ??
              "",
            secondaryText:
              suggestion.placePrediction?.structuredFormat?.secondaryText
                ?.text ?? "",
          }))
          .filter((prediction) => Boolean(prediction.id));

        dispatch({
          type: "SUCCESS",
          payload: items,
        });
      })
      .catch((fetchError: Error) => {
        if (fetchError.name === "AbortError") return;
        dispatch({
          type: "ERROR",
          payload: fetchError.message ?? "Unknown error",
        });
      });

    return () => controller.abort();
  }, [debouncedQuery]);

  return { results, isLoading, error };
}

export type { AddressPrediction };
