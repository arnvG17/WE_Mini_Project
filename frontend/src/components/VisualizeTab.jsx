import React from 'react';
import './VisualizeTab.css';

const WORLD_CITIES = [
  { name: "New York", lat: 40.7128, lon: -74.0060, pop: "mega" },
  { name: "London", lat: 51.5074, lon: -0.1278, pop: "mega" },
  { name: "Tokyo", lat: 35.6762, lon: 139.6503, pop: "mega" },
  { name: "Paris", lat: 48.8566, lon: 2.3522, pop: "mega" },
  { name: "Mumbai", lat: 19.0760, lon: 72.8777, pop: "mega" },
  { name: "Delhi", lat: 28.6139, lon: 77.2090, pop: "mega" },
  { name: "Bangalore", lat: 12.9716, lon: 77.5946, pop: "mega" },
  { name: "Chennai", lat: 13.0827, lon: 80.2707, pop: "mega" },
  { name: "Kolkata", lat: 22.5726, lon: 88.3639, pop: "mega" },
  { name: "Hyderabad", lat: 17.3850, lon: 78.4867, pop: "mega" },
  { name: "Dubai", lat: 25.2048, lon: 55.2708, pop: "mega" },
  { name: "Singapore", lat: 1.3521, lon: 103.8198, pop: "mega" },
  { name: "Sydney", lat: -33.8688, lon: 151.2093, pop: "mega" },
  { name: "Cairo", lat: 30.0444, lon: 31.2357, pop: "mega" },
  { name: "Rio de Janeiro", lat: -22.9068, lon: -43.1729, pop: "mega" },
  { name: "Los Angeles", lat: 34.0522, lon: -118.2437, pop: "mega" },
  { name: "San Francisco", lat: 37.7749, lon: -122.4194, pop: "mega" },
  { name: "Berlin", lat: 52.5200, lon: 13.4050, pop: "mega" },
  { name: "Moscow", lat: 55.7558, lon: 37.6173, pop: "mega" },
  { name: "Beijing", lat: 39.9042, lon: 116.4074, pop: "mega" },
  { name: "Istanbul", lat: 41.0082, lon: 28.9784, pop: "mega" },
  { name: "Bangkok", lat: 13.7563, lon: 100.5018, pop: "mega" },
  { name: "Seoul", lat: 37.5665, lon: 126.9780, pop: "mega" },
  { name: "Mexico City", lat: 19.4326, lon: -99.1332, pop: "mega" },
  { name: "Toronto", lat: 43.6532, lon: -79.3832, pop: "mega" },
  { name: "Cape Town", lat: -33.9249, lon: 18.4241, pop: "mega" },
  { name: "Pune", lat: 18.5204, lon: 73.8567, pop: "standard" },
  { name: "Ahmedabad", lat: 23.0225, lon: 72.5714, pop: "standard" },
  { name: "Jaipur", lat: 26.9124, lon: 75.7873, pop: "standard" },
  { name: "Lucknow", lat: 26.8467, lon: 80.9462, pop: "standard" },
  { name: "Chandigarh", lat: 30.7333, lon: 76.7794, pop: "standard" },
  { name: "Srinagar", lat: 34.0837, lon: 74.7973, pop: "standard" },
  { name: "Reykjavik", lat: 64.1466, lon: -21.9426, pop: "standard" },
  { name: "Anchorage", lat: 61.2181, lon: -149.9003, pop: "standard" },
  { name: "Perth", lat: -31.9505, lon: 115.8605, pop: "standard" },
  { name: "Nairobi", lat: -1.2921, lon: 36.8219, pop: "standard" },
  { name: "Yakutsk", lat: 62.0308, lon: 129.6755, pop: "standard" },
  { name: "Antarctica (McMurdo)", lat: -77.8419, lon: 166.6863, pop: "standard" },
  { name: "Honolulu", lat: 21.3069, lon: -157.8583, pop: "standard" },
  { name: "Casablanca", lat: 33.5731, lon: -7.5898, pop: "standard" },
  { name: "Lisbon", lat: 38.7223, lon: -9.1393, pop: "standard" },
  { name: "Oslo", lat: 59.9139, lon: 10.7522, pop: "standard" }
];

