import { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import { usePreloader } from '../hooks/usePreloader';
import { useMobile } from '../hooks/useMobile';
import MobilePreloader from '../components/preloader/MobilePreloader';
import DesktopPreloader from '../components/preloader/DesktopPreloader';

interface RideData {
    id: string;
    pickup: string;
    destination: string;
    fare: number;
    date: string;
    client_name: string;
    driver_name: string;
    vehicle_model: string;
    plate_number: string;
    payment_method: string;
}

declare global {
    interface Window {
        location: Location;
    }
}

export default function GenerateReceipt() {
    const [rideData, setRideData] = useState<RideData | null>(null);
    const loading = usePreloader(1000);
    const isMobile = useMobile();

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const rideId = urlParams.get('ride_id');

        if (rideId) {
            fetch(`/api/rides/${rideId}/receipt`)
                .then(res => res.json())
                .then(data => {
                    setRideData(data.ride);
                })
                .catch(err => console.error('Error fetching receipt:', err));
        }
    }, []);

    if (loading) {
        return isMobile ? <MobilePreloader /> : <DesktopPreloader />;
    }

    return (
        <>
            <Head title="Ride Receipt" />
            <div className="receipt-page">
                <div className="receipt-container">
                    <div className="receipt-header">
                        <img src="/main-assets/logo.png" alt="Speedly" className="receipt-logo" />
                        <h1>Ride Receipt</h1>
                    </div>

                    {rideData ? (
                        <>
                            <div className="receipt-details">
                                <div className="detail-row">
                                    <span className="label">Receipt #</span>
                                    <span className="value">{rideData.id}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="label">Date</span>
                                    <span className="value">{new Date(rideData.date).toLocaleDateString()}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="label">Pickup</span>
                                    <span className="value">{rideData.pickup}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="label">Destination</span>
                                    <span className="value">{rideData.destination}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="label">Driver</span>
                                    <span className="value">{rideData.driver_name}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="label">Vehicle</span>
                                    <span className="value">{rideData.vehicle_model} - {rideData.plate_number}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="label">Payment Method</span>
                                    <span className="value">{rideData.payment_method}</span>
                                </div>
                            </div>

                            <div className="receipt-total">
                                <span className="label">Total Fare</span>
                                <span className="amount">${rideData.fare.toFixed(2)}</span>
                            </div>

                            <div className="receipt-actions">
                                <button 
                                    className="btn-premium"
                                    onClick={() => window.print()}
                                >
                                    Print Receipt
                                </button>
                                <a href="/client/dashboard" className="btn-secondary">
                                    Back to Dashboard
                                </a>
                            </div>
                        </>
                    ) : (
                        <div className="receipt-loading">
                            <p>Loading receipt...</p>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
