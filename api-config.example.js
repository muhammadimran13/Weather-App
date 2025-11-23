// API Configuration Template
// Copy this file to api-config.js and add your actual API key

const API_CONFIG = {
  API_KEY: "YOUR_API_KEY_HERE", // Get your API key from https://openweathermap.org/api
  
  // Base URLs
  BASE_URL: "https://api.openweathermap.org",
  ICON_BASE_URL: "https://openweathermap.org/img/wn",
  
  // API Endpoints
  GEOCODE_URL: (city, apiKey) => 
    `${API_CONFIG.BASE_URL}/geo/1.0/direct?q=${encodeURIComponent(city)}&limit=1&appid=${apiKey}`,
  
  CURRENT_WEATHER_URL: (lat, lon, apiKey) => 
    `${API_CONFIG.BASE_URL}/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`,
  
  FORECAST_URL: (lat, lon, apiKey) => 
    `${API_CONFIG.BASE_URL}/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`,
  
  ONE_CALL_URL: (lat, lon, apiKey) => 
    `${API_CONFIG.BASE_URL}/data/3.0/onecall?lat=${lat}&lon=${lon}&exclude=minutely,alerts&units=metric&appid=${apiKey}`,
  
  WEATHER_ICON_URL: (icon) => 
    `${API_CONFIG.ICON_BASE_URL}/${icon}@2x.png`
};


