import { useState } from 'react';
import { Head } from '@inertiajs/react';
import DriverNavMobile from '@/components/navbars/DriverNavMobile';
import { useMutation } from '@tanstack/react-query';
import { usePreloader } from '../../hooks/usePreloader';
import MobilePreloader from '../preloader/MobilePreloader';

export default function DriverSupportMobile() {
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const loading = usePreloader(1500);

    const submitMutation = useMutation({
        mutationFn: (data: { subject: string; message: string }) =>
            fetch('/api/driver/support', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            }).then(res => res.json()),
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        submitMutation.mutate({ subject, message });
    };

    if (loading) {
        return <MobilePreloader />;
    }

    return (
        <>
            <Head title="Support - Mobile" />
            <div className="mobile-container">
                <div className="mobile-header">
                    <h1>Support</h1>
                </div>

                <div className="support-form">
                    <h2>Contact Support</h2>
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Subject</label>
                            <input
                                type="text"
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                placeholder="Enter subject"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Message</label>
                            <textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Describe your issue"
                                rows={5}
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            className="btn-premium"
                            disabled={submitMutation.isPending}
                        >
                            {submitMutation.isPending ? 'Sending...' : 'Send Message'}
                        </button>
                    </form>
                </div>

                <div className="mobile-nav-container">
                    <DriverNavMobile />
                </div>
            </div>
        </>
    );
}
