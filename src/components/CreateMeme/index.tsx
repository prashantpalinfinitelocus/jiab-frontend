"use client";
import React, { useState, useMemo, useEffect } from "react";
import FilterTabs from "../common/FilterTabs";
import MasonryGrid from "./MasonryGrid";
import LoadingModal from "../common/LoadingModal";
import { MemeTemplate } from "@/types/meme";
import { useGetTrendingTemplates, useGetAutocomplete, useSearchTemplates } from "@/api/hooks/MemeHooks";
import { MEME_TEMPLATES, SPRITE_TEMPLATES } from "@/constants";

// The backend has no cap on limit, so ask for far more than the catalog holds to get every template.
const TEMPLATES_LIMIT = 1000;

const CreateMeme = () => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState<string>("");
  const [isUserTyping, setIsUserTyping] = useState<boolean>(false);

  const apiType = "all";

  // Use search API if there's a debounced search query, otherwise use trending
  const shouldUseSearch = debouncedSearchQuery.trim().length > 0;

  const { data: trendingData, isLoading: isTrendingLoading, error: trendingError } = useGetTrendingTemplates(
    { type: apiType, limit: TEMPLATES_LIMIT }
  );

  const { data: searchData, isLoading: isSearchLoading, error: searchError } = useSearchTemplates({
    q: debouncedSearchQuery,
    type: apiType,
    limit: TEMPLATES_LIMIT,
  });

  // Determine which data to use
  const data = shouldUseSearch ? searchData : trendingData;
  const isLoading = shouldUseSearch ? isSearchLoading : isTrendingLoading;
  const error = shouldUseSearch ? searchError : trendingError;

  // Fetch autocomplete suggestions - only when user is actively typing
  const { data: autocompleteData } = useGetAutocomplete({
    q: isUserTyping ? searchQuery : "",
    type: apiType,
    limit: 5
  });

  // Extract suggestions from autocomplete data - only show when user is typing
  const autocompleteSuggestions = useMemo(() => {
    if (!isUserTyping || !autocompleteData?.data) return [];
    return Array.isArray(autocompleteData.data) 
      ? autocompleteData.data.map((item: { name: string }) => item.name)
      : [];
  }, [autocompleteData, isUserTyping]);

  // Debounce search query with 300ms delay - only trigger after 3 letters
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim().length >= 3) {
        // Trigger search after 3 or more letters
        setDebouncedSearchQuery(searchQuery);
      } else if (searchQuery.trim().length === 0) {
        // Clear search if input is empty
        setDebouncedSearchQuery("");
      }
      // If 1-2 letters, don't trigger search (only autocomplete works)
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Handle autocomplete selection - immediately trigger search
  const handleAutocompleteSelect = (value: string) => {
    setIsUserTyping(false);
    setSearchQuery(value);
    setDebouncedSearchQuery(value); // Immediately trigger search
  };

  // Handle tab change - trigger search with tab name if not "All"
  const handleTabChange = (tab: string) => {
    // Ignore empty string (this is called when user types in search)
    if (tab === "") return;
    
    setIsUserTyping(false); // Don't trigger autocomplete when clicking tabs
    if (tab !== "All") {
      // Trigger search with tab name without showing in search input
      setSearchQuery(""); // Clear the search input
      setDebouncedSearchQuery(tab);
    } else {
      // Clear search when going back to All
      setSearchQuery("");
      setDebouncedSearchQuery("");
    }
  };

  // Handle search submit (Enter key) - immediately trigger search even if less than 3 letters
  const handleSearchSubmit = (value: string) => {
    setIsUserTyping(false);
    if (value.trim()) {
      setDebouncedSearchQuery(value.trim()); // Immediately trigger search
    }
  };

  // Handle search input change
  const handleSearchChange = (query: string) => {
    setIsUserTyping(true); // User is actively typing
    setSearchQuery(query);
  };

  // Transform API data to MemeTemplate format
  const filteredTemplates = useMemo(() => {
    // The backend exposes no /templates/* endpoint yet, so fall back to the
    // in-repo template set instead of rendering an empty grid. The category
    // tabs route through the search API, so match them against the local
    // category labels to keep tab filtering working too.
    // A failed request still carries a payload, just not usable templates -
    // Giphy rate limiting the backend returns 500, and the empty list that
    // follows is indistinguishable from a real one. Treat anything that is not
    // a non-empty array as no data, or the grid silently collapses to our own
    // two templates instead of falling back to the local set.
    const apiTemplates =
      Array.isArray(data?.data) && data.data.length > 0 ? data.data : null;

    if (!apiTemplates) {
      let local = MEME_TEMPLATES;
      const query = shouldUseSearch
        ? debouncedSearchQuery.trim().toLowerCase()
        : "";
      if (query) {
        local = local.filter((t) =>
          (t.category ?? "").toLowerCase().includes(query)
        );
      }
      // Ours lead here too: they sit at the end of MEME_TEMPLATES, so without
      // this they would drop below the placeholders whenever the API is empty.
      const localSpriteIds = new Set(SPRITE_TEMPLATES.map((t) => t.id));
      return [
        ...SPRITE_TEMPLATES,
        ...local.filter((t) => !localSpriteIds.has(t.id)),
      ];
    }

    // Transform API templates to MemeTemplate format
    const templates: MemeTemplate[] = apiTemplates
      .map((template: { id: string; url: string; type?: string }) => {
          // Use the type from the API response if available, otherwise GIF
          const type: "GIF" | "Sticker" =
            template.type?.toLowerCase() === "stickers" ? "Sticker" : "GIF";

          return {
            id: template.id,
            type,
            imageURL: template.url,
            category: "All",
          };
        });

    // Our own two templates always lead the grid, whatever the tab or the
    // search: they are ours to show, not results the query happens to return.
    // Any that the API echoes back are dropped so they cannot appear twice.
    const spriteIds = new Set(SPRITE_TEMPLATES.map((t) => t.id));

    // No need to filter the API results here since:
    // - Search results are already filtered by the API
    // - Trending results show all templates (filtered by type dropdown only)
    return [
      ...SPRITE_TEMPLATES,
      ...templates.filter((t) => !spriteIds.has(t.id)),
    ];
  }, [data, shouldUseSearch, debouncedSearchQuery]);

  return (
    <>
      <LoadingModal isOpen={isLoading} text="Loading templates..." />
      <div className="md:text-[20px] text-[14px] font-[500] text-center leading-[100%] md:mb-[40px] mb-[21px]">
        Select a meme of your own choice 👇
      </div>
      <FilterTabs
        placeholder="Find something funny"
        className="flex flex-col gap-[8px] justify-center items-center md:mb-[40px] mb-[24px] w-full max-w-full"
        tabs={[]}
        defaultTab="All"
        onTabChange={handleTabChange}
        onSearchChange={handleSearchChange}
        onSearchSubmit={handleSearchSubmit}
        dropdownOptions={[]}
        autocompleteSuggestions={autocompleteSuggestions}
        onAutocompletSelect={handleAutocompleteSelect}
      />
      {error && !filteredTemplates.length && (
        <div className="text-center text-red-500 mb-4">
          Failed to load templates. Please try again.
        </div>
      )}
      <MasonryGrid 
        templates={filteredTemplates} 
        searchQuery={shouldUseSearch ? debouncedSearchQuery : ""}
      />
    </>
  );
};

export default CreateMeme;