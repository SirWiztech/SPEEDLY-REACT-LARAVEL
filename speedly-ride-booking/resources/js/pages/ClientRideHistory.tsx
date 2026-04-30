import { useState, useEffect } from 'react';
import { Link } from '@inertiajs/react';
import ClientSidebarDesktop from '@/components/navbars/ClientSidebarDesktop';
import ClientNavmobile from '@/components/navbars/ClientNavmobile';

interface Ride {
    id: string;
    pickup: string;
    destination: string;
    date: string;
    status: 'completed' | 'in-progress' | 'cancelled';
    fare: number;
}

export default function ClientRideHistory() {
    const [loading, setLoading] = useState(true);
    const [rides, setRides] = useState<Ride[]>([]);
    const [filter, setFilter] = useState<'all' | 'completed' | 'cancelled'>('all');

    useEffect(() => {
        fetchRides();
    }, []);

    const fetchRides = async () => {
        try {
            setRides([
                { id: '1', pickup: 'Main St', destination: 'Airport', date: '2026-04-30', status: 'completed', fare: 25.00 },
                { id: '2', pickup: 'Downtown', destination: 'Mall', date: '2026-04-29', status: 'completed', fare: 15.00 },
                { id: '3', pickup: 'Home', destination: 'Office', date: '2026-04-28', status: 'cancelled', fare: 12.00 }
            ]);
            setLoading(false);
        } catch (error) {
            console.error('Error:', error);
            setLoading(false);
        }
    };

    const filteredRides = filter === 'all' ? rides : rides.filter(ride => ride.status === filter);

    if (loading) {
        return <div className="preloader">Loading...</div>;
    }

    return (
        <div className="mobile-container">
            <div className="desktop-sidebar-container">
                <ClientSidebarDesktop />
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
                    {filteredRides.length === 0 ? (
                        <div className="empty-state">
                            <p>No rides found</p>
                        </div>
                    ) : (
                        filteredRides.map((ride) => (
                            <div key={ride.id} className="ride-card">
                                <div className="ride-info">
                                    <p><strong>From:</strong> {ride.pickup}</p>
                                    <p><strong>To:</strong> {ride.destination}</p>
                                    <p><strong>Date:</strong> {ride.date}</p>
                                    <p><strong>Status:</strong> <span className={`status-${ride.status}`}>{ride.status}</span></p>
                                    <p><strong>Fare:</strong> ${ride.fare.toFixed(2)}</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            <div className="mobile-nav-container">
                <ClientNavmobile />
            </div>
        </div>
    );
}
