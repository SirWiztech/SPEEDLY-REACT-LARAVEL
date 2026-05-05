import React, { useState, useEffect, useCallback, useRef } from 'react';
import { router } from '@inertiajs/react';
import ClientSidebarDesktop from '../components/navbars/ClientSidebarDesktop';
import Swal from 'sweetalert2';
import { usePreloader } from '../hooks/usePreloader';
import { useMobile } from '../hooks/useMobile';
import DesktopPreloader from '../components/preloader/DesktopPreloader';
import ClientLocationMobile from '../components/mobileViewComponent/ClientLocationMobile';
import '../../css/ClientLocation.css';

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
    types: string[];
}

const ClientLocation: React.FC = () => {
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
    const [isTracking, setIsTracking] = useState<boolean>(false);
    const [nearbyPlaces, setNearbyPlaces] = useState<PlaceResult[]>([]);
    const [showPlaces, setShowPlaces] = useState<boolean>(false);
    const [gpsStatus, setGpsStatus] = useState<string>('WAITING FOR GPS');

    const watchIdRef = useRef<number | null>(null);
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<google.maps.Map | null>(null);
    const markerRef = useRef<google.maps.Marker | null>(null);
    const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);
    const placesServiceRef = useRef<google.maps.places.PlacesService | null>(null);
    const directionArrowRef = useRef<HTMLDivElement>(null);

    const preloaderLoading = usePreloader(1000);
    const isMobile = useMobile();

    // Google Maps API Key
    const GOOGLE_MAPS_API_KEY = 'AIzaSyB1tM_s2w8JWfnIoUTAzJNpbblU-eZiC30';

    // Load Google Maps script
    useEffect(() => {
        const loadGoogleMaps = () => {
            if (document.querySelector('#google-maps-script-location')) {
                initMap();
                return;
            }

            const script = document.createElement('script');
            script.id = 'google-maps-script-location';
            script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places,geometry&callback=initMapLocation`;
            script.async = true;
            script.defer = true;

            (window as any).initMapLocation = () => {
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
            mapTypeControl: true,
            streetViewControl: true,
            fullscreenControl: true,
            zoomControl: true,
            styles: [
                {
                    featureType: "poi",
                    elementType: "labels",
                    stylers: [{ visibility: "on" }]
                },
                {
                    featureType: "road",
                    elementType: "labels",
                    stylers: [{ visibility: "on" }]
                }
            ]
        });

        infoWindowRef.current = new google.maps.InfoWindow();
        placesServiceRef.current = new google.maps.places.PlacesService(mapInstanceRef.current);
    };

    // Check geolocation permission
    const checkGeolocationPermission = () => {
        if (!navigator.permissions) {
            requestLocationPermission();
            return;
        }

        navigator.permissions.query({ name: 'geolocation' }).then((result) => {
            if (result.state === 'granted') {
                setHasPermission(true);
                startGPSTracking();
            } else if (result.state === 'denied') {
                setHasPermission(false);
                setGpsStatus('GPS ACCESS DENIED');
                updateGPSStatus('denied');
            }

            result.addEventListener('change', () => {
                if (result.state === 'granted') {
                    setHasPermission(true);
                    startGPSTracking();
                }
            });
        });
    };

    // Request location permission
    const requestLocationPermission = () => {
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
                updateGPSStatus('denied');
                
                Swal.fire({
                    icon: 'warning',
                    title: 'Location Access Required',
                    text: 'Please enable location access to use GPS features',
                    confirmButtonColor: '#ff5e00'
                });
            },
            { enableHighAccuracy: true, timeout: 30000, maximumAge: 0 }
        );
    };

    // Start GPS tracking
    const startGPSTracking = () => {
        if (!navigator.geolocation) {
            Swal.fire({ icon: 'error', title: 'Not Supported', text: 'Geolocation is not supported', confirmButtonColor: '#ff5e00' });
            return;
        }

        setGpsStatus('GPS ACTIVE - TRACKING');
        setIsTracking(true);
        updateGPSStatus('active');

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
                updateGPSStatus('error');
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

    // Update location state
    const updateLocation = (coords: LocationCoords) => {
        setUserLocation(coords);
        
        // Update map center
        if (mapInstanceRef.current) {
            mapInstanceRef.current.setCenter({ lat: coords.lat, lng: coords.lng });
            mapInstanceRef.current.setZoom(18);
        }
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

            markerRef.current.addListener('click', () => {
                if (infoWindowRef.current && markerRef.current) {
                    infoWindowRef.current.setContent(`
                        <div style="padding: 10px;">
                            <h3 style="font-weight: bold; color: #ff5e00;">📍 You Are Here</h3>
                            <p>Accuracy: ±${coords.accuracy.toFixed(0)}m</p>
                            <p>Speed: ${((coords.speed || 0) * 3.6).toFixed(1)} km/h</p>
                        </div>
                    `);
                    infoWindowRef.current.open(mapInstanceRef.current, markerRef.current);
                }
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
    const findNearbyPlaces = (type: string = 'restaurant') => {
        if (!userLocation || !placesServiceRef.current) {
            Swal.fire({ icon: 'warning', title: 'Location Required', text: 'Please enable GPS first', confirmButtonColor: '#ff5e00' });
            return;
        }

        const request: google.maps.places.NearbySearchRequest = {
            location: { lat: userLocation.lat, lng: userLocation.lng },
            radius: 1000,
            type: type as google.maps.places.PlaceType
        };

        placesServiceRef.current.nearbySearch(request, (results, status) => {
            if (status === google.maps.places.PlacesServiceStatus.OK && results) {
                const places: PlaceResult[] = results.slice(0, 10).map(place => ({
                    id: place.place_id || Math.random().toString(),
                    name: place.name || 'Unknown',
                    vicinity: place.vicinity || '',
                    location: { lat: place.geometry!.location!.lat(), lng: place.geometry!.location!.lng() },
                    types: place.types || []
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
                    location: { lat: place.geometry!.location!.lat(), lng: place.geometry!.location!.lng() },
                    types: place.types || []
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

            new google.maps.Marker({
                position: place.location,
                map: mapInstanceRef.current,
                title: place.name,
                animation: google.maps.Animation.DROP
            });

            setShowPlaces(false);
        }
    };

    // Update GPS status UI
    const updateGPSStatus = (status: 'active' | 'denied' | 'error') => {
        const pulseElement = document.querySelector('.desktop-gps-pulse') as HTMLElement;
        const stateElement = document.querySelector('.desktop-gps-state') as HTMLElement;

        if (pulseElement && stateElement) {
            if (status === 'active') {
                pulseElement.style.background = '#4ade80';
                stateElement.innerHTML = '🟢 GPS ACTIVE - LIVE TRACKING';
                stateElement.style.color = '#4caf50';
            } else if (status === 'denied') {
                pulseElement.style.background = '#ef4444';
                stateElement.innerHTML = '❌ GPS ACCESS DENIED';
                stateElement.style.color = '#ef4444';
            } else {
                pulseElement.style.background = '#ff9800';
                stateElement.innerHTML = '⚠️ GPS ERROR';
                stateElement.style.color = '#ff9800';
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

    const formatSpeed = (speed: number | null) => ((speed || 0) * 3.6).toFixed(1);
    const formatAccuracy = (accuracy: number) => accuracy.toFixed(0);

    if (preloaderLoading) {
        return <DesktopPreloader />;
    }

    // Render mobile view
    if (isMobile) {
        return <ClientLocationMobile />;
    }

    return (
        <div className="location-desktop-container">
            <ClientSidebarDesktop userName={userData?.fullname || 'User'} profilePictureUrl={userData?.profile_picture_url} />

            <div className="location-desktop-main">
                {/* Header */}
                <div className="location-desktop-header">
                    <div className="location-desktop-title">
                        <h1>⚡ Google Cloud Maps - All Features</h1>
                        <p>📍 Live Location • Places • Streets • Churches</p>
                    </div>
                </div>

                {/* Map and Panel Container */}
                <div className="location-desktop-grid">
                    {/* Map Column */}
                    <div className="location-map-col">
                        <div ref={mapRef} className="location-map"></div>
                        <div className="location-map-controls">
                            <button className="location-map-btn" onClick={() => findNearbyPlaces('restaurant')} title="Nearby Places">
                                <i className="fas fa-store"></i>
                            </button>
                            <button className="location-map-btn" onClick={findNearbyChurches} title="Nearby Churches">
                                <i className="fas fa-church"></i>
                            </button>
                            <button className="location-map-btn" onClick={centerOnUser} title="My Location">
                                <i className="fas fa-crosshairs"></i>
                            </button>
                        </div>
                        <div ref={directionArrowRef} className="location-direction-arrow">
                            <i className="fas fa-location-arrow"></i>
                        </div>

                        {/* Places Panel */}
                        {showPlaces && (
                            <div className="location-places-panel">
                                <div className="location-places-header">
                                    <h3>Nearby Places</h3>
                                    <button className="location-close-places" onClick={() => setShowPlaces(false)}>
                                        <i className="fas fa-times"></i>
                                    </button>
                                </div>
                                <div className="location-places-list">
                                    {nearbyPlaces.map((place) => (
                                        <div key={place.id} className="location-place-item" onClick={() => goToPlace(place)}>
                                            <div className="location-place-icon">
                                                <i className="fas fa-map-marker-alt"></i>
                                            </div>
                                            <div className="location-place-info">
                                                <h4>{place.name}</h4>
                                                <p>{place.vicinity}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Info Panel */}
                    <div className="location-info-panel">
                        <div className="location-gps-header">
                            <span className="desktop-gps-pulse"></span>
                            <span className="desktop-gps-state">⏳ Waiting for GPS permission</span>
                        </div>

                        {/* Address Card */}
                        <div className="location-address-card">
                            <div className="location-address-title">
                                <i className="fas fa-location-dot"></i>
                                <span>{address.street}</span>
                            </div>
                            <div className="location-address-full">{address.formatted}</div>
                        </div>

                        {/* Coordinates Grid */}
                        <div className="location-coord-grid">
                            <div className="location-coord-item">
                                <div className="coord-label">LATITUDE</div>
                                <div className="coord-value">{userLocation?.lat.toFixed(6) || '--'}</div>
                            </div>
                            <div className="location-coord-item">
                                <div className="coord-label">LONGITUDE</div>
                                <div className="coord-value">{userLocation?.lng.toFixed(6) || '--'}</div>
                            </div>
                            <div className="location-coord-item">
                                <div className="coord-label">ACCURACY</div>
                                <div className="coord-value">±{userLocation ? formatAccuracy(userLocation.accuracy) : '--'}m</div>
                            </div>
                            <div className="location-coord-item">
                                <div className="coord-label">GPS SOURCE</div>
                                <div className="coord-value">Google Maps</div>
                            </div>
                        </div>

                        {/* Movement Stats */}
                        <div className="location-movement-stats">
                            <div className="location-stat-badge">
                                <i className="fas fa-tachometer-alt"></i>
                                <span className="stat-label">Speed</span>
                                <span className="stat-value">{userLocation ? formatSpeed(userLocation.speed) : '0'}</span>
                                <span className="stat-unit">km/h</span>
                            </div>
                            <div className="location-stat-badge">
                                <i className="fas fa-compass"></i>
                                <span className="stat-label">Heading</span>
                                <span className="stat-value">{userLocation?.heading?.toFixed(0) || '--'}</span>
                                <span className="stat-unit">°</span>
                            </div>
                            <div className="location-stat-badge">
                                <i className="fas fa-mountain"></i>
                                <span className="stat-label">Altitude</span>
                                <span className="stat-value">{userLocation?.altitude?.toFixed(0) || '--'}</span>
                                <span className="stat-unit">m</span>
                            </div>
                        </div>

                        {/* Permission Button */}
                        {!hasPermission && (
                            <button className="location-permission-btn" onClick={requestLocationPermission}>
                                <i className="fas fa-location-arrow"></i>
                                ALLOW GPS ACCESS FOR ALL FEATURES
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ClientLocation;