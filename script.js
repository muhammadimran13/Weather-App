// ============================================
// State Management
// ============================================
let currentUnit = 'metric';
let currentTheme = 'day';
let currentWeatherData = null;
let hourlyChart = null;

// ============================================
// DOM Elements
// ============================================
const cityInput = document.getElementById('cityInput');
const searchBtn = document.getElementById('searchBtn');
const locationBtn = document.getElementById('locationBtn');
const cityName = document.getElementById('cityName');
const dateTime = document.getElementById('dateTime');
const currentTemp = document.getElementById('currentTemp');
const currentCondition = document.getElementById('currentCondition');
const extraInfo = document.getElementById('extraInfo');
const windSpeed = document.getElementById('windSpeed');
const humidity = document.getElementById('humidity');
const visibility = document.getElementById('visibility');
const pressure = document.getElementById('pressure');
const hourlyScroll = document.getElementById('hourlyScroll');
const hourlyChartCanvas = document.getElementById('hourlyChart');
const forecastList = document.getElementById('forecastList');
const lastUpdated = document.getElementById('lastUpdated');
const errorMsg = document.getElementById('errorMsg');
const unitToggle = document.getElementById('unitToggle');
const themeToggle = document.getElementById('themeToggle');
const weatherIllustration = document.getElementById('weatherIllustration');
const heroSection = document.getElementById('heroSection');
const appLogo = document.getElementById('appLogo');

// ============================================
// Initialize App
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  updateDateTime();
  setInterval(updateDateTime, 1000);
  setupEventListeners();
  initializeToggles();
  getCurrentLocation();
});

// ============================================
// Event Listeners Setup
// ============================================
function setupEventListeners() {
  searchBtn.addEventListener('click', () => {
    if (cityInput.value.trim()) {
      handleSearch();
    } else {
      cityInput.focus();
    }
  });
  
  cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  });
  
  locationBtn.addEventListener('click', getCurrentLocation);
  unitToggle.addEventListener('click', toggleUnit);
  themeToggle.addEventListener('click', toggleTheme);
}

function initializeToggles() {
  unitToggle.textContent = '°C';
  themeToggle.textContent = '🌙';
}

// ============================================
// Date & Time Update
// ============================================
function updateDateTime() {
  const now = new Date();
  const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const timeOptions = { hour: '2-digit', minute: '2-digit', second: '2-digit' };
  const dateStr = now.toLocaleDateString('en-US', dateOptions);
  const timeStr = now.toLocaleTimeString('en-US', timeOptions);
  dateTime.textContent = `${dateStr} • ${timeStr}`;
}

// ============================================
// Get Current Location
// ============================================
function getCurrentLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        fetchWeatherByCoords(latitude, longitude);
      },
      (error) => {
        console.log('Geolocation error:', error);
        // Default to Bahawalpur if geolocation fails
        handleSearch('Bahawalpur');
      }
    );
  } else {
    // Default to Bahawalpur if geolocation not supported
    handleSearch('Bahawalpur');
  }
}

// ============================================
// Handle Search
// ============================================
async function handleSearch(cityName = null) {
  const city = cityName || cityInput.value.trim();
  
  if (!city) {
    showError('Please enter a city name');
    return;
  }
  
  try {
    showLoading(true);
    hideError();
    
    // Use fetch() for geocoding
    const coords = await getCoordsWithFetch(city);
    if (!coords) {
      throw new Error('City not found');
    }
    
    // Use axios() for weather data
    await fetchWeatherDataWithAxios(coords.lat, coords.lon, coords.name, coords.country);
    
  } catch (error) {
    showError(error.message || 'Failed to fetch weather data. Please try again.');
    console.error('Error:', error);
  } finally {
    showLoading(false);
  }
}

// ============================================
// Get Coordinates using fetch()
// ============================================
async function getCoordsWithFetch(city) {
  try {
    const url = API_CONFIG.GEOCODE_URL(city, API_CONFIG.API_KEY);
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error('Failed to fetch location data');
    }
    
    const data = await response.json();
    
    if (!data || data.length === 0) {
      throw new Error('City not found. Please check the spelling.');
    }
    
    return {
      lat: data[0].lat,
      lon: data[0].lon,
      name: data[0].name,
      country: data[0].country
    };
  } catch (error) {
    throw new Error('Invalid city name. Please try again.');
  }
}

