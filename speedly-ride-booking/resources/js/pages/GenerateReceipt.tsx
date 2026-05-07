import React, { useState, useEffect } from 'react';
import { router, usePage } from '@inertiajs/react';
import Swal from 'sweetalert2';
import html2pdf from 'html2pdf.js';
import { usePreloader } from '../hooks/usePreloader';
import { useMobile } from '../hooks/useMobile';
import MobilePreloader from '../components/preloader/MobilePreloader';
import DesktopPreloader from '../components/preloader/DesktopPreloader';
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

const GenerateReceipt: React.FC<{ rideId?: string }> = ({ rideId: propRideId }) => {
    const { props } = usePage();
    const rideId = propRideId || (props.rideId as string) || new URLSearchParams(window.location.search).get('rideId') || '';
    const [ride, setRide] = useState<RideData | null>(null);
    const [payment, setPayment] = useState<PaymentData | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>('');
    
    const preloaderLoading = usePreloader(1000);
    const isMobile = useMobile();

    // Fetch ride data
    useEffect(() => {
        const fetchRideData = async () => {
            if (!rideId) {
                setError('No ride ID provided');
                setLoading(false);
                return;
            }

            try {
                const response = await fetch(`/SERVER/API/get_ride_details.php?ride_id=${rideId}`);
                const data = await response.json();

                if (data.success && data.ride) {
                    setRide(data.ride);
                    setPayment(data.payment || null);
                } else {
                    setError(data.message || 'Failed to load ride details');
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

    const downloadPDF = () => {
        const element = document.getElementById('receipt-content');
        if (!element) return;

        Swal.fire({
            title: 'Generating PDF...',
            text: 'Please wait',
            allowOutsideClick: false,
            didOpen: () => Swal.showLoading()
        });

        const opt = {
            margin: [0.5, 0.5, 0.5, 0.5],
            filename: `speedly_receipt_${ride?.ride_number || rideId}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, logging: true, dpi: 192, letterRendering: true },
            jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
        };

        // @ts-ignore
        html2pdf().set(opt).from(element).save().then(() => {
            Swal.close();
            Swal.fire({
                icon: 'success',
                title: 'PDF Generated!',
                text: 'Your receipt has been downloaded.',
                timer: 2000,
                showConfirmButton: false
            });
        });
    };

    const shareWhatsApp = () => {
        if (!ride) return;
        
        const text = `🚗 *SPEEDLY RIDE RECEIPT*\n\n` +
            `━━━━━━━━━━━━━━━━━━━━━\n\n` +
            `*Receipt:* #${ride.ride_number}\n` +
            `*Date:* ${new Date(ride.created_at).toLocaleString()}\n` +
            `*From:* ${ride.pickup_address}\n` +
            `*To:* ${ride.destination_address}\n` +
            `*Amount:* ₦${ride.total_fare.toLocaleString()}\n` +
            `*Driver:* ${ride.driver_name || 'N/A'}\n\n` +
            `━━━━━━━━━━━━━━━━━━━━━\n\n` +
            `Thank you for riding with Speedly! 🚀`;

        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
    };

    const formatCurrency = (amount: number) => `₦${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    const formatDate = (dateString: string) => new Date(dateString).toLocaleString();

    if (preloaderLoading) {
        return isMobile ? <MobilePreloader /> : <DesktopPreloader />;
    }

    if (loading) {
        return (
            <div className="receipt-loading">
                <div className="loading-spinner"></div>
                <p>Loading receipt...</p>
            </div>
        );
    }

    if (error || !ride) {
        return (
            <div className="receipt-error">
                <i className="fas fa-exclamation-circle"></i>
                <p>{error || 'Ride not found'}</p>
                <button onClick={() => router.visit('/ride-history')} className="btn-primary">
                    Back to Ride History
                </button>
            </div>
        );
    }

    const baseFare = 500;
    const distanceFare = (ride.distance_km || 0) * 1000;
    const serviceFee = ride.total_fare * 0.05;
    const platformCommission = ride.total_fare * 0.2;
    const driverPayout = ride.total_fare - platformCommission;
    const driverInitial = ride.driver_name?.charAt(0)?.toUpperCase() || 'D';
    const clientInitial = ride.client_name?.charAt(0)?.toUpperCase() || 'C';

    return (
        <div className="receipt-page">
            <div className="receipt-container" id="receipt-content">
                {/* Header */}
                <div className="receipt-header">
                    <div className="logo-wrapper">
                        <img src="/main-assets/logo-no-background.png" alt="Speedly" className="logo-image" />
                    </div>
                    <div className="header-badge">
                        <span className="badge-premium">OFFICIAL RECEIPT</span>
                    </div>
                    <h1>RIDE RECEIPT</h1>
                    <p>Your trusted ride partner</p>
                </div>

                {/* Content */}
                <div className="receipt-content-inner">
                    {/* Receipt Info */}
                    <div className="receipt-section">
                        <div className="section-title">
                            <i className="fas fa-receipt"></i> Receipt Information
                        </div>
                        <div className="info-grid">
                            <div className="info-row">
                                <span className="label">Receipt Number:</span>
                                <span className="value">#{ride.ride_number}</span>
                            </div>
                            <div className="info-row">
                                <span className="label">Date & Time:</span>
                                <span className="value">{formatDate(ride.created_at)}</span>
                            </div>
                            <div className="info-row">
                                <span className="label">Payment Method:</span>
                                <span className="value">Speedly Wallet</span>
                            </div>
                            <div className="info-row">
                                <span className="label">Transaction ID:</span>
                                <span className="value">{payment?.reference || `WAL-${ride.ride_number?.substring(0, 8)}`}</span>
                            </div>
                            <div className="info-row">
                                <span className="label">Payment Status:</span>
                                <span className="value">
                                    <span className="status-paid">✓ PAID</span>
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Ride Details */}
                    <div className="receipt-section">
                        <div className="section-title">
                            <i className="fas fa-map-marker-alt"></i> Ride Details
                        </div>
                        <div className="info-grid">
                            <div className="info-row">
                                <span className="label">Ride Type:</span>
                                <span className="value">{ride.ride_type?.charAt(0).toUpperCase() + ride.ride_type?.slice(1) || 'Economy'}</span>
                            </div>
                            <div className="info-row">
                                <span className="label">Pickup Location:</span>
                                <span className="value">{ride.pickup_address}</span>
                            </div>
                            <div className="info-row">
                                <span className="label">Destination:</span>
                                <span className="value">{ride.destination_address}</span>
                            </div>
                            <div className="info-row">
                                <span className="label">Distance:</span>
                                <span className="value">{ride.distance_km?.toFixed(1) || 0} km</span>
                            </div>
                            <div className="info-row">
                                <span className="label">Duration:</span>
                                <span className="value">{Math.floor((ride.distance_km || 0) * 2)} mins</span>
                            </div>
                        </div>
                    </div>

                    {/* Driver Details */}
                    <div className="receipt-section">
                        <div className="section-title">
                            <i className="fas fa-user-tie"></i> Driver Details
                        </div>
                        <div className="driver-card">
                            <div className="driver-avatar">{driverInitial}</div>
                            <div className="driver-info">
                                <div className="driver-name">{ride.driver_name || 'Driver'}</div>
                                <div className="driver-rating">
                                    <i className="fas fa-star"></i> 4.8 
                                    <span className="driver-role">• Professional Driver</span>
                                </div>
                                {ride.driver_phone && (
                                    <div className="driver-phone">
                                        <i className="fas fa-phone-alt"></i> {ride.driver_phone}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="info-grid">
                            <div className="info-row">
                                <span className="label">Vehicle:</span>
                                <span className="value">{ride.vehicle_model} • {ride.vehicle_color}</span>
                            </div>
                            <div className="info-row">
                                <span className="label">Plate Number:</span>
                                <span className="value">{ride.plate_number}</span>
                            </div>
                        </div>
                    </div>

                    {/* Client Details */}
                    <div className="receipt-section">
                        <div className="section-title">
                            <i className="fas fa-user"></i> Client Details
                        </div>
                        <div className="driver-card client-card">
                            <div className="driver-avatar client">{clientInitial}</div>
                            <div className="driver-info">
                                <div className="driver-name">{ride.client_name || 'Client'}</div>
                                <div className="driver-role">Customer</div>
                                {ride.client_phone && (
                                    <div className="driver-phone">
                                        <i className="fas fa-phone-alt"></i> {ride.client_phone}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="info-row">
                            <span className="label">Email:</span>
                            <span className="value">{ride.client_email || 'N/A'}</span>
                        </div>
                    </div>

                    {/* Fare Breakdown */}
                    <div className="receipt-section">
                        <div className="section-title">
                            <i className="fas fa-calculator"></i> Fare Breakdown
                        </div>
                        <div className="fare-card">
                            <div className="fare-row">
                                <span>Base Fare</span>
                                <span>{formatCurrency(baseFare)}</span>
                            </div>
                            <div className="fare-row">
                                <span>Distance Fare ({ride.distance_km?.toFixed(1) || 0} km @ ₦1000/km)</span>
                                <span>{formatCurrency(distanceFare)}</span>
                            </div>
                            <div className="fare-row">
                                <span>Time Fare</span>
                                <span>{formatCurrency(0)}</span>
                            </div>
                            <div className="fare-row">
                                <span>Service Fee (5%)</span>
                                <span>{formatCurrency(serviceFee)}</span>
                            </div>
                            <div className="fare-divider"></div>
                            <div className="fare-row total">
                                <span>Total Amount</span>
                                <span>{formatCurrency(ride.total_fare)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Payment Breakdown */}
                    <div className="receipt-section">
                        <div className="section-title">
                            <i className="fas fa-chart-pie"></i> Payment Breakdown
                        </div>
                        <div className="payment-card">
                            <div className="payment-item">
                                <div className="payment-label">
                                    <i className="fas fa-wallet"></i>
                                    <span>Paid via Speedly Wallet</span>
                                </div>
                                <div className="payment-amount">{formatCurrency(ride.total_fare)}</div>
                            </div>
                            <div className="payment-divider"></div>
                            <div className="payment-item">
                                <div className="payment-label">
                                    <i className="fas fa-charging-station"></i>
                                    <span>Platform Commission (20%)</span>
                                </div>
                                <div className="payment-amount text-muted">{formatCurrency(platformCommission)}</div>
                            </div>
                            <div className="payment-item highlight">
                                <div className="payment-label">
                                    <i className="fas fa-user-check"></i>
                                    <span>Driver Payout</span>
                                </div>
                                <div className="payment-amount driver-payout">{formatCurrency(driverPayout)}</div>
                            </div>
                        </div>
                    </div>

                    {/* QR Code */}
                    <div className="qr-section">
                        <img 
                            src={`https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(
                                `SPEEDLY RIDE\nReceipt: ${ride.ride_number}\nAmount: ${formatCurrency(ride.total_fare)}\nDate: ${formatDate(ride.created_at)}`
                            )}`} 
                            alt="QR Code" 
                        />
                        <p>Scan QR code to verify receipt authenticity</p>
                    </div>

                    {/* Thank You Message */}
                    <div className="thankyou-section">
                        <i className="fas fa-heart"></i>
                        <p>Thank you for choosing Speedly!</p>
                        <p className="subtext">We appreciate your business and look forward to serving you again.</p>
                    </div>

                    {/* Footer */}
                    <div className="receipt-footer">
                        <p className="support-line">
                            <i className="fas fa-envelope"></i> support@speedly.com &nbsp;|&nbsp; 
                            <i className="fas fa-phone-alt"></i> +234 800 000 0000
                        </p>
                        <p>© {new Date().getFullYear()} Speedly. All rights reserved.</p>
                        <p className="disclaimer">This is a computer generated receipt. No signature required.</p>
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="action-buttons no-print">
                <button className="btn-secondary" onClick={() => window.print()}>
                    <i className="fas fa-print"></i> Print
                </button>
                <button className="btn-secondary" onClick={downloadPDF}>
                    <i className="fas fa-download"></i> PDF
                </button>
                <button className="btn-secondary" onClick={shareWhatsApp}>
                    <i className="fab fa-whatsapp"></i> Share
                </button>
                <button className="btn-primary" onClick={() => router.visit('/ride-history')}>
                    <i className="fas fa-history"></i> Ride History
                </button>
                <button className="btn-primary" onClick={() => router.visit('/book-ride')}>
                    <i className="fas fa-car"></i> Book Another Ride
                </button>
            </div>
        </div>
    );
};

export default GenerateReceipt;