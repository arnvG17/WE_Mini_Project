/**
 * Weather Routes
 * 
 * Optimized for a single-call dashboard experience.
 * GET /dashboard/:city — returns a comprehensive, cleaned weather object.
 */

const express = require('express');
const axios = require('axios');
const router = express.Router();

const API_KEY = process.env.WEATHER_API_KEY;
const BASE_URL = 'https://api.weatherapi.com/v1';

// --------------- Helper: classify weather condition ---------------
function classifyCondition(conditionText, tempC) {
  const text = conditionText.toLowerCase();

  // 1. Extreme Heat
  if (tempC >= 35) return 'heatwave';

  // 2. Clear/Sunny
  if (text.includes('sunny') || text.includes('clear')) return 'clear';

  // 3. Storms
  if (text.includes('thunder') || text.includes('storm')) return 'storm';

  // 4. Precipitation
  if (text.includes('snow') || text.includes('sleet') || text.includes('blizzard') || text.includes('ice')) return 'snow';
  if (text.includes('rain') || text.includes('drizzle') || text.includes('shower')) return 'rain';

  // 5. Atmospheric/Visibility
  if (text.includes('mist') || text.includes('fog') || text.includes('haze') || text.includes('smoke')) return 'mist';
  if (text.includes('dust') || text.includes('sand') || text.includes('ash')) return 'dust';

  // 6. Temperature-based (Chilly)
  if (tempC <= 15) return 'chilly';

  // 7. General Cloudiness
  if (text.includes('cloud') || text.includes('overcast')) return 'clouds';

  return 'clear';
}

// --------------- Helpers: Beaufort Scale ---------------
function getBeaufort(kph) {
  if (kph < 1) return { force: 0, label: 'Calm' };
  if (kph <= 5) return { force: 1, label: 'Light air' };
  if (kph <= 11) return { force: 2, label: 'Light breeze' };
  if (kph <= 19) return { force: 3, label: 'Gentle breeze' };
  if (kph <= 28) return { force: 4, label: 'Moderate breeze' };
  if (kph <= 38) return { force: 5, label: 'Fresh breeze' };
  if (kph <= 49) return { force: 6, label: 'Strong breeze' };
  if (kph <= 61) return { force: 7, label: 'Near gale' };
  if (kph <= 74) return { force: 8, label: 'Gale' };
  if (kph <= 88) return { force: 9, label: 'Strong gale' };
  if (kph <= 102) return { force: 10, label: 'Storm' };
  if (kph <= 117) return { force: 11, label: 'Violent storm' };
  return { force: 12, label: 'Hurricane' };
}

// --------------- Helpers: UV Label ---------------
function getUvLabel(uv) {
  if (uv <= 2) return 'Low';
  if (uv <= 5) return 'Moderate';
  if (uv <= 7) return 'High';
  if (uv <= 10) return 'Very High';
  return 'Extreme';
}

// --------------- Helpers: AQI Mapping ---------------
function getAqiDetails(epaIndex) {
  const mapping = {
    1: { score: 50, label: 'Good' },
    2: { score: 100, label: 'Moderate' },
    3: { score: 150, label: 'Unhealthy for sensitive groups' },
    4: { score: 200, label: 'Unhealthy' },
    5: { score: 300, label: 'Very Unhealthy' },
    6: { score: 500, label: 'Hazardous' }
  };
  return mapping[epaIndex] || null;
}

// --------------- Helpers: Pressure Trend ---------------
function getPressureTrend(current, hourly, localTimeStr) {
  if (!hourly || hourly.length === 0) return 'Steady';
  
  // Use location's local time to find the current hour
  const hourMatch = localTimeStr.match(/ (\d{1,2}):/);
  const currentHour = hourMatch ? parseInt(hourMatch[1]) : new Date().getHours();
  
  // Look back 3 hours
  let pastHourIndex = currentHour - 3;
  if (pastHourIndex < 0) pastHourIndex = 0;
  
  const pastPressure = hourly[pastHourIndex]?.pressure_mb;
  if (!pastPressure) return 'Steady';
  
  const diff = current - pastPressure;
  
  if (diff > 1.5) return 'Rising';
  if (diff > 0.5) return 'Rising slowly';
  if (diff < -1.5) return 'Falling';
  if (diff < -0.5) return 'Falling slowly';
  return 'Steady';
}