// ============================================
// Fetch Weather by Coordinates
// ============================================
async function fetchWeatherByCoords(lat, lon) {
  try {
    showLoading(true);
    hideError();
    
    // Reverse geocoding to get city name
    const geoUrl = `${API_CONFIG.BASE_URL}/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${API_CONFIG.API_KEY}`;
    const geoResponse = await fetch(geoUrl);
    const geoData = await geoResponse.json();
    
    const cityNameValue = geoData[0]?.name || 'Unknown';
    const country = geoData[0]?.country || '';
    
    await fetchWeatherDataWithAxios(lat, lon, cityNameValue, country);
    
  } catch (error) {
    showError(error.message || 'Failed to fetch weather data.');
    console.error('Error:', error);
  } finally {
    showLoading(false);
  }
}

// ============================================
// Fetch Weather Data using axios()
// ============================================
async function fetchWeatherDataWithAxios(lat, lon, cityNameValue, country) {
  try {
    const unitParam = currentUnit === 'metric' ? 'metric' : 'imperial';
    
    // Fetch current weather and forecast using axios
    const [currentResponse, forecastResponse] = await Promise.all([
      axios.get(`${API_CONFIG.BASE_URL}/data/2.5/weather?lat=${lat}&lon=${lon}&units=${unitParam}&appid=${API_CONFIG.API_KEY}`),
      axios.get(`${API_CONFIG.BASE_URL}/data/2.5/forecast?lat=${lat}&lon=${lon}&units=${unitParam}&appid=${API_CONFIG.API_KEY}`)
    ]);
    
    const currentData = currentResponse.data;
    const forecastData = forecastResponse.data;
    
    currentWeatherData = {
      current: currentData,
      forecast: forecastData,
      location: { name: cityNameValue, country }
    };
    
    updateUI(currentData, forecastData, cityNameValue, country);
    updateDynamicBackground(currentData);
    updateLogo(currentData);
    
  } catch (error) {
    if (error.response) {
      throw new Error(`API Error: ${error.response.data.message || 'Failed to fetch weather'}`);
    } else {
      throw new Error('Network error. Please check your connection.');
    }
  }
}

// ============================================
// Update UI
// ============================================
function updateUI(currentData, forecastData, cityNameValue, country) {
  // Update location
  cityName.textContent = `${cityNameValue}, ${country}`;
  
  // Update main weather with count animation
  const temp = Math.round(currentData.main.temp);
  const feelsLike = Math.round(currentData.main.feels_like);
  const tempMax = Math.round(currentData.main.temp_max);
  const tempMin = Math.round(currentData.main.temp_min);
  
  animateValue(currentTemp, temp, '°');
  currentCondition.textContent = currentData.weather[0].description;
  extraInfo.textContent = `Feels like ${feelsLike}° · H:${tempMax}° · L:${tempMin}°`;
  
  // Update weather icon
  const icon = currentData.weather[0].icon;
  const iconUrl = API_CONFIG.WEATHER_ICON_URL(icon);
  
  // Update illustration background
  updateWeatherIllustration(currentData.weather[0].main, icon);
  
  // Update logo based on weather and time
  updateLogo(currentData);
  
  // Update stats
  const wind = currentData.wind?.speed || 0;
  const windUnit = currentUnit === 'metric' ? 'km/h' : 'mph';
  const windValue = currentUnit === 'metric' ? Math.round(wind * 3.6) : Math.round(wind * 2.237);
  
  windSpeed.textContent = `${windValue} ${windUnit}`;
  humidity.textContent = `${currentData.main.humidity}%`;
  pressure.textContent = `${currentData.main.pressure} hPa`;
  
  const vis = currentData.visibility ? (currentData.visibility / 1000).toFixed(1) : 'N/A';
  const visUnit = currentUnit === 'metric' ? 'km' : 'mi';
  const visValue = vis !== 'N/A' ? (currentUnit === 'metric' ? vis : (vis * 0.621371).toFixed(1)) : 'N/A';
  visibility.textContent = visValue !== 'N/A' ? `${visValue} ${visUnit}` : 'N/A';
  
  // Update hourly forecast
  updateHourlyForecast(forecastData);
  
  // Update 10-day forecast
  updateForecastList(forecastData);
  
  // Update last updated time
  const now = new Date();
  const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  lastUpdated.textContent = `Last updated: ${timeStr}`;
}

