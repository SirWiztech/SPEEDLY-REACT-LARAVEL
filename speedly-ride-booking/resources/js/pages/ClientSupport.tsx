import { useState } from 'react';
import { Head } from '@inertiajs/react';
import { useForm } from '@inertiajs/react';
import { usePreloader } from '../hooks/usePreloader';
import { useMobile } from '../hooks/useMobile';
import ClientSidebarDesktop from '@/components/navbars/ClientSidebarDesktop';
import ClientNavmobile from '@/components/navbars/ClientNavMobile';
import MobilePreloader from '../components/preloader/MobilePreloader';
import DesktopPreloader from '../components/preloader/DesktopPreloader';
import '../../css/ClientSupport.css';

export default function ClientSupport() {
  const loading = usePreloader(1000);
  const isMobile = useMobile();
  const { data, setData, post, processing, errors } = useForm({
    subject: '',
    message: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post('/support/client', {
      preserveScroll: true,
      onSuccess: () => {
        setData({ subject: '', message: '' });
      },
    });
  };

  if (loading) {
    return isMobile ? <MobilePreloader /> : <DesktopPreloader />;
  }

  return (
    <>
      <Head title="Support" />
      {isMobile ? (
        <div className="mobile-container">
          <div className="mobile-header">
            <h1>Support</h1>
          </div>
          <div className="support-form-card">
            <h2>Contact Support</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Subject</label>
                <input
                  type="text"
                  value={data.subject}
                  onChange={(e) => setData('subject', e.target.value)}
                  placeholder="Enter subject"
                  required
                  className="form-input"
                />
                {errors.subject && <span className="error-text">{errors.subject}</span>}
              </div>
              <div className="form-group">
                <label>Message</label>
                <textarea
                  value={data.message}
                  onChange={(e) => setData('message', e.target.value)}
                  placeholder="Describe your issue"
                  rows={5}
                  required
                  className="form-textarea"
                />
                {errors.message && <span className="error-text">{errors.message}</span>}
              </div>
              <button
                type="submit"
                className="btn-premium"
                disabled={processing}
              >
                {processing ? 'Sending...' : 'Send Message'}
              </button>
            </form>
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
              <h1>Support</h1>
              <p>We're here to help</p>
            </div>
            <div className="cd-card">
              <h2>Contact Support</h2>
              <form onSubmit={handleSubmit} className="support-form">
                <div className="form-group">
                  <label>Subject</label>
                  <input
                    type="text"
                    value={data.subject}
                    onChange={(e) => setData('subject', e.target.value)}
                    placeholder="Enter subject"
                    required
                    className="form-input"
                  />
                  {errors.subject && <span className="error-text">{errors.subject}</span>}
                </div>
                <div className="form-group">
                  <label>Message</label>
                  <textarea
                    value={data.message}
                    onChange={(e) => setData('message', e.target.value)}
                    placeholder="Describe your issue"
                    rows={5}
                    required
                    className="form-textarea"
                  />
                  {errors.message && <span className="error-text">{errors.message}</span>}
                </div>
                <button
                  type="submit"
                  className="btn-premium"
                  disabled={processing}
                >
                  {processing ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
