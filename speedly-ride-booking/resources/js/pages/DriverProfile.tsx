import React, { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import Swal from 'sweetalert2';
import { usePreloader } from '../hooks/usePreloader';
import { useMobile } from '../hooks/useMobile';
import MobilePreloader from '../components/preloader/MobilePreloader';
import DesktopPreloader from '../components/preloader/DesktopPreloader';
import '../../css/DriverProfile.css';

interface DriverData {
    id: string;
    full_name: string;
    email: string;
    phone_number: string;
    profile_picture_url: string | null;
    created_at: string;
    driver_status: string;
    verification_status: string;
    vehicle_type: string;
    vehicle_model: string;
    vehicle_year: string;
    license_plate: string;
    address: string;
    city: string;
    state: string;
}

interface DriverStats {
    total_rides: number;
    total_earnings: number;
    average_rating: number;
    total_reviews: number;
}

const DriverProfile: React.FC = () => {
    const [driverData, setDriverData] = useState<DriverData | null>(null);
    const [stats, setStats] = useState<DriverStats>({
        total_rides: 0,
        total_earnings: 0,
        average_rating: 0,
        total_reviews: 0
    });
    const [activeTab, setActiveTab] = useState<string>('personal');
    const [loading, setLoading] = useState<boolean>(true);
    const [editName, setEditName] = useState<string>('');
    const [editPhone, setEditPhone] = useState<string>('');
    const [editAddress, setEditAddress] = useState<string>('');
    const [editCity, setEditCity] = useState<string>('');
    const [editState, setEditState] = useState<string>('');
    const [vehicleType, setVehicleType] = useState<string>('');
    const [vehicleModel, setVehicleModel] = useState<string>('');
    const [vehicleYear, setVehicleYear] = useState<string>('');
    const [licensePlate, setLicensePlate] = useState<string>('');
    const [bankName, setBankName] = useState<string>('');
    const [accountNumber, setAccountNumber] = useState<string>('');
    const [accountName, setAccountName] = useState<string>('');
    
    const preloaderLoading = usePreloader(1000);
    const isMobile = useMobile();

    // Fetch driver data
    const fetchDriverData = async () => {
        try {
            const response = await fetch('/SERVER/API/driver_profile_data.php');
            const data = await response.json();
            
            if (data.success) {
                setDriverData(data.driver);
                setStats(data.stats);
                setEditName(data.driver?.full_name || '');
                setEditPhone(data.driver?.phone_number || '');
                setEditAddress(data.driver?.address || '');
                setEditCity(data.driver?.city || '');
                setEditState(data.driver?.state || '');
                setVehicleType(data.driver?.vehicle_type || '');
                setVehicleModel(data.driver?.vehicle_model || '');
                setVehicleYear(data.driver?.vehicle_year || '');
                setLicensePlate(data.driver?.license_plate || '');
            }
        } catch (error) {
            console.error('Error fetching driver data:', error);
        } finally {
            setLoading(false);
        }
    };

    // Update profile
    const updateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        
        Swal.fire({
            title: 'Updating...',
            allowOutsideClick: false,
            didOpen: () => Swal.showLoading()
        });
        
        try {
            const response = await fetch('/SERVER/API/update_driver_profile.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    full_name: editName, 
                    phone_number: editPhone,
                    address: editAddress,
                    city: editCity,
                    state: editState
                })
            });
            const data = await response.json();
            
            if (data.success) {
                Swal.fire({
                    icon: 'success',
                    title: 'Profile Updated',
                    text: 'Your profile has been updated successfully',
                    timer: 1500,
                    showConfirmButton: false
                }).then(() => {
                    fetchDriverData();
                    setActiveTab('personal');
                });
            } else {
                Swal.fire({ icon: 'error', title: 'Error', text: data.message, confirmButtonColor: '#ff5e00' });
            }
        } catch (error) {
            Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to update profile', confirmButtonColor: '#ff5e00' });
        }
    };

    // Update vehicle
    const updateVehicle = async (e: React.FormEvent) => {
        e.preventDefault();
        
        Swal.fire({
            title: 'Updating...',
            allowOutsideClick: false,
            didOpen: () => Swal.showLoading()
        });
        
        try {
            const response = await fetch('/SERVER/API/update_driver_vehicle.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    vehicle_type: vehicleType,
                    vehicle_model: vehicleModel,
                    vehicle_year: vehicleYear,
                    license_plate: licensePlate
                })
            });
            const