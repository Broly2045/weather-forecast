// ============================================
// SkyView Weather App - API Module
// Handles all OpenWeatherMap API interactions
// ============================================

const WeatherAPI = (() => {
    
    const API_KEY = "dd89cf9ad6c4244ffa4e7bf50ee52e4d";
    const BASE_URL = "https://api.openweathermap.org/data/2.5";
    const ICON_URL = "https://openweathermap.org/img/wn";

    /**
     * Generic fetch wrapper with error handling
     * @param {string} endpoint - API endpoint URL
     * @returns {Promise<Object>} Parsed JSON response
     */
    async function fetchData(endpoint) {
        try {
            const response = await fetch(endpoint);

            if (!response.ok) {
                // Parse specific error codes from the API
                const errorData = await response.json().catch(() => null);

                if (response.status === 404) {
                    throw new Error("City not found. Please check the spelling and try again.");
                } else if (response.status === 401) {
                    throw new Error("Invalid API key. Please check your configuration.");
                } else if (response.status === 429) {
                    throw new Error("Too many requests. Please wait a moment and try again.");
                } else {
                    throw new Error(
                        errorData?.message || `Failed to fetch weather data (Error ${response.status}).`
                    );
                }
            }

            return await response.json();
        } catch (error) {
            // Network errors (no internet, DNS failure, etc.)
            if (error.name === "TypeError" && error.message.includes("fetch")) {
                throw new Error("Network error. Please check your internet connection.");
            }
            throw error;
        }
    }

    /**
     * Get current weather data by city name
     * @param {string} city - City name (e.g., "London" or "London,UK")
     * @returns {Promise<Object>} Current weather data
     */
    async function getCurrentWeather(city) {
        const url = `${BASE_URL}/weather?q=${encodeURIComponent(city)}&units=metric&appid=${API_KEY}`;
        return fetchData(url);
    }

    /**
     * Get current weather data by geographic coordinates
     * @param {number} lat - Latitude
     * @param {number} lon - Longitude
     * @returns {Promise<Object>} Current weather data
     */
    async function getCurrentWeatherByCoords(lat, lon) {
        const url = `${BASE_URL}/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`;
        return fetchData(url);
    }

    /**
     * Get 5-day / 3-hour forecast by city name
     * @param {string} city - City name
     * @returns {Promise<Object>} Forecast data with list of 3-hour intervals
     */
    async function getForecast(city) {
        const url = `${BASE_URL}/forecast?q=${encodeURIComponent(city)}&units=metric&appid=${API_KEY}`;
        return fetchData(url);
    }

    /**
     * Get 5-day / 3-hour forecast by geographic coordinates
     * @param {number} lat - Latitude
     * @param {number} lon - Longitude
     * @returns {Promise<Object>} Forecast data with list of 3-hour intervals
     */
    async function getForecastByCoords(lat, lon) {
        const url = `${BASE_URL}/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`;
        return fetchData(url);
    }

    /**
     * Search for city name suggestions using the Geocoding API
     * @param {string} query - Partial city name (minimum 2 characters)
     * @param {number} limit - Max number of results (default 5)
     * @returns {Promise<Array>} Array of city objects with name, country, state, lat, lon
     */
    async function getCitySuggestions(query, limit = 5) {
        const url = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(query)}&limit=${limit}&appid=${API_KEY}`;
        return fetchData(url);
    }

    /**
     * Build the full URL for a weather icon
     * @param {string} iconCode - Icon code from API (e.g., "01d", "10n")
     * @returns {string} Full icon URL
     */
    function getIconUrl(iconCode) {
        return `${ICON_URL}/${iconCode}@2x.png`;
    }

    // Public API
    return {
        getCurrentWeather,
        getCurrentWeatherByCoords,
        getForecast,
        getForecastByCoords,
        getCitySuggestions,
        getIconUrl,
    };
})();
