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
  className?: string;
  inputClassName?: string;
  inputId?: string;
  placeholder?: string;
  showLabel?: boolean;
  suggestedLocation?: string;
  onFocus?: () => void;
  onBlur?: () => void;
}

export const CityAutocomplete: React.FC<CityAutocompleteProps> = ({
  value = "",
  onSelectCity,
  error,
  className,
  inputClassName,
  inputId = "geo-search-query",
  placeholder = "e.g. Kyiv, Lviv, Odesa (English only)",
  showLabel = false,
  suggestedLocation = "",
  onFocus,
  onBlur,
}) => {
  const [inputValue, setInputValue] = useState<string>(value);
  const [suggestions, setSuggestions] = useState<PlaceAutocompleteSuggestion[]>(
    [],
  );
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [cyrillicWarning, setCyrillicWarning] = useState<boolean>(false);
  const [isCitySelected, setIsCitySelected] = useState<boolean>(Boolean(value));
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [previousValue, setPreviousValue] = useState(value);
  const canSuggestSavedLocation = Boolean(
    suggestedLocation && suggestedLocation.trim().toLowerCase() !== inputValue.trim().toLowerCase(),
  );

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
    if (suggestedLocation && document.activeElement === wrapperRef.current?.querySelector("input")) {
      setIsOpen(true);
    }
  }, [suggestedLocation]);

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

  const handleInputChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ): Promise<void> => {
    const text = e.target.value;
    setInputValue(text);

    setIsCitySelected(false);
    onSelectCity("");

    const hasCyrillic = /[а-яіїєґА-ЯІЇЄҐ]/i.test(text);
    if (hasCyrillic) {
      setCyrillicWarning(true);
      setSuggestions([]);
      setIsOpen(Boolean(suggestedLocation));
      return;
    }

    setCyrillicWarning(false);

    if (text.trim().length < 1) {
      setSuggestions([]);
      setIsOpen(Boolean(suggestedLocation));
      return;
    }

    try {
      if (!window.google?.maps?.importLibrary) return;

      const { AutocompleteSuggestion } =
        (await window.google.maps.importLibrary(
          "places",
        )) as unknown as PlacesLibrary;

      const request: AutocompleteSuggestionsRequest = {
        input: text,
        language: "en",
        includedRegionCodes: ["ua"],
        includedPrimaryTypes: ["locality", "administrative_area_level_3"],
      };

      const { suggestions: results } =
        await AutocompleteSuggestion.fetchAutocompleteSuggestions(request);

      if (results && results.length > 0) {
        const strictlyEnglishResults = results.filter(
          (s: PlaceAutocompleteSuggestion) => {
            const mainText = s.placePrediction?.text?.text || "";
            return !/[а-яіїєґ]/i.test(mainText);
          },
        );

        setSuggestions(strictlyEnglishResults);
        setIsOpen(strictlyEnglishResults.length > 0 || Boolean(suggestedLocation));
      } else {
        setSuggestions([]);
        setIsOpen(Boolean(suggestedLocation));
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

  const handleSelectSavedLocation = (): void => {
    const savedLocation = suggestedLocation.trim();
    setInputValue(savedLocation);
    setIsCitySelected(true);
    onSelectCity(savedLocation);
    setIsOpen(false);
  };

  const handleBlur = (): void => {
    onBlur?.();
    if (!isCitySelected) {
      setInputValue(value);
      if (!value) {
        onSelectCity("");
      }
    }
  };

  return (
    <div className={`${styles.wrapper} ${className || ""}`} ref={wrapperRef}>
      {showLabel && (
        <label htmlFor="geo-search-query" className={styles.label}>
          City / Location
        </label>
      )}

      <input
        id={inputId}
        name="custom-city-search-field"
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onBlur={handleBlur}
        onFocus={() => {
          onFocus?.();
          if (suggestions.length > 0 || canSuggestSavedLocation) setIsOpen(true);
        }}
        placeholder={placeholder}
        className={`${styles.input} ${
          error || cyrillicWarning ? styles.inputError : ""
        } ${inputClassName || ""}`}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
        role="presentation"
        aria-autocomplete="list"
      />

      {cyrillicWarning && (
        <span className={styles.errorMessage}>
          Please enter city name in English (e.g., "Kyiv", not "Київ").
        </span>
      )}

      {isOpen && (suggestions.length > 0 || canSuggestSavedLocation) && (
        <ul className={styles.dropdown}>
          {canSuggestSavedLocation && (
            <li
              key="saved-location"
              onMouseDown={(event) => {
                event.preventDefault();
                handleSelectSavedLocation();
              }}
              className={`${styles.dropdownItem} ${styles.savedLocationItem}`}
            >
              <span className={styles.savedLocationHint}>Use your profile location</span>
              <span>{suggestedLocation}</span>
            </li>
          )}
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
