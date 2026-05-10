import { useState, useEffect, useRef } from 'react';
import { Head } from '@inertiajs/react';
import DriverNavMobile from '@/components/navbars/DriverNavMobile';
import { useQuery } from '@tanstack/react-query';
import { usePreloader } from '../../hooks/usePreloader';
import MobilePreloader from '../preloader/MobilePreloader';
import { api } from '../../services/api';
import '../../../css/DriverLocation.css';

interface DriverLocationData {
    latitude: number;
    longitude: number;
    last_location_update: string;
    status: string;
}

export default function DriverLocationMobile() {
    const loading = usePreloader(1500);
    const [driverStatus, setDriverStatus] = useState<'online' | 'offline'>('offline');
    const [hasPermission, setHasPermission] = useState(false);
    const [gpsStatus, setGpsStatus] = useState('WAITING FOR GPS');
    const [gpsClicked, setGpsClicked] = useState(false);
    const [userLocation, setUserLocation] = useState<GeolocationCoordinates | null>(null);
    const watchIdRef = useRef<number | null>(null);

    const { data: locationData, refetch } = useQuery<DriverLocationData>({
        queryKey: ['driver-locations-mobile'],
        queryFn: () => api.driver.locations().then(res => res.data),
    });

    useEffect(() => {
        if (locationData?.status) {
            setDriverStatus(locationData.status as 'online' | 'offline');
        }
    }, [locationData]);

    const startGPS = () => {
        if (!navigator.geolocation) {
            setGpsStatus('GPS NOT SUPPORTED');
            return;
        }
        setGpsClicked(true);
        setGpsStatus('REQUESTING GPS...');
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setHasPermission(true);
                setGpsStatus('GPS ACTIVE - TRACKING');
                setUserLocation(position.coords);
                startWatching();
            },
            (error) => {
                setHasPermission(false);
                setGpsStatus('GPS ACCESS DENIED');
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
                setUserLocation(position.coords);
            },
            null,
            { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 }
        );
    };

    const toggleStatus = async () => {
        const newStatus = driverStatus === 'online' ? 'offline' : 'online';
        setDriverStatus(newStatus);
        await api.driver.toggleStatus({ status: newStatus });
        refetch();
    };

    useEffect(() => {
        return () => {
            if (watchIdRef.current) {
                navigator.geolocation.clearWatch(watchIdRef.current);
            }
        };
    }, []);

    if (loading) {
        return <MobilePreloader />;
    }

    return (
        <>
            <Head title="Location - Mobile" />
            <div className="mobile-container">
                <div className="mobile-header">
                    <h1>My Location</h1>
                </div>

                <div className="status-toggle">
                    <div>
                        <div className="status-label">Driver Status</div>
                        <div className={`status-value ${driverStatus}`}>
                            {driverStatus === 'online' ? 'Online' : 'Offline'}
                        </div>
                    </div>
                    <button 
                        className={`btn-toggle ${driverStatus === 'online' ? 'go-offline' : 'go-online'}`}
                        onClick={toggleStatus}
                    >
                        {driverStatus === 'online' ? 'Go Offline' : 'Go Online'}
                    </button>
                </div>

                <div className="current-location">
                    <div className="gps-status-bar">
                        <span className={`gps-dot ${hasPermission ? 'active' : ''}`}></span>
                        <span className="gps-status-text">{gpsStatus}</span>
                    </div>

                    {userLocation ? (
                        <div className="location-card">
                            <div className="location-icon">📍</div>
                            <div className="location-details">
                                <h4>Live Location</h4>
                                <p>Lat: {userLocation.latitude.toFixed(6)}</p>
                                <p>Lng: {userLocation.longitude.toFixed(6)}</p>
                                <p>Accuracy: ±{userLocation.accuracy.toFixed(0)}m</p>
                                {userLocation.speed !== null && (
                                    <p>Speed: {(userLocation.speed * 3.6).toFixed(1)} km/h</p>
                                )}
                            </div>
                        </div>
                    ) : locationData?.latitude ? (
                        <div className="location-card">
                            <div className="location-icon">📍</div>
                            <div className="location-details">
                                <h4>Last Known Position</h4>
                                <p>Lat: {locationData.latitude.toFixed(6)}</p>
                                <p>Lng: {locationData.longitude.toFixed(6)}</p>
                                {locationData.last_location_update && (
                                    <p className="location-time">
                                        Updated: {new Date(locationData.last_location_update).toLocaleString()}
                                    </p>
                                )}
                            </div>
                        </div>
                    ) : null}

                    {!gpsClicked && (
                        <button className="gps-allow-btn" onClick={startGPS}>
                            <i className="fas fa-location-arrow"></i>
                            Enable GPS
                        </button>
                    )}
                </div>

                <div className="mobile-nav-container">
                    <DriverNavMobile />
                </div>
            </div>
        </>
    );
}