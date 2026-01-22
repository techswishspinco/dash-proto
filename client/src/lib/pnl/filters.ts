import type { PnLFilterState, CuratedViewPrefs, TimeframeType } from "@/data/pnl/filter-options";
import { getDefaultCuratedPrefs } from "@/data/pnl/filter-options";

// Local storage keys
export const PNL_FILTER_KEY = "munch-pnl-filters";
export const CURATED_VIEW_PREFS_KEY = "munch-curated-view-prefs";

// Default filter values
export const getDefaultFilters = (): PnLFilterState => {
  return {
    startDate: "2025-01-01",
    endDate: "2025-09-30",
    timeframe: "Monthly" as TimeframeType,
    pnlStatuses: [],
    ownerStatuses: [],
  };
};

// Load filters from localStorage
export const loadFilters = (): PnLFilterState => {
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem(PNL_FILTER_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
  }
  return getDefaultFilters();
};

// Save filters to localStorage
export const saveFilters = (filters: PnLFilterState) => {
  localStorage.setItem(PNL_FILTER_KEY, JSON.stringify(filters));
};

// Load curated view preferences from localStorage
export const loadCuratedPrefs = (): CuratedViewPrefs => {
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem(CURATED_VIEW_PREFS_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
  }
  return getDefaultCuratedPrefs();
};

// Save curated view preferences to localStorage
export const saveCuratedPrefs = (prefs: CuratedViewPrefs) => {
  localStorage.setItem(CURATED_VIEW_PREFS_KEY, JSON.stringify(prefs));
};