// ============================================
// Animate Value (Count Up Effect)
// ============================================
function animateValue(element, target, suffix = '') {
  const start = parseInt(element.textContent) || 0;
  const duration = 800;
  const startTime = performance.now();
  
  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const easeOut = 1 - Math.pow(1 - progress, 3);
    const current = Math.round(start + (target - start) * easeOut);
    
    element.textContent = `${current}${suffix}`;
    
    if (progress < 1) {
      requestAnimationFrame(update);
    }
  }
  
  requestAnimationFrame(update);
}

// ============================================
// Update Weather Illustration
// ============================================
function updateWeatherIllustration(weatherMain, icon) {
  const weatherType = weatherMain.toLowerCase();
  let emoji = '☀️';
  
  if (weatherType.includes('clear')) {
    emoji = icon.includes('d') ? '☀️' : '🌙';
  } else if (weatherType.includes('cloud')) {
    emoji = '☁️';
  } else if (weatherType.includes('rain')) {
    emoji = '🌧️';
  } else if (weatherType.includes('thunderstorm')) {
    emoji = '⛈️';
  } else if (weatherType.includes('snow')) {
    emoji = '❄️';
  } else if (weatherType.includes('mist') || weatherType.includes('fog')) {
    emoji = '🌫️';
  }
  
  weatherIllustration.textContent = emoji;
  weatherIllustration.style.fontSize = '200px';
  weatherIllustration.style.opacity = '0.2';
}

// ============================================
// Update Hourly Forecast
// ============================================
function updateHourlyForecast(forecastData) {
  // Clear previous
  hourlyScroll.innerHTML = '';
  
  // Get next 12 hours (4 forecasts, 3-hour intervals)
  const hourlyItems = forecastData.list.slice(0, 12);
  
  hourlyItems.forEach(item => {
    const hourItem = document.createElement('div');
    hourItem.className = 'hourly-item';
    
    const date = new Date(item.dt * 1000);
    const time = date.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true });
    const temp = Math.round(item.main.temp);
    const icon = item.weather[0].icon;
    
    hourItem.innerHTML = `
      <div class="hourly-time">${time}</div>
      <img src="${API_CONFIG.WEATHER_ICON_URL(icon)}" alt="${item.weather[0].description}" class="hourly-icon">
      <div class="hourly-temp">${temp}°</div>
    `;
    
    hourlyScroll.appendChild(hourItem);
  });
  
  // Update Chart
  updateHourlyChart(hourlyItems);
}

// ============================================
// Update Hourly Chart
// ============================================
function updateHourlyChart(hourlyItems) {
  const labels = hourlyItems.map(item => {
    const date = new Date(item.dt * 1000);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true });
  });
  
  const temps = hourlyItems.map(item => Math.round(item.main.temp));
   const minTemp = Math.min(...temps);
  const maxTemp = Math.max(...temps);
  const padding = (maxTemp - minTemp) * 0.2;
  
  const ctx = hourlyChartCanvas.getContext('2d');
  
  if (hourlyChart) {
    hourlyChart.destroy();
  }
  
  hourlyChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: 'Temperature',
        data: temps,
        borderColor: 'rgba(255, 255, 255, 0.9)',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: 'rgba(255, 255, 255, 1)',
        pointBorderColor: 'rgba(255, 255, 255, 1)',
        pointBorderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          padding: 12,
          titleFont: {
            family: 'Poppins',
            size: 14
          },
          bodyFont: {
            family: 'Poppins',
            size: 14
          },
          displayColors: false
        }
      },
      scales: {
        y: {
          beginAtZero: false,
          min: minTemp - padding,
          max: maxTemp + padding,
          ticks: {
            color: 'rgba(255, 255, 255, 0.8)',
            font: {
              family: 'Poppins',
              size: 12
            }
          },
          grid: {
            color: 'rgba(255, 255, 255, 0.1)'
          }
        },
        x: {
          ticks: {
            color: 'rgba(255, 255, 255, 0.8)',
            font: {
              family: 'Poppins',
              size: 12
            }
          },
          grid: {
            color: 'rgba(255, 255, 255, 0.1)'
          }
        }
      }
    }
  });
}

