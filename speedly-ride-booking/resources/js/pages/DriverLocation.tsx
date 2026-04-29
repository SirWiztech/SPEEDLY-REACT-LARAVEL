import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import ClientSidebar from '../components/DriverSidebar';
import Preloader from '../components/Preloader';
import MobileNav from '../components/DriverMobileNav';
import { userAPI, locationAPI } from '../services/api';

const GOOGLE_MAPS_API_KEY = 'AIzaSyB1tM_s2w8JWfnIoUTAzJNpbblU-eZiC30';

export default function Location() {
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [userName, setUserName] = useState('User');
  const [hasPermission, setHasPermission] = useState(false);
  const [location, setLocation] = useState(null);
  const [address, setAddress] = useState('');
  const [street, setStreet] = useState('');
  const [speed, setSpeed] = useState(0);
  const [heading, setHeading] = useState(0);
  const [altitude, setAltitude] = useState(0);
  const [accuracy, setAccuracy] = useState(0);
  const [places, setPlaces] = useState([]);
  const [showPlaces, setShowPlaces] = useState(false);
  const [mapsLoaded, setMapsLoaded] = useState(false);
  
  const mobileMapRef = useRef(null);
  const desktopMapRef = useRef(null);
  const mobileMarkerRef = useRef(null);
  const desktopMarkerRef = useRef(null);
  const mobileMapInstance = useRef(null);
  const desktopMapInstance = useRef(null);
  const watchIdRef = useRef(null);
  const geocoderRef = useRef(null);

  useEffect(() => {
    fetchData();
    loadGoogleMaps();
    return () => {
      if (watchIdRef.current) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (mapsLoaded && window.google && window.google.maps) {
      initMaps();
    }
  }, [mapsLoaded]);

  useEffect(() => {
    if (mapsLoaded && hasPermission && location) {
      updateMapMarker(location);
    }
  }, [mapsLoaded, hasPermission, location]);

  const loadGoogleMaps = () => {
    if (window.google && window.google.maps) {
      setMapsLoaded(true);
      initMaps();
      return;
    }
    
    const existingScript = document.querySelector('script[src*="maps.googleapis"]');
    if (existingScript) {
      if (window.google && window.google.maps) {
        setMapsLoaded(true);
        initMaps();
        return;
      }
      existingScript.addEventListener('load', () => {
        setMapsLoaded(true);
        initMaps();
      });
      return;
    }
    
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places,geometry&v=weekly`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      setMapsLoaded(true);
      initMaps();
    };
    script.onerror = () => {
      console.error('Failed to load Google Maps');
    };
    document.head.appendChild(script);
  };

  const initMaps = () => {
    if (!window.google || !window.google.maps) return;
    
    const defaultLocation = { lat: 6.5244, lng: 3.3792 };
    geocoderRef.current = new window.google.maps.Geocoder();
    
    if (mobileMapRef.current && !mobileMapInstance.current) {
      mobileMapInstance.current = new window.google.maps.Map(mobileMapRef.current, {
        center: defaultLocation,
        zoom: 15,
        mapTypeId: window.google.maps.MapTypeId.ROADMAP,
        disableDefaultUI: false,
        zoomControl: true,
      });
    }
    
    if (desktopMapRef.current && !desktopMapInstance.current) {
      desktopMapInstance.current = new window.google.maps.Map(desktopMapRef.current, {
        center: defaultLocation,
        zoom: 15,
        mapTypeId: window.google.maps.MapTypeId.ROADMAP,
        disableDefaultUI: false,
        zoomControl: true,
      });
    }
  };

  const fetchData = async () => {
    try {
      const profileRes = await userAPI.getProfile();
      const profile = profileRes.data?.user || profileRes.data?.profile || profileRes.data;
      
      if (profile) {
        setUserData({
          fullname: profile.full_name || profile.name || 'User',
          role: profile.role || 'client',
          email: profile.email,
          phone: profile.phone,
          logged_in: true
        });
        setUserName(profile.full_name || profile.name || 'User');
      }

      const placesRes = await userAPI.getSavedLocations();
      if (placesRes.data?.locations) {
        setPlaces(placesRes.data.locations);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setUserData({
          fullname: parsedUser.name || 'User',
          role: 'client',
          logged_in: true
        });
        setUserName(parsedUser.name || 'User');
      }
    } finally {
      setLoading(false);
    }
  };

  const requestLocationPermission = () => {
    if (!navigator.geolocation) {
      alert('Geolocation not supported');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setHasPermission(true);
        updateLocation(position.coords);
        startWatching();
      },
      (error) => {
        console.error('GPS Error:', error.message);
        setHasPermission(false);
      },
      { enableHighAccuracy: true, timeout: 30000 }
    );
  };

  const startWatching = () => {
    if (watchIdRef.current) {
      navigator.geolocation.clearWatch(watchIdRef.current);
    }

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        updateLocation(position.coords);
      },
      (error) => {
        console.log('Watch error:', error.message);
      },
      { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 }
    );
  };

  const updateLocation = (coords) => {
    const newLocation = {
      lat: coords.latitude,
      lng: coords.longitude,
      accuracy: coords.accuracy,
      altitude: coords.altitude || 0,
      speed: coords.speed || 0,
      heading: coords.heading || 0
    };
    
    setLocation(newLocation);
    setAccuracy(coords.accuracy);
    setSpeed((coords.speed || 0) * 3.6);
    setHeading(coords.heading || 0);
    setAltitude(coords.altitude || 0);
    
    reverseGeocode(coords.latitude, coords.lng);
    updateMapMarker(newLocation);
  };

  const reverseGeocode = (lat, lng) => {
    if (!geocoderRef.current || !window.google) return;
    
    geocoderRef.current.geocode({ location: { lat, lng } }, (results, status) => {
      if (status === 'OK' && results[0]) {
        const formatted = results[0].formatted_address;
        let streetName = '';
        
        for (let component of results[0].address_components) {
          if (component.types.includes('route')) {
            streetName = component.long_name;
            break;
          }
        }
        
        setStreet(streetName || 'Current Location');
        setAddress(formatted);
      }
    });
  };

  const updateMapMarker = (loc) => {
    if (!window.google || !loc) return;
    
    const position = { lat: loc.lat, lng: loc.lng };
    
    const markerIcon = {
      path: window.google.maps.SymbolPath.CIRCLE,
      scale: 12,
      fillColor: '#ff5e00',
      fillOpacity: 1,
      strokeColor: '#ffffff',
      strokeWeight: 3
    };
    
    if (mobileMapInstance.current) {
      mobileMapInstance.current.setCenter(position);
      mobileMapInstance.current.setZoom(17);
      
      if (mobileMarkerRef.current) {
        mobileMarkerRef.current.setPosition(position);
      } else {
        mobileMarkerRef.current = new window.google.maps.Marker({
          position: position,
          map: mobileMapInstance.current,
          title: 'You are here',
          icon: markerIcon,
          animation: window.google.maps.Animation.DROP
        });
      }
    }
    
    if (desktopMapInstance.current) {
      desktopMapInstance.current.setCenter(position);
      desktopMapInstance.current.setZoom(17);
      
      if (desktopMarkerRef.current) {
        desktopMarkerRef.current.setPosition(position);
      } else {
        desktopMarkerRef.current = new window.google.maps.Marker({
          position: position,
          map: desktopMapInstance.current,
          title: 'You are here',
          icon: markerIcon,
          animation: window.google.maps.Animation.DROP
        });
      }
    }
  };

  const togglePlaces = () => {
    if (!location) {
      alert('Please enable location first');
      return;
    }
    setShowPlaces(!showPlaces);
    if (!showPlaces) {
      setPlaces([
        { name: 'Shoprite Mall', type: 'shopping_mall', distance: '0.5 km' },
        { name: 'First Bank', type: 'bank', distance: '0.3 km' },
        { name: 'Palm Avenue Mosque', type: 'mosque', distance: '0.8 km' },
        { name: 'Jumia Office', type: 'point_of_interest', distance: '1.2 km' },
        { name: 'Chicken Republic', type: 'restaurant', distance: '0.4 km' },
      ]);
    }
  };

  const numberStyle = { fontFamily: '"Outfit", sans-serif' };

  if (loading) {
    return <Preloader />;
  }

  return (
    <div className="dashboard-container" style={{width: '100%', maxWidth: '100%'}}>
      {/* MOBILE VIEW */}
      <div className="mobile-view" style={{overflowX: 'visible'}}>
        {/* Hero Header */}
        <div className="loc-hero">
          <div className="loc-header">
            <div className="loc-title">
              <h1>Live Location</h1>
              <p>Real-time GPS tracking</p>
            </div>
          </div>
        </div>

        {/* Map */}
        <div className="loc-map-container" style={{width: '100vw', marginLeft: 'calc(-50vw + 50%)', marginRight: 'calc(-50vw + 50%)', marginTop: '12px'}}>
          <div ref={mobileMapRef} style={{width: '100%', height: '100%', background: '#e5e5e5'}}></div>
          {!mapsLoaded && (
            <div className="loc-map-loading">
              <i className="fas fa-spinner fa-spin"></i>
              <p>Loading Maps...</p>
            </div>
          )}
        </div>

        {/* Location Info Card */}
        <div className="loc-info-section">
          <div className="loc-info-card">
            <div className="loc-gps-status">
              <div className={`loc-gps-dot ${hasPermission ? 'active' : 'inactive'}`}></div>
              <span>{hasPermission ? 'GPS Active' : 'Waiting for GPS'}</span>
            </div>
            <div className="loc-address">
              <div className="loc-address-icon">
                <i className="fas fa-map-marker-alt"></i>
              </div>
              <div>
                <h3>{hasPermission ? (street || 'Acquiring...') : 'Enable GPS'}</h3>
                <p>{hasPermission ? address : 'Click Enable to see location'}</p>
              </div>
            </div>
          </div>

          {/* Coordinates */}
          <div className="loc-stats-card">
            <h3>Coordinates</h3>
            <div className="loc-coords-grid">
              <div className="loc-stat-box">
                <p className="loc-stat-label">Latitude</p>
                <p className="loc-stat-value">{location?.lat?.toFixed(6) || '--'}</p>
              </div>
              <div className="loc-stat-box">
                <p className="loc-stat-label">Longitude</p>
                <p className="loc-stat-value">{location?.lng?.toFixed(6) || '--'}</p>
              </div>
            </div>
          </div>

          {/* Enable GPS Button */}
          <div style={{padding: '0 16px 0'}}>
            <button className="loc-primary-btn" onClick={requestLocationPermission} style={{width: '100%', margin: '0'}}>
              <i className="fas fa-location-arrow"></i> {hasPermission ? 'Update Location' : 'Enable GPS Access'}
            </button>
          </div>

          {/* Movement Stats */}
          {hasPermission && (
            <div className="loc-stats-card">
              <h3>Movement</h3>
              <div className="loc-movement-grid">
                <div className="loc-movement-item">
                  <div className="loc-movement-icon">
                    <i className="fas fa-tachometer-alt"></i>
                  </div>
                  <p className="loc-movement-label">Speed</p>
                  <p className="loc-movement-value">{speed.toFixed(1)} <small>km/h</small></p>
                </div>
                <div className="loc-movement-item">
                  <div className="loc-movement-icon">
                    <i className="fas fa-compass"></i>
                  </div>
                  <p className="loc-movement-label">Heading</p>
                  <p className="loc-movement-value">{heading.toFixed(0)}<small>°</small></p>
                </div>
                <div className="loc-movement-item">
                  <div className="loc-movement-icon">
                    <i className="fas fa-mountain"></i>
                  </div>
                  <p className="loc-movement-label">Altitude</p>
                  <p className="loc-movement-value">{altitude.toFixed(0)}<small>m</small></p>
                </div>
              </div>
            </div>
          )}

          {/* Nearby Places */}
          {showPlaces && places.length > 0 && (
            <div className="loc-stats-card">
              <h3>Nearby Places</h3>
              <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
                {places.map((place, index) => (
                  <div key={index} style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px', background: '#f8f8f8', borderRadius: '10px'}}>
                    <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                      <i className="fas fa-store" style={{color: '#ff5e00', fontSize: '12px'}}></i>
                      <span style={{fontSize: '12px', color: '#333'}}>{place.name}</span>
                    </div>
                    <span style={{fontSize: '11px', color: '#888'}}>{place.distance}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <MobileNav />
      </div>

      {/* DESKTOP VIEW */}
      <div className="desktop-view">
        <ClientSidebar userName={userName} />

        <div className="desktop-main">
          {/* Header */}
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px'}}>
            <div>
              <h1 style={{fontSize: '26px', fontWeight: 800, letterSpacing: '-0.5px', color: '#111', marginBottom: '2px'}}>Live Location</h1>
              <p style={{fontSize: '13px', color: '#9ca3af'}}>Real-time GPS tracking with Google Maps</p>
            </div>
            <div style={{display: 'flex', alignItems: 'center', gap: '16px'}}>
              <div style={{background: 'white', border: '1px solid #f0f0f0', padding: '10px 18px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)'}}>
                <i className="fas fa-wallet" style={{color: '#ff5e00', marginRight: '8px'}}></i>
                <span style={{fontWeight: 600, ...numberStyle}}>₦12,450</span>
              </div>
              <button style={{width: '44px', height: '44px', background: 'white', borderRadius: '12px', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', color: '#666', fontSize: '18px'}}>
                <i className="fas fa-bell"></i>
              </button>
            </div>
          </div>
          <div style={{display: 'grid', gridTemplateColumns: '1fr 400px', gap: '24px', height: 'calc(100vh - 180px)'}}>
            <MapPanel />
            <InfoPanel />
          </div>
        </div>
      </div>
    </div>
  );

  function MapPanel() {
    return (
      <div style={{background: 'white', borderRadius: '20px', border: '1.5px solid #f0f0f0', boxShadow: '0 4px 24px rgba(0,0,0,0.05)', overflow: 'hidden', position: 'relative', width: '100%', maxWidth: '100%'}}>
        <div ref={desktopMapRef} style={{width: '100%', height: '100%', minHeight: 'calc(100vh - 280px)'}}></div>
        {!mapsLoaded && (
          <div style={{position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: '#fafafa', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
            <i className="fas fa-spinner fa-spin" style={{fontSize: '32px', color: '#ff5e00', marginBottom: '12px'}}></i>
            <p style={{color: '#666'}}>Loading Maps...</p>
          </div>
        )}
        <div style={{position: 'absolute', top: '16px', right: '16px', display: 'flex', flexDirection: 'column', gap: '8px'}}>
          <button onClick={togglePlaces} style={{width: '44px', height: '44px', background: 'white', borderRadius: '12px', border: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.1)', cursor: 'pointer', color: '#666', fontSize: '16px'}}>
            <i className="fas fa-store"></i>
          </button>
        </div>
      </div>
    );
  }

  function InfoPanel() {
    return (
      <div style={{display: 'flex', flexDirection: 'column', gap: '20px'}}>
        <div style={{background: 'linear-gradient(135deg, #ff5e00 0%, #ff8c3a 100%)', borderRadius: '16px', padding: '24px', boxShadow: '0 8px 32px rgba(255,94,0,0.25)', color: 'white'}}>
          <div style={{display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px'}}>
            <div style={{width: '10px', height: '10px', borderRadius: '50%', background: hasPermission ? '#22c55e' : '#fef08a'}}></div>
            <span style={{fontSize: '14px', fontWeight: 600}}>{hasPermission ? 'GPS Active - Tracking' : 'Waiting for GPS'}</span>
          </div>
          <div style={{display: 'flex', alignItems: 'flex-start', gap: '12px'}}>
            <i className="fas fa-map-marker-alt" style={{fontSize: '20px', marginTop: '2px'}}></i>
            <div>
              <h3 style={{fontSize: '16px', fontWeight: 700, margin: '0 0 4px 0'}}>{hasPermission ? (street || 'Acquiring...') : 'Enable GPS'}</h3>
              <p style={{fontSize: '13px', opacity: 0.9, margin: 0}}>{hasPermission ? address : 'Click Enable to see location'}</p>
            </div>
          </div>
        </div>
        <div style={{background: 'white', borderRadius: '16px', padding: '24px', border: '1.5px solid #f0f0f0', boxShadow: '0 4px 20px rgba(0,0,0,0.06)'}}>
          <h3 style={{fontSize: '14px', fontWeight: 600, color: '#111', margin: '0 0 16px 0'}}>Coordinates</h3>
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px'}}>
            <div style={{background: '#f8f8f8', padding: '12px', borderRadius: '10px'}}>
              <p style={{fontSize: '11px', color: '#888', margin: '0 0 4px 0', textTransform: 'uppercase'}}>Latitude</p>
              <p style={{fontSize: '16px', fontWeight: 700, ...numberStyle}}>{location?.lat?.toFixed(6) || '--'}</p>
            </div>
            <div style={{background: '#f8f8f8', padding: '12px', borderRadius: '10px'}}>
              <p style={{fontSize: '11px', color: '#888', margin: '0 0 4px 0', textTransform: 'uppercase'}}>Longitude</p>
              <p style={{fontSize: '16px', fontWeight: 700, ...numberStyle}}>{location?.lng?.toFixed(6) || '--'}</p>
            </div>
            <div style={{background: '#f8f8f8', padding: '12px', borderRadius: '10px'}}>
              <p style={{fontSize: '11px', color: '#888', margin: '0 0 4px 0', textTransform: 'uppercase'}}>Accuracy</p>
              <p style={{fontSize: '16px', fontWeight: 700, ...numberStyle}}>{accuracy > 0 ? `±${accuracy.toFixed(0)}m` : '--'}</p>
            </div>
            <div style={{background: '#f8f8f8', padding: '12px', borderRadius: '10px'}}>
              <p style={{fontSize: '11px', color: '#888', margin: '0 0 4px 0', textTransform: 'uppercase'}}>Source</p>
              <p style={{fontSize: '16px', fontWeight: 700, ...numberStyle}}>Google</p>
            </div>
          </div>
        </div>
        <div style={{background: 'white', borderRadius: '16px', padding: '24px', border: '1.5px solid #f0f0f0', boxShadow: '0 4px 20px rgba(0,0,0,0.06)'}}>
          <h3 style={{fontSize: '14px', fontWeight: 600, color: '#111', margin: '0 0 16px 0'}}>Movement</h3>
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px'}}>
            <div style={{textAlign: 'center'}}>
              <i className="fas fa-tachometer-alt" style={{fontSize: '18px', color: '#ff5e00', marginBottom: '8px'}}></i>
              <p style={{fontSize: '11px', color: '#888', margin: '0 0 4px 0'}}>Speed</p>
              <p style={{fontSize: '18px', fontWeight: 700, ...numberStyle}}>{speed.toFixed(1)} <small style={{fontSize: '11px'}}>km/h</small></p>
            </div>
            <div style={{textAlign: 'center'}}>
              <i className="fas fa-compass" style={{fontSize: '18px', color: '#ff5e00', marginBottom: '8px'}}></i>
              <p style={{fontSize: '11px', color: '#888', margin: '0 0 4px 0'}}>Heading</p>
              <p style={{fontSize: '18px', fontWeight: 700, ...numberStyle}}>{heading.toFixed(0)}<small style={{fontSize: '11px'}}>°</small></p>
            </div>
            <div style={{textAlign: 'center'}}>
              <i className="fas fa-mountain" style={{fontSize: '18px', color: '#ff5e00', marginBottom: '8px'}}></i>
              <p style={{fontSize: '11px', color: '#888', margin: '0 0 4px 0'}}>Altitude</p>
              <p style={{fontSize: '18px', fontWeight: 700, ...numberStyle}}>{altitude.toFixed(0)}<small style={{fontSize: '11px'}}>m</small></p>
            </div>
          </div>
        </div>
        {!hasPermission && (
          <button onClick={requestLocationPermission} style={{width: '100%', padding: '16px', background: 'linear-gradient(135deg, #ff5e00 0%, #ff8c3a 100%)', color: 'white', border: 'none', borderRadius: '14px', fontSize: '15px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px'}}>
            <i className="fas fa-location-arrow"></i>
            Enable GPS Access
          </button>
        )}
        {showPlaces && places.length > 0 && (
          <div style={{background: 'white', borderRadius: '16px', padding: '20px', border: '1.5px solid #f0f0f0', boxShadow: '0 4px 20px rgba(0,0,0,0.06)'}}>
            <h3 style={{fontSize: '14px', fontWeight: 600, color: '#111', margin: '0 0 16px 0'}}>Nearby Places</h3>
            <div style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>
              {places.map((place, index) => (
                <div key={index} style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px', background: '#f8f8f8', borderRadius: '10px'}}>
                  <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                    <i className={`fas fa-${place.type === 'church' ? 'church' : 'store'}`} style={{color: '#ff5e00', fontSize: '14px'}}></i>
                    <span style={{fontSize: '13px', color: '#333'}}>{place.name}</span>
                  </div>
                  <span style={{fontSize: '12px', color: '#888'}}>{place.distance}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }
}