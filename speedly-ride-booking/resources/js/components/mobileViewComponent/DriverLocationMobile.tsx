import { useState } from 'react';
import { Head } from '@inertiajs/react';
import DriverNavMobile from '@/components/navbars/DriverNavMobile';
import { useQuery } from '@tanstack/react-query';
import { usePreloader } from '../../hooks/usePreloader';
import MobilePreloader from '../preloader/MobilePreloader';
import '../../../css/DriverLocation.css';

interface Location {
    id: string;
    name: string;
    address: string;
    type: 'home' | 'work' | 'other';
}

export default function DriverLocationMobile() {
    const loading = usePreloader(1500);
    const [driverStatus, setDriverStatus] = useState<'online' | 'offline'>('offline');

    const { data: locations } = useQuery<Location[]>({
        queryKey: ['driver-locations-mobile'],
        queryFn: () => fetch('/api/driver/locations').then(res => res.json()),
    });

    const toggleStatus = () => {
        const newStatus = driverStatus === 'online' ? 'offline' : 'online';
        setDriverStatus(newStatus);
        fetch('/api/driver/toggle-status', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus }),
        });
    };

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

                <div className="saved-locations">
                    <h3>Saved Locations</h3>
                    {locations?.map((location) => (
                        <div key={location.id} className="location-card">
                            <div className="location-icon">
                                {location.type === 'home' ? '🏠' : location.type === 'work' ? '💼' : '📍'}
                            </div>
                            <div className="location-details">
                                <h4>{location.name}</h4>
                                <p>{location.address}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mobile-nav-container">
                    <DriverNavMobile />
                </div>
            </div>
        </>
    );
}
