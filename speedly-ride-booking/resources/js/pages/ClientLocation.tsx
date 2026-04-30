import { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import { usePreloader } from '../hooks/usePreloader';
import { useMobile } from '../hooks/useMobile';
import ClientSidebarDesktop from '@/components/navbars/ClientSidebarDesktop';
import ClientNavmobile from '@/components/navbars/ClientNavmobile';
import MobilePreloader from '../components/preloader/MobilePreloader';
import DesktopPreloader from '../components/preloader/DesktopPreloader';
import '../../css/ClientLocation.css';

declare global {
  interface Window {
    google: typeof google;
  }
}

// ==================== MAP PICKER FUNCTIONALITY ====================
// This file handles the map-based location selection for booking rides

let map: google.maps.Map | null = null;
let pickupMarker: google.maps.Marker | null = null;
let destMarker: google.maps.Marker | null = null;
let pickupLocation: google.maps.LatLng | null = null;
let destLocation: google.maps.LatLng | null = null;
let currentMode: 'pickup' | 'destination' = 'pickup';
let geocoder: google.maps.Geocoder | null = null;
let placesService: google.maps.places.PlacesService | null = null;
let autocomplete: google.maps.places.Autocomplete | null = null;

// Initialize the map
function initMapPicker(mapElementId: string, initialCenter: google.maps.LatLngLiteral = { lat: 6.5244, lng: 3.3792 }) {
    const mapElement = document.getElementById(mapElementId);
    if (!mapElement) return null;
    
    // Create map
    map = new google.maps.Map(mapElement, {
        center: initialCenter,
        zoom: 13,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: true,
        zoomControl: true,
        styles: [
            {
                featureType: "poi",
                elementType: "labels",
                stylers: [{ visibility: "on" }]
            },
            {
                featureType: "road",
                elementType: "labels",
                stylers: [{ visibility: "on" }]
            }
        ]
    });
    
    // Initialize geocoder
    geocoder = new google.maps.Geocoder();
    
    // Add click listener
    map.addListener('click', function(e: google.maps.MapMouseEvent) {
        handleMapClick(e.latLng!);
    });
    
    return map;
}

// Handle map click
function handleMapClick(latLng: google.maps.LatLng | null) {
    if (!latLng) return;
    const lat = latLng.lat();
    const lng = latLng.lng();
    
    showLoading();
    
    // Reverse geocode to get address
    geocoder!.geocode({ location: { lat, lng } }, (results, status) => {
        hideLoading();
        
        let address = '';
        let placeId = '';
        
        if (status === 'OK' && results && results[0]) {
            address = results[0].formatted_address;
            placeId = results[0].place_id;
        } else {
            address = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
        }
        
        if (currentMode === 'pickup') {
            setPickupLocation(lat, lng, address, placeId);
        } else {
            setDestinationLocation(lat, lng, address, placeId);
        }
    });
}

// Set pickup location
function setPickupLocation(lat: number, lng: number, address: string, placeId: string) {
    // Remove existing pickup marker
    if (pickupMarker) {
        pickupMarker.setMap(null);
    }
    
    // Create new marker
    pickupMarker = new google.maps.Marker({
        position: { lat, lng },
        map: map,
        title: 'Pickup Location',
        icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 12,
            fillColor: '#4CAF50',
            fillOpacity: 1,
            strokeColor: '#ffffff',
            strokeWeight: 3,
            labelOrigin: new google.maps.Point(0, -10)
        },
        label: {
            text: 'P',
            color: 'white',
            fontSize: '12px',
            fontWeight: 'bold'
        }
    });
    
    pickupLocation = new google.maps.LatLng(lat, lng);
    
    // Update UI
    const pickupInput = document.getElementById('pickup-input') as HTMLInputElement | null;
    if (pickupInput) pickupInput.value = address;
    
    // Update hidden fields
    const pickupLat = document.getElementById('pickup_lat') as HTMLInputElement | null;
    const pickupLng = document.getElementById('pickup_lng') as HTMLInputElement | null;
    const pickupAddress = document.getElementById('pickup_address') as HTMLInputElement | null;
    const pickupPlaceId = document.getElementById('pickup_place_id') as HTMLInputElement | null;
    
    if (pickupLat) pickupLat.value = lat.toString();
    if (pickupLng) pickupLng.value = lng.toString();
    if (pickupAddress) pickupAddress.value = address;
    if (pickupPlaceId) pickupPlaceId.value = placeId;
}

