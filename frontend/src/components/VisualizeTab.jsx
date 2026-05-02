import React from 'react';
import './VisualizeTab.css';

const WEATHER_API_KEY = '0e24a04ab4fe4a7fae195443260205';

const VisualizeTab = ({ data, unit, onBack, onSearch, active }) => {
  const viewerRef = React.useRef(null);
  const containerRef = React.useRef(null);
  const [cesiumLoaded, setCesiumLoaded] = React.useState(false);
  const [activeTheme, setActiveTheme] = React.useState('clear');
  const [showPanel, setShowPanel] = React.useState(false);
  const prevCityRef = React.useRef(data?.location?.name || null);

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

  // Lazy load Cesium
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

  // Initialize Viewer (Persistent)
  React.useEffect(() => {
    if (!cesiumLoaded || (viewerRef.current && !viewerRef.current.isDestroyed())) return;

    const Cesium = window.Cesium;
    Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJhMGYwMzk4Yy0yZDM3LTQ0MDItYTQwNS05MDM5M2Y0NzEzZmMiLCJpZCI6NDI2NDEyLCJpc3MiOiJodHRwczovL2lvbi5jZXNpdW0uY29tIiwiYXVkIjoidW5kZWZpbmVkX2RlZmF1bHQiLCJpYXQiOjE3Nzc3MjE4NDN9.D7yB3sTdWaac1WlTuWM8fcNdQxXC9SqJ-ueo7jrV1_8'; 

    // Define imagery options
    const imageryViewModels = Cesium.createDefaultImageryProviderViewModels();
    // Find the Bing Maps Aerial with Labels view model
    const bingAerialWithLabels = imageryViewModels.find(vm => vm.name.includes('Aerial with Labels'));

    const viewer = new Cesium.Viewer(containerRef.current, {
      animation: false,
      timeline: false,
      fullscreenButton: false,
      geocoder: false,
      homeButton: false,
      infoBox: false,
      sceneModePicker: true, // Allow switching between 3D/2D
      selectionIndicator: false,
      navigationHelpButton: false,
      navigationInstructionsInitiallyVisible: false,
      baseLayerPicker: true, // Show the picker so user can find it
      enableLighting: true,
      imageryProviderViewModels: imageryViewModels,
      selectedImageryProviderViewModel: bingAerialWithLabels || imageryViewModels[0]
    });

    // Add Terrain
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
    setCesiumLoaded(true);

    return () => {
      if (viewer && !viewer.isDestroyed()) {
        viewer.destroy();
      }
      handler.destroy();
    };
  }, [cesiumLoaded, onSearch]);

  // Handle Rotation
  React.useEffect(() => {
    if (!viewerRef.current) return;
    const viewer = viewerRef.current;
    const Cesium = window.Cesium;

    const rotationCallback = (scene, time) => {
      if (!showPanel) {
        viewer.camera.rotate(Cesium.Cartesian3.UNIT_Z, 0.0005);
      }
    };

    viewer.scene.preUpdate.addEventListener(rotationCallback);
    return () => viewer.scene.preUpdate.removeEventListener(rotationCallback);
  }, [showPanel]);

  // Handle Visibility Change
  React.useEffect(() => {
    if (viewerRef.current && active) {
      viewerRef.current.forceResize();
      if (data && showPanel) {
        const Cesium = window.Cesium;
        viewerRef.current.camera.flyTo({
          destination: Cesium.Cartesian3.fromDegrees(data.location.lon, data.location.lat, 80000),
          duration: 1.5
        });
      }
    }
  }, [active, data, showPanel]);

  // Handle City Update
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
      {showPanel && data && (
        <div className="info-panel">
          <div className="info-scroll">
            <header className="info-header">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <h1 className="city-name-large">{data.location.name}</h1>
                <button 
                  onClick={() => setShowPanel(false)}
                  className="close-panel-btn"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
              </div>
              <p className="location-meta">{data.location.region}, {data.location.country}</p>
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
                <span className="label">Wind</span>
                <span className="value">{data.current.wind.dir} {unit === 'C' ? data.current.wind.kph : data.current.wind.mph} {unit === 'C' ? 'kph' : 'mph'}</span>
              </div>
              <div className="stat-card-v2">
                <span className="label">Humidity</span>
                <span className="value">{data.current.humidity}%</span>
              </div>
              <div className="stat-card-v2">
                <span className="label">AQI Score</span>
                <span className="value">{data.current.air_quality.score}</span>
              </div>
              <div className="stat-card-v2">
                <span className="label">UV Index</span>
                <span className="value">{data.current.uv.label}</span>
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
                Explore Mode
              </button>
              
              <button className="back-btn" onClick={onBack} style={{ flex: 1, margin: 0 }}>
                Home
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="globe-panel" style={{ width: showPanel ? '65%' : '100%' }}>
        {!cesiumLoaded && (
          <div className="globe-loading">
            <div className="spinner"></div>
            <p>Initializing 3D Atmosphere...</p>
          </div>
        )}
        <div ref={containerRef} className="cesium-container" />
        
        <div className="zoom-controls">
          <button onClick={() => {
            if (viewerRef.current) viewerRef.current.camera.zoomIn(viewerRef.current.camera.positionCartographic.height * 0.4);
          }}>+</button>
          <button onClick={() => {
            if (viewerRef.current) viewerRef.current.camera.zoomOut(viewerRef.current.camera.positionCartographic.height * 0.4);
          }}>−</button>
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
