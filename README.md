# SkyView - Weather Forecast Application

A responsive weather forecast web application built with HTML, Tailwind CSS, and vanilla JavaScript. SkyView lets you search for any city's weather or use your current location to get real-time weather data and a 5-day forecast, all in a visually dynamic interface that changes with the weather.

## Features

- **City Search** - Type any city name to get its current weather and 5-day forecast
- **Current Location Detection** - One-click geolocation to fetch weather for where you are
- **5-Day Forecast** - Extended forecast displayed in organized cards with temperature, wind, and humidity
- **Temperature Toggle** - Switch between Celsius and Fahrenheit on the current weather display
- **Recently Searched Cities** - Dropdown of your last 5 searches, saved in localStorage, click any to reload
- **Dynamic Backgrounds** - The page background changes based on weather conditions (sunny, rainy, snowy, cloudy, etc.)
- **Weather Animations** - Rain and snow particle effects for immersive experience
- **Extreme Temperature Alerts** - Warning banner for temperatures above 40°C or below -20°C
- **Input Validation** - Prevents empty, numeric-only, or special character searches with clear error messages
- **Custom Error Toasts** - All errors shown as styled popup notifications, never browser alert() dialogs
- **Responsive Design** - Fully responsive for desktop, iPad Mini (768px), and iPhone SE (375px)
- **Glassmorphism UI** - Modern frosted glass card design with smooth animations

## Getting Started

### Prerequisites

- A modern web browser (Chrome, Firefox, Edge, Safari)
- An internet connection (for API calls and Tailwind CDN)
- An OpenWeatherMap API key (free tier works)

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd weather-forecast
   ```

2. **Get an API key**
   - Sign up at [OpenWeatherMap](https://openweathermap.org/api) (free)
   - Go to your API keys section and copy your key

3. **Configure the API key**
   - Open `js/api.js`
   - Replace the value of `API_KEY` on line 8 with your own key:
     ```javascript
     const API_KEY = "your_api_key_here";
     ```

4. **Open the application**
   - Simply open `index.html` in your browser
   - No build step, no npm install, no server required

### Usage

1. **Search by city** - Type a city name in the search bar and press Enter or click the search icon
2. **Use your location** - Click the location pin button to detect your current position
3. **View recent searches** - Click the search input to see a dropdown of your recently searched cities
4. **Toggle temperature** - Click °C or °F next to the temperature to switch units
5. **Clear history** - Click "Clear all" in the recent searches dropdown to remove saved cities

## Project Structure

```
weather-forecast/
├── index.html          # Main HTML page with Tailwind CSS classes
├── css/
│   └── style.css       # Custom CSS: weather backgrounds, animations, glassmorphism
├── js/
│   ├── api.js          # OpenWeatherMap API calls and error handling
│   ├── storage.js      # localStorage management for recent cities
│   ├── ui.js           # DOM rendering, toasts, alerts, background updates
│   └── app.js          # Main app logic, event listeners, input validation
├── .gitignore          # Git ignore rules
└── README.md           # This file
```

## API Reference

This application uses the [OpenWeatherMap API](https://openweathermap.org/api) (free tier):

- **Current Weather** - `/data/2.5/weather` - Real-time weather data
- **5-Day Forecast** - `/data/2.5/forecast` - 3-hour interval forecasts for 5 days
- **Weather Icons** - `openweathermap.org/img/wn/{code}@2x.png` - Condition icons

## Browser Compatibility

Tested and working on:
- Google Chrome (latest)
- Mozilla Firefox (latest)
- Microsoft Edge (latest)
- Safari (latest)

## Technologies Used

- **HTML5** - Semantic markup
- **Tailwind CSS v3** - Utility-first CSS framework (via CDN)
- **Vanilla JavaScript (ES6+)** - No frameworks or libraries
- **OpenWeatherMap API** - Weather data provider
- **Geolocation API** - Browser-native location detection
- **localStorage** - Client-side data persistence