const WEATHER_API_KEY = '0e24a04ab4fe4a7fae195443260205';

const VisualizeTab = ({ data, unit, onBack, onSearch, active }) => {
  const viewerRef = React.useRef(null);
  const containerRef = React.useRef(null);
  const tooltipRef = React.useRef(null);
  const [cesiumLoaded, setCesiumLoaded] = React.useState(false);
  const [activeTheme, setActiveTheme] = React.useState('clear');
  const [showPanel, setShowPanel] = React.useState(false);
  const prevCityRef = React.useRef(data?.location?.name || null);

  // Weather color mapping
  const getWeatherLabelColor = React.useCallback((conditionText) => {
    const Cesium = window.Cesium;
    const c = conditionText.toLowerCase();

    if (c.includes("thunder") || c.includes("storm"))
      return Cesium.Color.fromCssColorString('#9B59B6'); // purple

    if (c.includes("snow") || c.includes("blizzard") ||
        c.includes("ice") || c.includes("sleet") || c.includes("freeze"))
      return Cesium.Color.fromCssColorString('#AED6F1'); // icy blue

    if (c.includes("rain") || c.includes("drizzle") ||
        c.includes("shower") || c.includes("downpour"))
      return Cesium.Color.fromCssColorString('#5DADE2'); // rain blue

    if (c.includes("fog") || c.includes("mist") ||
        c.includes("haze") || c.includes("smoke"))
      return Cesium.Color.fromCssColorString('#D5D8DC'); // pale grey

    if (c.includes("dust") || c.includes("sand") ||
        c.includes("wind"))
      return Cesium.Color.fromCssColorString('#E59866'); // sandy orange

    if (c.includes("overcast") || c.includes("cloud"))
      return Cesium.Color.fromCssColorString('#BDC3C7'); // grey

    if (c.includes("partly") || c.includes("scattered") ||
        c.includes("broken"))
      return Cesium.Color.fromCssColorString('#58D68D'); // soft green

    if (c.includes("sunny") || c.includes("clear") ||
        c.includes("fair") || c.includes("bright"))
      return Cesium.Color.fromCssColorString('#FFD700'); // golden yellow

    return Cesium.Color.WHITE; 
  }, []);

  const updateGlobeLabelColors = React.useCallback(() => {
    if (!viewerRef.current) return;
    const viewer = viewerRef.current;
    const Cesium = window.Cesium;

    viewer.entities.suspendEvents();
    viewer.entities.values.forEach(entity => {
      if (entity._cityIndex === undefined) return;
      const city = WORLD_CITIES[entity._cityIndex];
      if (!city || !city.condition) return;

      const color = getWeatherLabelColor(city.condition);
      if (entity.label) entity.label.fillColor = new Cesium.ConstantProperty(color);
      if (entity.point) entity.point.color = new Cesium.ConstantProperty(color);
    });
    viewer.entities.resumeEvents();
  }, [getWeatherLabelColor]);

  const fetchAllCityWeather = React.useCallback(async () => {
    try {
      const results = await Promise.allSettled(
        WORLD_CITIES.map(city =>
          fetch(
            `https://api.weatherapi.com/v1/current.json?key=${WEATHER_API_KEY}&q=${city.lat},${city.lon}&aqi=no`
          ).then(r => r.json())
        )
      );

      results.forEach((result, i) => {
        if (result.status === 'fulfilled') {
          const condition = result.value?.current?.condition?.text || 'Clear';
          const temp = result.value?.current?.temp_c;
          WORLD_CITIES[i].condition = condition;
          WORLD_CITIES[i].temp = temp;
        }
      });

      updateGlobeLabelColors();
    } catch (err) {
      console.error("Global weather fetch failed", err);
    }
  }, [updateGlobeLabelColors]);

  // Map condition to theme
  const getThemeFromCondition = React.useCallback((condition) => {
    const text = condition.toLowerCase();
    if (text.includes('sunny') || text.includes('clear')) return 'clear';
    if (text.includes('rain') || text.includes('drizzle') || text.includes('shower')) return 'rain';
    if (text.includes('cloud') || text.includes('overcast')) return 'cloudy';
    if (text.includes('snow') || text.includes('blizzard') || text.includes('ice')) return 'snow';
    if (text.includes('thunder') || text.includes('storm')) return 'thunder';
    if (text.includes('fog') || text.includes('mist') || text.includes('haze')) return 'fog';
    return 'clear';
  }, []);

  // Apply atmosphere tint
  const applyGlobeTheme = React.useCallback((theme) => {
    if (!viewerRef.current) return;
    const scene = viewerRef.current.scene;
    const atmosphere = scene.skyAtmosphere;

    switch (theme) {
      case 'clear':
        atmosphere.hueShift = 0.0;
        atmosphere.saturationShift = 0.1;
        atmosphere.brightnessShift = 0.1;
        break;
      case 'rain':
        atmosphere.hueShift = -0.3;
        atmosphere.saturationShift = -0.1;
        atmosphere.brightnessShift = -0.2;
        break;
      case 'cloudy':
        atmosphere.hueShift = 0.0;
        atmosphere.saturationShift = -0.5;
        atmosphere.brightnessShift = -0.1;
        break;
      case 'snow':
        atmosphere.hueShift = 0.6;
        atmosphere.saturationShift = -0.3;
        atmosphere.brightnessShift = 0.3;
        break;
      case 'thunder':
        atmosphere.hueShift = -0.5;
        atmosphere.saturationShift = 0.2;
        atmosphere.brightnessShift = -0.4;
        break;
      case 'fog':
        atmosphere.hueShift = 0.0;
        atmosphere.saturationShift = -0.8;
        atmosphere.brightnessShift = 0.2;
        break;
      default:
        atmosphere.hueShift = 0.0;
        atmosphere.saturationShift = 0.0;
        atmosphere.brightnessShift = 0.0;
    }
  }, []);

  // Lazy load Cesium (Using 1.110 for better stability)
  React.useEffect(() => {
    if (window.Cesium) {
      setCesiumLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://cesium.com/downloads/cesiumjs/releases/1.110/Build/Cesium/Cesium.js';
    script.async = true;
    script.onload = () => setCesiumLoaded(true);
    document.head.appendChild(script);

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://cesium.com/downloads/cesiumjs/releases/1.110/Build/Cesium/Widgets/widgets.css';
    document.head.appendChild(link);
  }, []);

  // Initialize Viewer (Persistent - Only run once after Cesium loads)
  React.useEffect(() => {
    if (!cesiumLoaded || (viewerRef.current && !viewerRef.current.isDestroyed())) return;

    const Cesium = window.Cesium;
    Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJhMGYwMzk4Yy0yZDM3LTQ0MDItYTQwNS05MDM5M2Y0NzEzZmMiLCJpZCI6NDI2NDEyLCJpc3MiOiJodHRwczovL2lvbi5jZXNpdW0uY29tIiwiYXVkIjoidW5kZWZpbmVkX2RlZmF1bHQiLCJpYXQiOjE3Nzc3MjE4NDN9.D7yB3sTdWaac1WlTuWM8fcNdQxXC9SqJ-ueo7jrV1_8'; 

    // Create viewer using the most reliable "Ion-Native" method
    const viewer = new Cesium.Viewer(containerRef.current, {
      animation: false,
      timeline: false,
      fullscreenButton: false,
      geocoder: false,
      homeButton: false,
      infoBox: false,
      sceneModePicker: false,
      selectionIndicator: false,
      navigationHelpButton: false,
      navigationInstructionsInitiallyVisible: false,
      enableLighting: true,
      baseLayer: Cesium.ImageryLayer.fromWorldImagery({
        style: Cesium.IonWorldImageryStyle.BING_MAPS_AERIAL_WITH_LABELS
      })
    });

    // Add Terrain after a small delay
    setTimeout(() => {
      if (!viewer.isDestroyed()) {
        viewer.terrainProvider = Cesium.createWorldTerrain();
      }
    }, 1000);

    // Create persistent city labels
    WORLD_CITIES.forEach((city, index) => {
      const entity = viewer.entities.add({
        position: Cesium.Cartesian3.fromDegrees(city.lon, city.lat, 0),
        label: {
          text: city.name,
          fillColor: Cesium.Color.WHITE,
          outlineColor: Cesium.Color.BLACK,
          outlineWidth: city.pop === "mega" ? 3 : 2,
          style: Cesium.LabelStyle.FILL_AND_OUTLINE,
          font: city.pop === "mega" ? "900 16px 'DM Sans', sans-serif" : "bold 13px 'DM Sans', sans-serif",
          verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
          pixelOffset: new Cesium.Cartesian2(0, -12),
          disableDepthTestDistance: Number.POSITIVE_INFINITY,
          translucencyByDistance: new Cesium.NearFarScalar(2.0e6, 1.0, 15.0e6, 0.0),
          scaleByDistance: new Cesium.NearFarScalar(2.0e6, 1.4, 12.0e6, 0.5)
        },
        point: {
          pixelSize: city.pop === "mega" ? 7 : 5,
          color: Cesium.Color.WHITE,
          outlineColor: Cesium.Color.BLACK,
          outlineWidth: 1,
          disableDepthTestDistance: Number.POSITIVE_INFINITY
        }
      });
      entity._cityIndex = index;
    });

    // Handle Hover Tooltip
    const tooltip = tooltipRef.current;
    const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
    
    handler.setInputAction((move) => {
      const picked = viewer.scene.pick(move.endPosition);
      if (Cesium.defined(picked) && picked.id?._cityIndex !== undefined) {
        const city = WORLD_CITIES[picked.id._cityIndex];
        tooltip.style.display = 'block';
        tooltip.style.left = (move.endPosition.x + 14) + 'px';
        tooltip.style.top = (move.endPosition.y - 10) + 'px';
        tooltip.innerHTML = `
          <div class="tooltip-name">${city.name}</div>
          <div class="tooltip-cond">${city.condition || 'Loading...'}</div>
          <div class="tooltip-temp">${city.temp !== undefined ? city.temp + '°C' : ''}</div>
        `;
      } else {
        tooltip.style.display = 'none';
      }
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

    // Handle Clicks
    handler.setInputAction((click) => {
      const picked = viewer.scene.pick(click.position);
      if (Cesium.defined(picked) && picked.id?._cityIndex !== undefined) {
        const city = WORLD_CITIES[picked.id._cityIndex];
        if (onSearch) onSearch(`${city.lat},${city.lon}`);
        return;
      }

      const cartesian = viewer.camera.pickEllipsoid(click.position, viewer.scene.globe.ellipsoid);
      if (cartesian) {
        const cartographic = Cesium.Cartographic.fromCartesian(cartesian);
        const lat = Cesium.Math.toDegrees(cartographic.latitude);
        const lon = Cesium.Math.toDegrees(cartographic.longitude);
        if (onSearch) onSearch(`${lat.toFixed(4)},${lon.toFixed(4)}`);
      }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

    viewerRef.current = viewer;
    fetchAllCityWeather();

    // Auto-refresh every 30 mins
    const interval = setInterval(fetchAllCityWeather, 30 * 60 * 1000);
    
    setTimeout(() => viewer.forceResize(), 100);

    return () => {
      handler.destroy();
      clearInterval(interval);
      if (viewerRef.current && !viewerRef.current.isDestroyed()) {
        viewerRef.current.destroy();
        viewerRef.current = null;
      }
    };
  }, [cesiumLoaded, onSearch, fetchAllCityWeather]);

  // Handle Rotation
  React.useEffect(() => {
    if (!viewerRef.current) return;
    const viewer = viewerRef.current;
    const Cesium = window.Cesium;

    const rotationListener = viewer.scene.postRender.addEventListener(function() {
      if (!viewer.trackedEntity && !showPanel && !viewer.isDestroyed()) {
        viewer.camera.rotate(Cesium.Cartesian3.UNIT_Z, 0.001);
      }
    });

    return () => {
      if (!viewer.isDestroyed()) rotationListener();
    };
  }, [showPanel]);

  // Handle Visibility Change
  React.useEffect(() => {
    if (viewerRef.current && active) {
      viewerRef.current.forceResize();
      if (data && showPanel) {
        const Cesium = window.Cesium;
        viewerRef.current.camera.flyTo({
          destination: Cesium.Cartesian3.fromDegrees(data.location.lon, data.location.lat, 80000),
          duration: 1.0
        });
      }
    }
  }, [active, data, showPanel]);

  // Handle City Update (for the search/dashboard selection)
  React.useEffect(() => {
    if (!viewerRef.current || !data) return;

    if (prevCityRef.current !== data.location.name) {
      setShowPanel(true);
      prevCityRef.current = data.location.name;
    }

    const Cesium = window.Cesium;
    const viewer = viewerRef.current;
    const lat = data.location.lat;
    const lon = data.location.lon;

    // Filter out user-selected marker if it already exists
    const existing = viewer.entities.getById('selection-marker');
    if (existing) viewer.entities.remove(existing);

    const pinBuilder = new Cesium.PinBuilder();
    viewer.entities.add({
      id: 'selection-marker',
      name: data.location.name,
      position: Cesium.Cartesian3.fromDegrees(lon, lat),
      billboard: {
        image: pinBuilder.fromColor(Cesium.Color.fromCssColorString('#ff3d00'), 48).toDataURL(),
        verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
        heightReference: Cesium.HeightReference.RELATIVE_TO_GROUND,
        disableDepthTestDistance: Number.POSITIVE_INFINITY
      }
    });

    viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(lon, lat, 80000), 
      duration: 2.5,
      easingFunction: Cesium.EasingFunction.QUADRATIC_IN_OUT
    });

    const theme = getThemeFromCondition(data.current.condition.text);
    setActiveTheme(theme);
    applyGlobeTheme(theme);

  }, [data, getThemeFromCondition, applyGlobeTheme]);

  return (
    <div className={`visualize-container theme-${activeTheme}`}>
      <div id="globe-tooltip" ref={tooltipRef}></div>

      {/* Left Panel - Only shown after a selection */}
      {showPanel && data && (
        <div className="info-panel">
          <div className="info-scroll">
            <header className="info-header">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <h1 className="city-name-large">{data.location.name}</h1>
                <button 
                  onClick={() => setShowPanel(false)}
                  className="close-panel-btn"
                  aria-label="Close panel"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
              </div>
              <p className="location-meta">{data.location.region}, {data.location.country}</p>
              <p className="coordinates">{data.location.lat.toFixed(4)}, {data.location.lon.toFixed(4)}</p>
            </header>

            <div className="main-stat-v2">
              <div className="temp-hero">
                <span className="temp-val">
                  {unit === 'C' ? Math.round(data.current.temp_c) : Math.round(data.current.temp_f)}°
                </span>
                <span className="feels-val">
                  Feels like {unit === 'C' ? Math.round(data.current.feelslike_c) : Math.round(data.current.feelslike_f)}°
                </span>
              </div>
              <div className="cond-hero">
                <img src={data.current.condition.icon} alt={data.current.condition.text} className="cond-icon" />
                <span className="cond-label">{data.current.condition.text}</span>
              </div>
            </div>

            <div className="stat-grid-v2">
              <div className="stat-card-v2">
                <span className="label">High / Low</span>
                <span className="value">
                  {unit === 'C' ? Math.round(data.forecast[0].maxtemp_c) : Math.round(data.forecast[0].maxtemp_f)}° / {unit === 'C' ? Math.round(data.forecast[0].mintemp_c) : Math.round(data.forecast[0].mintemp_f)}°
                </span>
              </div>
              <div className="stat-card-v2">
                <span className="label">Wind</span>
                <span className="value">{data.current.wind.dir} {unit === 'C' ? data.current.wind.kph : data.current.wind.mph} {unit === 'C' ? 'kph' : 'mph'}</span>
                <span className="sub">Gusts {unit === 'C' ? data.current.wind.gust_kph : data.current.wind.gust_mph}</span>
              </div>
              <div className="stat-card-v2">
                <span className="label">Humidity</span>
                <span className="value">{data.current.humidity}%</span>
                <span className="sub">Dew point {unit === 'C' ? Math.round(data.current.dewpoint_c) : Math.round(data.current.dewpoint_f)}°</span>
              </div>
              <div className="stat-card-v2">
                <span className="label">Pressure</span>
                <span className="value">{unit === 'C' ? data.current.pressure_mb : data.current.pressure_in} {unit === 'C' ? 'mb' : 'in'}</span>
                <span className="sub">{data.current.pressure_trend}</span>
              </div>
            </div>

            <div className="astro-grid">
              <div className="astro-box">
                <span className="label">Sunrise</span>
                <span className="value">{data.astronomy.sunrise}</span>
              </div>
              <div className="astro-box">
                <span className="label">Sunset</span>
                <span className="value">{data.astronomy.sunset}</span>
              </div>
              <div className="astro-box">
                <span className="label">Moon</span>
                <span className="value">{data.astronomy.moon_phase}</span>
              </div>
            </div>

            <div className="aqi-strip">
              <div className={`aqi-bar aqi-${data.current.air_quality.label.toLowerCase().replace(/ /g, '-')}`}></div>
              <div className="aqi-info">
                <span className="label">AQI Score: <strong>{data.current.air_quality.score}</strong></span>
                <span className="value">{data.current.air_quality.label}</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '40px' }}>
              <button 
                className="back-btn" 
                onClick={() => {
                  setShowPanel(false);
                  const existing = viewerRef.current?.entities.getById('selection-marker');
                  if (existing) viewerRef.current.entities.remove(existing);
                  prevCityRef.current = null;
                }}
                style={{ flex: 1, margin: 0, background: 'rgba(255,255,255,0.1)' }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                Explore Mode
              </button>
              
              <button className="back-btn" onClick={onBack} style={{ flex: 1, margin: 0 }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                Home
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Globe Panel */}
      <div className="globe-panel" style={{ width: showPanel ? '65%' : '100%' }}>
        {!cesiumLoaded && (
          <div className="globe-loading">
            <div className="spinner"></div>
            <p>Initializing 3D Atmosphere...</p>
          </div>
        )}
        <div ref={containerRef} className="cesium-container" />
        
        {/* Zoom Controls */}
        <div className="zoom-controls">
          <button onClick={() => {
            if (viewerRef.current) viewerRef.current.camera.zoomIn(viewerRef.current.camera.positionCartographic.height * 0.4);
          }} aria-label="Zoom in">+</button>
          <button onClick={() => {
            if (viewerRef.current) viewerRef.current.camera.zoomOut(viewerRef.current.camera.positionCartographic.height * 0.4);
          }} aria-label="Zoom out">−</button>
        </div>

        {!showPanel && (
          <div className="globe-pill">
            Explore the world — Click anywhere to see weather
          </div>
        )}
      </div>
    </div>
  );
};

export default VisualizeTab;
