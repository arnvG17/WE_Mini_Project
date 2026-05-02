# 🌦️ WeatherVue — Dynamic Weather App

A full-stack weather application with dynamic theming that changes the entire UI based on current weather conditions. Built with React + Express.js.

## Features

- 🔍 City search with loading states and error handling
- 🌡️ Current weather display (temp, humidity, wind, sunrise/sunset)
- 📅 5-day forecast with horizontal scrolling cards
- 📊 Temperature trend chart (Chart.js)
- 📆 Historical weather comparison via date picker
- 🌡️ Celsius / Fahrenheit toggle (no re-fetch)
- 💾 Recent searches saved to localStorage
- 📍 Auto-detect user location via Geolocation API
- 🎨 **Dynamic UI themes** — the entire app changes visually based on weather:
  - ☀️ Sunny → warm yellow-orange gradient + sun pulse
  - 🌧️ Rain → dark navy-blue + animated rain drops
  - ☁️ Cloudy → neutral grey + desaturation
  - ❄️ Snow → icy blue-white + drifting snowflakes

## Tech Stack

| Layer    | Tech                          |
|----------|-------------------------------|
| Frontend | React, Axios, Chart.js, CSS   |
| Backend  | Express.js, dotenv, Axios     |
| API      | WeatherAPI.com (free tier)     |

## Setup

### 1. Get a free API key

Sign up at [weatherapi.com](https://www.weatherapi.com/) and grab your API key.

### 2. Configure the backend

```bash
cd backend
cp .env.example .env
```

Open `backend/.env` and paste your key:

```
WEATHER_API_KEY=your_key_here
PORT=5000
```

### 3. Install dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 4. Run the app

```bash
# Terminal 1 — Backend
cd backend
npm run dev

# Terminal 2 — Frontend
cd frontend
npm start
```

Frontend runs on `http://localhost:3000`, backend on `http://localhost:5000`.

## API Endpoints

| Method | Route              | Description                  |
|--------|--------------------|------------------------------|
| GET    | `/current/:city`   | Current weather for a city   |
| GET    | `/forecast/:city`  | 5-day forecast               |
| GET    | `/history/:city`   | Historical data (`?date=YYYY-MM-DD`) |

## Folder Structure

```
├── backend/
│   ├── server.js
│   ├── routes/
│   │   └── weather.js
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   └── index.js
│   └── package.json
└── README.md
```
