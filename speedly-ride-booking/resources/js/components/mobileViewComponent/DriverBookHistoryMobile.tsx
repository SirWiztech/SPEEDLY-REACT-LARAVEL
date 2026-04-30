import { useState } from 'react';
import { Head } from '@inertiajs/react';
import DriverNavMobile from '@/components/navbars/DriverNavMobile';
import { useQuery } from '@tanstack/react-query';
import { usePreloader } from '../../hooks/usePreloader';
import MobilePreloader from '../preloader/MobilePreloader';
import '../../../css/DriverBookHistory.css';

interface Ride {
    id: string;
    pickup: string;
    destination: string;
    status: 'completed' | 'cancelled';
    date: string;
    fare: number;
    client_name: string;
}

export default function DriverBookHistoryMobile() {
    const [filter, setFilter] = useState<'all' | 'completed' | 'cancelled'>('all');
    const loading = usePreloader(1500);

    const { data: rides } = useQuery<Ride[]>({
        queryKey: ['driver-rides-history-mobile'],
        queryFn: () => fetch('/api/driver/rides/history').then(res => res.json()),
    });

    const filteredRides = rides?.filter(ride => {
        if (filter === 'all') return true;
        return ride.status === filter;
    });

    if (loading) {
        return <MobilePreloader />;
    }

    return (
        <>
            <Head title="Ride History - Mobile" />
            <div className="mobile-container">
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
                                <span className="ride-fare">${ride.fare.toFixed(2)}</span>
                            </div>
                            <p><strong>From:</strong> {ride.pickup}</p>
                            <p><strong>To:</strong> {ride.destination}</p>
                            <p><strong>Client:</strong> {ride.client_name}</p>
                            <p><strong>Date:</strong> {new Date(ride.date).toLocaleDateString()}</p>
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
