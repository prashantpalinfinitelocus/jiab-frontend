"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { ICONS_NAMES } from "@/constants";
import Image from "next/image";

type FilterTabsProps = {
  placeholder?: string;
  tabs?: string[];
  defaultTab?: string;
  onTabChange?: (tab: string) => void;
  onSearchChange?: (value: string) => void;
  onSearchSubmit?: (value: string) => void;
  dropdownOptions?: string[];
  onApplyDropdown?: (selected: string[]) => void;
  className?: string;
  autocompleteSuggestions?: string[];
  onAutocompletSelect?: (value: string) => void;
};

const DEFAULT_TABS = [
  "All",
  "Memelord",
  "Cranky",
  "Goofy",
  "Sad",
  "Gloomy",
  "Funny",
];

const DEFAULT_DROPDOWN_OPTIONS = [
  "All",
  "Memelord",
  "Cranky",
  "Goofy",
  "Sad",
  "Gloomy",
  "Funny",
];

const FilterTabs: React.FC<FilterTabsProps> = ({
  placeholder = "Find something funny",
  tabs = DEFAULT_TABS,
  defaultTab = "All",
  onTabChange,
  onSearchChange,
  onSearchSubmit,
  dropdownOptions = DEFAULT_DROPDOWN_OPTIONS,
  onApplyDropdown,
  className,
  autocompleteSuggestions = [],
  onAutocompletSelect,
}) => {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<string>(defaultTab);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedDropdown, setSelectedDropdown] = useState<string>(defaultTab);
  const [currentSuggestion, setCurrentSuggestion] = useState("");
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Debounce search updates to consumers
  useEffect(() => {
    const t = setTimeout(() => {
      onSearchChange?.(search);
    }, 300);
    return () => clearTimeout(t);
  }, [search, onSearchChange]);

  // Update current suggestion based on autocomplete data
  useEffect(() => {
    if (autocompleteSuggestions.length > 0 && search.trim().length > 0) {
      // Find first suggestion that starts with the search query (case insensitive)
      const searchLower = search.toLowerCase();
      const matchingSuggestion = autocompleteSuggestions.find((suggestion) =>
        suggestion.toLowerCase().startsWith(searchLower)
      );
      setCurrentSuggestion(matchingSuggestion || "");
    } else {
      setCurrentSuggestion("");
    }
  }, [autocompleteSuggestions, search]);

  // Close dropdown on outside click
  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    }
    if (isDropdownOpen) {
      document.addEventListener("mousedown", onClickOutside);
    }
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [isDropdownOpen]);

  const handleDropdownSelection = (opt: string) => {
    setSelectedDropdown(opt);
    onApplyDropdown?.([opt]);
    setIsDropdownOpen(false);
  };

  const handleAcceptSuggestion = () => {
    if (currentSuggestion) {
      setSearch(currentSuggestion);
      onAutocompletSelect?.(currentSuggestion);
      setCurrentSuggestion("");
      setActiveTab("");
      onTabChange?.("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Handle Enter key - submit search
    if (e.key === "Enter") {
      e.preventDefault();
      if (currentSuggestion) {
        // If there's a suggestion, accept it first
        handleAcceptSuggestion();
      }
      // Trigger search submit
      onSearchSubmit?.(search.trim() || currentSuggestion);
    }
    // Accept suggestion on Tab or Right Arrow (if cursor is at the end)
    else if (currentSuggestion && (e.key === "Tab" || e.key === "ArrowRight")) {
      const input = inputRef.current;
      if (
        e.key === "Tab" ||
        (input && input.selectionStart === search.length)
      ) {
        e.preventDefault();
        handleAcceptSuggestion();
      }
    }
  };

  // Get the remaining part of suggestion to display
  const getSuggestionDisplay = () => {
    if (!currentSuggestion || !search) return "";
    const searchLower = search.toLowerCase();
    const suggestionLower = currentSuggestion.toLowerCase();

    if (suggestionLower.startsWith(searchLower)) {
      return currentSuggestion.slice(search.length);
    }
    return "";
  };

  // const isSearchEmpty = search.trim().length === 0

  const pillTabs = useMemo(() => tabs, [tabs]);

  return (
    <div className={className}>
      <div className="flex items-center justify-between md:justify-start gap-[16px] md:w-[533.33px] w-full md:h-[43px] h-auto px-[16px] md:px-0">
        {/* Search */}
        <div className="relative w-full md:flex-1 md:w-auto">
          <div className="relative w-full rounded-[108px] bg-white px-[12px] md:px-[20px] py-[9px] md:py-[12px] border-[1px] border-green leading-[100%]">
            {/* Suggestion overlay */}
            {getSuggestionDisplay() && (
              <div
                className="absolute left-[12px] md:left-[20px] top-[9px] md:top-[12px] pointer-events-none font-[400] text-[12px] md:text-[16px] leading-[100%]"
                aria-hidden="true"
              >
                <span className="invisible">{search}</span>
                <span className="text-gray-400">{getSuggestionDisplay()}</span>
              </div>
            )}

            <input
              ref={inputRef}
              type="text"
              value={search}
              placeholder={placeholder}
              className="relative w-full outline-none border-none bg-transparent font-[400] text-[12px] md:text-[16px] text-[#000] placeholder:text-[#000] pr-[36px] leading-[100%] z-10"
              onChange={(e) => {
                const val = e.target.value;
                setSearch(val);
                if (val.trim().length > 0) {
                  setActiveTab("");
                  onTabChange?.("");
                } else {
                  setActiveTab(defaultTab);
                  onTabChange?.(defaultTab);
                  setCurrentSuggestion("");
                }
              }}
              onKeyDown={handleKeyDown}
            />
            {/* {isSearchEmpty ? ( */}
            <div className="absolute right-[12px] md:right-[20px] top-1/2 -translate-y-1/2 pointer-events-none">
              <Image
                src={`/static/sprite/icons/${ICONS_NAMES.GLASS}.svg`}
                className="w-[14px] h-[14px] md:w-[18px] md:h-[18px]"
                alt={ICONS_NAMES.GLASS}
                width={14}
                height={14}
              />
            </div>
          </div>
        </div>

        {/* Filter button */}
        {dropdownOptions.length > 0 && (
        <div className={`relative flex-shrink-0 ${selectedDropdown === "Gifs" || selectedDropdown === "Stickers" ? "md:w-[133px]" : "md:w-[168px]"}`} ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setIsDropdownOpen((v) => !v)}
            className="w-full flex items-center gap-[8px] rounded-full md:px-[20px] px-[12px] md:py-[12px] py-[12px] border border-green text-black bg-white"
          >
            <span className="text-[14px] md:text-[16px] font-[400] leading-[100%] md:block hidden whitespace-nowrap">
              {selectedDropdown === "Gifs" || selectedDropdown === "Stickers"
                ? "Filter (1)"
                : "Filter"}
            </span>
            <Image
              src={`/static/sprite/icons/${
                isDropdownOpen ? ICONS_NAMES.CROSS : ICONS_NAMES.MEME_FILTER
              }.svg`}
              alt={isDropdownOpen ? ICONS_NAMES.CROSS : ICONS_NAMES.MEME_FILTER}
              width={16}
              height={16}
              className="md:w-[16px] md:h-[16px] w-[12px] h-[12px]"
            />
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-[160px] bg-white border border-black rounded-[10px] z-30 p-[12px]">
              <p className="text-[14px] md:text-[16px] text-[#000] font-[500] mb-[12px]">
                Select Format
              </p>
              <div className="max-h-[240px] overflow-auto flex flex-col gap-[8.81px]">
                {dropdownOptions.map((opt) => (
                  <label
                    key={opt}
                    className="flex items-center gap-[4.4px] rounded cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="meme-format"
                      className="!accent-[#484848]"
                      checked={selectedDropdown === opt}
                      onChange={() => handleDropdownSelection(opt)}
                    />
                    <span className="text-[14px] md:text-[16px] text-[#000]">
                      {opt}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>
        )}
      </div>

      {/* Pills */}
      {pillTabs.length > 0 && (
        <div className="mt-[12px] md:mt-[16px] w-full overflow-hidden">
          <div className="flex md:flex-wrap md:justify-center gap-[10px] md:gap-[12px] overflow-x-auto scrollbar-hide pb-[2px] md:mx-0 mx-4">
            {pillTabs.map((tab) => {
              const isActive = activeTab === tab;
              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => {
                    setActiveTab(tab);
                    onTabChange?.(tab);
                  }}
                  className={`leading-[100%] whitespace-nowrap flex-shrink-0
                    ${
                      isActive
                        ? "px-[16px] py-[8px] rounded-full bg-green text-white text-[12px] md:text-[16px] font-[400]"
                        : "px-[16px] py-[8px] rounded-full border border-green text-black bg-white text-[12px] md:text-[16px] font-[400]"
                    }`}
                >
                  {tab}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterTabs;