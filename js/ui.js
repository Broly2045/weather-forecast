// ============================================
// SkyView Weather App - UI Module
// Handles all DOM manipulation and rendering
// ============================================

const UI = (() => {
    // --- DOM Element References ---
    const elements = {
        body: document.getElementById("app-body"),
        welcomeSection: document.getElementById("welcome-section"),
        weatherSection: document.getElementById("weather-section"),
        currentCity: document.getElementById("current-city"),
        currentDate: document.getElementById("current-date"),
        currentDescription: document.getElementById("current-description"),
        currentIcon: document.getElementById("current-icon"),
        currentTemp: document.getElementById("current-temp"),
        currentFeelsLike: document.getElementById("current-feels-like"),
        currentHumidity: document.getElementById("current-humidity"),
        currentWind: document.getElementById("current-wind"),
        currentPressure: document.getElementById("current-pressure"),
        currentVisibility: document.getElementById("current-visibility"),
        forecastContainer: document.getElementById("forecast-container"),
        recentDropdown: document.getElementById("recent-cities-dropdown"),
        recentList: document.getElementById("recent-cities-list"),
        toastContainer: document.getElementById("toast-container"),
        weatherAlert: document.getElementById("weather-alert"),
        alertMessage: document.getElementById("alert-message"),
        alertClose: document.getElementById("alert-close"),
        loadingOverlay: document.getElementById("loading-overlay"),
        unitCelsius: document.getElementById("unit-celsius"),
        unitFahrenheit: document.getElementById("unit-fahrenheit"),
    };

    // Track the current temperature in Celsius for unit conversion
    let currentTempCelsius = null;
    let currentUnit = "C";

    // --- Utility Functions ---

    /**
     * Format a Unix timestamp to a readable date string
     * @param {number} timestamp - Unix timestamp in seconds
     * @param {Object} options - Intl.DateTimeFormat options
     * @returns {string} Formatted date
     */
    function formatDate(timestamp, options = {}) {
        const date = new Date(timestamp * 1000);
        const defaultOptions = {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        };
        return date.toLocaleDateString("en-US", { ...defaultOptions, ...options });
    }

    /**
     * Format a Unix timestamp to a short day name (e.g., "Mon")
     */
    function formatDay(timestamp) {
        const date = new Date(timestamp * 1000);
        return date.toLocaleDateString("en-US", { weekday: "short" });
    }

    /**
     * Format a Unix timestamp to a short date (e.g., "Jan 15")
     */
    function formatShortDate(timestamp) {
        const date = new Date(timestamp * 1000);
        return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    }

    /**
     * Convert Celsius to Fahrenheit
     */
    function celsiusToFahrenheit(celsius) {
        return (celsius * 9) / 5 + 32;
    }

    // --- Render Functions ---

    /**
     * Render current weather data on the page
     * @param {Object} data - Current weather API response
     */
    function renderCurrentWeather(data) {
        // Save Celsius temperature for unit toggling
        currentTempCelsius = Math.round(data.main.temp);
        currentUnit = "C";

        // Hide welcome, show weather
        elements.welcomeSection.classList.add("hidden");
        elements.weatherSection.classList.remove("hidden");

        // Populate fields
        elements.currentCity.textContent = `${data.name}, ${data.sys.country}`;
        elements.currentDate.textContent = formatDate(data.dt);
        elements.currentDescription.textContent = data.weather[0].description;
        elements.currentIcon.src = WeatherAPI.getIconUrl(data.weather[0].icon);
        elements.currentIcon.alt = data.weather[0].description;
        elements.currentTemp.textContent = `${currentTempCelsius}°`;
        elements.currentFeelsLike.textContent = `Feels like ${Math.round(data.main.feels_like)}°C`;
        elements.currentHumidity.textContent = `${data.main.humidity}%`;
        elements.currentWind.textContent = `${data.wind.speed} m/s`;
        elements.currentPressure.textContent = `${data.main.pressure} hPa`;
        elements.currentVisibility.textContent = data.visibility
            ? `${(data.visibility / 1000).toFixed(1)} km`
            : "N/A";

        // Reset unit toggle buttons to Celsius active
        elements.unitCelsius.classList.add("unit-active");
        elements.unitCelsius.classList.remove("unit-inactive");
        elements.unitFahrenheit.classList.add("unit-inactive");
        elements.unitFahrenheit.classList.remove("unit-active");

        // Update background based on weather condition
        updateBackground(data.weather[0].main, data.weather[0].icon);

        // Check for extreme temperature alert
        checkWeatherAlert(data.main.temp);

        // Animate entry
        const card = document.getElementById("current-weather");
        card.classList.remove("fade-in");
        // Trigger reflow to restart animation
        void card.offsetWidth;
        card.classList.add("fade-in");
    }

    /**
     * Render 5-day forecast from the 3-hour interval data
     * Groups data by day and picks the midday (12:00) reading for each day
     * @param {Object} data - Forecast API response
     */
    function renderForecast(data) {
        elements.forecastContainer.innerHTML = "";

        // Group forecast entries by date
        const dailyMap = {};
        data.list.forEach((entry) => {
            const dateKey = entry.dt_txt.split(" ")[0];
            if (!dailyMap[dateKey]) {
                dailyMap[dateKey] = [];
            }
            dailyMap[dateKey].push(entry);
        });

        // Get today's date string to exclude it
        const todayKey = new Date().toISOString().split("T")[0];

        // Pick the midday reading (closest to 12:00) for each future day
        const dailyForecasts = [];
        Object.keys(dailyMap).forEach((dateKey) => {
            if (dateKey === todayKey) return;
            if (dailyForecasts.length >= 5) return;

            const entries = dailyMap[dateKey];
            // Find the reading closest to 12:00
            let midday = entries[0];
            let minDiff = Infinity;
            entries.forEach((e) => {
                const hour = parseInt(e.dt_txt.split(" ")[1].split(":")[0], 10);
                const diff = Math.abs(hour - 12);
                if (diff < minDiff) {
                    minDiff = diff;
                    midday = e;
                }
            });

            // Calculate daily min and max from all entries
            let tempMin = Infinity;
            let tempMax = -Infinity;
            entries.forEach((e) => {
                if (e.main.temp_min < tempMin) tempMin = e.main.temp_min;
                if (e.main.temp_max > tempMax) tempMax = e.main.temp_max;
            });

            dailyForecasts.push({ ...midday, tempMin, tempMax });
        });

        // Render each forecast card
        dailyForecasts.forEach((day, index) => {
            const card = document.createElement("div");
            card.className = `forecast-card slide-up delay-${index + 1}`;
            card.innerHTML = `
                <p class="text-white/70 text-xs font-semibold uppercase tracking-wider mb-1">${formatDay(day.dt)}</p>
                <p class="text-white/50 text-xs mb-3">${formatShortDate(day.dt)}</p>
                <img src="${WeatherAPI.getIconUrl(day.weather[0].icon)}" alt="${day.weather[0].description}" class="w-12 h-12 mx-auto mb-2 drop-shadow-md">
                <p class="text-white/60 text-xs capitalize mb-3">${day.weather[0].description}</p>
                <div class="space-y-1.5 text-xs">
                    <div class="flex items-center justify-center gap-1.5 text-white/70">
                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                        <span class="font-semibold">${Math.round(day.tempMax)}°</span>
                        <span class="text-white/40">/</span>
                        <span>${Math.round(day.tempMin)}°</span>
                    </div>
                    <div class="flex items-center justify-center gap-1.5 text-white/60">
                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/>
                        </svg>
                        <span>${day.wind.speed} m/s</span>
                    </div>
                    <div class="flex items-center justify-center gap-1.5 text-white/60">
                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"/>
                        </svg>
                        <span>${day.main.humidity}%</span>
                    </div>
                </div>
            `;
            elements.forecastContainer.appendChild(card);
        });
    }

    /**
     * Render the recently searched cities in the dropdown
     * @param {string[]} cities - Array of city names
     * @param {Function} onCityClick - Callback when a city is clicked
     */
    function renderRecentCities(cities, onCityClick) {
        elements.recentList.innerHTML = "";

        if (!cities || cities.length === 0) {
            elements.recentDropdown.classList.add("hidden");
            return;
        }

        cities.forEach((city) => {
            const li = document.createElement("li");
            li.className = "recent-city-item";
            li.innerHTML = `
                <svg class="w-4 h-4 text-white/40 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <span class="flex-1">${city}</span>
                <svg class="w-3.5 h-3.5 text-white/30 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                </svg>
            `;
            li.addEventListener("click", () => {
                onCityClick(city);
                hideRecentCities();
            });
            elements.recentList.appendChild(li);
        });
    }

    /** Show the recent cities dropdown */
    function showRecentCities() {
        const cities = Storage.getRecentCities();
        if (cities.length > 0) {
            elements.recentDropdown.classList.remove("hidden");
        }
    }

    /** Hide the recent cities dropdown */
    function hideRecentCities() {
        elements.recentDropdown.classList.add("hidden");
    }

    // --- Toast Notifications ---

    /**
     * Show a toast notification (replaces JS alert())
     * @param {string} message - Message to display
     * @param {"error"|"success"|"info"} type - Toast type
     * @param {number} duration - Auto-dismiss time in ms (default 4000)
     */
    function showToast(message, type = "error", duration = 4000) {
        const toast = document.createElement("div");
        toast.className = `toast toast-${type}`;

        // Icon based on type
        const icons = {
            error: `<svg class="w-5 h-5 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/></svg>`,
            success: `<svg class="w-5 h-5 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>`,
            info: `<svg class="w-5 h-5 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/></svg>`,
        };

        toast.innerHTML = `${icons[type] || icons.error}<span>${message}</span>`;
        elements.toastContainer.appendChild(toast);

        // Auto-dismiss after duration
        setTimeout(() => {
            toast.classList.add("toast-exit");
            toast.addEventListener("animationend", () => toast.remove());
        }, duration);
    }

    /** Convenience: show error toast */
    function showError(message) {
        showToast(message, "error");
    }

    // --- Weather Alerts ---

    /**
     * Check if the temperature triggers an extreme weather alert
     * @param {number} tempCelsius - Temperature in Celsius
     */
    function checkWeatherAlert(tempCelsius) {
        if (tempCelsius > 40) {
            elements.alertMessage.textContent = `Extreme Heat Warning! Temperature is ${Math.round(tempCelsius)}°C. Stay hydrated and avoid direct sun exposure.`;
            elements.weatherAlert.classList.remove("hidden");
        } else if (tempCelsius < -20) {
            elements.alertMessage.textContent = `Extreme Cold Warning! Temperature is ${Math.round(tempCelsius)}°C. Dress warmly and limit time outdoors.`;
            elements.weatherAlert.classList.remove("hidden");
            elements.weatherAlert.style.background = "rgba(37, 99, 235, 0.95)";
        } else {
            elements.weatherAlert.classList.add("hidden");
            elements.weatherAlert.style.background = "";
        }
    }

    // Close alert when X button is clicked
    elements.alertClose.addEventListener("click", () => {
        elements.weatherAlert.classList.add("hidden");
    });

    // --- Dynamic Background ---

    /**
     * Update the page background based on the weather condition
     * Also adds/removes rain or snow particle animations
     * @param {string} condition - Weather condition main (e.g., "Clear", "Rain")
     * @param {string} icon - Icon code (ends in "n" for night)
     */
    function updateBackground(condition, icon) {
        const body = elements.body;
        const isNight = icon && icon.endsWith("n");

        // Remove all weather classes
        body.className = body.className
            .split(" ")
            .filter((cls) => !cls.startsWith("weather-"))
            .join(" ");

        // Remove existing particle overlays
        document.querySelectorAll(".rain-overlay").forEach((el) => el.remove());

        // Map condition to CSS class
        const conditionLower = condition.toLowerCase();
        const classMap = {
            clear: isNight ? "weather-clear-night" : "weather-clear",
            clouds: "weather-clouds",
            rain: "weather-rain",
            drizzle: "weather-drizzle",
            thunderstorm: "weather-thunderstorm",
            snow: "weather-snow",
            mist: "weather-mist",
            fog: "weather-fog",
            haze: "weather-haze",
            smoke: "weather-smoke",
        };

        const weatherClass = classMap[conditionLower] || "weather-default";
        body.classList.add(weatherClass);

        // Add rain particle effect for rain/drizzle/thunderstorm
        if (["rain", "drizzle", "thunderstorm"].includes(conditionLower)) {
            createRainEffect();
        }

        // Add snow particle effect
        if (conditionLower === "snow") {
            createSnowEffect();
        }
    }

    /** Create animated raindrops overlay */
    function createRainEffect() {
        const overlay = document.createElement("div");
        overlay.className = "rain-overlay";

        for (let i = 0; i < 60; i++) {
            const drop = document.createElement("div");
            drop.className = "raindrop";
            drop.style.left = `${Math.random() * 100}%`;
            drop.style.animationDuration = `${0.5 + Math.random() * 0.5}s`;
            drop.style.animationDelay = `${Math.random() * 2}s`;
            drop.style.opacity = `${0.2 + Math.random() * 0.4}`;
            overlay.appendChild(drop);
        }

        document.body.appendChild(overlay);
    }

    /** Create animated snowflakes overlay */
    function createSnowEffect() {
        const overlay = document.createElement("div");
        overlay.className = "rain-overlay"; // reuse overlay container

        for (let i = 0; i < 40; i++) {
            const flake = document.createElement("div");
            flake.className = "snowflake";
            flake.style.left = `${Math.random() * 100}%`;
            flake.style.width = `${4 + Math.random() * 6}px`;
            flake.style.height = flake.style.width;
            flake.style.animationDuration = `${3 + Math.random() * 4}s`;
            flake.style.animationDelay = `${Math.random() * 3}s`;
            flake.style.opacity = `${0.4 + Math.random() * 0.4}`;
            overlay.appendChild(flake);
        }

        document.body.appendChild(overlay);
    }

    // --- Temperature Unit Toggle ---

    /**
     * Switch the displayed current temperature between °C and °F
     * @param {"C"|"F"} unit - Target unit
     */
    function setTemperatureUnit(unit) {
        if (currentTempCelsius === null) return;
        currentUnit = unit;

        if (unit === "F") {
            const fahrenheit = Math.round(celsiusToFahrenheit(currentTempCelsius));
            elements.currentTemp.textContent = `${fahrenheit}°`;
            elements.currentFeelsLike.textContent = elements.currentFeelsLike.textContent.replace(
                /[\d.-]+°[CF]/,
                `${Math.round(celsiusToFahrenheit(parseFloat(elements.currentFeelsLike.textContent.match(/[\d.-]+/))))}°F`
            );
            elements.unitFahrenheit.classList.add("unit-active");
            elements.unitFahrenheit.classList.remove("unit-inactive");
            elements.unitCelsius.classList.add("unit-inactive");
            elements.unitCelsius.classList.remove("unit-active");
        } else {
            elements.currentTemp.textContent = `${currentTempCelsius}°`;
            elements.unitCelsius.classList.add("unit-active");
            elements.unitCelsius.classList.remove("unit-inactive");
            elements.unitFahrenheit.classList.add("unit-inactive");
            elements.unitFahrenheit.classList.remove("unit-active");
        }
    }

    // --- Loading State ---

    /** Show the loading overlay */
    function showLoading() {
        elements.loadingOverlay.classList.remove("hidden");
    }

    /** Hide the loading overlay */
    function hideLoading() {
        elements.loadingOverlay.classList.add("hidden");
    }

    // Public API
    return {
        renderCurrentWeather,
        renderForecast,
        renderRecentCities,
        showRecentCities,
        hideRecentCities,
        showToast,
        showError,
        updateBackground,
        setTemperatureUnit,
        showLoading,
        hideLoading,
        elements,
    };
})();
