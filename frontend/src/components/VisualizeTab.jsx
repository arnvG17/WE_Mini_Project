import React, { useEffect, useRef, useState, useCallback } from 'react';
import './VisualizeTab.css';

/**
 * VisualizeTab — 3D Globe Visualization using CesiumJS.
 * Features a split-panel layout: Left info panel + Right globe panel.
 */
const VisualizeTab = ({ data, unit, onBack, onSearch, active }) => {
  const viewerRef = useRef(null);
  const containerRef = useRef(null);
  const [cesiumLoaded, setCesiumLoaded] = useState(false);
  const [activeTheme, setActiveTheme] = useState('clear');
  const [showPanel, setShowPanel] = useState(false);
  const prevCityRef = useRef(data?.location?.name || null);

  // Map condition to theme
  const getThemeFromCondition = useCallback((condition) => {
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
  const applyGlobeTheme = useCallback((theme) => {
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
  useEffect(() => {
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
  useEffect(() => {
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
      // Using Ion imagery with LABELS is best for seeing city names
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

    // Handle Clicks
    const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
    handler.setInputAction((click) => {
      const cartesian = viewer.camera.pickEllipsoid(click.position, viewer.scene.globe.ellipsoid);
      if (cartesian) {
        const cartographic = Cesium.Cartographic.fromCartesian(cartesian);
        const lat = Cesium.Math.toDegrees(cartographic.latitude);
        const lon = Cesium.Math.toDegrees(cartographic.longitude);
        if (onSearch) onSearch(`${lat.toFixed(4)},${lon.toFixed(4)}`);
      }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

    viewerRef.current = viewer;
    
    setTimeout(() => viewer.forceResize(), 100);

    return () => {
      handler.destroy();
      if (viewerRef.current && !viewerRef.current.isDestroyed()) {
        viewerRef.current.destroy();
        viewerRef.current = null;
      }
    };
  }, [cesiumLoaded, onSearch]);

  // Handle Rotation
  useEffect(() => {
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
  useEffect(() => {
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

  // Handle City Update
  useEffect(() => {
    if (!viewerRef.current || !data) return;

    // Detect if this is a new city selection
    if (prevCityRef.current !== data.location.name) {
      setShowPanel(true);
      prevCityRef.current = data.location.name;
    }

    const Cesium = window.Cesium;
    const viewer = viewerRef.current;
    const lat = data.location.lat;
    const lon = data.location.lon;

    viewer.entities.removeAll();

    const pinBuilder = new Cesium.PinBuilder();
    viewer.entities.add({
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
                  if (viewerRef.current) viewerRef.current.entities.removeAll();
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
