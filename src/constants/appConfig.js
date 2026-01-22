/**
 * Centralized configuration constants.
 * Removes "Magic Numbers" from the codebase and provides a single source of truth.
 */
export const APP_CONFIG = {
    PAGINATION: {
        ITEMS_PER_PAGE: 12,
        FAV_ITEMS_PER_PAGE: 6
    },
    API: {
        BASE_URL: "https://itunes.apple.com/search",
        SEARCH_LIMIT: 50,
        AUTOCOMPLETE_LIMIT: 10,
        TIMEOUT_MS: 5000 // Global timeout safety
    },
    UI: {
        DEBOUNCE_DELAY_MS: 300,
        TOAST_DURATION_MS: 5000,
        SKELETON_COUNT: 8
    }
};
