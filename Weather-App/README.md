# Made by Imran

Giving the Weather details



# 🌤️ SkySense - Weather Dashboard

A beautiful, modern weather application with real-time weather data, dynamic backgrounds, and responsive design. Built with vanilla JavaScript, featuring glassmorphism UI, interactive charts, and automatic theme switching based on weather conditions.

## Features

- 🌤️ Real-time weather data from OpenWeatherMap API
- 🎨 Dynamic backgrounds based on weather and time of day
- 📱 Fully responsive design (iPhone, Samsung, Desktop)
- 📊 Interactive hourly forecast chart
- 📅 10-day weather forecast with visual temperature bars
- 🌙 Day/Night theme switching
- 🌡️ Temperature unit toggle (°C/°F)
- 🎯 Auto-location detection
- ✨ Smooth animations and glassmorphism design

## Setup Instructions

### 1. Get Your API Key

1. Visit [OpenWeatherMap](https://openweathermap.org/api)
2. Sign up for a free account
3. Get your API key from the dashboard

### 2. Configure API Key

1. Copy `api-config.example.js` to `api-config.js`:
   ```bash
   cp api-config.example.js api-config.js
   ```

2. Open `api-config.js` and replace `YOUR_API_KEY_HERE` with your actual API key:
   ```javascript
   API_KEY: "your-actual-api-key-here"
   ```

### 3. Run the Application

Simply open `index.html` in your web browser, or use a local server:

```bash
# Using Python
python -m http.server 8000

# Using Node.js (http-server)
npx http-server

# Using PHP
php -S localhost:8000
```

Then open `http://localhost:8000` in your browser.

## Project Structure

```
Weather/
├── index.html          # Main HTML file
├── style.css          # All styles and responsive design
├── script.js          # Application logic
├── api-config.js      # API configuration (NOT in git)
├── api-config.example.js  # API config template
├── .gitignore        # Git ignore file
└── README.md         # This file
```

## Technologies Used

- **HTML5** - Structure
- **CSS3** - Styling with glassmorphism and animations
- **JavaScript (ES6+)** - Application logic
- **Chart.js** - For hourly forecast visualization
- **Axios** - For API calls
- **OpenWeatherMap API** - Weather data source

## API Usage

The app uses OpenWeatherMap API endpoints:
- Geocoding API (city name → coordinates)
- Current Weather API
- 5-Day Forecast API

## Security Note

⚠️ **Important**: Never commit `api-config.js` to version control. It contains your API key. The file is already added to `.gitignore`.

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## License

This project is open source and available for personal and commercial use.

## Credits

- Weather data provided by [OpenWeatherMap](https://openweathermap.org)
- Icons from OpenWeatherMap
- Fonts: Poppins & Inter from Google Fonts

