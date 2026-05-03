import React, { useState, useEffect, useCallback, useRef } from 'react';
import { router } from '@inertiajs/react';
import ClientSidebarDesktop from '../components/navbars/ClientSidebarDesktop';
import Swal from 'sweetalert2';
import { usePreloader } from '../hooks/usePreloader';
import { useMobile } from '../hooks/useMobile';
import DesktopPreloader from '../components/preloader/DesktopPreloader';
import ClientBookRideMobile from '../components/mobileViewComponent/ClientBookRideMobile';
import '../../css/ClientBookRide.css';

// Types
interface LocationData {
    address: string;
    lat: number | null;
    lng: number | null;
    placeId: string | null;
}

interface BookingData {
    pickup: LocationData;
    destination: LocationData;
    plan: string;
    driverId: string | null;
    driverSelected: boolean;
    payment: string;
    distance: number;
    fare: number;
}

interface Driver {
    id: string;
    name: string;
    rating: number;
    rides: number;
    distance: number;
    vehicle: string;
    plate: string;
    type: string;
}

interface SavedLocation {
    id: string;
    name: string;
    address: string;
    latitude: number;
    longitude: number;
    location_type: string;
}

const ClientBookRide: React.FC = () => {
    // State
    const [userData, setUserData] = useState<any>(null);
    const [walletBalance, setWalletBalance] = useState<number>(0);
    const [notificationCount, setNotificationCount] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(true);
    const [step, setStep] = useState<number>(1);
    const [booking, setBooking] = useState<BookingData>({
        pickup: { address: '', lat: null, lng: null, placeId: null },
        destination: { address: '', lat: null, lng: null, placeId: null },
        plan: '',
        driverId: null,
        driverSelected: false,
        payment: '',
        distance: 0,
        fare: 0
    });
    const [drivers, setDrivers] = useState<Driver[]>([]);
    const [savedLocations, setSavedLocations] = useState<SavedLocation[]>([]);
    const [mode, setMode] = useState<'pickup' | 'destination'>('pickup');
    const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [mapLoaded, setMapLoaded] = useState<boolean>(false);
    const [selectedDriverId, setSelectedDriverId] = useState<string | null>(null);
    const [selectedPlan, setSelectedPlan] = useState<string>('');
    const [selectedPayment, setSelectedPayment] = useState<string>('');

    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<google.maps.Map | null>(null);
    const pickupMarkerRef = useRef<google.maps.Marker | null>(null);
    const destMarkerRef = useRef<google.maps.Marker | null>(null);
    const directionsRendererRef = useRef<google.maps.DirectionsRenderer | null>(null);
    const searchBoxRef = useRef<HTMLInputElement>(null);
    const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
    const watchIdRef = useRef<number | null>(null);

    const preloaderLoading = usePreloader(1000);
    const isMobile = useMobile();

    // Popular locations
    const popularLocations = [
        { name: 'Lagos Airport', lat: 6.5774, lng: 3.3211, address: 'Murtala Muhammed International Airport, Lagos', icon: 'plane' },
        { name: 'Victoria Island', lat: 6.4281, lng: 3.4219, address: 'Victoria Island, Lagos, Nigeria', icon: 'building' },
        { name: 'Lekki Phase 1', lat: 6.4484, lng: 3.4719, address: 'Lekki Phase 1, Lagos, Nigeria', icon: 'map-pin' },
        { name: 'Ikeja City Mall', lat: 6.6018, lng: 3.3515, address: 'Ikeja City Mall, Lagos, Nigeria', icon: 'shopping-cart' },
        { name: 'Ajah', lat: 6.4700, lng: 3.5730, address: 'Ajah, Lagos, Nigeria', icon: 'market' },
        { name: 'Maryland Mall', lat: 6.5794, lng: 3.3622, address: 'Maryland Mall, Lagos, Nigeria', icon: 'store' }
    ];

    // Fetch dashboard data
    const fetchData = useCallback(async () => {
        try {
            const response = await fetch('/SERVER/API/client_dashboard_data.php');
            const data = await response.json();
            
            if (data.success) {
                setUserData(data.user);
                setWalletBalance(data.wallet_balance);
                setNotificationCount(data.notification_count || 0);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    // Fetch saved locations
    const fetchSavedLocations = useCallback(async () => {
        try {
            const response = await fetch('/SERVER/API/get_saved_locations.php');
            const data = await response.json();
            if (data.success) {
                setSavedLocations(data.locations || []);
            }
        } catch (error) {
            console.error('Error fetching saved locations:', error);
        }
    }, []);

    // Load Google Maps script
    useEffect(() => {
        const loadGoogleMaps = () => {
            if (document.querySelector('#google-maps-script')) {
                initMap();
                return;
            }

            const script = document.createElement('script');
            script.id = 'google-maps-script';
            script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyB1tM_s2w8JWfnIoUTAzJNpbblU-eZiC30&libraries=places,geometry&callback=initMap`;
            script.async = true;
            script.defer = true;
            
            (window as any).initMap = () => {
                setMapLoaded(true);
                initMap();
            };
            
            document.head.appendChild(script);
        };

        loadGoogleMaps();
    }, []);

    // Initialize map
    const initMap = () => {
        if (!mapRef.current || !window.google) return;

        const defaultCenter = { lat: 6.5244, lng: 3.3792 };
        
        mapInstanceRef.current = new google.maps.Map(mapRef.current, {
            center: defaultCenter,
            zoom: 13,
            mapTypeId: google.maps.MapTypeId.ROADMAP,
            mapTypeControl: true,
            streetViewControl: true,
            fullscreenControl: true,
            zoomControl: true
        });

        // Add click listener
        mapInstanceRef.current.addListener('click', (e: google.maps.MapMouseEvent) => {
            if (e.latLng) {
                handleMapClick(e.latLng.lat(), e.latLng.lng());
            }
        });

        // Setup search box
        if (searchBoxRef.current) {
            autocompleteRef.current = new google.maps.places.Autocomplete(searchBoxRef.current, {
                componentRestrictions: { country: 'ng' },
                fields: ['place_id', 'geometry', 'formatted_address', 'name']
            });
            
            autocompleteRef.current.addListener('place_changed', () => {
                const place = autocompleteRef.current?.getPlace();
                if (place?.geometry?.location) {
                    const lat = place.geometry.location.lat();
                    const lng = place.geometry.location.lng();
                    const address = place.formatted_address || '';
                    
                    mapInstanceRef.current?.setCenter({ lat, lng });
                    mapInstanceRef.current?.setZoom(16);
                    
                    if (mode === 'pickup') {
                        updatePickupLocation(lat, lng, address, place.place_id);
                    } else {
                        updateDestinationLocation(lat, lng, address, place.place_id);
                    }
                    
                    if (searchBoxRef.current) searchBoxRef.current.value = '';
                }
            });
        }

        // Initialize directions renderer
        directionsRendererRef.current = new google.maps.DirectionsRenderer({
            map: mapInstanceRef.current,
            suppressMarkers: true,
            polylineOptions: {
                strokeColor: '#ff5e00',
                strokeWeight: 5,
                strokeOpacity: 0.7
            }
        });

        // Start watching user location
        startWatchingPosition();
    };

    // Handle map click
    const handleMapClick = async (lat: number, lng: number) => {
        const geocoder = new google.maps.Geocoder();
        
        geocoder.geocode({ location: { lat, lng } }, (results, status) => {
            if (status === 'OK' && results && results[0]) {
                const address = results[0].formatted_address;
                const placeId = results[0].place_id;
                
                if (mode === 'pickup') {
                    updatePickupLocation(lat, lng, address, placeId);
                } else {
                    updateDestinationLocation(lat, lng, address, placeId);
                }
            } else {
                const areaName = getLocationAreaName(lat, lng);
                if (mode === 'pickup') {
                    updatePickupLocation(lat, lng, areaName, '');
                } else {
                    updateDestinationLocation(lat, lng, areaName, '');
                }
            }
        });
    };

    // Get location area name
    const getLocationAreaName = (lat: number, lng: number): string => {
        if (lat > 6.35 && lat < 6.70 && lng > 3.25 && lng < 3.60) {
            if (lat > 6.57 && lat < 6.62 && lng > 3.31 && lng < 3.38) return 'Ikeja Area, Lagos';
            if (lat > 6.42 && lat < 6.48 && lng > 3.40 && lng < 3.48) return 'Victoria Island, Lagos';
            if (lat > 6.43 && lat < 6.48 && lng > 3.52 && lng < 3.58) return 'Lekki Area, Lagos';
            return 'Lagos, Nigeria';
        }
        return 'Selected Location';
    };

    // Update pickup location
    const updatePickupLocation = (lat: number, lng: number, address: string, placeId: string | null) => {
        if (pickupMarkerRef.current) {
            pickupMarkerRef.current.setMap(null);
        }

        if (lat !== 0 && lng !== 0) {
            pickupMarkerRef.current = new google.maps.Marker({
                position: { lat, lng },
                map: mapInstanceRef.current,
                title: 'Pickup Location',
                icon: {
                    path: google.maps.SymbolPath.CIRCLE,
                    scale: 12,
                    fillColor: '#4CAF50',
                    fillOpacity: 1,
                    strokeColor: '#ffffff',
                    strokeWeight: 3
                },
                label: { text: 'P', color: 'white', fontSize: '12px', fontWeight: 'bold' },
                animation: google.maps.Animation.DROP
            });
        }

        setBooking(prev => ({
            ...prev,
            pickup: { address, lat, lng, placeId }
        }));

        if (booking.destination.lat && booking.destination.lng && lat !== 0 && lng !== 0) {
            drawRoute();
            calculateFare();
        }
    };

    // Update destination location
    const updateDestinationLocation = (lat: number, lng: number, address: string, placeId: string | null) => {
        if (destMarkerRef.current) {
            destMarkerRef.current.setMap(null);
        }

        if (lat !== 0 && lng !== 0) {
            destMarkerRef.current = new google.maps.Marker({
                position: { lat, lng },
                map: mapInstanceRef.current,
                title: 'Destination',
                icon: {
                    path: google.maps.SymbolPath.CIRCLE,
                    scale: 12,
                    fillColor: '#F44336',
                    fillOpacity: 1,
                    strokeColor: '#ffffff',
                    strokeWeight: 3
                },
                label: { text: 'D', color: 'white', fontSize: '12px', fontWeight: 'bold' },
                animation: google.maps.Animation.DROP
            });
        }

        setBooking(prev => ({
            ...prev,
            destination: { address, lat, lng, placeId }
        }));

        if (booking.pickup.lat && booking.pickup.lng && lat !== 0 && lng !== 0) {
            drawRoute();
            calculateFare();
        }
    };

    // Draw route
    const drawRoute = () => {
        if (!directionsRendererRef.current || !booking.pickup.lat || !booking.destination.lat) return;

        const directionsService = new google.maps.DirectionsService();
        
        directionsService.route({
            origin: { lat: booking.pickup.lat, lng: booking.pickup.lng },
            destination: { lat: booking.destination.lat, lng: booking.destination.lng },
            travelMode: google.maps.TravelMode.DRIVING
        }, (result, status) => {
            if (status === 'OK' && result) {
                directionsRendererRef.current?.setDirections(result);
            }
        });
    };

    // Calculate fare
    const calculateFare = async () => {
        if (!booking.pickup.lat || !booking.destination.lat) return;

        const formData = new FormData();
        formData.append('pickup_lat', booking.pickup.lat.toString());
        formData.append('pickup_lng', booking.pickup.lng.toString());
        formData.append('dest_lat', booking.destination.lat.toString());
        formData.append('dest_lng', booking.destination.lng.toString());
        formData.append('ride_type', booking.plan || 'economy');

        try {
            const response = await fetch('/SERVER/API/calculate_fare.php', {
                method: 'POST',
                body: formData
            });
            const data = await response.json();

            if (data.success) {
                setBooking(prev => ({
                    ...prev,
                    distance: data.distance,
                    fare: data.fare
                }));
                
                // Find nearby drivers
                if (booking.pickup.lat && booking.pickup.lng) {
                    findNearbyDrivers(booking.pickup.lat, booking.pickup.lng, booking.plan || 'economy');
                }
            }
        } catch (error) {
            console.error('Error calculating fare:', error);
        }
    };

    // Find nearby drivers
    const findNearbyDrivers = async (lat: number, lng: number, rideType: string) => {
        try {
            const response = await fetch(`/SERVER/API/get_nearby_drivers.php?lat=${lat}&lng=${lng}&ride_type=${rideType}`);
            const data = await response.json();
            
            if (data.success && data.drivers) {
                setDrivers(data.drivers);
            } else {
                // Mock drivers as fallback
                setDrivers([
                    { id: '1', name: 'Michael Chen', rating: 4.8, rides: 1242, distance: 2.3, vehicle: 'Black Toyota Prius', plate: 'LAG123AB', type: 'economy' },
                    { id: '2', name: 'Sarah Johnson', rating: 5.0, rides: 892, distance: 3.1, vehicle: 'White Honda Civic', plate: 'LAG456CD', type: 'comfort' },
                    { id: '3', name: 'James Wilson', rating: 4.9, rides: 2156, distance: 1.8, vehicle: 'Silver Toyota Camry', plate: 'LAG789EF', type: 'economy' },
                    { id: '4', name: 'Emma Davis', rating: 4.7, rides: 1876, distance: 2.9, vehicle: 'Blue Hyundai Elantra', plate: 'LAG321FG', type: 'comfort' }
                ]);
            }
        } catch (error) {
            console.error('Error finding drivers:', error);
        }
    };

    // Start watching position
    const startWatchingPosition = () => {
        if (!navigator.geolocation) return;

        if (watchIdRef.current) {
            navigator.geolocation.clearWatch(watchIdRef.current);
        }

        watchIdRef.current = navigator.geolocation.watchPosition(
            (position) => {
                const location = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                setUserLocation(location);
                
                if (mapInstanceRef.current && !booking.pickup.lat) {
                    mapInstanceRef.current.setCenter(location);
                    mapInstanceRef.current.setZoom(14);
                }
            },
            (error) => {
                console.error('Geolocation error:', error);
            },
            { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 }
        );
    };

    // Center on user location
    const centerOnUser = () => {
        if (userLocation && mapInstanceRef.current) {
            mapInstanceRef.current.setCenter(userLocation);
            mapInstanceRef.current.setZoom(16);
        } else if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const location = { lat: position.coords.latitude, lng: position.coords.longitude };
                    setUserLocation(location);
                    mapInstanceRef.current?.setCenter(location);
                    mapInstanceRef.current?.setZoom(16);
                },
                (error) => {
                    Swal.fire({ icon: 'error', title: 'Location Access Denied', text: 'Please enable location services', confirmButtonColor: '#ff5e00' });
                }
            );
        }
    };

    // Use saved location
    const useSavedLocation = (location: SavedLocation, type: 'pickup' | 'destination') => {
        const lat = location.latitude;
        const lng = location.longitude;
        const address = location.address;

        if (mapInstanceRef.current) {
            mapInstanceRef.current.setCenter({ lat, lng });
            mapInstanceRef.current.setZoom(16);
        }

        if (type === 'pickup') {
            updatePickupLocation(lat, lng, address, null);
        } else {
            updateDestinationLocation(lat, lng, address, null);
        }
    };

    // Use popular location
    const usePopularLocation = (location: typeof popularLocations[0], type: 'pickup' | 'destination') => {
        const lat = location.lat;
        const lng = location.lng;
        const address = location.address;

        if (mapInstanceRef.current) {
            mapInstanceRef.current.setCenter({ lat, lng });
            mapInstanceRef.current.setZoom(16);
        }

        if (type === 'pickup') {
            updatePickupLocation(lat, lng, address, null);
        } else {
            updateDestinationLocation(lat, lng, address, null);
        }
    };

    // Select plan
    const selectPlan = (plan: string) => {
        setSelectedPlan(plan);
        setBooking(prev => ({ ...prev, plan }));
        
        if (booking.pickup.lat && booking.destination.lat) {
            calculateFare();
        }
    };

    // Select driver
    const selectDriver = (driverId: string) => {
        setSelectedDriverId(driverId);
        setBooking(prev => ({ ...prev, driverId, driverSelected: true }));
        
        Swal.fire({
            icon: 'info',
            title: 'Private Ride',
            text: 'This driver will be privately notified of your ride. Only this driver can accept this ride.',
            timer: 3000,
            showConfirmButton: false,
            position: 'top-end',
            toast: true
        });
    };

    // Skip driver selection (public ride)
    const skipDriverSelection = () => {
        setSelectedDriverId(null);
        setBooking(prev => ({ ...prev, driverId: null, driverSelected: false }));
        
        Swal.fire({
            icon: 'info',
            title: 'Public Ride',
            text: 'Your ride will be visible to all nearby drivers. Any available driver can accept this ride.',
            timer: 3000,
            showConfirmButton: false,
            position: 'top-end',
            toast: true
        });
    };

    // Select payment
    const selectPayment = (payment: string) => {
        setSelectedPayment(payment);
        setBooking(prev => ({ ...prev, payment }));
    };

    // Check if balance is sufficient
    const isBalanceSufficient = (): boolean => {
        if (booking.payment === 'card') return true;
        return walletBalance >= booking.fare;
    };

    // Next step
    const nextStep = () => {
        if (step === 1 && (!booking.pickup.lat || !booking.destination.lat)) {
            Swal.fire({ icon: 'warning', title: 'Incomplete', text: 'Please select both pickup and destination', confirmButtonColor: '#ff5e00' });
            return;
        }
        if (step === 2 && !booking.plan) {
            Swal.fire({ icon: 'warning', title: 'Incomplete', text: 'Please select a ride plan', confirmButtonColor: '#ff5e00' });
            return;
        }
        
        if (step < 4) {
            setStep(step + 1);
        }
    };

    // Previous step
    const prevStep = () => {
        if (step > 1) {
            setStep(step - 1);
        }
    };

    // Confirm booking
    const confirmBooking = async () => {
        if (!booking.pickup.address || !booking.destination.address || !booking.plan || !booking.payment) {
            Swal.fire({ icon: 'error', title: 'Incomplete Booking', text: 'Please complete all steps', confirmButtonColor: '#ff5e00' });
            return;
        }

        if (booking.payment === 'wallet' && booking.fare > walletBalance) {
            Swal.fire({
                icon: 'error',
                title: 'Insufficient Balance',
                html: `Your wallet balance (₦${walletBalance.toLocaleString()}) is insufficient.<br>Required: ₦${booking.fare.toLocaleString()}`,
                showCancelButton: true,
                confirmButtonText: 'Add Funds',
                confirmButtonColor: '#ff5e00'
            }).then((result) => {
                if (result.isConfirmed) router.visit('/wallet');
            });
            return;
        }

        const message = booking.driverId 
            ? 'This will be a PRIVATE ride sent only to the selected driver. Continue?'
            : 'This will be a PUBLIC ride visible to all nearby drivers. Continue?';

        const result = await Swal.fire({
            title: 'Confirm Booking',
            text: message,
            icon: 'info',
            showCancelButton: true,
            confirmButtonColor: '#ff5e00',
            confirmButtonText: 'Yes, Book Now',
            cancelButtonText: 'Cancel'
        });

        if (result.isConfirmed) {
            processBooking();
        }
    };

    // Process booking
    const processBooking = async () => {
        Swal.fire({ title: 'Booking your ride...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });

        const formData = new FormData();
        formData.append('pickup_address', booking.pickup.address);
        formData.append('pickup_lat', booking.pickup.lat?.toString() || '');
        formData.append('pickup_lng', booking.pickup.lng?.toString() || '');
        formData.append('pickup_place_id', booking.pickup.placeId || '');
        formData.append('dest_address', booking.destination.address);
        formData.append('dest_lat', booking.destination.lat?.toString() || '');
        formData.append('dest_lng', booking.destination.lng?.toString() || '');
        formData.append('dest_place_id', booking.destination.placeId || '');
        formData.append('distance', booking.distance.toString());
        formData.append('fare', booking.fare.toString());
        formData.append('driver_id', booking.driverId || '');
        formData.append('ride_type', booking.plan);
        formData.append('payment_method', booking.payment);

        try {
            const response = await fetch('/SERVER/API/book_ride.php', { method: 'POST', body: formData });
            const data = await response.json();
            Swal.close();

            if (data.success) {
                Swal.fire({
                    icon: 'success',
                    title: 'Ride Booked Successfully!',
                    html: `<div><p><strong>Ride Number:</strong> #${data.ride_number}</p><p><strong>Amount Paid:</strong> ₦${booking.fare.toLocaleString()}</p><p><strong>New Balance:</strong> ₦${data.new_balance.toLocaleString()}</p></div>`,
                    confirmButtonColor: '#ff5e00',
                    confirmButtonText: 'View Receipt'
                }).then(() => {
                    router.visit(`/generate_receipt?ride_id=${data.ride_id}`);
                });
            } else if (data.insufficient_balance) {
                Swal.fire({ icon: 'error', title: 'Insufficient Balance', text: data.message, confirmButtonColor: '#ff5e00' });
            } else {
                Swal.fire({ icon: 'error', title: 'Booking Failed', text: data.message, confirmButtonColor: '#ff5e00' });
            }
        } catch (error) {
            Swal.close();
            Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to book ride', confirmButtonColor: '#ff5e00' });
        }
    };

    // Check notifications
    const checkNotifications = async () => {
        try {
            const response = await fetch('/SERVER/API/get_notifications.php');
            const data = await response.json();
            
            if (data.success && data.notifications && data.notifications.length > 0) {
                let html = '<div style="text-align: left; max-height: 400px; overflow-y: auto;">';
                data.notifications.forEach((notif: any) => {
                    html += `<div style="padding: 10px; border-bottom: 1px solid #eee;"><p><strong>${notif.title}</strong></p><p>${notif.message}</p><p style="font-size: 12px; color: #999;">${new Date(notif.created_at).toLocaleString()}</p></div>`;
                });
                html += '</div>';
                
                Swal.fire({ icon: 'info', title: `Notifications (${data.notifications.length})`, html: html, confirmButtonColor: '#ff5e00' });
            } else {
                Swal.fire({ icon: 'info', title: 'Notifications', text: 'No new notifications', confirmButtonColor: '#ff5e00' });
            }
        } catch (error) {
            Swal.fire({ icon: 'info', title: 'Notifications', text: 'No new notifications', confirmButtonColor: '#ff5e00' });
        }
    };

    // Initial data fetch
    useEffect(() => {
        fetchData();
        fetchSavedLocations();
    }, [fetchData, fetchSavedLocations]);

    // Cleanup
    useEffect(() => {
        return () => {
            if (watchIdRef.current) {
                navigator.geolocation.clearWatch(watchIdRef.current);
            }
        };
    }, []);

    const formatCurrency = (amount: number) => `₦${amount.toLocaleString()}`;
    const tierColor = userData?.membership_tier === 'premium' ? '#ff5e00' : userData?.membership_tier === 'gold' ? '#ffd700' : '#6c757d';

    if (loading || preloaderLoading) {
        return <DesktopPreloader />;
    }

    // Render mobile view on mobile devices
    if (isMobile) {
        return <ClientBookRideMobile />;
    }

    // Render desktop view
    return (
        <div className="book-ride-desktop-container">
            <ClientSidebarDesktop userName={userData?.fullname || 'User'} profilePictureUrl={userData?.profile_picture_url} />
            
            <div className="book-ride-desktop-main">
                {/* Header */}
                <div className="book-ride-desktop-header">
                    <div className="book-ride-desktop-title">
                        <h1>Book a Ride</h1>
                        <p className="wallet-balance">Wallet: {formatCurrency(walletBalance)}</p>
                    </div>
                    <button className="book-ride-notification-btn" onClick={checkNotifications}>
                        <i className="fas fa-bell"></i>
                        {notificationCount > 0 && <span className="notification-badge">{notificationCount}</span>}
                    </button>
                </div>

                {/* Steps */}
                <div className="book-ride-steps">
                    <div className={`step ${step === 1 ? 'active' : ''}`} onClick={() => setStep(1)}>
                        <div className="step-icon"><i className="fas fa-map-marker-alt"></i></div>
                        <h3>Select Location</h3>
                        <p>Choose pickup & destination</p>
                    </div>
                    <div className={`step ${step === 2 ? 'active' : ''}`} onClick={() => step > 1 && setStep(2)}>
                        <div className="step-icon"><i className="fas fa-car"></i></div>
                        <h3>Choose Plan</h3>
                        <p>Select your ride type</p>
                    </div>
                    <div className={`step ${step === 3 ? 'active' : ''}`} onClick={() => step > 2 && setStep(3)}>
                        <div className="step-icon"><i className="fas fa-user-tie"></i></div>
                        <h3>Select Driver</h3>
                        <p>Choose your driver</p>
                    </div>
                    <div className={`step ${step === 4 ? 'active' : ''}`} onClick={() => step > 3 && setStep(4)}>
                        <div className="step-icon"><i className="fas fa-credit-card"></i></div>
                        <h3>Make Payment</h3>
                        <p>Pay securely</p>
                    </div>
                </div>

                {/* Step 1: Location Selection */}
                {step === 1 && (
                    <div className="book-ride-location-step">
                        <div className="book-ride-map-section">
                            <div className="map-controls">
                                <div className="mode-selector">
                                    <button className={`mode-btn pickup ${mode === 'pickup' ? 'active' : ''}`} onClick={() => setMode('pickup')}>
                                        <i className="fas fa-circle text-green-600"></i> Pickup
                                    </button>
                                    <button className={`mode-btn destination ${mode === 'destination' ? 'active' : ''}`} onClick={() => setMode('destination')}>
                                        <i className="fas fa-map-marker-alt text-red-600"></i> Destination
                                    </button>
                                </div>
                                <div className="search-box">
                                    <i className="fas fa-search"></i>
                                    <input type="text" ref={searchBoxRef} placeholder="Search for a location..." />
                                </div>
                            </div>
                            <div ref={mapRef} className="book-ride-map"></div>
                            <button className="center-location-btn" onClick={centerOnUser}>
                                <i className="fas fa-crosshairs"></i>
                            </button>
                        </div>

                        <div className="book-ride-location-panel">
                            <h3>📍 Selected Locations</h3>
                            
                            <div className="location-card">
                                <div className="label"><i className="fas fa-circle text-green-600"></i> PICKUP LOCATION</div>
                                <div className="address">{booking.pickup.address || 'Not selected'}</div>
                                {booking.pickup.lat && (
                                    <button className="clear-btn" onClick={() => updatePickupLocation(0, 0, '', null)}>Clear</button>
                                )}
                            </div>
                            
                            <div className="location-card destination">
                                <div className="label"><i className="fas fa-map-marker-alt text-red-600"></i> DESTINATION</div>
                                <div className="address">{booking.destination.address || 'Not selected'}</div>
                                {booking.destination.lat && (
                                    <button className="clear-btn" onClick={() => updateDestinationLocation(0, 0, '', null)}>Clear</button>
                                )}
                            </div>

                            {savedLocations.length > 0 && (
                                <>
                                    <h3 className="section-title">Saved Locations</h3>
                                    <div className="saved-locations-grid">
                                        {savedLocations.map(loc => (
                                            <div key={loc.id} className="saved-location-chip" onClick={() => useSavedLocation(loc, mode)}>
                                                <i className={`fas fa-${loc.location_type === 'home' ? 'home' : loc.location_type === 'work' ? 'building' : 'map-pin'}`}></i>
                                                <div className="name">{loc.name}</div>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}

                            <h3 className="section-title">Popular Locations</h3>
                            <div className="popular-locations-grid">
                                {popularLocations.map(loc => (
                                    <div key={loc.name} className="popular-location-chip" onClick={() => usePopularLocation(loc, mode)}>
                                        <i className={`fas fa-${loc.icon}`}></i>
                                        <div className="name">{loc.name}</div>
                                    </div>
                                ))}
                            </div>

                            <button className="continue-btn" onClick={nextStep} disabled={!booking.pickup.lat || !booking.destination.lat}>
                                <i className="fas fa-arrow-right"></i> CONTINUE TO PLAN
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 2: Select Plan */}
                {step === 2 && (
                    <div className="book-ride-plan-step">
                        <h2>Choose Your Ride</h2>
                        <div className="plans-grid">
                            <div className={`plan-card ${selectedPlan === 'economy' ? 'selected' : ''}`} onClick={() => selectPlan('economy')}>
                                <div className="plan-icon"><i className="fas fa-car"></i></div>
                                <h3>Economy</h3>
                                <ul>
                                    <li><i className="fas fa-check"></i> Affordable rates</li>
                                    <li><i className="fas fa-check"></i> 4 Seater cars</li>
                                    <li><i className="fas fa-check"></i> Standard comfort</li>
                                </ul>
                                <div className="plan-price">₦1,000 <span>/km</span></div>
                            </div>
                            <div className={`plan-card ${selectedPlan === 'comfort' ? 'selected' : ''}`} onClick={() => selectPlan('comfort')}>
                                <div className="plan-icon"><i className="fas fa-car-side"></i></div>
                                <h3>Comfort</h3>
                                <ul>
                                    <li><i className="fas fa-check"></i> Extra legroom</li>
                                    <li><i className="fas fa-check"></i> Professional drivers</li>
                                    <li><i className="fas fa-check"></i> Premium vehicles</li>
                                </ul>
                                <div className="plan-price">₦1,500 <span>/km</span></div>
                            </div>
                        </div>
                        
                        <div className="action-buttons">
                            <button className="back-btn" onClick={prevStep}><i className="fas fa-arrow-left"></i> Back to Map</button>
                            <button className="next-btn" onClick={nextStep} disabled={!booking.plan}><i className="fas fa-arrow-right"></i> Continue to Drivers</button>
                        </div>
                    </div>
                )}

                {/* Step 3: Select Driver */}
                {step === 3 && (
                    <div className="book-ride-driver-step">
                        <h2>Available Drivers</h2>
                        <p className="driver-status">{drivers.length} drivers available nearby</p>
                        
                        <div className="driver-selection-info">
                            <i className="fas fa-info-circle"></i>
                            <div className="info-text">
                                <strong>Ride Privacy Options</strong>
                                <p>• Select a driver below for a <span className="private-badge">PRIVATE RIDE</span> (only they can accept)<br/>
                                • Click "Skip" for a <span className="public-badge">PUBLIC RIDE</span> (any driver can accept)</p>
                            </div>
                        </div>
                        
                        <div className="drivers-grid">
                            {drivers.map(driver => (
                                <div key={driver.id} className={`driver-card ${selectedDriverId === driver.id ? 'selected' : ''}`} onClick={() => selectDriver(driver.id)}>
                                    <div className="driver-info">
                                        <div className="driver-avatar">{driver.name.charAt(0)}</div>
                                        <div className="driver-details">
                                            <h4>{driver.name}</h4>
                                            <div className="driver-rating">★★★★★ <span>{driver.rating}</span></div>
                                            <div className="driver-car"><i className="fas fa-car"></i> {driver.vehicle}</div>
                                        </div>
                                    </div>
                                    <div className="driver-stats">
                                        <div><span className="stat-value">{driver.distance}</span><span className="stat-label">km away</span></div>
                                        <div><span className="stat-value">{driver.rating}</span><span className="stat-label">rating</span></div>
                                        <div><span className="stat-value">{driver.rides}+</span><span className="stat-label">rides</span></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        
                        <button className="skip-driver-btn" onClick={skipDriverSelection}>
                            <i className="fas fa-globe"></i> Skip - Make Ride Public (Any Driver Can Accept)
                        </button>
                        
                        <div className="action-buttons">
                            <button className="back-btn" onClick={prevStep}><i className="fas fa-arrow-left"></i> Back to Plans</button>
                            <button className="next-btn" onClick={nextStep}><i className="fas fa-arrow-right"></i> Continue to Payment</button>
                        </div>
                    </div>
                )}

                {/* Step 4: Payment */}
                {step === 4 && (
                    <div className="book-ride-payment-step">
                        <h2>Payment Method</h2>
                        <div className="payment-grid">
                            <div className={`payment-card ${selectedPayment === 'wallet' ? 'selected' : ''}`} onClick={() => selectPayment('wallet')}>
                                <i className="fas fa-wallet"></i>
                                <h4>Speedly Wallet</h4>
                                <p>Balance: {formatCurrency(walletBalance)}</p>
                            </div>
                            <div className={`payment-card ${selectedPayment === 'card' ? 'selected' : ''}`} onClick={() => selectPayment('card')}>
                                <i className="fas fa-credit-card"></i>
                                <h4>Card</h4>
                                <p>Pay with card</p>
                            </div>
                        </div>

                        {booking.distance > 0 && (
                            <div className="fare-summary">
                                <h3>Fare Summary</h3>
                                <div className="fare-item"><span>Distance</span><span>{booking.distance.toFixed(1)} km</span></div>
                                <div className="fare-item"><span>Rate per km</span><span>₦{booking.plan === 'economy' ? '1,000' : '1,500'}</span></div>
                                <div className="fare-item"><span>Base fare</span><span>₦500</span></div>
                                <div className="fare-item total"><span>Total Amount</span><span>₦{booking.fare.toLocaleString()}</span></div>
                                {booking.payment === 'wallet' && booking.fare > walletBalance && (
                                    <div className="insufficient-warning">⚠️ Insufficient balance. Please add funds.</div>
                                )}
                            </div>
                        )}

                        <div className="action-buttons">
                            <button className="back-btn" onClick={prevStep}><i className="fas fa-arrow-left"></i> Back to Drivers</button>
                            <button className="book-btn" onClick={confirmBooking} disabled={!booking.payment || (booking.payment === 'wallet' && booking.fare > walletBalance)}>
                                <i className="fas fa-check"></i> Confirm & Book Ride
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ClientBookRide;