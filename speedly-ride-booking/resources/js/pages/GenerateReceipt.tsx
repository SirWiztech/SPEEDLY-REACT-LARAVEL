import React, { useState, useEffect } from 'react';
import { router, usePage } from '@inertiajs/react';
import Swal from 'sweetalert2';
import api from '../services/api';
import { usePreloader } from '../hooks/usePreloader';
import { useMobile } from '../hooks/useMobile';
import MobilePreloader from '../components/preloader/MobilePreloader';
import DesktopPreloader from '../components/preloader/DesktopPreloader';
import ErrorBoundary from '../components/ErrorBoundary';
import '../../css/GenerateReceipt.css';

interface RideData {
    id: string;
    ride_number: string;
    pickup_address: string;
    destination_address: string;
    total_fare: number;
    distance_km: number;
    ride_type: string;
    created_at: string;
    driver_name: string;
    driver_phone: string;
    vehicle_model: string;
    vehicle_color: string;
    plate_number: string;
    client_name: string;
    client_email: string;
    client_phone: string;
}

interface PaymentData {
    reference: string;
    amount: number;
    status: string;
}

interface FareBreakdown {
    base_fare: number;
    distance_fare: number;
    service_fee: number;
    platform_commission: number;
    driver_payout: number;
    total: number;
}