// --------------- GET /dashboard/:city ---------------
router.get('/dashboard/:city', async (req, res) => {
  try {
    const { city } = req.params;
    
    // ONE call: forecast with 7 days, aqi, and alerts
    const { data } = await axios.get(`${BASE_URL}/forecast.json`, {
      params: { 
        key: API_KEY, 
        q: city, 
        days: 7, 
        aqi: 'yes', 
        alerts: 'no' 
      }
    });

    const current = data.current;
    const location = data.location;
    const forecastDays = data.forecast.forecastday;
    const todayForecast = forecastDays[0];
    const hourly = todayForecast.hour;

    // Beaufort calculation
    const beaufort = getBeaufort(current.wind_kph);

    // AQI details
    const epaIndex = current.air_quality?.['us-epa-index'];
    const aqi = getAqiDetails(epaIndex);

    // Today's Period Summary
    const periods = {
      morning: hourly.slice(6, 12),
      afternoon: hourly.slice(12, 18),
      evening: hourly.slice(18, 22),
      overnight: [...hourly.slice(22, 24), ...hourly.slice(0, 6)]
    };

    const processPeriod = (hours) => {
      if (!hours.length) return null;
      const avg_temp_c = hours.reduce((acc, h) => acc + h.temp_c, 0) / hours.length;
      const avg_temp_f = hours.reduce((acc, h) => acc + h.temp_f, 0) / hours.length;
      
      // Dominant condition
      const conditions = hours.map(h => h.condition);
      const counts = {};
      conditions.forEach(c => { counts[c.text] = (counts[c.text] || 0) + 1; });
      const dominantText = Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);
      const dominantIcon = conditions.find(c => c.text === dominantText).icon;
      
      const max_chance_of_rain = Math.max(...hours.map(h => h.chance_of_rain));
      
      return {
        avg_temp_c,
        avg_temp_f,
        dominant_condition: dominantText,
        dominant_icon: dominantIcon,
        max_chance_of_rain
      };
    };

    const shaped = {
      location: {
        name: location.name,
        region: location.region,
        country: location.country,
        localtime: location.localtime,
        lat: location.lat,
        lon: location.lon
      },
      theme: classifyCondition(current.condition.text, current.temp_c),
      current: {
        temp_c: current.temp_c,
        temp_f: current.temp_f,
        feelslike_c: current.feelslike_c,
        feelslike_f: current.feelslike_f,
        condition: {
          text: current.condition.text,
          icon: current.condition.icon
        },
        humidity: current.humidity,
        dewpoint_c: current.dewpoint_c,
        dewpoint_f: current.dewpoint_f,
        pressure_mb: current.pressure_mb,
        pressure_in: current.pressure_in,
        pressure_trend: getPressureTrend(current.pressure_mb, hourly, location.localtime),
        vis_km: current.vis_km,
        vis_miles: current.vis_miles,
        uv: {
          index: current.uv,
          label: getUvLabel(current.uv),
          display: `${current.uv} of 11`
        },
        wind: {
          kph: current.wind_kph,
          mph: current.wind_mph,
          dir: current.wind_dir,
          degree: current.wind_degree,
          gust_kph: current.gust_kph,
          gust_mph: current.gust_mph,
          beaufort: `Force ${beaufort.force} — ${beaufort.label}`
        },
        air_quality: aqi ? {
          pm2_5: current.air_quality.pm2_5,
          pm10: current.air_quality.pm10,
          o3: current.air_quality.o3,
          no2: current.air_quality.no2,
          epa_index: epaIndex,
          score: aqi.score,
          label: aqi.label
        } : null
      },
      astronomy: {
        sunrise: todayForecast.astro.sunrise,
        sunset: todayForecast.astro.sunset,
        moonrise: todayForecast.astro.moonrise,
        moonset: todayForecast.astro.moonset,
        moon_phase: todayForecast.astro.moon_phase
      },
      today_summary: {
        morning: processPeriod(periods.morning),
        afternoon: processPeriod(periods.afternoon),
        evening: processPeriod(periods.evening),
        overnight: processPeriod(periods.overnight)
      },
      hourly: hourly.map(h => ({
        time: h.time.split(' ')[1], // Format as HH:MM
        temp_c: h.temp_c,
        temp_f: h.temp_f,
        feelslike_c: h.feelslike_c,
        feelslike_f: h.feelslike_f,
        condition: {
          text: h.condition.text,
          icon: h.condition.icon
        },
        chance_of_rain: h.chance_of_rain,
        chance_of_snow: h.chance_of_snow,
        precip_mm: h.precip_mm,
        precip_in: h.precip_in,
        humidity: h.humidity,
        wind_kph: h.wind_kph,
        wind_mph: h.wind_mph
      })),
      forecast: forecastDays.map(day => ({
        date: day.date,
        day_of_week: new Date(day.date).toLocaleDateString('en-US', { weekday: 'long' }),
        maxtemp_c: day.day.maxtemp_c,
        maxtemp_f: day.day.maxtemp_f,
        mintemp_c: day.day.mintemp_c,
        mintemp_f: day.day.mintemp_f,
        condition: {
          text: day.day.condition.text,
          icon: day.day.condition.icon
        },
        daily_chance_of_rain: day.day.daily_chance_of_rain,
        totalprecip_mm: day.day.totalprecip_mm,
        totalprecip_in: day.day.totalprecip_in,
        avghumidity: day.day.avghumidity,
        uv: day.day.uv,
        astro: {
          sunrise: day.astro.sunrise,
          sunset: day.astro.sunset,
          moon_phase: day.astro.moon_phase
        }
      }))
    };

    res.json(shaped);

  } catch (err) {
    if (err.response) {
      const status = err.response.status;
      const errorCode = err.response.data?.error?.code;
      
      if (errorCode === 1006 || status === 400) {
        return res.status(404).json({ error: "city_not_found" });
      }
      if (status === 401 || status === 403) {
        return res.status(401).json({ error: "auth_failed" });
      }
    }
    console.error('Weather API error:', err.message);
    res.status(500).json({ error: "internal_server_error" });
  }
});

// Keep existing routes for backward compatibility or individual needs
router.get('/current/:city', async (req, res) => {
  // ... existing logic simplified or kept ...
  // (I'll keep the previous logic for these but they are less used now)
  try {
    const { city } = req.params;
    const { data } = await axios.get(`${BASE_URL}/current.json`, {
      params: { key: API_KEY, q: city, aqi: 'yes' }
    });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --------------- GET /search/:query ---------------
router.get('/search/:query', async (req, res) => {
  try {
    const { query } = req.params;
    const { data } = await axios.get(`${BASE_URL}/search.json`, {
      params: { key: API_KEY, q: query }
    });
    res.json(data);
  } catch (err) {
    console.error('Search API error:', err.message);
    res.status(500).json({ error: "internal_server_error" });
  }
});

module.exports = router;