// Set destination location
function setDestinationLocation(lat: number, lng: number, address: string, placeId: string) {
    // Remove existing destination marker
    if (destMarker) {
        destMarker.setMap(null);
    }
    
    // Create new marker
    destMarker = new google.maps.Marker({
        position: { lat, lng },
        map: map,
        title: 'Destination',
        icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 12,
            fillColor: '#F44336',
            fillOpacity: 1,
            strokeColor: '#ffffff',
            strokeWeight: 3,
            labelOrigin: new google.maps.Point(0, -10)
        },
        label: {
            text: 'D',
            color: 'white',
            fontSize: '12px',
            fontWeight: 'bold'
        }
    });
    
    destLocation = new google.maps.LatLng(lat, lng);
    
    // Update UI
    const destInput = document.getElementById('destination-input') as HTMLInputElement | null;
    if (destInput) destInput.value = address;
    
    // Update hidden fields
    const destLat = document.getElementById('destination_lat') as HTMLInputElement | null;
    const destLng = document.getElementById('destination_lng') as HTMLInputElement | null;
    const destAddress = document.getElementById('destination_address') as HTMLInputElement | null;
    const destPlaceId = document.getElementById('destination_place_id') as HTMLInputElement | null;
    
    if (destLat) destLat.value = lat.toString();
    if (destLng) destLng.value = lng.toString();
    if (destAddress) destAddress.value = address;
    if (destPlaceId) destPlaceId.value = placeId;
}

// Calculate distance
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
}

function deg2rad(deg: number) {
    return deg * (Math.PI / 180);
}

// Show loading
function showLoading() {
    const loadingEl = document.getElementById('map-loading');
    if (loadingEl) loadingEl.style.display = 'flex';
}

// Hide loading
function hideLoading() {
    const loadingEl = document.getElementById('map-loading');
    if (loadingEl) loadingEl.style.display = 'none';
}

// Initialize autocomplete
function initAutocomplete(searchInputId: string, mode: 'pickup' | 'destination') {
    const input = document.getElementById(searchInputId) as HTMLInputElement | null;
    if (!input || !google?.maps?.places) return;
    
    autocomplete = new google.maps.places.Autocomplete(input, {
        types: ['establishment'],
        componentRestrictions: { country: 'ng' }
    });
    
    autocomplete.addListener('place_changed', function() {
        const place = autocomplete!.getPlace();
        
        if (!place.geometry || !place.geometry.location) {
            return;
        }
        
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        const address = place.formatted_address || input.value;
        const placeId = place.place_id || '';
        
        if (mode === 'pickup') {
            setPickupLocation(lat, lng, address, placeId);
        } else {
            setDestinationLocation(lat, lng, address, placeId);
        }
        
        // Pan to location
        if (map) {
            map.panTo({ lat, lng });
        }
    });
}

// ==================== MAIN COMPONENT ====================

export default function ClientLocation() {
    const loading = usePreloader(1000);
    const isMobile = useMobile();
    const [userLocation, setUserLocation] = useState<{lat: number; lng: number} | null>(null);

    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setUserLocation({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    });
                },
                (error) => {
                    console.error('Error getting location:', error);
                }
            );
        }
    }, []);

    if (loading) {
        return isMobile ? <MobilePreloader /> : <DesktopPreloader />;
    }

    return (
        <>
            <Head title="My Location" />
            {isMobile ? (
                <div className="mobile-container">
                    <div className="mobile-header">
                        <h1>My Location</h1>
                    </div>

                    <div className="location-content">
                        <div className="map-placeholder">
                            <p>Map integration coming soon</p>
                            {userLocation && (
                                <p>Latitude: {userLocation.lat}, Longitude: {userLocation.lng}</p>
                            )}
                        </div>

                        <div className="location-actions">
                            <button className="action-btn primary">Set Pickup Here</button>
                            <button className="action-btn">Share Location</button>
                        </div>
                    </div>

                    <div className="mobile-nav-container">
                        <ClientNavmobile />
                    </div>
                </div>
            ) : (
                <div className="dashboard-container">
                    <ClientSidebarDesktop userName="User" />
                    <div className="desktop-main">
                        <div className="desktop-header">
                            <h1>My Location</h1>
                            <p>Set your pickup and destination</p>
                        </div>

                        <div className="cd-card">
                            <div className="location-content">
                                <div className="map-placeholder">
                                    <p>Map integration coming soon</p>
                                    {userLocation && (
                                        <p>Latitude: {userLocation.lat}, Longitude: {userLocation.lng}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
