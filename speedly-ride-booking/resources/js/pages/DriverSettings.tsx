import { useState } from 'react';
import { Head } from '@inertiajs/react';
import { useForm } from '@inertiajs/react';
import DriverSidebarDesktop from '@/components/navbars/DriverSidebarDesktop';
import DriverNavMobile from '@/components/navbars/DriverNavMobile';
import MobilePreloader from '../components/preloader/MobilePreloader';
import DesktopPreloader from '../components/preloader/DesktopPreloader';
import { usePreloader } from '../hooks/usePreloader';
import { useMobile } from '../hooks/useMobile';
import '../../css/DriverSettings.css';

interface DriverSettings {
  notifications_enabled: boolean;
  sound_alerts: boolean;
  dark_mode: boolean;
  language: string;
}

export default function DriverSettings() {
  const loading = usePreloader(1000);
  const isMobile = useMobile();
  const [driverStatus, setDriverStatus] = useState('offline');

  const { data, setData, post, processing } = useForm<DriverSettings>({
    notifications_enabled: true,
    sound_alerts: true,
    dark_mode: false,
    language: 'en'
  });

  const handleToggleSetting = (key: keyof DriverSettings) => {
    const newValue = !data[key];
    setData(key, newValue);
  };

  const handleToggleDriverStatus = () => {
    const newStatus = driverStatus === 'online' ? 'offline' : 'online';
    setDriverStatus(newStatus);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    post('/driver/settings', {
      preserveScroll: true,
    });
  };

  if (loading) {
    return isMobile ? <MobilePreloader /> : <DesktopPreloader />;
  }

  return (
    <>
      <Head title="Settings" />
      {isMobile ? (
        <div className="mobile-container">
          <div className="mobile-header">
            <h1>Settings</h1>
          </div>

          <form onSubmit={handleSave} className="settings-form">
            <div className="settings-section">
              <h2>Driver Status</h2>
              <div className="driver-status-toggle">
                <button
                  type="button"
                  className={`status-btn ${driverStatus === 'online' ? 'active' : ''}`}
                  onClick={() => driverStatus !== 'online' && handleToggleDriverStatus()}
                >
                  Go Online
                </button>
                <button
                  type="button"
                  className={`status-btn ${driverStatus === 'offline' ? 'active offline' : ''}`}
                  onClick={() => driverStatus !== 'offline' && handleToggleDriverStatus()}
                >
                  Go Offline
                </button>
              </div>
            </div>

            <div className="settings-section">
              <h2>Preferences</h2>
              
              <div className="setting-item">
                <span>Push Notifications</span>
                <input 
                  type="checkbox" 
                  checked={data.notifications_enabled}
                  onChange={() => handleToggleSetting('notifications_enabled')}
                />
              </div>

              <div className="setting-item">
                <span>Sound Alerts</span>
                <input 
                  type="checkbox" 
                  checked={data.sound_alerts}
                  onChange={() => handleToggleSetting('sound_alerts')}
                />
              </div>

              <div className="setting-item">
                <span>Dark Mode</span>
                <input 
                  type="checkbox" 
                  checked={data.dark_mode}
                  onChange={() => handleToggleSetting('dark_mode')}
                />
              </div>

              <div className="setting-item">
                <span>Language</span>
                <select 
                  value={data.language}
                  onChange={(e) => setData('language', e.target.value)}
                  className="setting-select"
                >
                  <option value="en">English</option>
                  <option value="yo">Yoruba</option>
                  <option value="ig">Igbo</option>
                  <option value="ha">Hausa</option>
                </select>
              </div>
            </div>

            <div className="settings-section">
              <h2>Account</h2>
              <a href="/driver/profile" className="settings-link">Edit Profile</a>
              <a href="/driver/change-password" className="settings-link">Change Password</a>
              <button type="button" className="settings-link danger">Delete Account</button>
            </div>

            <button type="submit" className="btn-premium" disabled={processing}>
              {processing ? 'Saving...' : 'Save Settings'}
            </button>
          </form>

          <div className="mobile-nav-container">
            <DriverNavMobile />
          </div>
        </div>
      ) : (
        <div className="dashboard-container">
          <DriverSidebarDesktop userName="Driver" />
          <div className="desktop-main">
            <div className="desktop-header">
              <h1>Settings</h1>
              <p>Manage your driver preferences</p>
            </div>

            <form onSubmit={handleSave} className="settings-form">
              <div className="cd-card">
                <h2>Driver Status</h2>
                <div className="driver-status-toggle">
                  <button
                    type="button"
                    className={`status-btn ${driverStatus === 'online' ? 'active' : ''}`}
                    onClick={() => driverStatus !== 'online' && handleToggleDriverStatus()}
                  >
                    Go Online
                  </button>
                  <button
                    type="button"
                    className={`status-btn ${driverStatus === 'offline' ? 'active offline' : ''}`}
                    onClick={() => driverStatus !== 'offline' && handleToggleDriverStatus()}
                  >
                    Go Offline
                  </button>
                </div>
              </div>

              <div className="cd-card">
                <h2>Preferences</h2>
                
                <div className="setting-item">
                  <span>Push Notifications</span>
                  <input 
                    type="checkbox" 
                    checked={data.notifications_enabled}
                    onChange={() => handleToggleSetting('notifications_enabled')}
                  />
                </div>

                <div className="setting-item">
                  <span>Sound Alerts</span>
                  <input 
                    type="checkbox" 
                    checked={data.sound_alerts}
                    onChange={() => handleToggleSetting('sound_alerts')}
                  />
                </div>

                <div className="setting-item">
                  <span>Dark Mode</span>
                  <input 
                    type="checkbox" 
                    checked={data.dark_mode}
                    onChange={() => handleToggleSetting('dark_mode')}
                  />
                </div>

                <div className="setting-item">
                  <span>Language</span>
                  <select 
                    value={data.language}
                    onChange={(e) => setData('language', e.target.value)}
                    className="setting-select"
                  >
                    <option value="en">English</option>
                    <option value="yo">Yoruba</option>
                    <option value="ig">Igbo</option>
                    <option value="ha">Hausa</option>
                  </select>
                </div>
              </div>

              <div className="cd-card">
                <h2>Account</h2>
                <a href="/driver/profile" className="settings-link">Edit Profile</a>
                <a href="/driver/change-password" className="settings-link">Change Password</a>
                <button type="button" className="settings-link danger">Delete Account</button>
              </div>

              <button type="submit" className="btn-premium" disabled={processing}>
                {processing ? 'Saving...' : 'Save Settings'}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
