// ============================================
// SkyView Weather App - Main Application Logic
// Orchestrates API calls, UI updates, and user interactions
// ============================================

const App = (() => {
    // --- DOM References ---
    const cityInput = document.getElementById("city-input");
    const searchBtn = document.getElementById("search-btn");
    const locationBtn = document.getElementById("location-btn");
    const clearRecentBtn = document.getElementById("clear-recent-btn");

    // Track current "feels like" temperature in Celsius for unit conversion
    let currentFeelsLikeCelsius = null;

    // --- Input Validation ---

    /**
     * Validate the city name input
     * @param {string} input - Raw user input
     * @returns {{ valid: boolean, value: string, error?: string }}
     */
    function validateCityInput(input) {
        const trimmed = input.trim();

        if (trimmed.length === 0) {
            return { valid: false, value: "", error: "Please enter a city name." };
        }

        if (trimmed.length < 2) {
            return { valid: false, value: trimmed, error: "City name must be at least 2 characters." };
        }

        if (trimmed.length > 100) {
            return { valid: false, value: trimmed, error: "City name is too long." };
        }

        // Allow letters, spaces, hyphens, apostrophes, periods, and commas
        const validPattern = /^[a-zA-ZÀ-ÿ\s\-'.,]+$/;
        if (!validPattern.test(trimmed)) {
            return {
                valid: false,
                value: trimmed,
                error: "City name can only contain letters, spaces, hyphens, and apostrophes.",
            };
        }

        return { valid: true, value: trimmed };
    }

    // --- Core Weather Fetch Logic ---

    /**
     * Fetch and display weather for a given city name
     * @param {string} city - City name to search
     */
    async function searchByCity(city) {
        const validation = validateCityInput(city);
        if (!validation.valid) {
            UI.showError(validation.error);
            return;
        }

        UI.showLoading();

        try {
            // Fetch current weather and forecast in parallel
            const [currentData, forecastData] = await Promise.all([
                WeatherAPI.getCurrentWeather(validation.value),
                WeatherAPI.getForecast(validation.value),
            ]);

            // Store the feels-like temperature for unit conversion
            currentFeelsLikeCelsius = Math.round(currentData.main.feels_like);

            // Render the weather data
            UI.renderCurrentWeather(currentData);
            UI.renderForecast(forecastData);

            // Save to recent cities and update dropdown
            Storage.addRecentCity(currentData.name);
            refreshRecentCitiesDropdown();

            // Clear input
            cityInput.value = "";
        } catch (error) {
            UI.showError(error.message);
        } finally {
            UI.hideLoading();
        }
    }

    /**
     * Fetch and display weather for the user's current geolocation
     */
    async function searchByLocation() {
        if (!navigator.geolocation) {
            UI.showError("Geolocation is not supported by your browser.");
            return;
        }

        UI.showLoading();

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;

                try {
                    const [currentData, forecastData] = await Promise.all([
                        WeatherAPI.getCurrentWeatherByCoords(latitude, longitude),
                        WeatherAPI.getForecastByCoords(latitude, longitude),
                    ]);

                    currentFeelsLikeCelsius = Math.round(currentData.main.feels_like);

                    UI.renderCurrentWeather(currentData);
                    UI.renderForecast(forecastData);

                    Storage.addRecentCity(currentData.name);
                    refreshRecentCitiesDropdown();

                    UI.showToast(`Showing weather for ${currentData.name}`, "success", 3000);
                } catch (error) {
                    UI.showError(error.message);
                } finally {
                    UI.hideLoading();
                }
            },
            (error) => {
                UI.hideLoading();
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        UI.showError("Location access denied. Please allow location access in your browser settings.");
                        break;
                    case error.POSITION_UNAVAILABLE:
                        UI.showError("Location information is unavailable.");
                        break;
                    case error.TIMEOUT:
                        UI.showError("Location request timed out. Please try again.");
                        break;
                    default:
                        UI.showError("An unknown error occurred while getting your location.");
                }
            },
            { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
        );
    }

    // --- Recent Cities Dropdown ---

    /**
     * Refresh the recent cities dropdown with the latest data
     */
    function refreshRecentCitiesDropdown() {
        const cities = Storage.getRecentCities();
        UI.renderRecentCities(cities, (city) => {
            searchByCity(city);
        });
    }

    // --- Event Listeners ---

    // Search button click
    searchBtn.addEventListener("click", () => {
        searchByCity(cityInput.value);
    });

    // Enter key on input field
    cityInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            searchByCity(cityInput.value);
        }
    });

    // Current location button
    locationBtn.addEventListener("click", () => {
        searchByLocation();
    });

    // Show recent cities dropdown when input is focused
    cityInput.addEventListener("focus", () => {
        const cities = Storage.getRecentCities();
        if (cities.length > 0) {
            refreshRecentCitiesDropdown();
            UI.showRecentCities();
        }
    });

    // Hide dropdown when clicking outside
    document.addEventListener("click", (e) => {
        const dropdown = document.getElementById("recent-cities-dropdown");
        const input = cityInput;
        if (!dropdown.contains(e.target) && e.target !== input) {
            UI.hideRecentCities();
        }
    });

    // Clear recent cities
    clearRecentBtn.addEventListener("click", () => {
        Storage.clearRecentCities();
        UI.hideRecentCities();
        UI.showToast("Recent searches cleared.", "info", 2000);
    });

    // Temperature unit toggle - Celsius
    UI.elements.unitCelsius.addEventListener("click", () => {
        UI.setTemperatureUnit("C");
        // Also update feels-like to Celsius
        if (currentFeelsLikeCelsius !== null) {
            UI.elements.currentFeelsLike.textContent = `Feels like ${currentFeelsLikeCelsius}°C`;
        }
    });

    // Temperature unit toggle - Fahrenheit
    UI.elements.unitFahrenheit.addEventListener("click", () => {
        UI.setTemperatureUnit("F");
        // Also update feels-like to Fahrenheit
        if (currentFeelsLikeCelsius !== null) {
            const feelsF = Math.round((currentFeelsLikeCelsius * 9) / 5 + 32);
            UI.elements.currentFeelsLike.textContent = `Feels like ${feelsF}°F`;
        }
    });

    // --- Initialize on page load ---
    function init() {
        refreshRecentCitiesDropdown();
    }

    // Run init when DOM is ready
    init();

    // Public API (for potential external use)
    return {
        searchByCity,
        searchByLocation,
    };
})();
