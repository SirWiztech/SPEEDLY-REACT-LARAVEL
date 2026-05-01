import { useState } from 'react';
import { Head } from '@inertiajs/react';
import DriverSidebarDesktop from '@/components/navbars/DriverSidebarDesktop';
import DriverNavMobile from '@/components/navbars/DriverNavMobile';
import { useQuery, useMutation } from '@tanstack/react-query';
import { usePreloader } from '../hooks/usePreloader';
import { useMobile } from '../hooks/useMobile';
import MobilePreloader from '../components/preloader/MobilePreloader';
import DesktopPreloader from '../components/preloader/DesktopPreloader';
import '../../css/DriverKyc.css';

interface KycDocument {
    id: string;
    type: 'license' | 'insurance' | 'registration' | 'id_card';
    status: 'pending' | 'approved' | 'rejected';
    file_url: string;
}

interface KycStatus {
    verification_status: 'pending' | 'approved' | 'rejected';
    documents: KycDocument[];
}

export default function DriverKyc() {
    const loading = usePreloader(1000);
    const isMobile = useMobile();
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [documentType, setDocumentType] = useState<string>('license');

    const { data: kycStatus, isLoading } = useQuery<KycStatus>({
        queryKey: ['driver-kyc'],
        queryFn: () => api.driver.kyc().then(res => res.data),
    });

    const uploadMutation = useMutation({
        mutationFn: (formData: FormData) => api.driver.uploadKyc(formData),
    });

    const handleFileUpload = () => {
        if (!selectedFile) return;
        
        const formData = new FormData();
        formData.append('document', selectedFile);
        formData.append('type', documentType);
        uploadMutation.mutate(formData);
    };

    if (loading) {
        return isMobile ? <MobilePreloader /> : <DesktopPreloader />;
    }

    return (
        <>
            <Head title="KYC Verification" />
            <div className="mobile-container">
                <div className="desktop-sidebar-container">
                    <DriverSidebarDesktop userName="Driver" />
                </div>

                <div className="main-content">
                    <div className="mobile-header">
                        <h1>KYC Verification</h1>
                    </div>

                    <div className="kyc-status-card">
                        <div className={`status-badge status-${kycStatus?.verification_status || 'pending'}`}>
                            {kycStatus?.verification_status || 'Pending'}
                        </div>
                        <p className="kyc-description">
                            Complete your KYC verification to start accepting rides.
                        </p>
                    </div>

                    <div className="kyc-upload-section">
                        <h2>Upload Documents</h2>
                        <div className="upload-form">
                            <div className="form-group">
                                <label>Document Type</label>
                                <select 
                                    value={documentType}
                                    onChange={(e) => setDocumentType(e.target.value)}
                                >
                                    <option value="license">Driver's License</option>
                                    <option value="insurance">Insurance</option>
                                    <option value="registration">Vehicle Registration</option>
                                    <option value="id_card">ID Card</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Select File</label>
                                <input 
                                    type="file"
                                    accept="image/*,.pdf"
                                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                                />
                            </div>

                            <button 
                                className="btn-premium"
                                onClick={handleFileUpload}
                                disabled={!selectedFile || uploadMutation.isPending}
                            >
                                {uploadMutation.isPending ? 'Uploading...' : 'Upload Document'}
                            </button>
                        </div>
                    </div>

                    <div className="documents-list">
                        <h2>Uploaded Documents</h2>
                        {kycStatus?.documents.map((doc) => (
                            <div key={doc.id} className="document-card">
                                <div className="doc-info">
                                    <span className="doc-type">{doc.type}</span>
                                    <span className={`status-badge status-${doc.status}`}>{doc.status}</span>
                                </div>
                                <a href={doc.file_url} target="_blank" rel="noopener noreferrer">
                                    View Document
                                </a>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="mobile-nav-container">
                    <DriverNavMobile />
                </div>
            </div>
        </>
    );
}
