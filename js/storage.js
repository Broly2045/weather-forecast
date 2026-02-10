// ============================================
// SkyView Weather App - Storage Module
// Manages recently searched cities in localStorage
// ============================================

const Storage = (() => {
    const STORAGE_KEY = "skyview_recent_cities";
    const MAX_CITIES = 5;

    /**
     * Retrieve the list of recently searched cities
     * @returns {string[]} Array of city names (most recent first)
     */
    function getRecentCities() {
        try {
            const data = localStorage.getItem(STORAGE_KEY);
            return data ? JSON.parse(data) : [];
        } catch {
            return [];
        }
    }

    /**
     * Add a city to the recent searches list
     * - Moves existing city to the top if already present (no duplicates)
     * - Caps the list at MAX_CITIES entries
     * @param {string} city - City name to add
     */
    function addRecentCity(city) {
        if (!city || typeof city !== "string") return;

        const trimmed = city.trim();
        if (trimmed.length === 0) return;

        let cities = getRecentCities();

        // Remove duplicate (case-insensitive)
        cities = cities.filter(
            (c) => c.toLowerCase() !== trimmed.toLowerCase()
        );

        // Add to beginning (most recent first)
        cities.unshift(trimmed);

        // Enforce max limit
        if (cities.length > MAX_CITIES) {
            cities = cities.slice(0, MAX_CITIES);
        }

        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(cities));
        } catch {
            // localStorage might be full or unavailable; fail silently
        }
    }

    /**
     * Clear all recently searched cities
     */
    function clearRecentCities() {
        try {
            localStorage.removeItem(STORAGE_KEY);
        } catch {
            // fail silently
        }
    }

    // Public API
    return {
        getRecentCities,
        addRecentCity,
        clearRecentCities,
    };
})();
