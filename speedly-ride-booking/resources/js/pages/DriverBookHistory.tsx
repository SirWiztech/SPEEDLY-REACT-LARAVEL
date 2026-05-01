import { useState } from 'react';
import { Head } from '@inertiajs/react';
import DriverSidebarDesktop from '@/components/navbars/DriverSidebarDesktop';
import DriverNavMobile from '@/components/navbars/DriverNavMobile';
import { useQuery } from '@tanstack/react-query';
import { usePreloader } from '../hooks/usePreloader';
import { useMobile } from '../hooks/useMobile';
import MobilePreloader from '../components/preloader/MobilePreloader';
import DesktopPreloader from '../components/preloader/DesktopPreloader';
import { api } from '../services/api';
import '../../css/DriverBookHistory.css';

interface Ride {
    id: string;
    pickup_location: string;
    dropoff_location: string;
    status: 'completed' | 'cancelled' | 'accepted' | 'pending';
    created_at: string;
    fare_amount: number;
    client: { full_name: string } | null;
}

export default function DriverBookHistory() {
    const [filter, setFilter] = useState<'all' | 'completed' | 'cancelled'>('all');
    const loading = usePreloader(1000);
    const isMobile = useMobile();

    const { data: rides, isLoading } = useQuery<Ride[]>({
        queryKey: ['driver-rides-history'],
        queryFn: () => api.driver.rideHistory().then(res => res.data),
    });

    const filteredRides = rides?.filter(ride => {
        if (filter === 'all') return true;
        return ride.status === filter;
    });

    if (loading) {
        return isMobile ? <MobilePreloader /> : <DesktopPreloader />;
    }

    return (
        <>
            <Head title="Ride History" />
            <div className="mobile-container">
                <div className="desktop-sidebar-container">
                    <DriverSidebarDesktop userName="Driver" />
                </div>

                <div className="main-content">
                    <div className="mobile-header">
                        <h1>Ride History</h1>
                    </div>

                    <div className="filter-tabs">
                        <button 
                            className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
                            onClick={() => setFilter('all')}
                        >
                            All
                        </button>
                        <button 
                            className={`filter-tab ${filter === 'completed' ? 'active' : ''}`}
                            onClick={() => setFilter('completed')}
                        >
                            Completed
                        </button>
                        <button 
                            className={`filter-tab ${filter === 'cancelled' ? 'active' : ''}`}
                            onClick={() => setFilter('cancelled')}
                        >
                            Cancelled
                        </button>
                    </div>

                    <div className="rides-list">
                        {filteredRides?.map((ride) => (
                            <div key={ride.id} className="ride-card">
                                <div className="ride-header">
                                    <span className={`ride-status ${ride.status}`}>{ride.status}</span>
                                    <span className="ride-fare">₦{ride.fare_amount?.toLocaleString()}</span>
                                </div>
                                <p><strong>From:</strong> {ride.pickup_location}</p>
                                <p><strong>To:</strong> {ride.dropoff_location}</p>
                                <p><strong>Rider:</strong> {ride.client?.full_name || 'N/A'}</p>
                                <p><strong>Date:</strong> {new Date(ride.created_at).toLocaleDateString()}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="mobile-nav-container">
                    <DriverNavMobile />
                </div>
            </div>
        </>
    );
}