const GenerateReceipt: React.FC<{ rideId?: string }> = ({ rideId: propRideId }) => {
    const { props } = usePage();
    const rideId = propRideId || (props.rideId as string) || new URLSearchParams(window.location.search).get('rideId') || '';
    const [ride, setRide] = useState<RideData | null>(null);
    const [payment, setPayment] = useState<PaymentData | null>(null);
    const [fareBreakdown, setFareBreakdown] = useState<FareBreakdown | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>('');

    const preloaderLoading = usePreloader(800);
    const isMobile = useMobile();

    useEffect(() => {
        const fetchRideData = async () => {
            if (!rideId) {
                setError('No ride ID provided');
                setLoading(false);
                return;
            }
            try {
                const response = await api.rides.receipt(rideId);
                const payload = response.data || response;
                if (response.success && payload.ride) {
                    setRide(payload.ride);
                    setPayment(payload.payment || null);
                    setFareBreakdown(payload.fare_breakdown || null);
                } else {
                    setError(response.message || 'Failed to load ride details');
                }
            } catch (error) {
                console.error('Error fetching ride data:', error);
                setError('Failed to load ride details');
            } finally {
                setLoading(false);
            }
        };
        fetchRideData();
    }, [rideId]);

    const downloadPDF = async () => {
        const element = document.getElementById('receipt-content');
        if (!element) return;
        Swal.fire({ title: 'Generating PDF...', text: 'Please wait', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
        try {
            const html2pdf = (await import('html2pdf.js')).default;
            const opt = {
                margin: [0.5, 0.5, 0.5, 0.5],
                filename: `speedly_receipt_${ride?.ride_number || rideId}.pdf`,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2, logging: false, dpi: 192, letterRendering: true },
                jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
            };
            html2pdf().set(opt).from(element).save().then(() => {
                Swal.close();
                Swal.fire({ icon: 'success', title: 'PDF Generated!', text: 'Receipt downloaded.', timer: 2000, showConfirmButton: false });
            });
        } catch (e) {
            Swal.close();
            Swal.fire({ icon: 'error', title: 'PDF Error', text: 'Could not generate PDF. Try printing instead.', confirmButtonColor: '#ff4500' });
        }
    };

    const shareWhatsApp = () => {
        if (!ride) return;
        const text = [
            'SPEEDLY RIDE RECEIPT',
            '',
            `Receipt: #${ride.ride_number}`,
            `Date: ${new Date(ride.created_at).toLocaleString()}`,
            `From: ${ride.pickup_address}`,
            `To: ${ride.destination_address}`,
            `Amount: \u20A6${Number(ride.total_fare).toLocaleString()}`,
            `Driver: ${ride.driver_name || 'N/A'}`,
            '',
            'Thank you for riding with Speedly!'
        ].join('\n');
        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
    };

    const formatCurrency = (amount: number) =>
        `\u20A6${Number(amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    const formatDate = (dateString: string) =>
        new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric', month: 'long', day: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });

    if (preloaderLoading) return isMobile ? <MobilePreloader /> : <DesktopPreloader />;

    if (loading) {
        return (
            <div className="receipt-loading">
                <div className="spinner"></div>
                <p>Loading receipt...</p>
            </div>
        );
    }

    if (error || !ride) {
        return (
            <div className="receipt-error">
                <i className="fas fa-exclamation-circle"></i>
                <p>{error || 'Ride not found'}</p>
                <button onClick={() => router.visit('/ride-history')} className="btn-back">
                    Back to Ride History
                </button>
            </div>
        );
    }

    const baseFare = fareBreakdown?.base_fare ?? 500;
    const distanceFare = fareBreakdown?.distance_fare ?? (ride.distance_km || 0) * 1000;
    const serviceFee = fareBreakdown?.service_fee ?? ride.total_fare * 0.05;
    const platformCommission = fareBreakdown?.platform_commission ?? ride.total_fare * 0.2;
    const driverPayout = fareBreakdown?.driver_payout ?? ride.total_fare - platformCommission;

    return (
        <div className="receipt-page">
            <div className="receipt-container" id="receipt-content">
                <div className="receipt-top-border"></div>

                <div className="receipt-header">
                    <img src="/main-assets/logo-no-background.png" alt="Speedly" className="receipt-logo" />
                    <h1>RIDE RECEIPT</h1>
                    <p className="receipt-subtitle">Official Payment Confirmation</p>
                </div>

                <div className="receipt-divider">
                    <span>RECEIPT #{ride.ride_number}</span>
                </div>

                <div className="receipt-body">
                    <div className="info-section">
                        <h3><i className="fas fa-info-circle"></i> Ride Information</h3>
                        <div className="info-grid">
                            <div className="info-item">
                                <span className="info-label">Date & Time</span>
                                <span className="info-value">{formatDate(ride.created_at)}</span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">Ride Type</span>
                                <span className="info-value capitalize">{ride.ride_type || 'Economy'}</span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">Distance</span>
                                <span className="info-value">{Number(ride.distance_km || 0).toFixed(1)} km</span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">Payment</span>
                                <span className="info-value">
                                    <span className="status-badge">PAID</span>
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="locations-section">
                        <div className="location-block">
                            <div className="location-dot pickup"></div>
                            <div className="location-content">
                                <span className="location-label">Pickup</span>
                                <span className="location-address">{ride.pickup_address}</span>
                            </div>
                        </div>
                        <div className="location-line"></div>
                        <div className="location-block">
                            <div className="location-dot dropoff"></div>
                            <div className="location-content">
                                <span className="location-label">Drop-off</span>
                                <span className="location-address">{ride.destination_address}</span>
                            </div>
                        </div>
                    </div>

                    <div className="parties-section">
                        <div className="party-card">
                            <div className="party-avatar" style={{ background: '#ff4500' }}>
                                {ride.client_name?.charAt(0)?.toUpperCase() || 'C'}
                            </div>
                            <div className="party-info">
                                <span className="party-label">Client</span>
                                <span className="party-name">{ride.client_name || 'Customer'}</span>
                                {ride.client_phone && <span className="party-contact">{ride.client_phone}</span>}
                            </div>
                        </div>
                        <div className="party-card">
                            <div className="party-avatar" style={{ background: '#cc3700' }}>
                                {ride.driver_name?.charAt(0)?.toUpperCase() || 'D'}
                            </div>
                            <div className="party-info">
                                <span className="party-label">Driver</span>
                                <span className="party-name">{ride.driver_name || 'TBA'}</span>
                                {ride.driver_phone && <span className="party-contact">{ride.driver_phone}</span>}
                            </div>
                        </div>
                    </div>

                    {ride.vehicle_model && (
                        <div className="vehicle-section">
                            <i className="fas fa-car"></i>
                            <span>{ride.vehicle_model}{ride.vehicle_color ? ` \u2022 ${ride.vehicle_color}` : ''}</span>
                            {ride.plate_number && <span className="plate">{ride.plate_number}</span>}
                        </div>
                    )}

                    <div className="fare-section">
                        <h3><i className="fas fa-calculator"></i> Fare Breakdown</h3>
                        <div className="fare-table">
                            <div className="fare-row">
                                <span>Base Fare</span>
                                <span>{formatCurrency(baseFare)}</span>
                            </div>
                            <div className="fare-row">
                                <span>Distance Fare ({Number(ride.distance_km || 0).toFixed(1)} km)</span>
                                <span>{formatCurrency(distanceFare)}</span>
                            </div>
                            <div className="fare-row">
                                <span>Service Fee</span>
                                <span>{formatCurrency(serviceFee)}</span>
                            </div>
                            <div className="fare-row">
                                <span>Platform Commission</span>
                                <span>{formatCurrency(platformCommission)}</span>
                            </div>
                            <div className="fare-row divider"></div>
                            <div className="fare-row total">
                                <span>Total Paid</span>
                                <span>{formatCurrency(ride.total_fare)}</span>
                            </div>
                        </div>
                    </div>

                    <div className="payment-section">
                        <h3><i className="fas fa-credit-card"></i> Payment</h3>
                        <div className="payment-card">
                            <div className="payment-row">
                                <span><i className="fas fa-wallet"></i> Speedly Wallet</span>
                                <span className="payment-amount">{formatCurrency(ride.total_fare)}</span>
                            </div>
                            <div className="payment-row">
                                <span><i className="fas fa-user-check"></i> Driver Payout</span>
                                <span className="payment-amount driver">{formatCurrency(driverPayout)}</span>
                            </div>
                            <div className="payment-row muted">
                                <span>Reference</span>
                                <span className="ref">{payment?.reference || `WAL-${ride.ride_number?.substring(0, 8)}`}</span>
                            </div>
                        </div>
                    </div>

                    <div className="qr-section">
                        <img
                            src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(`SPEEDLY RECEIPT\n#${ride.ride_number}\n${formatCurrency(ride.total_fare)}\n${ride.created_at}`)}`}
                            alt="QR"
                        />
                        <p>Verify this receipt</p>
                    </div>
                </div>

                <div className="receipt-footer">
                    <div className="footer-brand">
                        <i className="fas fa-bolt"></i> SPEEDLY
                    </div>
                    <p className="footer-contact">
                        <i className="fas fa-envelope"></i> support@speedly.com
                        <span className="sep">|</span>
                        <i className="fas fa-phone-alt"></i> +234 800 000 0000
                    </p>
                    <p className="footer-copy">
                        &copy; {new Date().getFullYear()} Speedly. All rights reserved.
                    </p>
                    <p className="footer-disclaimer">Computer-generated receipt \u2022 No signature required</p>
                </div>
            </div>

            <div className="receipt-actions">
                <button className="action-btn download" onClick={downloadPDF}>
                    <i className="fas fa-download"></i> Download
                </button>
                <button className="action-btn print" onClick={() => window.print()}>
                    <i className="fas fa-print"></i> Print
                </button>
                <button className="action-btn share" onClick={shareWhatsApp}>
                    <i className="fab fa-whatsapp"></i> Share
                </button>
                <button className="action-btn history" onClick={() => router.visit('/clientridehistory')}>
                    <i className="fas fa-history"></i> History
                </button>
                <button className="action-btn book" onClick={() => router.visit('/clientbookride')}>
                    <i className="fas fa-plus-circle"></i> New Ride
                </button>
            </div>
        </div>
    );
};

const WrappedGenerateReceipt: React.FC<{ rideId?: string }> = (props) => (
    <ErrorBoundary>
        <GenerateReceipt {...props} />
    </ErrorBoundary>
);

export default WrappedGenerateReceipt;
