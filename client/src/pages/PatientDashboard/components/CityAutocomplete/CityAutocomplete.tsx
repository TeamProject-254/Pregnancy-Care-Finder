import React, { useState, useEffect, useRef } from "react";
import styles from "./CityAutocomplete.module.scss";

interface PlacePrediction {
  text?: {
    text: string;
  };
  structuredFormat?: {
    mainText?: {
      text: string;
    };
    secondaryText?: {
      text: string;
    };
  };
}

interface PlaceAutocompleteSuggestion {
  placePrediction?: PlacePrediction;
}

interface AutocompleteSuggestionsResponse {
  suggestions: PlaceAutocompleteSuggestion[];
}

interface AutocompleteSuggestionsRequest {
  input: string;
  language: string;
  includedRegionCodes: string[];
  includedPrimaryTypes: string[];
}

interface PlacesLibrary {
  AutocompleteSuggestion: {
    fetchAutocompleteSuggestions: (
      request: AutocompleteSuggestionsRequest,
    ) => Promise<AutocompleteSuggestionsResponse>;
  };
}

interface CityAutocompleteProps {
  value?: string;
  onSelectCity: (cityName: string) => void;
  error?: string;
}

export const CityAutocomplete: React.FC<CityAutocompleteProps> = ({
  value = "",
  onSelectCity,
  error,
}) => {
  const [inputValue, setInputValue] = useState<string>(value);
  const [suggestions, setSuggestions] = useState<PlaceAutocompleteSuggestion[]>([]);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [cyrillicWarning, setCyrillicWarning] = useState<boolean>(false);
  const [isCitySelected, setIsCitySelected] = useState<boolean>(Boolean(value));
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [previousValue, setPreviousValue] = useState(value);

  if (value !== previousValue) {
    setPreviousValue(value);
    setInputValue(value);
    setIsCitySelected(Boolean(value));
  }

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent): void => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    if (!apiKey) return;

    const existingScript = document.querySelector(
      'script[src*="maps.googleapis.com/maps/api/js"]',
    );
    if (existingScript) return;

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&v=weekly&libraries=places&language=en&loading=async`;
    script.async = true;
    document.head.appendChild(script);
  }, []);

  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    const text = e.target.value;
    setInputValue(text);

    setIsCitySelected(false);
    onSelectCity("");

    const hasCyrillic = /[а-яіїєґА-ЯІЇЄҐ]/i.test(text);
    if (hasCyrillic) {
      setCyrillicWarning(true);
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    setCyrillicWarning(false);

    if (text.trim().length < 1) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    try {
      if (!window.google?.maps?.importLibrary) return;

      const { AutocompleteSuggestion } =
        (await window.google.maps.importLibrary("places")) as unknown as PlacesLibrary;

      const request: AutocompleteSuggestionsRequest = {
        input: text,
        language: "en",
        includedRegionCodes: ["ua"],
        includedPrimaryTypes: ["locality", "administrative_area_level_3"],
      };

      const { suggestions: results } =
        await AutocompleteSuggestion.fetchAutocompleteSuggestions(request);

      if (results && results.length > 0) {
        const strictlyEnglishResults = results.filter((s: PlaceAutocompleteSuggestion) => {
          const mainText = s.placePrediction?.text?.text || "";
          return !/[а-яіїєґ]/i.test(mainText);
        });

        setSuggestions(strictlyEnglishResults);
        setIsOpen(strictlyEnglishResults.length > 0);
      } else {
        setSuggestions([]);
        setIsOpen(false);
      }
    } catch (err: unknown) {
      console.error("Places API (New) error:", err);
    }
  };

  const handleSelect = (suggestion: PlaceAutocompleteSuggestion): void => {
    const title =
      suggestion.placePrediction?.text?.text ||
      suggestion.placePrediction?.structuredFormat?.mainText?.text ||
      "";

    setInputValue(title);
    setIsCitySelected(true);
    onSelectCity(title);
    setIsOpen(false);
  };

  const handleBlur = (): void => {
    if (!isCitySelected) {
      setInputValue(value);
      if (!value) {
        onSelectCity("");
      }
    }
  };

  return (
    <div
      className={styles.wrapper}
      ref={wrapperRef}
      style={{ position: "relative" }}
    >
      <label htmlFor="geo-search-query" className={styles.label}>
        City / Location
      </label>
      <input
        id="geo-search-query"
        name="geo-search-query"
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onBlur={handleBlur}
        onFocus={() => suggestions.length > 0 && setIsOpen(true)}
        placeholder="e.g. Kyiv, Lviv, Odesa (English only)"
        className={`${styles.input} ${
          error || cyrillicWarning ? styles.inputError : ""
        }`}
        autoComplete="new-password"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
        data-form-type="other"
        data-lpignore="true"
        data-1p-ignore
      />

      {cyrillicWarning && (
        <span className={styles.errorMessage}>
          Please enter city name in English (e.g., "Kyiv", not "Київ").
        </span>
      )}

      {isOpen && suggestions.length > 0 && (
        <ul className={styles.dropdown}>
          {suggestions.map((s: PlaceAutocompleteSuggestion, idx: number) => {
            const mainText = s.placePrediction?.text?.text;
            return (
              <li
                key={idx}
                onMouseDown={() => handleSelect(s)}
                className={styles.dropdownItem}
              >
                {mainText}
              </li>
            );
          })}
        </ul>
      )}

      {error && !cyrillicWarning && (
        <span className={styles.errorMessage}>{error}</span>
      )}
    </div>
  );
};