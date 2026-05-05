import React, { useState, useEffect, useCallback, useRef } from 'react';
import { router } from '@inertiajs/react';
import ClientNavMobile from '../../components/navbars/ClientNavMobile';
import Swal from 'sweetalert2';
import { usePreloader } from '../../hooks/usePreloader';
import MobilePreloader from '../../components/preloader/MobilePreloader';
import '../../../css/ClientLocationMobile.css';

// Types
interface LocationCoords {
    lat: number;
    lng: number;
    accuracy: number;
    altitude: number | null;
    speed: number | null;
    heading: number | null;
}

interface AddressComponents {
    street: string;
    area: string;
    city: string;
    state: string;
    country: string;
    formatted: string;
}

interface PlaceResult {
    id: string;
    name: string;
    vicinity: string;
    location: { lat: number; lng: number };
}

const ClientLocationMobile: React.FC = () => {
    // State
    const [userData, setUserData] = useState<any>(null);
    const [userLocation, setUserLocation] = useState<LocationCoords | null>(null);
    const [address, setAddress] = useState<AddressComponents>({
        street: 'Waiting for GPS...',
        area: '',
        city: '',
        state: '',
        country: '',
        formatted: 'Click "Allow" to see your exact location'
    });
    const [hasPermission, setHasPermission] = useState<boolean>(false);
    const [gpsStatus, setGpsStatus] = useState<string>('WAITING FOR GPS');
    const [nearbyPlaces, setNearbyPlaces] = useState<PlaceResult[]>([]);
    const [showPlaces, setShowPlaces] = useState<boolean>(false);
    const [showPermissionPrompt, setShowPermissionPrompt] = useState<boolean>(false);

    const watchIdRef = useRef<number | null>(null);
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<google.maps.Map | null>(null);
    const markerRef = useRef<google.maps.Marker | null>(null);
    const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);
    const placesServiceRef = useRef<google.maps.places.PlacesService | null>(null);
    const directionArrowRef = useRef<HTMLDivElement>(null);

    const preloaderLoading = usePreloader(1000);

    // Google Maps API Key
    const GOOGLE_MAPS_API_KEY = 'AIzaSyB1tM_s2w8JWfnIoUTAzJNpbblU-eZiC30';

    // Load Google Maps script
    useEffect(() => {
        const loadGoogleMaps = () => {
            if (document.querySelector('#google-maps-script-location-mobile')) {
                initMap();
                return;
            }

            const script = document.createElement('script');
            script.id = 'google-maps-script-location-mobile';
            script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places,geometry&callback=initMapLocationMobile`;
            script.async = true;
            script.defer = true;

            (window as any).initMapLocationMobile = () => {
                initMap();
            };

            document.head.appendChild(script);
        };

        loadGoogleMaps();
        checkGeolocationPermission();
    }, []);

    // Initialize map
    const initMap = () => {
        if (!mapRef.current || !window.google) return;

        const defaultCenter = { lat: 6.2109, lng: 6.7985 };

        mapInstanceRef.current = new google.maps.Map(mapRef.current, {
            center: defaultCenter,
            zoom: 15,
            mapTypeId: google.maps.MapTypeId.ROADMAP,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: true,
            zoomControl: true
        });

        infoWindowRef.current = new google.maps.InfoWindow();
        placesServiceRef.current = new google.maps.places.PlacesService(mapInstanceRef.current);
    };

    // Check geolocation permission
    const checkGeolocationPermission = () => {
        if (!navigator.permissions) {
            return;
        }

        navigator.permissions.query({ name: 'geolocation' }).then((result) => {
            if (result.state === 'granted') {
                setHasPermission(true);
                startGPSTracking();
            } else if (result.state === 'prompt') {
                setShowPermissionPrompt(true);
            } else if (result.state === 'denied') {
                setHasPermission(false);
                setGpsStatus('GPS ACCESS DENIED');
                setShowPermissionPrompt(true);
            }

            result.addEventListener('change', () => {
                if (result.state === 'granted') {
                    setHasPermission(true);
                    setShowPermissionPrompt(false);
                    startGPSTracking();
                }
            });
        });
    };

    // Request location permission
    const requestLocationPermission = () => {
        setShowPermissionPrompt(false);
        setGpsStatus('REQUESTING GPS ACCESS...');
        
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setHasPermission(true);
                startGPSTracking();
            },
            (error) => {
                console.error('GPS permission denied:', error.message);
                setHasPermission(false);
                setGpsStatus('GPS ACCESS DENIED');
                setShowPermissionPrompt(true);
                
                Swal.fire({
                    icon: 'warning',
                    title: 'Location Required',
                    text: 'Please enable location to see your position on map',
                    confirmButtonColor: '#ff5e00'
                });
            },
            { enableHighAccuracy: true, timeout: 30000, maximumAge: 0 }
        );
    };

    // Start GPS tracking
    const startGPSTracking = () => {
        if (!navigator.geolocation) return;

        setGpsStatus('GPS ACTIVE - TRACKING');
        updateMobileGPSStatus('active');

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const coords = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                    accuracy: position.coords.accuracy,
                    altitude: position.coords.altitude,
                    speed: position.coords.speed,
                    heading: position.coords.heading
                };
                updateLocation(coords);
                reverseGeocode(coords.lat, coords.lng);
                startWatchingPosition();
            },
            (error) => {
                console.error('GPS Error:', error.message);
                setGpsStatus('GPS ERROR');
                updateMobileGPSStatus('error');
            },
            { enableHighAccuracy: true, timeout: 30000, maximumAge: 0 }
        );
    };

    // Start watching position
    const startWatchingPosition = () => {
        if (watchIdRef.current) {
            navigator.geolocation.clearWatch(watchIdRef.current);
        }

        watchIdRef.current = navigator.geolocation.watchPosition(
            (position) => {
                const coords = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                    accuracy: position.coords.accuracy,
                    altitude: position.coords.altitude,
                    speed: position.coords.speed,
                    heading: position.coords.heading
                };
                updateLocation(coords);
                updateMapMarker(coords);
                reverseGeocode(coords.lat, coords.lng);
                updateDirectionArrow(coords.heading);
            },
            (error) => {
                console.log('Watch error:', error.message);
            },
            { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 }
        );
    };

    // Update location
    const updateLocation = (coords: LocationCoords) => {
        setUserLocation(coords);
        
        if (mapInstanceRef.current) {
            mapInstanceRef.current.setCenter({ lat: coords.lat, lng: coords.lng });
            mapInstanceRef.current.setZoom(18);
        }

        // Update UI elements
        const latEl = document.getElementById('mobile-latitude');
        const lngEl = document.getElementById('mobile-longitude');
        const accEl = document.getElementById('mobile-accuracy');
        const speedEl = document.getElementById('mobile-speed');
        const headingEl = document.getElementById('mobile-heading');
        const altEl = document.getElementById('mobile-altitude');

        if (latEl) latEl.textContent = coords.lat.toFixed(6);
        if (lngEl) lngEl.textContent = coords.lng.toFixed(6);
        if (accEl) accEl.textContent = coords.accuracy.toFixed(0);
        if (speedEl) speedEl.textContent = ((coords.speed || 0) * 3.6).toFixed(1);
        if (headingEl) headingEl.textContent = (coords.heading || 0).toFixed(0);
        if (altEl) altEl.textContent = (coords.altitude || 0).toFixed(0);
    };

    // Update map marker
    const updateMapMarker = (coords: LocationCoords) => {
        if (!mapInstanceRef.current) return;

        const position = { lat: coords.lat, lng: coords.lng };

        if (markerRef.current) {
            markerRef.current.setPosition(position);
        } else {
            markerRef.current = new google.maps.Marker({
                position: position,
                map: mapInstanceRef.current,
                title: 'You are here',
                icon: {
                    path: google.maps.SymbolPath.CIRCLE,
                    scale: 10,
                    fillColor: '#ff5e00',
                    fillOpacity: 1,
                    strokeColor: '#ffffff',
                    strokeWeight: 2
                },
                animation: google.maps.Animation.DROP
            });
        }
    };

    // Update direction arrow
    const updateDirectionArrow = (heading: number | null) => {
        if (directionArrowRef.current && heading) {
            directionArrowRef.current.style.transform = `rotate(${heading}deg)`;
        }
    };

    // Reverse geocode
    const reverseGeocode = (lat: number, lng: number) => {
        const geocoder = new google.maps.Geocoder();

        geocoder.geocode({ location: { lat, lng } }, (results, status) => {
            if (status === 'OK' && results && results[0]) {
                const components = results[0].address_components;
                let street = '', area = '', city = '', state = '', country = '';

                for (const component of components) {
                    if (component.types.includes('route')) street = component.long_name;
                    if (component.types.includes('sublocality') || component.types.includes('neighborhood')) area = component.long_name;
                    if (component.types.includes('locality')) city = component.long_name;
                    if (component.types.includes('administrative_area_level_1')) state = component.long_name;
                    if (component.types.includes('country')) country = component.long_name;
                }

                setAddress({
                    street: street || 'Unknown Street',
                    area,
                    city,
                    state: state || 'Anambra',
                    country: country || 'Nigeria',
                    formatted: results[0].formatted_address
                });
            }
        });
    };

    // Find nearby places
    const togglePlaces = () => {
        if (!userLocation || !placesServiceRef.current) {
            Swal.fire({ icon: 'warning', title: 'Location Required', text: 'Please enable GPS first', confirmButtonColor: '#ff5e00' });
            return;
        }

        if (showPlaces) {
            setShowPlaces(false);
            return;
        }

        const request: google.maps.places.NearbySearchRequest = {
            location: { lat: userLocation.lat, lng: userLocation.lng },
            radius: 1000,
            type: 'restaurant'
        };

        placesServiceRef.current.nearbySearch(request, (results, status) => {
            if (status === google.maps.places.PlacesServiceStatus.OK && results) {
                const places: PlaceResult[] = results.slice(0, 10).map(place => ({
                    id: place.place_id || Math.random().toString(),
                    name: place.name || 'Unknown',
                    vicinity: place.vicinity || '',
                    location: { lat: place.geometry!.location!.lat(), lng: place.geometry!.location!.lng() }
                }));
                setNearbyPlaces(places);
                setShowPlaces(true);
            } else {
                Swal.fire({ icon: 'info', title: 'No Places Found', text: 'No nearby places found', confirmButtonColor: '#ff5e00' });
            }
        });
    };

    // Find nearby churches
    const findNearbyChurches = () => {
        if (!userLocation || !placesServiceRef.current) {
            Swal.fire({ icon: 'warning', title: 'Location Required', text: 'Please enable GPS first', confirmButtonColor: '#ff5e00' });
            return;
        }

        const request: google.maps.places.NearbySearchRequest = {
            location: { lat: userLocation.lat, lng: userLocation.lng },
            radius: 2000,
            keyword: 'church'
        };

        placesServiceRef.current.nearbySearch(request, (results, status) => {
            if (status === google.maps.places.PlacesServiceStatus.OK && results) {
                const places: PlaceResult[] = results.slice(0, 10).map(place => ({
                    id: place.place_id || Math.random().toString(),
                    name: place.name || 'Unknown',
                    vicinity: place.vicinity || '',
                    location: { lat: place.geometry!.location!.lat(), lng: place.geometry!.location!.lng() }
                }));
                setNearbyPlaces(places);
                setShowPlaces(true);
            } else {
                Swal.fire({ icon: 'info', title: 'No Churches Found', text: 'No nearby churches found', confirmButtonColor: '#ff5e00' });
            }
        });
    };

    // Center on user
    const centerOnUser = () => {
        if (userLocation && mapInstanceRef.current) {
            mapInstanceRef.current.setCenter({ lat: userLocation.lat, lng: userLocation.lng });
            mapInstanceRef.current.setZoom(18);
        } else {
            requestLocationPermission();
        }
    };

    // Go to place
    const goToPlace = (place: PlaceResult) => {
        if (mapInstanceRef.current) {
            mapInstanceRef.current.setCenter(place.location);
            mapInstanceRef.current.setZoom(18);
            setShowPlaces(false);
        }
    };

    // Update mobile GPS status
    const updateMobileGPSStatus = (status: 'active' | 'denied' | 'error') => {
        const pulseElement = document.getElementById('mobile-gps-pulse');
        const stateElement = document.getElementById('mobile-gps-state');
        const streetElement = document.getElementById('mobile-street-name');

        if (pulseElement && stateElement) {
            if (status === 'active') {
                pulseElement.style.background = '#4ade80';
                stateElement.innerHTML = '🟢 GPS ACTIVE - TRACKING';
                if (streetElement) streetElement.innerHTML = '📍 Acquiring GPS...';
            } else if (status === 'denied') {
                pulseElement.style.background = '#ef4444';
                stateElement.innerHTML = '❌ GPS ACCESS DENIED';
                if (streetElement) streetElement.innerHTML = '📍 Location blocked. Please enable in settings.';
            } else {
                pulseElement.style.background = '#ff9800';
                stateElement.innerHTML = '⚠️ GPS ERROR';
            }
        }
    };

    // Cleanup
    useEffect(() => {
        return () => {
            if (watchIdRef.current) {
                navigator.geolocation.clearWatch(watchIdRef.current);
            }
        };
    }, []);

    if (preloaderLoading) {
        return <MobilePreloader />;
    }

    return (
        <div className="mobile-location-container">
            <div className="mobile-location-view">
                {/* Header */}
                <div className="mobile-location-header">
                    <div className="mobile-location-user-info">
                        <h1>Google Cloud Maps</h1>
                        <p>📍 Live Location • Places • Streets • Churches</p>
                    </div>
                </div>

                {/* Permission Prompt */}
                {showPermissionPrompt && !hasPermission && (
                    <div className="mobile-permission-prompt">
                        <i className="fas fa-exclamation-triangle"></i>
                        <span>Location access denied</span>
                        <p>Please allow location to use GPS tracking</p>
                        <button onClick={requestLocationPermission}>Enable</button>
                    </div>
                )}

                {/* GPS Status Card */}
                <div className="mobile-location-card">
                    <div className="mobile-location-header-row">
                        <div className="mobile-location-title">
                            <span id="mobile-gps-pulse" className={`mobile-gps-pulse ${hasPermission ? 'active' : 'inactive'}`}></span>
                            <span id="mobile-gps-state" className="mobile-gps-state">{gpsStatus}</span>
                        </div>
                        <span className="mobile-gps-badge">
                            <i className="fas fa-satellite-dish"></i> Google Maps GPS
                        </span>
                    </div>

                    <div className="mobile-street-address">
                        <i className="fas fa-location-dot"></i>
                        <span id="mobile-street-name" className="mobile-street-name">
                            {address.street}
                        </span>
                    </div>

                    <div className="mobile-full-address">
                        <i className="fas fa-map-pin"></i>
                        <span>{address.formatted}</span>
                    </div>

                    <div className="mobile-coordinate-row">
                        <div className="mobile-coord-item">
                            <i className="fas fa-globe-africa"></i>
                            <div className="coord-label">Lat</div>
                            <div className="coord-value" id="mobile-latitude">--</div>
                        </div>
                        <div className="mobile-coord-item">
                            <i className="fas fa-globe-americas"></i>
                            <div className="coord-label">Lng</div>
                            <div className="coord-value" id="mobile-longitude">--</div>
                        </div>
                        <div className="mobile-coord-item">
                            <i className="fas fa-bullseye"></i>
                            <div className="coord-label">Accuracy</div>
                            <div className="coord-value" id="mobile-accuracy">--</div>
                        </div>
                    </div>

                    <div className="mobile-movement-stats">
                        <div className="mobile-stat-badge">
                            <i className="fas fa-tachometer-alt"></i>
                            <span className="stat-label">Speed</span>
                            <span className="stat-value" id="mobile-speed">0</span>
                            <span className="stat-unit">km/h</span>
                        </div>
                        <div className="mobile-stat-badge">
                            <i className="fas fa-compass"></i>
                            <span className="stat-label">Heading</span>
                            <span className="stat-value" id="mobile-heading">--</span>
                            <span className="stat-unit">°</span>
                        </div>
                        <div className="mobile-stat-badge">
                            <i className="fas fa-mountain"></i>
                            <span className="stat-label">Alt</span>
                            <span className="stat-value" id="mobile-altitude">--</span>
                            <span className="stat-unit">m</span>
                        </div>
                    </div>
                </div>

                {/* Map Container */}
                <div className="mobile-map-container">
                    <div ref={mapRef} className="mobile-map"></div>
                    <div className="mobile-map-controls">
                        <button className="mobile-map-btn" onClick={togglePlaces}>
                            <i className="fas fa-store"></i>
                        </button>
                        <button className="mobile-map-btn" onClick={findNearbyChurches}>
                            <i className="fas fa-church"></i>
                        </button>
                        <button className="mobile-map-btn" onClick={centerOnUser}>
                            <i className="fas fa-crosshairs"></i>
                        </button>
                    </div>
                    <div ref={directionArrowRef} className="mobile-direction-arrow">
                        <i className="fas fa-location-arrow"></i>
                    </div>

                    {/* Places Panel */}
                    {showPlaces && (
                        <div className="mobile-places-panel">
                            <div className="mobile-places-header">
                                <h3>Nearby Places</h3>
                                <button className="mobile-close-places" onClick={() => setShowPlaces(false)}>
                                    <i className="fas fa-times"></i>
                                </button>
                            </div>
                            <div className="mobile-places-list">
                                {nearbyPlaces.map((place) => (
                                    <div key={place.id} className="mobile-place-item" onClick={() => goToPlace(place)}>
                                        <div className="mobile-place-icon">
                                            <i className="fas fa-map-marker-alt"></i>
                                        </div>
                                        <div className="mobile-place-info">
                                            <h4>{place.name}</h4>
                                            <p>{place.vicinity}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Bottom Navigation */}
                <ClientNavMobile />
            </div>
        </div>
    );
};

export default ClientLocationMobile;