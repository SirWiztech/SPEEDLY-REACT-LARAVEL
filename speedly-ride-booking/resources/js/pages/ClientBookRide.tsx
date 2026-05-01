import { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import ClientSidebarDesktop from '@/components/navbars/ClientSidebarDesktop';
import ClientNavmobile from '@/components/navbars/ClientNavmobile';
import { useMutation, useQuery } from '@tanstack/react-query';
import { usePreloader } from '../hooks/usePreloader';
import { useMobile } from '../hooks/useMobile';
import MobilePreloader from '../components/preloader/MobilePreloader';
import DesktopPreloader from '../components/preloader/DesktopPreloader';
import { api } from '../services/api';
import '../../css/ClientBookRide.css';

interface Location {
    address: string;
    lat: number;
    lng: number;
}

interface RideRequest {
    pickup_location: string;
    dropoff_location: string;
    pickup_lat: number;
    pickup_lng: number;
    dropoff_lat: number;
    dropoff_lng: number;
    ride_type: string;
    scheduled_at?: string;
    notes?: string;
}

export default function ClientBookRide() {
    const [step, setStep] = useState(1);
    const loading = usePreloader(1500);
    const isMobile = useMobile();
    
    const [rideData, setRideData] = useState<RideRequest>({
        pickup_location: '',
        dropoff_location: '',
        pickup_lat: 0,
        pickup_lng: 0,
        dropoff_lat: 0,
        dropoff_lng: 0,
        ride_type: 'economy',
    });

    const { data: rideTypes } = useQuery({
        queryKey: ['ride-types'],
        queryFn: () => api.rides.getRideTypes().then(res => res.data),
    });

    const bookRideMutation = useMutation({
        mutationFn: (data: RideRequest) => api.rides.book(data),
    });

    const handleBookRide = () => {
        bookRideMutation.mutate(rideData);
    };

    if (loading) {
        return isMobile ? <MobilePreloader /> : <DesktopPreloader />;
    }

    return (
        <>
            <Head title="Book a Ride" />
            <div className="mobile-container">
                <div className="desktop-sidebar-container">
                    <ClientSidebarDesktop userName="User" />
                </div>

                <div className="main-content">
                    <div className="mobile-header">
                        <h1>Book a Ride</h1>
                    </div>

                    <div className="book-ride-form">
                        <div className="location-inputs">
                            <div className="input-group">
                                <label>Pickup Location</label>
                                <input 
                                    type="text" 
                                    placeholder="Enter pickup address"
                                    value={rideData.pickup_location}
                                    onChange={(e) => setRideData({
                                        ...rideData,
                                        pickup_location: e.target.value
                                    })}
                                />
                            </div>
                            <div className="input-group">
                                <label>Destination</label>
                                <input 
                                    type="text" 
                                    placeholder="Enter destination"
                                    value={rideData.dropoff_location}
                                    onChange={(e) => setRideData({
                                        ...rideData,
                                        dropoff_location: e.target.value
                                    })}
                                />
                            </div>
                        </div>

                        <div className="ride-types">
                            <h3>Select Ride Type</h3>
                            <div className="ride-type-grid">
                                {rideTypes?.map((type: any) => (
                                    <div 
                                        key={type.id}
                                        className={`ride-type-card ${rideData.ride_type === type.id ? 'selected' : ''}`}
                                        onClick={() => setRideData({ ...rideData, ride_type: type.id })}
                                    >
                                        <span className="ride-icon">{type.icon}</span>
                                        <span className="ride-name">{type.name}</span>
                                        <span className="ride-price">₦{type.base_fare}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <button 
                            className="btn-premium"
                            onClick={handleBookRide}
                            disabled={bookRideMutation.isPending}
                        >
                            {bookRideMutation.isPending ? 'Booking...' : 'Book Ride'}
                        </button>
                    </div>
                </div>

                <div className="mobile-nav-container">
                    <ClientNavmobile />
                </div>
            </div>
        </>
    );
}
