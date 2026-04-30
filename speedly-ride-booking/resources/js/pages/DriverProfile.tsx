import { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import { useForm } from '@inertiajs/react';
import DriverSidebarDesktop from '@/components/navbars/DriverSidebarDesktop';
import DriverNavMobile from '@/components/navbars/DriverNavMobile';
import MobilePreloader from '../components/preloader/MobilePreloader';
import DesktopPreloader from '../components/preloader/DesktopPreloader';
import { usePreloader } from '../hooks/usePreloader';
import { useMobile } from '../hooks/useMobile';
import '../../css/DriverProfile.css';

interface UserData {
  id?: number;
  full_name?: string;
  name?: string;
  email?: string;
  phone?: string;
  avatar?: string;
  profile_picture?: string;
  driver_status?: string;
  is_verified?: boolean;
  avg_rating?: number;
  total_reviews?: number;
  driver?: {
    vehicle_type?: string;
    vehicle_model?: string;
    vehicle_year?: string;
    license_plate?: string;
    vehicle_plate?: string;
  };
  bank?: {
    bank_name?: string;
    account_number?: string;
    account_name?: string;
  };
  notifications?: Array<{ is_read: boolean }>;
}

export default function DriverProfile() {
  const loading = usePreloader(1000);
  const isMobile = useMobile();
  
  const { data: userData } = useForm({
    full_name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: ''
  });

  const userName = userData?.full_name?.split(' ')[0] || userData?.name?.split(' ')[0] || 'Driver';
  const userAvatar = userData?.avatar || userData?.profile_picture || null;

  if (loading) {
    return isMobile ? <MobilePreloader /> : <DesktopPreloader />;
  }

  return (
    <>
      <Head title="Profile" />
      {isMobile ? (
        <div className="mobile-container">
          <div className="mobile-header">
            <h1>Profile</h1>
          </div>
          
          <div className="profile-card">
            <div className="profile-avatar-large">
              {userAvatar ? (
                <img src={userAvatar} alt="Profile" className="avatar-image" />
              ) : (
                <span>{userName.charAt(0).toUpperCase()}</span>
              )}
            </div>
            <h2>{userData?.full_name || userData?.name}</h2>
            <p>{userData?.email}</p>
            <p>{userData?.phone}</p>
          </div>

          <div className="profile-info-card">
            <h3>Driver Information</h3>
            <div className="info-row">
              <span className="info-label">Full Name</span>
              <span className="info-value">{userData?.full_name || userData?.name || 'Not set'}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Email</span>
              <span className="info-value">{userData?.email || 'Not set'}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Phone</span>
              <span className="info-value">{userData?.phone || 'Not set'}</span>
            </div>
          </div>

          {userData?.driver && (
            <div className="profile-info-card">
              <h3>Vehicle Information</h3>
              <div className="info-row">
                <span className="info-label">Vehicle Type</span>
                <span className="info-value">{userData.driver.vehicle_type || 'Not set'}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Vehicle Model</span>
                <span className="info-value">{userData.driver.vehicle_model || 'Not set'}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Vehicle Year</span>
                <span className="info-value">{userData.driver.vehicle_year || 'Not set'}</span>
              </div>
              <div className="info-row">
                <span className="info-label">License Plate</span>
                <span className="info-value">{userData.driver.license_plate || userData.driver.vehicle_plate || 'Not set'}</span>
              </div>
            </div>
          )}

          <div className="mobile-nav-container">
            <DriverNavMobile />
          </div>
        </div>
      ) : (
        <div className="dashboard-container">
          <DriverSidebarDesktop userName={userName} />
          <div className="desktop-main">
            <div className="desktop-header">
              <h1>Profile</h1>
              <p>Manage your driver information</p>
            </div>

            <div className="cd-card">
              <div className="profile-header">
                <div className="profile-avatar-large">
                  {userAvatar ? (
                    <img src={userAvatar} alt="Profile" className="avatar-image" />
                  ) : (
                    <span>{userName.charAt(0).toUpperCase()}</span>
                  )}
                </div>
                <div>
                  <h2>{userData?.full_name || userData?.name}</h2>
                  <p>{userData?.email}</p>
                </div>
              </div>
            </div>

            <div className="cd-card">
              <h3>Driver Information</h3>
              <div className="info-row">
                <span className="info-label">Full Name</span>
                <span className="info-value">{userData?.full_name || userData?.name || 'Not set'}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Email</span>
                <span className="info-value">{userData?.email || 'Not set'}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Phone</span>
                <span className="info-value">{userData?.phone || 'Not set'}</span>
              </div>
            </div>

            {userData?.driver && (
              <div className="cd-card">
                <h3>Vehicle Information</h3>
                <div className="info-row">
                  <span className="info-label">Vehicle Type</span>
                  <span className="info-value">{userData.driver.vehicle_type || 'Not set'}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Vehicle Model</span>
                  <span className="info-value">{userData.driver.vehicle_model || 'Not set'}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Vehicle Year</span>
                  <span className="info-value">{userData.driver.vehicle_year || 'Not set'}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">License Plate</span>
                  <span className="info-value">{userData.driver.license_plate || userData.driver.vehicle_plate || 'Not set'}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
