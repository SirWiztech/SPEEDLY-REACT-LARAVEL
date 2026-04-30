import { useState } from 'react';
import { Head } from '@inertiajs/react';
import DriverNavMobile from '@/components/navbars/DriverNavMobile';
import { useQuery } from '@tanstack/react-query';
import { usePreloader } from '../../hooks/usePreloader';
import MobilePreloader from '../preloader/MobilePreloader';
import '../../../css/DriverProfile.css';

interface ProfileData {
    full_name: string;
    email: string;
    phone_number: string;
    profile_picture: string;
    rating: number;
    total_rides: number;
    completion_rate: number;
}

export default function DriverProfileMobile() {
    const loading = usePreloader(1500);

    const { data: profile } = useQuery<ProfileData>({
        queryKey: ['driver-profile-mobile'],
        queryFn: () => fetch('/api/driver/profile').then(res => res.json()),
    });

    if (loading) {
        return <MobilePreloader />;
    }

    return (
        <>
            <Head title="Profile - Mobile" />
            <div className="mobile-container">
                <div className="mobile-header">
                    <h1>My Profile</h1>
                </div>

                <div className="profile-card">
                    <div className="profile-avatar-section">
                        <div className="avatar-wrapper">
                            <img 
                                src={profile?.profile_picture || '/main-assets/default-avatar.png'} 
                                alt="Profile" 
                                className="profile-avatar"
                            />
                        </div>
                        <div className="profile-info">
                            <h2>{profile?.full_name || 'Driver'}</h2>
                            <p>{profile?.email}</p>
                        </div>
                    </div>

                    <div className="profile-stats">
                        <div className="stat-item">
                            <div className="stat-value">{profile?.rating?.toFixed(1) || '0.0'} ⭐</div>
                            <div className="stat-label">Rating</div>
                        </div>
                        <div className="stat-item">
                            <div className="stat-value">{profile?.total_rides || 0}</div>
                            <div className="stat-label">Total Rides</div>
                        </div>
                        <div className="stat-item">
                            <div className="stat-value">{profile?.completion_rate || 0}%</div>
                            <div className="stat-label">Completion</div>
                        </div>
                    </div>
                </div>

                <div className="mobile-nav-container">
                    <DriverNavMobile />
                </div>
            </div>
        </>
    );
}
