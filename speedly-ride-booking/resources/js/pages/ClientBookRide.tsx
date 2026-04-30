import { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import ClientSidebarDesktop from '@/components/navbars/ClientSidebarDesktop';
import ClientNavmobile from '@/components/navbars/ClientNavmobile';
import { useMutation, useQuery } from '@tanstack/react-query';
import { usePreloader } from '../hooks/usePreloader';
import { useMobile } from '../hooks/useMobile';
import MobilePreloader from '../components/preloader/MobilePreloader';
import DesktopPreloader from '../components/preloader/DesktopPreloader';
import '../../css/ClientBookRide.css';

interface Location {
    address: string;
    lat: number;
    lng: number;
}

interface RideRequest {
    pickup: Location;
    destination: Location;
    rideType: string;
    estimatedFare: number;
}

export default function ClientBookRide() {
    const [step, setStep] = useState(1);
    const loading = usePreloader(1500);
    const isMobile = useMobile();
    
    const [rideData, setRideData] = useState<RideRequest>({
        pickup: { address: '', lat: 0, lng: 0 },
        destination: { address: '', lat: 0, lng: 0 },
        rideType: 'standard',
        estimatedFare: 0,
    });

    const { data: rideTypes } = useQuery({
        queryKey: ['ride-types'],
        queryFn: () => fetch('/api/ride-types').then(res => res.json()),
    });

    const bookRideMutation = useMutation({
        mutationFn: (data: RideRequest) => 
            fetch('/api/rides/book', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            }).then(res => res.json()),
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
                                    value={rideData.pickup.address}
                                    onChange={(e) => setRideData({
                                        ...rideData,
                                        pickup: { ...rideData.pickup, address: e.target.value }
                                    })}
                                />
                            </div>
                            <div className="input-group">
                                <label>Destination</label>
                                <input 
                                    type="text" 
                                    placeholder="Enter destination"
                                    value={rideData.destination.address}
                                    onChange={(e) => setRideData({
                                        ...rideData,
                                        destination: { ...rideData.destination, address: e.target.value }
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
                                        className={`ride-type-card ${rideData.rideType === type.id ? 'selected' : ''}`}
                                        onClick={() => setRideData({ ...rideData, rideType: type.id })}
                                    >
                                        <span className="ride-icon">{type.icon}</span>
                                        <span className="ride-name">{type.name}</span>
                                        <span className="ride-price">${type.baseFare}</span>
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
