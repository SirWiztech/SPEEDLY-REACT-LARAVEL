import { useState } from 'react';
import { Head } from '@inertiajs/react';
import ClientNavmobile from '@/components/navbars/ClientNavmobile';
import { useQuery, useMutation } from '@tanstack/react-query';
import { usePreloader } from '../../hooks/usePreloader';
import MobilePreloader from '../preloader/MobilePreloader';
import '../../../css/ClientLocation.css';

interface SavedLocation {
    id: string;
    name: string;
    address: string;
    type: 'home' | 'work' | 'other';
}

export default function ClientLocationMobile() {
    const loading = usePreloader(1500);
    const [showAddForm, setShowAddForm] = useState(false);

    const { data: locations, isLoading } = useQuery<SavedLocation[]>({
        queryKey: ['client-locations-mobile'],
        queryFn: () => fetch('/api/client/locations').then(res => res.json()),
    });

    if (loading) {
        return <MobilePreloader />;
    }

    return (
        <>
            <Head title="Saved Locations - Mobile" />
            <div className="mobile-container">
                <div className="mobile-header">
                    <h1>Saved Locations</h1>
                    <button className="btn-add" onClick={() => setShowAddForm(true)}>+</button>
                </div>

                <div className="locations-list">
                    {locations?.map((location) => (
                        <div key={location.id} className="location-card">
                            <div className="location-icon">
                                {location.type === 'home' ? '🏠' : location.type === 'work' ? '💼' : '📍'}
                            </div>
                            <div className="location-details">
                                <h3>{location.name}</h3>
                                <p>{location.address}</p>
                            </div>
                            <button className="btn-edit">Edit</button>
                        </div>
                    ))}
                </div>

                <div className="quick-actions">
                    <button className="action-btn primary">Use Current Location</button>
                </div>

                <div className="mobile-nav-container">
                    <ClientNavmobile />
                </div>
            </div>
        </>
    );
}