// ============================================
// Update 10-Day Forecast List
// ============================================
function updateForecastList(forecastData) {
  forecastList.innerHTML = '';
  
  // Group forecasts by day
  const dailyData = {};
  
  forecastData.list.forEach(item => {
    const date = new Date(item.dt * 1000);
    const dayKey = date.toDateString();
    
    if (!dailyData[dayKey]) {
      dailyData[dayKey] = {
        date: date,
        temps: [],
        weather: item.weather[0],
        icon: item.weather[0].icon,
        rain: item.rain ? item.rain['3h'] : 0
      };
    }
    
    dailyData[dayKey].temps.push(item.main.temp);
    if (item.rain && item.rain['3h']) {
      dailyData[dayKey].rain = Math.max(dailyData[dayKey].rain, item.rain['3h']);
    }
  });
  
  // Get next 10 days
  const days = Object.values(dailyData).slice(0, 10);
  const allTemps = days.flatMap(day => day.temps);
  const globalMin = Math.min(...allTemps);
  const globalMax = Math.max(...allTemps);
  const tempRange = globalMax - globalMin;
  
  days.forEach((day, index) => {
    const forecastItem = document.createElement('div');
    forecastItem.className = 'forecast-item';
    
    const dayName = day.date.toLocaleDateString('en-US', { weekday: 'short' });
    const dateStr = day.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const tempMax = Math.round(Math.max(...day.temps));
    const tempMin = Math.round(Math.min(...day.temps));
    const tempCurrent = Math.round(day.temps[0]);
    
    // Calculate bar width (percentage of range)
    const barWidth = ((tempMax - globalMin) / tempRange) * 100;
    const dotPosition = ((tempCurrent - globalMin) / tempRange) * 100;
    const rainChance = day.rain > 0 ? Math.round((day.rain / 10) * 100) : 0;
    
    forecastItem.innerHTML = `
      <div class="forecast-day">
        <div>${dayName}</div>
        <div class="forecast-date">${dateStr}</div>
      </div>
      <div class="forecast-icon-container">
        <img src="${API_CONFIG.WEATHER_ICON_URL(day.icon)}" alt="${day.weather.description}" class="forecast-icon">
        ${rainChance > 0 ? `<div class="forecast-rain">${rainChance}%</div>` : '<div class="forecast-rain">-</div>'}
      </div>
      <div class="forecast-temp-bar-container">
        <div class="temp-bar">
          <div class="temp-bar-fill" style="width: ${barWidth}%"></div>
          <div class="temp-bar-dot" style="left: ${dotPosition}%"></div>
        </div>
      </div>
      <div class="forecast-temps">
        <span class="temp-max">${tempMax}°</span>
        <span class="temp-min">${tempMin}°</span>
      </div>
    `;
    
    forecastItem.style.animationDelay = `${index * 0.1}s`;
    forecastList.appendChild(forecastItem);
  });
}

// ============================================
// Update Logo Based on Weather and Time
// ============================================
function updateLogo(weatherData) {
  if (!appLogo) return;
  
  const weatherMain = weatherData.weather[0].main.toLowerCase();
  const hour = new Date().getHours();
  const icon = weatherData.weather[0].icon;
  
  // Determine time of day
  const isDay = hour >= 6 && hour < 18;
  const isNight = hour >= 18 || hour < 6;
  
  let logoEmoji = '🌤️'; // Default
  let isSunLogo = false;
  
  // Clear weather
  if (weatherMain.includes('clear')) {
    if (isNight || icon.includes('n')) {
      // Night clear - Moon
      logoEmoji = '🌙';
      appLogo.classList.remove('sun-logo');
    } else {
      // Day clear - Sun with rays
      logoEmoji = '☀️';
      isSunLogo = true;
      appLogo.classList.add('sun-logo');
    }
  } else {
    appLogo.classList.remove('sun-logo');
    
    if (weatherMain.includes('cloud')) {
      if (isNight || icon.includes('n')) {
        logoEmoji = '☁️';
      } else {
        logoEmoji = '⛅';
      }
    } else if (weatherMain.includes('rain') || weatherMain.includes('drizzle')) {
      logoEmoji = '🌧️';
    } else if (weatherMain.includes('thunderstorm')) {
      logoEmoji = '⛈️';
    } else if (weatherMain.includes('snow')) {
      logoEmoji = '❄️';
    } else if (weatherMain.includes('mist') || weatherMain.includes('fog')) {
      logoEmoji = '🌫️';
    }
  }
  
  appLogo.innerHTML = `${logoEmoji} SkySense`;
}

