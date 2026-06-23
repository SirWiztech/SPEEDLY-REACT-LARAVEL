import React, { useState, useEffect, useCallback, useRef } from 'react';
import { router } from '@inertiajs/react';
import ClientNavMobile from '../../components/navbars/ClientNavMobile';
import Swal from 'sweetalert2';
import { loadGoogleMapsApi } from '../../lib/googleMaps';
import '../../../css/ClientLocationMobile.css';

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
    const [userData, setUserData] = useState<any>(null);
    const [userLocation, setUserLocation] = useState<LocationCoords | null>(null);
    const [address, setAddress] = useState<AddressComponents>({
        street: 'Waiting for GPS...', area: '', city: '', state: '', country: '',
        formatted: 'Click "Enable Location" to see your exact position'
    });
    const [hasPermission, setHasPermission] = useState<boolean>(false);
    const [gpsStatus, setGpsStatus] = useState<string>('WAITING FOR GPS');
    const [nearbyPlaces, setNearbyPlaces] = useState<PlaceResult[]>([]);
    const [showPlaces, setShowPlaces] = useState<boolean>(false);
    const [showPermissionPrompt, setShowPermissionPrompt] = useState<boolean>(false);
    const [isTracking, setIsTracking] = useState<boolean>(false);

    const watchIdRef = useRef<number | null>(null);
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<google.maps.Map | null>(null);
    const markerRef = useRef<google.maps.Marker | null>(null);
    const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);
    const placesServiceRef = useRef<google.maps.places.PlacesService | null>(null);
    const directionArrowRef = useRef<HTMLDivElement>(null);
    const mapInitRef = useRef(false);
    const lastValidCoordsRef = useRef<LocationCoords | null>(null);
    const geocoderRef = useRef<google.maps.Geocoder | null>(null);
    const lastGeocodedRef = useRef<{ lat: number; lng: number } | null>(null);
    const bestAccuracyRef = useRef<number>(Infinity);

    const [locationStats, setLocationStats] = useState({
        latitude: '--', longitude: '--', accuracy: '--',
        speed: '0', heading: '--', altitude: '--',
    });

    const haversineDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
        const R = 6371000;
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLng = (lng2 - lng1) * Math.PI / 180;
        const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
        return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    };

    // Accept a position if it improves our best known accuracy, or if the movement is
    // plausible (≤500m from last fix). This replaces the old >100m hard reject that
    // blocked the first real GPS fix on cold start, and the >200m jump guard that
    // rejected legitimate positions while still feeding bad fallbacks to processPosition.
    const shouldAcceptPosition = (coords: LocationCoords): boolean => {
        if (coords.accuracy < bestAccuracyRef.current) return true;
        if (lastValidCoordsRef.current) {
            const d = haversineDistance(lastValidCoordsRef.current.lat, lastValidCoordsRef.current.lng, coords.lat, coords.lng);
            if (d <= 500) return true;
            return coords.accuracy < lastValidCoordsRef.current.accuracy * 0.75;
        }
        return true;
    };

    const initMap = useCallback(() => {
        if (!mapRef.current || !window.google || mapInitRef.current) return;
        mapInitRef.current = true;

        mapInstanceRef.current = new google.maps.Map(mapRef.current, {
            center: { lat: 6.2109, lng: 6.7985 },
            zoom: 15,
            mapTypeId: google.maps.MapTypeId.ROADMAP,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: true,
            zoomControl: true,
            gestureHandling: 'greedy',
        });

        infoWindowRef.current = new google.maps.InfoWindow();
        placesServiceRef.current = new google.maps.places.PlacesService(mapInstanceRef.current);
    }, []);

    useEffect(() => {
        loadGoogleMapsApi().then(() => initMap()).catch(e => console.error('Maps:', e));
    }, [initMap]);

    useEffect(() => {
        const timer = setTimeout(() => initMap(), 500);
        return () => clearTimeout(timer);
    }, [initMap]);

    const requestLocationPermission = () => {
        setShowPermissionPrompt(false);
        setGpsStatus('REQUESTING GPS ACCESS...');
        setIsTracking(true);

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setHasPermission(true);
                setShowPermissionPrompt(false);
                startGPSTracking();

                Swal.fire({
                    icon: 'success', title: 'Location Enabled',
                    text: 'GPS tracking activated successfully',
                    timer: 1500, showConfirmButton: false
                });
            },
            (error) => {
                console.error('GPS permission denied:', error.message);
                setHasPermission(false);
                setGpsStatus('GPS ACCESS DENIED');
                setShowPermissionPrompt(true);
                setIsTracking(false);

                Swal.fire({
                    icon: 'warning', title: 'Location Required',
                    text: 'Please enable location to see your position on map',
                    confirmButtonColor: '#ff5e00'
                });
            },
            { enableHighAccuracy: true, timeout: 30000, maximumAge: 0 }
        );
    };

    const startGPSTracking = () => {
        if (!navigator.geolocation) return;

        setGpsStatus('GPS ACTIVE — TRACKING');
        setIsTracking(true);
        bestAccuracyRef.current = Infinity; // Reset on fresh start

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const coords: LocationCoords = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                    accuracy: position.coords.accuracy,
                    altitude: position.coords.altitude,
                    speed: position.coords.speed,
                    heading: position.coords.heading
                };
                // Accept the first fix unconditionally — it's the only fix we have.
                // watchPosition will refine it to GPS accuracy within a few seconds.
                bestAccuracyRef.current = coords.accuracy;
                lastValidCoordsRef.current = coords;
                processPosition(coords);
                startWatchingPosition();
            },
            (error) => {
                console.error('GPS Error:', error.message);
                setGpsStatus('GPS ERROR');
                setIsTracking(false);
            },
            { enableHighAccuracy: true, timeout: 30000, maximumAge: 0 }
        );
    };

    const stopGPSTracking = () => {
        if (watchIdRef.current) {
            navigator.geolocation.clearWatch(watchIdRef.current);
            watchIdRef.current = null;
        }
        setIsTracking(false);
        setGpsStatus('GPS STOPPED');

        Swal.fire({
            icon: 'info', title: 'GPS Stopped',
            text: 'Location tracking has been stopped',
            timer: 1500, showConfirmButton: false
        });
    };

    const startWatchingPosition = () => {
        if (watchIdRef.current) navigator.geolocation.clearWatch(watchIdRef.current);

        watchIdRef.current = navigator.geolocation.watchPosition(
            (position) => {
                const coords: LocationCoords = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                    accuracy: position.coords.accuracy,
                    altitude: position.coords.altitude,
                    speed: position.coords.speed,
                    heading: position.coords.heading
                };
                if (shouldAcceptPosition(coords)) {
                    if (coords.accuracy < bestAccuracyRef.current) {
                        bestAccuracyRef.current = coords.accuracy;
                    }
                    lastValidCoordsRef.current = coords;
                    processPosition(coords);
                }
                // Silently drop readings that fail the acceptance check — don't
                // fall through to processPosition with bad data
            },
            () => {},
            { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 }
        );
    };

    const processPosition = (coords: LocationCoords) => {
        setUserLocation(coords);

        setLocationStats({
            latitude: coords.lat.toFixed(6),
            longitude: coords.lng.toFixed(6),
            accuracy: coords.accuracy.toFixed(0),
            speed: ((coords.speed || 0) * 3.6).toFixed(1),
            heading: (coords.heading ?? 0).toFixed(0),
            altitude: (coords.altitude ?? 0).toFixed(0),
        });

        if (mapInstanceRef.current) {
            mapInstanceRef.current.setCenter({ lat: coords.lat, lng: coords.lng });
            mapInstanceRef.current.setZoom(18);
        }

        updateMapMarker(coords);
        // Throttle geocoding — only call when moved > 30m to avoid race conditions
        // where a slow response from an earlier position overwrites the current address
        if (!lastGeocodedRef.current || haversineDistance(lastGeocodedRef.current.lat, lastGeocodedRef.current.lng, coords.lat, coords.lng) > 30) {
            lastGeocodedRef.current = { lat: coords.lat, lng: coords.lng };
            reverseGeocode(coords.lat, coords.lng);
        }
        updateDirectionArrow(coords.heading);
    };

    const updateMapMarker = (coords: LocationCoords) => {
        if (!mapInstanceRef.current) return;
        const position = { lat: coords.lat, lng: coords.lng };

        if (markerRef.current) {
            markerRef.current.setPosition(position);
        } else {
            markerRef.current = new google.maps.Marker({
                position,
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

    const updateDirectionArrow = (heading: number | null) => {
        if (directionArrowRef.current && heading) {
            directionArrowRef.current.style.transform = `rotate(${heading}deg)`;
        }
    };

    const reverseGeocode = (lat: number, lng: number) => {
        if (!window.google) return;
        // Reuse single instance — new Geocoder() per call causes race conditions
        if (!geocoderRef.current) geocoderRef.current = new google.maps.Geocoder();
        const geocoder = geocoderRef.current;
        geocoder.geocode({ location: { lat, lng } }, (results, status) => {
            if (status !== 'OK' || !results?.[0]) return;
            const c = results[0].address_components;
            let street = '', area = '', city = '', state = '', country = '';
            for (const comp of c) {
                if (comp.types.includes('route')) street = comp.long_name;
                if (comp.types.includes('sublocality') || comp.types.includes('neighborhood')) area = comp.long_name;
                if (comp.types.includes('locality')) city = comp.long_name;
                if (comp.types.includes('administrative_area_level_1')) state = comp.long_name;
                if (comp.types.includes('country')) country = comp.long_name;
            }
            setAddress({
                street: street || 'Unknown Street', area, city,
                state: state || 'Anambra', country: country || 'Nigeria',
                formatted: results[0].formatted_address
            });
        });
    };

    const togglePlaces = () => {
        if (!userLocation || !placesServiceRef.current) {
            Swal.fire({ icon: 'warning', title: 'Location Required', text: 'Please enable GPS first', confirmButtonColor: '#ff5e00' });
            return;
        }
        if (showPlaces) { setShowPlaces(false); return; }
        placesServiceRef.current.nearbySearch(
            { location: { lat: userLocation.lat, lng: userLocation.lng }, radius: 1000, type: 'restaurant' },
            (results, status) => {
                if (status === google.maps.places.PlacesServiceStatus.OK && results) {
                    setNearbyPlaces(results.slice(0, 10).map(p => ({
                        id: p.place_id || Math.random().toString(),
                        name: p.name || 'Unknown', vicinity: p.vicinity || '',
                        location: { lat: p.geometry!.location!.lat(), lng: p.geometry!.location!.lng() }
                    })));
                    setShowPlaces(true);
                } else {
                    Swal.fire({ icon: 'info', title: 'No Places Found', text: 'No nearby places found', confirmButtonColor: '#ff5e00' });
                }
            }
        );
    };

    const findNearbyChurches = () => {
        if (!userLocation || !placesServiceRef.current) {
            Swal.fire({ icon: 'warning', title: 'Location Required', text: 'Please enable GPS first', confirmButtonColor: '#ff5e00' });
            return;
        }
        placesServiceRef.current.nearbySearch(
            { location: { lat: userLocation.lat, lng: userLocation.lng }, radius: 2000, keyword: 'church' },
            (results, status) => {
                if (status === google.maps.places.PlacesServiceStatus.OK && results) {
                    setNearbyPlaces(results.slice(0, 10).map(p => ({
                        id: p.place_id || Math.random().toString(),
                        name: p.name || 'Unknown', vicinity: p.vicinity || '',
                        location: { lat: p.geometry!.location!.lat(), lng: p.geometry!.location!.lng() }
                    })));
                    setShowPlaces(true);
                } else {
                    Swal.fire({ icon: 'info', title: 'No Churches Found', text: 'No nearby churches found', confirmButtonColor: '#ff5e00' });
                }
            }
        );
    };

    const centerOnUser = () => {
        if (userLocation && mapInstanceRef.current) {
            mapInstanceRef.current.setCenter({ lat: userLocation.lat, lng: userLocation.lng });
            mapInstanceRef.current.setZoom(18);
        } else {
            requestLocationPermission();
        }
    };

    const goToPlace = (place: PlaceResult) => {
        if (mapInstanceRef.current) {
            mapInstanceRef.current.setCenter(place.location);
            mapInstanceRef.current.setZoom(18);
            setShowPlaces(false);
        }
    };

    useEffect(() => () => {
        if (watchIdRef.current) navigator.geolocation.clearWatch(watchIdRef.current);
    }, []);

    return (
        <>
            <style>{`
                html, body, #app { margin: 0 !important; padding: 0 !important; width: 100% !important; max-width: 100% !important; overflow-x: hidden !important; background: white !important; }
                .mobile-location-container { width: 100vw !important; max-width: 100vw !important; margin: 0 !important; padding: 0 !important; background: white !important; overflow-x: hidden !important; }
                .mobile-location-view { overflow-y: auto !important; overflow-x: hidden !important; padding-bottom: 80px !important; min-height: 100vh !important; display: flex !important; flex-direction: column !important; width: 100% !important; }
                @media (max-width: 380px) { .mobile-map-container { height: 50vh !important; min-height: 280px !important; } }
                @supports (-webkit-touch-callout: none) { .mobile-location-view { height: -webkit-fill-available !important; } }
            `}</style>

            <div className="mobile-location-container">
                <div className="mobile-location-view">
                    {/* Header */}
                    <div className="mobile-location-header">
                        <div className="mobile-location-user-info">
                            <h1>Live Location Tracker</h1>
                            <p>📍 Real-time GPS • Maps • Places</p>
                        </div>
                    </div>

                    {/* Enable Location Prompt */}
                    {(!hasPermission || !isTracking) && (
                        <div className="mobile-enable-location-btn-container">
                            <button className="mobile-enable-location-btn" onClick={requestLocationPermission}>
                                <i className="fas fa-location-dot"></i>
                                <span>Enable GPS Tracking</span>
                                <i className="fas fa-arrow-right"></i>
                            </button>
                            <p className="mobile-enable-location-hint">
                                Allow location access to see your real-time position on the map
                            </p>
                        </div>
                    )}

                    {showPermissionPrompt && !hasPermission && !isTracking && (
                        <div className="mobile-permission-prompt">
                            <i className="fas fa-exclamation-triangle"></i>
                            <span>Location Access Required</span>
                            <p>Please enable location services to use GPS tracking features</p>
                            <button onClick={requestLocationPermission}>Enable Location</button>
                        </div>
                    )}

                    {/* Map — top section, full height taken from viewport */}
                    <div className="mobile-map-container">
                        <div ref={mapRef} className="mobile-map"></div>

                        <div ref={directionArrowRef} className="mobile-direction-arrow">
                            <i className="fas fa-location-arrow"></i>
                        </div>

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
                                            <div className="mobile-place-icon"><i className="fas fa-map-marker-alt"></i></div>
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

                    {/* GPS Info Card — BELOW the map, not floating */}
                    {(hasPermission || isTracking) && (
                        <div className="mobile-location-card">
                            <div className="mobile-location-header-row">
                                <div className="mobile-location-title">
                                    <span className={`mobile-gps-pulse ${hasPermission && isTracking ? 'active' : 'inactive'}`}></span>
                                    <span className="mobile-gps-state">{gpsStatus}</span>
                                </div>
                                <span className="mobile-gps-badge">
                                    <i className="fas fa-satellite-dish"></i> GPS Live
                                </span>
                            </div>

                            {hasPermission && (
                                <div className="mobile-gps-control">
                                    {isTracking ? (
                                        <button className="mobile-stop-gps-btn" onClick={stopGPSTracking}>
                                            <i className="fas fa-stop-circle"></i> Stop Tracking
                                        </button>
                                    ) : (
                                        <button className="mobile-start-gps-btn" onClick={startGPSTracking}>
                                            <i className="fas fa-play-circle"></i> Start Tracking
                                        </button>
                                    )}
                                </div>
                            )}

                            <div className="mobile-street-address">
                                <i className="fas fa-location-dot"></i>
                                <span className="mobile-street-name">{address.street}</span>
                            </div>

                            <div className="mobile-full-address">
                                <i className="fas fa-map-pin"></i>
                                <span>{address.formatted}</span>
                            </div>

                            <div className="mobile-coordinate-row">
                                <div className="mobile-coord-item">
                                    <i className="fas fa-globe-africa"></i>
                                    <div className="coord-label">Latitude</div>
                                    <div className="coord-value">{locationStats.latitude}</div>
                                </div>
                                <div className="mobile-coord-item">
                                    <i className="fas fa-globe-americas"></i>
                                    <div className="coord-label">Longitude</div>
                                    <div className="coord-value">{locationStats.longitude}</div>
                                </div>
                                <div className="mobile-coord-item">
                                    <i className="fas fa-bullseye"></i>
                                    <div className="coord-label">Accuracy</div>
                                    <div className="coord-value">{locationStats.accuracy}m</div>
                                </div>
                            </div>

                            <div className="mobile-movement-stats">
                                <div className="mobile-stat-badge">
                                    <i className="fas fa-tachometer-alt"></i>
                                    <span className="stat-label">Speed</span>
                                    <span className="stat-value">{locationStats.speed}</span>
                                    <span className="stat-unit">km/h</span>
                                </div>
                                <div className="mobile-stat-badge">
                                    <i className="fas fa-compass"></i>
                                    <span className="stat-label">Heading</span>
                                    <span className="stat-value">{locationStats.heading}</span>
                                    <span className="stat-unit">°</span>
                                </div>
                                <div className="mobile-stat-badge">
                                    <i className="fas fa-mountain"></i>
                                    <span className="stat-label">Altitude</span>
                                    <span className="stat-value">{locationStats.altitude}</span>
                                    <span className="stat-unit">m</span>
                                </div>
                            </div>
                        </div>
                    )}

                    <ClientNavMobile />
                </div>
            </div>
        </>
    );
};

export default ClientLocationMobile;