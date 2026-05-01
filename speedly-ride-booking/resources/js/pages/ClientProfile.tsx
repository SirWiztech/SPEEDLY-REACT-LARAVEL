import { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import { useForm } from '@inertiajs/react';
import ClientSidebarDesktop from '@/components/navbars/ClientSidebarDesktop';
import ClientNavmobile from '@/components/navbars/ClientNavmobile';
import MobilePreloader from '../components/preloader/MobilePreloader';
import DesktopPreloader from '../components/preloader/DesktopPreloader';
import { usePreloader } from '../hooks/usePreloader';
import { useMobile } from '../hooks/useMobile';
import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import '../../css/ClientProfile.css';

interface UserData {
  id?: string;
  full_name?: string;
  name?: string;
  email?: string;
  phone_number?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  profile_picture_url?: string;
  avatar?: string;
  profile_picture?: string;
  is_verified?: boolean;
}

export default function ClientProfile() {
  const loading = usePreloader(1000);
  const isMobile = useMobile();
  
  const { data: profileData, isLoading } = useQuery<{ user: UserData; profile: any }>({
    queryKey: ['client-profile'],
    queryFn: () => api.client.profile().then(res => res.data),
  });

  const userData = profileData?.user || {};
  const userName = userData?.full_name?.split(' ')[0] || userData?.name?.split(' ')[0] || 'User';
  const userAvatar = userData?.profile_picture_url || userData?.avatar || userData?.profile_picture || null;

  if (loading || isLoading) {
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
            <p>{userData?.phone_number || userData?.phone}</p>
          </div>

          <div className="profile-info-card">
            <h3>Personal Information</h3>
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
              <span className="info-value">{userData?.phone_number || userData?.phone || 'Not set'}</span>
            </div>
          </div>

          <div className="mobile-nav-container">
            <ClientNavmobile />
          </div>
        </div>
      ) : (
        <div className="dashboard-container">
          <ClientSidebarDesktop userName={userName} />
          <div className="desktop-main">
            <div className="desktop-header">
              <h1>Profile</h1>
              <p>Manage your personal information</p>
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
              <h3>Personal Information</h3>
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
                <span className="info-value">{userData?.phone_number || userData?.phone || 'Not set'}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