// ============================================
// Update Dynamic Background
// ============================================
function updateDynamicBackground(weatherData) {
  const weatherMain = weatherData.weather[0].main.toLowerCase();
  const hour = new Date().getHours();
  
  // Determine time of day
  // Day: 6 AM - 4 PM (6-16)
  // Evening: 4 PM - 7 PM (16-19)
  // Night: 7 PM - 6 AM (19-6)
  const isDay = hour >= 6 && hour < 16;
  const isEvening = hour >= 16 && hour < 19;
  const isNight = hour >= 19 || hour < 6;
  
  // Remove all weather classes
  document.body.className = '';
  
  // Set background based on time and weather
  if (weatherMain.includes('thunderstorm')) {
    document.body.className = 'weather-thunderstorm';
  } else if (weatherMain.includes('snow')) {
    document.body.className = 'weather-snow';
  } else if (isNight) {
    // Night backgrounds
    if (weatherMain.includes('clear') || weatherMain.includes('sun')) {
      document.body.className = 'weather-night-clear';
    } else if (weatherMain.includes('cloud')) {
      document.body.className = 'weather-night-clouds';
    } else if (weatherMain.includes('rain') || weatherMain.includes('drizzle')) {
      document.body.className = 'weather-night-rain';
    } else {
      document.body.className = 'weather-night';
    }
  } else if (isEvening) {
    // Evening/Sunset backgrounds
    if (weatherMain.includes('clear') || weatherMain.includes('sun')) {
      document.body.className = 'weather-evening';
    } else if (weatherMain.includes('cloud')) {
      document.body.className = 'weather-evening-clouds';
    } else if (weatherMain.includes('rain') || weatherMain.includes('drizzle')) {
      document.body.className = 'weather-evening-rain';
    } else {
      document.body.className = 'weather-sunset';
    }
  } else {
    // Day backgrounds
    if (weatherMain.includes('clear') || weatherMain.includes('sun')) {
      document.body.className = 'weather-day-clear';
    } else if (weatherMain.includes('cloud')) {
      document.body.className = 'weather-day-clouds';
    } else if (weatherMain.includes('rain') || weatherMain.includes('drizzle')) {
      document.body.className = 'weather-day-rain';
    } else {
      document.body.className = 'weather-day-clear';
    }
  }
  
  // Fallback to default if no class set
  if (!document.body.className) {
    document.body.className = 'weather-default';
  }
}

// ============================================
// Toggle Unit
// ============================================
function toggleUnit() {
  currentUnit = currentUnit === 'metric' ? 'imperial' : 'metric';
  unitToggle.textContent = currentUnit === 'metric' ? '°C' : '°F';
  
  if (currentWeatherData) {
    const { lat, lon } = currentWeatherData.current.coord;
    const { name, country } = currentWeatherData.location;
    fetchWeatherDataWithAxios(lat, lon, name, country);
  }
}

// ============================================
// Toggle Theme
// ============================================
function toggleTheme() {
  currentTheme = currentTheme === 'day' ? 'night' : 'day';
  themeToggle.textContent = currentTheme === 'day' ? '🌙' : '🌞';
  
  // Manually override background
  if (currentTheme === 'night') {
    document.body.className = 'weather-night';
  } else if (currentWeatherData) {
    updateDynamicBackground(currentWeatherData.current);
  }
}

// ============================================
// Error Handling
// ============================================
function showError(message) {
  errorMsg.textContent = message;
  errorMsg.classList.add('show');
  
  setTimeout(() => {
    hideError();
  }, 5000);
}

function hideError() {
  errorMsg.classList.remove('show');
}

// ============================================
// Loading State
// ============================================
function showLoading(loading) {
  const app = document.querySelector('.weather-app');
  if (loading) {
    app.style.opacity = '0.6';
    app.style.pointerEvents = 'none';
  } else {
    app.style.opacity = '1';
    app.style.pointerEvents = 'auto';
  }
}
