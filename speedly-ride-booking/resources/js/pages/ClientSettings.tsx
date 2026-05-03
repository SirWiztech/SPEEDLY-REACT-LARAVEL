import { useState } from 'react';
import { Head } from '@inertiajs/react';
import { useForm } from '@inertiajs/react';
import ClientSidebarDesktop from '@/components/navbars/ClientSidebarDesktop';
import ClientNavmobile from '@/components/navbars/ClientNavMobile';
import MobilePreloader from '../components/preloader/MobilePreloader';
import DesktopPreloader from '../components/preloader/DesktopPreloader';
import { usePreloader } from '../hooks/usePreloader';
import { useMobile } from '../hooks/useMobile';
import '../../css/ClientSettings.css';

interface UserSettings {
  darkMode: boolean;
  notificationsEnabled: boolean;
  emailNotifications: boolean;
  smsNotifications: boolean;
  language: string;
  currency: string;
}

export default function ClientSettings() {
  const loading = usePreloader(1000);
  const isMobile = useMobile();
  const [settings, setSettings] = useState<UserSettings>({
    darkMode: false,
    notificationsEnabled: true,
    emailNotifications: true,
    smsNotifications: false,
    language: 'en',
    currency: 'NGN'
  });

  const { data, setData, post, processing } = useForm({
    darkMode: false,
    notificationsEnabled: true,
    emailNotifications: true,
    smsNotifications: false,
    language: 'en',
    currency: 'NGN'
  });

  const handleSettingChange = (key: keyof UserSettings, value: boolean | string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setData(key as any, value);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    post('/client/settings', {
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
              <h2>Preferences</h2>
              
              <div className="setting-item">
                <span>Dark Mode</span>
                <input 
                  type="checkbox" 
                  checked={settings.darkMode}
                  onChange={(e) => handleSettingChange('darkMode', e.target.checked)}
                />
              </div>

              <div className="setting-item">
                <span>Push Notifications</span>
                <input 
                  type="checkbox" 
                  checked={settings.notificationsEnabled}
                  onChange={(e) => handleSettingChange('notificationsEnabled', e.target.checked)}
                />
              </div>

              <div className="setting-item">
                <span>Email Notifications</span>
                <input 
                  type="checkbox" 
                  checked={settings.emailNotifications}
                  onChange={(e) => handleSettingChange('emailNotifications', e.target.checked)}
                />
              </div>

              <div className="setting-item">
                <span>SMS Notifications</span>
                <input 
                  type="checkbox" 
                  checked={settings.smsNotifications}
                  onChange={(e) => handleSettingChange('smsNotifications', e.target.checked)}
                />
              </div>

              <div className="setting-item">
                <span>Language</span>
                <select 
                  value={settings.language}
                  onChange={(e) => handleSettingChange('language', e.target.value)}
                  className="setting-select"
                >
                  <option value="en">English</option>
                  <option value="yo">Yoruba</option>
                  <option value="ig">Igbo</option>
                  <option value="ha">Hausa</option>
                </select>
              </div>

              <div className="setting-item">
                <span>Currency</span>
                <select 
                  value={settings.currency}
                  onChange={(e) => handleSettingChange('currency', e.target.value)}
                  className="setting-select"
                >
                  <option value="NGN">NGN (₦)</option>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                </select>
              </div>
            </div>

            <div className="settings-section">
              <h2>Account</h2>
              <a href="/client/profile" className="settings-link">Edit Profile</a>
              <a href="/client/change-password" className="settings-link">Change Password</a>
              <button type="button" className="settings-link danger">Delete Account</button>
            </div>

            <button type="submit" className="btn-premium" disabled={processing}>
              {processing ? 'Saving...' : 'Save Settings'}
            </button>
          </form>

          <div className="mobile-nav-container">
            <ClientNavmobile />
          </div>
        </div>
      ) : (
        <div className="dashboard-container">
          <ClientSidebarDesktop userName="User" />
          <div className="desktop-main">
            <div className="desktop-header">
              <h1>Settings</h1>
              <p>Manage your preferences</p>
            </div>

            <form onSubmit={handleSave} className="settings-form">
              <div className="cd-card">
                <h2>Preferences</h2>
                
                <div className="setting-item">
                  <span>Dark Mode</span>
                  <input 
                    type="checkbox" 
                    checked={settings.darkMode}
                    onChange={(e) => handleSettingChange('darkMode', e.target.checked)}
                  />
                </div>

                <div className="setting-item">
                  <span>Push Notifications</span>
                  <input 
                    type="checkbox" 
                    checked={settings.notificationsEnabled}
                    onChange={(e) => handleSettingChange('notificationsEnabled', e.target.checked)}
                  />
                </div>

                <div className="setting-item">
                  <span>Email Notifications</span>
                  <input 
                    type="checkbox" 
                    checked={settings.emailNotifications}
                    onChange={(e) => handleSettingChange('emailNotifications', e.target.checked)}
                  />
                </div>

                <div className="setting-item">
                  <span>SMS Notifications</span>
                  <input 
                    type="checkbox" 
                    checked={settings.smsNotifications}
                    onChange={(e) => handleSettingChange('smsNotifications', e.target.checked)}
                  />
                </div>

                <div className="setting-item">
                  <span>Language</span>
                  <select 
                    value={settings.language}
                    onChange={(e) => handleSettingChange('language', e.target.value)}
                    className="setting-select"
                  >
                    <option value="en">English</option>
                    <option value="yo">Yoruba</option>
                    <option value="ig">Igbo</option>
                    <option value="ha">Hausa</option>
                  </select>
                </div>

                <div className="setting-item">
                  <span>Currency</span>
                  <select 
                    value={settings.currency}
                    onChange={(e) => handleSettingChange('currency', e.target.value)}
                    className="setting-select"
                  >
                    <option value="NGN">NGN (₦)</option>
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                  </select>
                </div>
              </div>

              <div className="cd-card">
                <h2>Account</h2>
                <a href="/client/profile" className="settings-link">Edit Profile</a>
                <a href="/client/change-password" className="settings-link">Change Password</a>
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
