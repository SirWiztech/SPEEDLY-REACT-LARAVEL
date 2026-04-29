import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import DriverSidebar from '../components/DriverSidebar';
import DriverMobileNav from '../components/DriverMobileNav';
import { userAPI, rideAPI } from '../services/api';
import MobilePreloader from '../components/Preloader';
import '../styles/driver_settings.css';
import alert from '../utils/alert';

export default function DriverSettings() {
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [driverStatus, setDriverStatus] = useState('offline');
  const [todayEarnings, setTodayEarnings] = useState(0);
  const [notificationCount, setNotificationCount] = useState(0);
  const [settings, setSettings] = useState({
    notifications_enabled: true,
    sound_alerts: true,
    dark_mode: false,
    language: 'en'
  });
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [profileRes, settingsRes, ridesRes] = await Promise.all([
        userAPI.getProfile(),
        userAPI.getSettings(),
        rideAPI.getHistory(100)
      ]);
      const profile = profileRes.data?.user || profileRes.data?.profile || profileRes.data;
      setUserData(profile);
      
      const driverProfile = profile?.driver;
      if (driverProfile) {
        setDriverStatus(driverProfile.driver_status || 'offline');
      }
      
      const appSettings = settingsRes.data?.settings || {};
      setSettings({
        notifications_enabled: appSettings.notifications_enabled !== false,
        sound_alerts: appSettings.sound_alerts !== false,
        dark_mode: appSettings.dark_mode === true,
        language: appSettings.language || 'en'
      });

      const rides = ridesRes.data?.rides || [];
      const today = new Date().toDateString();
      const todayRides = rides.filter(r => r.status === 'completed' && new Date(r.completed_at || r.created_at).toDateString() === today);
      setTodayEarnings(todayRides.reduce((sum, r) => sum + (parseFloat(r.total_fare) || 0), 0));
      
      setNotificationCount(profileRes.data?.notifications?.filter(n => !n.is_read).length || 0);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleDriverStatus = async () => {
    const newStatus = driverStatus === 'online' ? 'offline' : 'online';
    try {
      await userAPI.toggleDriverStatus(newStatus);
      setDriverStatus(newStatus);
      alert.toast(newStatus === 'online' ? 'You are now online' : 'You are now offline', 'success');
    } catch (err) {
      console.error('Error toggling status:', err);
      setDriverStatus(newStatus);
    }
  };

  const handleToggleSetting = async (key) => {
    const newValue = !settings[key];
    setSettings(prev => ({...prev, [key]: newValue}));
    try {
      await userAPI.updateSettings({[key]: newValue});
    } catch (err) {
      setSettings(prev => ({...prev, [key]: !newValue}));
    }
  };

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to log out?')) {
      try {
        await userAPI.logout?.();
      } catch (err) {}
      localStorage.clear();
      navigate('/');
    }
  };

  if (loading) return <MobilePreloader />;

  const userName = userData?.full_name?.split(' ')[0] || userData?.name?.split(' ')[0] || 'Driver';

  const accountItems = [
    { label: 'Edit Profile', icon: 'fa-user', path: '/driver/profile', color: '#ff5e00' },
    { label: 'Update Location', icon: 'fa-map-marker-alt', path: '/driver_location', color: '#16a34a' },
    { label: 'KYC Verification', icon: 'fa-id-card', path: '/kyc', color: '#0284c7' },
    { label: 'Support', icon: 'fa-headset', path: '/support', color: '#8b5cf6' },
  ];

  const languageNames = { en: 'English', fr: 'French', es: 'Spanish', pt: 'Portuguese' };

  return (
    <div className="dashboard-container">
      <div className="mobile-view" style={{
        background: '#f5f5f7',
        minHeight: '100vh',
        paddingBottom: '90px'
      }}>
        <div style={{
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
          padding: '60px 20px 32px',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute',
            top: '-40%',
            right: '-20%',
            width: '200px',
            height: '200px',
            background: 'linear-gradient(135deg, #ff5e00 0%, #ff8c3a 100%)',
            borderRadius: '50%'
          }}></div>
          
          <div style={{position: 'relative', zIndex: 1}}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px'
            }}>
              <div style={{
                width: '56px', height: '56px',
                borderRadius: '18px',
                background: 'linear-gradient(135deg, #ff5e00 0%, #ff8c3a 100%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 8px 24px rgba(255,94,0,0.3)'
              }}>
                <i className="fas fa-gear" style={{fontSize: '24px', color: 'white'}}></i>
              </div>
              <div>
                <h1 style={{fontSize: '24px', fontWeight: 800, color: 'white', margin: '0 0 4px 0', letterSpacing: '-0.5px'}}>
                  Settings
                </h1>
                <p style={{fontSize: '13px', color: 'rgba(255,255,255,0.6)', margin: 0}}>
                  Manage your account & preferences
                </p>
              </div>
            </div>
          </div>
        </div>

        <div style={{padding: '20px 16px'}}>
          <div style={{
            background: 'white',
            borderRadius: '24px',
            padding: '20px',
            marginBottom: '16px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.06)',
            border: '1px solid rgba(0,0,0,0.04)'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{display: 'flex', alignItems: 'center', gap: '14px'}}>
                <div style={{
                  width: '48px', height: '48px',
                  borderRadius: '14px',
                  background: driverStatus === 'online' ? '#dcfce7' : '#fee2e2',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <i className={`fas fa-${driverStatus === 'online' ? 'car' : 'ban'}`} style={{fontSize: '20px', color: driverStatus === 'online' ? '#16a34a' : '#dc2626'}}></i>
                </div>
                <div>
                  <div style={{fontSize: '15px', fontWeight: 700, color: '#111'}}>Driver Status</div>
                  <div style={{fontSize: '12px', color: '#888'}}>
                    {driverStatus === 'online' ? 'Accepting ride requests' : 'Currently offline'}
                  </div>
                </div>
              </div>
              <div
                onClick={handleToggleDriverStatus}
                style={{
                  width: '52px', height: '30px',
                  background: driverStatus === 'online' ? '#10b981' : '#e0e0e0',
                  borderRadius: '15px',
                  position: 'relative',
                  cursor: 'pointer',
                  transition: 'background 0.3s'
                }}
              >
                <div style={{
                  position: 'absolute',
                  top: '3px',
                  left: driverStatus === 'online' ? '25px' : '3px',
                  width: '24px', height: '24px',
                  background: 'white',
                  borderRadius: '50%',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                  transition: 'left 0.3s'
                }}></div>
              </div>
            </div>
          </div>

          <div style={{
            background: 'white',
            borderRadius: '24px',
            padding: '20px',
            marginBottom: '16px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.06)',
            border: '1px solid rgba(0,0,0,0.04)'
          }}>
            <h3 style={{
              fontSize: '14px',
              fontWeight: 700,
              color: '#888',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              margin: '0 0 16px 0'
            }}>
              <i className="fas fa-user-shield" style={{color: '#ff5e00', marginRight: '8px', fontSize: '12px'}}></i>
              Account
            </h3>
            <div style={{display: 'flex', flexDirection: 'column', gap: '4px'}}>
              {accountItems.map((item, idx) => (
                <div key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '14px 12px',
                    background: '#fafafa',
                    borderRadius: '16px',
                    cursor: 'pointer'
                  }}
                  onClick={() => navigate(item.path)}
                >
                  <div style={{display: 'flex', alignItems: 'center', gap: '14px'}}>
                    <div style={{
                      width: '40px', height: '40px',
                      borderRadius: '12px',
                      background: `${item.color}15`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      <i className={`fas ${item.icon}`} style={{color: item.color, fontSize: '16px'}}></i>
                    </div>
                    <span style={{fontSize: '14px', fontWeight: 600, color: '#333'}}>{item.label}</span>
                  </div>
                  <i className="fas fa-chevron-right" style={{color: '#ccc', fontSize: '12px'}}></i>
                </div>
              ))}
            </div>
          </div>

          <div style={{
            background: 'white',
            borderRadius: '24px',
            padding: '20px',
            marginBottom: '16px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.06)',
            border: '1px solid rgba(0,0,0,0.04)'
          }}>
            <h3 style={{
              fontSize: '14px',
              fontWeight: 700,
              color: '#888',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              margin: '0 0 16px 0'
            }}>
              <i className="fas fa-sliders" style={{color: '#ff5e00', marginRight: '8px', fontSize: '12px'}}></i>
              Preferences
            </h3>
            <div style={{display: 'flex', flexDirection: 'column', gap: '4px'}}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 12px',
                background: '#fafafa',
                borderRadius: '16px'
              }}>
                <div style={{display: 'flex', alignItems: 'center', gap: '14px'}}>
                  <div style={{
                    width: '40px', height: '40px',
                    borderRadius: '12px',
                    background: '#ff5e0015',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    <i className="fas fa-bell" style={{color: '#ff5e00', fontSize: '16px'}}></i>
                  </div>
                  <span style={{fontSize: '14px', fontWeight: 600, color: '#333'}}>Notifications</span>
                </div>
                <div
                  onClick={() => handleToggleSetting('notifications_enabled')}
                  style={{
                    width: '48px', height: '28px',
                    background: settings.notifications_enabled ? '#10b981' : '#e0e0e0',
                    borderRadius: '14px',
                    position: 'relative',
                    cursor: 'pointer',
                    transition: 'background 0.3s'
                  }}
                >
                  <div style={{
                    position: 'absolute',
                    top: '3px',
                    left: settings.notifications_enabled ? '23px' : '3px',
                    width: '22px', height: '22px',
                    background: 'white',
                    borderRadius: '50%',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
                    transition: 'left 0.3s'
                  }}></div>
                </div>
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 12px',
                background: '#fafafa',
                borderRadius: '16px'
              }}>
                <div style={{display: 'flex', alignItems: 'center', gap: '14px'}}>
                  <div style={{
                    width: '40px', height: '40px',
                    borderRadius: '12px',
                    background: '#16a34a15',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    <i className="fas fa-volume-up" style={{color: '#16a34a', fontSize: '16px'}}></i>
                  </div>
                  <span style={{fontSize: '14px', fontWeight: 600, color: '#333'}}>Sound</span>
                </div>
                <div
                  onClick={() => handleToggleSetting('sound_alerts')}
                  style={{
                    width: '48px', height: '28px',
                    background: settings.sound_alerts ? '#10b981' : '#e0e0e0',
                    borderRadius: '14px',
                    position: 'relative',
                    cursor: 'pointer',
                    transition: 'background 0.3s'
                  }}
                >
                  <div style={{
                    position: 'absolute',
                    top: '3px',
                    left: settings.sound_alerts ? '23px' : '3px',
                    width: '22px', height: '22px',
                    background: 'white',
                    borderRadius: '50%',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
                    transition: 'left 0.3s'
                  }}></div>
                </div>
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 12px',
                background: '#fafafa',
                borderRadius: '16px'
              }}>
                <div style={{display: 'flex', alignItems: 'center', gap: '14px'}}>
                  <div style={{
                    width: '40px', height: '40px',
                    borderRadius: '12px',
                    background: '#0284c715',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    <i className="fas fa-moon" style={{color: '#0284c7', fontSize: '16px'}}></i>
                  </div>
                  <span style={{fontSize: '14px', fontWeight: 600, color: '#333'}}>Dark Mode</span>
                </div>
                <div
                  onClick={() => handleToggleSetting('dark_mode')}
                  style={{
                    width: '48px', height: '28px',
                    background: settings.dark_mode ? '#10b981' : '#e0e0e0',
                    borderRadius: '14px',
                    position: 'relative',
                    cursor: 'pointer',
                    transition: 'background 0.3s'
                  }}
                >
                  <div style={{
                    position: 'absolute',
                    top: '3px',
                    left: settings.dark_mode ? '23px' : '3px',
                    width: '22px', height: '22px',
                    background: 'white',
                    borderRadius: '50%',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
                    transition: 'left 0.3s'
                  }}></div>
                </div>
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 12px',
                background: '#fafafa',
                borderRadius: '16px'
              }}>
                <div style={{display: 'flex', alignItems: 'center', gap: '14px'}}>
                  <div style={{
                    width: '40px', height: '40px',
                    borderRadius: '12px',
                    background: '#8b5cf615',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    <i className="fas fa-globe" style={{color: '#8b5cf6', fontSize: '16px'}}></i>
                  </div>
                  <span style={{fontSize: '14px', fontWeight: 600, color: '#333'}}>Language</span>
                </div>
                <span style={{fontSize: '13px', color: '#888'}}>{languageNames[settings.language] || 'English'}</span>
              </div>
            </div>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '12px',
            marginTop: '8px'
          }}>
            <button onClick={handleLogout} style={{
              padding: '14px',
              background: 'white',
              border: '1px solid #e0e0e0',
              borderRadius: '16px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              color: '#666',
              fontSize: '13px'
            }}>
              <i className="fas fa-sign-out-alt" style={{color: '#888'}}></i> Log Out
            </button>
            <button style={{
              padding: '14px',
              background: '#fee2e2',
              border: '1px solid #fecaca',
              borderRadius: '16px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              color: '#dc2626',
              fontSize: '13px'
            }}>
              <i className="fas fa-trash-alt"></i> Delete
            </button>
          </div>
        </div>

        <DriverMobileNav />
      </div>

      <div className="desktop-view">
        <DriverSidebar userName={userName} />
        <div className="desktop-main">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
            <div>
              <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.5px', color: '#111', marginBottom: 2 }}>Driver Settings</h1>
              <p style={{ fontSize: 13, color: '#9ca3af' }}>Manage your driver account and preferences</p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 20, marginBottom: 24 }}>
            <div style={{ background: 'white', borderRadius: 20, padding: 24 }}>
              <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 20 }}>Account Settings</h3>
              <Link to="/driver/profile" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', borderBottom: '1px solid #f0f0f0', textDecoration: 'none', color: '#333' }}>
                <span><i className="fas fa-user" style={{ marginRight: 12, color: '#ff5e00' }}></i> Edit Profile</span>
                <i className="fas fa-chevron-right" style={{ color: '#ccc' }}></i>
              </Link>
              <Link to="/driver_location" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', borderBottom: '1px solid #f0f0f0', textDecoration: 'none', color: '#333' }}>
                <span><i className="fas fa-map-marker-alt" style={{ marginRight: 12, color: '#ff5e00' }}></i> Update Location</span>
                <i className="fas fa-chevron-right" style={{ color: '#ccc' }}></i>
              </Link>
              <Link to="/kyc" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', borderBottom: '1px solid #f0f0f0', textDecoration: 'none', color: '#333' }}>
                <span><i className="fas fa-id-card" style={{ marginRight: 12, color: '#ff5e00' }}></i> KYC Verification</span>
                <i className="fas fa-chevron-right" style={{ color: '#ccc' }}></i>
              </Link>
              <Link to="/support" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', textDecoration: 'none', color: '#333' }}>
                <span><i className="fas fa-headset" style={{ marginRight: 12, color: '#ff5e00' }}></i> Support</span>
                <i className="fas fa-chevron-right" style={{ color: '#ccc' }}></i>
              </Link>
            </div>

            <div style={{ background: 'white', borderRadius: 20, padding: 24 }}>
              <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 20 }}>App Settings</h3>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', borderBottom: '1px solid #f0f0f0' }}>
                <span><i className="fas fa-bell" style={{ marginRight: 12, color: '#ff5e00' }}></i> Notifications</span>
                <div onClick={() => handleToggleSetting('notifications_enabled')} style={{ width: 50, height: 26, background: settings.notifications_enabled ? '#10b981' : '#e0e0e0', borderRadius: 13, border: 'none', position: 'relative', cursor: 'pointer' }}>
                  <span style={{ position: 'absolute', top: 3, left: settings.notifications_enabled ? 26 : 3, width: 20, height: 20, background: 'white', borderRadius: '50%' }}></span>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', borderBottom: '1px solid #f0f0f0' }}>
                <span><i className="fas fa-volume-up" style={{ marginRight: 12, color: '#ff5e00' }}></i> Sound</span>
                <div onClick={() => handleToggleSetting('sound_alerts')} style={{ width: 50, height: 26, background: settings.sound_alerts ? '#10b981' : '#e0e0e0', borderRadius: 13, border: 'none', position: 'relative', cursor: 'pointer' }}>
                  <span style={{ position: 'absolute', top: 3, left: settings.sound_alerts ? 26 : 3, width: 20, height: 20, background: 'white', borderRadius: '50%' }}></span>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', borderBottom: '1px solid #f0f0f0' }}>
                <span><i className="fas fa-moon" style={{ marginRight: 12, color: '#ff5e00' }}></i> Dark Mode</span>
                <div onClick={() => handleToggleSetting('dark_mode')} style={{ width: 50, height: 26, background: settings.dark_mode ? '#10b981' : '#e0e0e0', borderRadius: 13, border: 'none', position: 'relative', cursor: 'pointer' }}>
                  <span style={{ position: 'absolute', top: 3, left: settings.dark_mode ? 26 : 3, width: 20, height: 20, background: 'white', borderRadius: '50%' }}></span>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0' }}>
                <span><i className="fas fa-globe" style={{ marginRight: 12, color: '#ff5e00' }}></i> Language</span>
                <span style={{ color: '#888' }}>{languageNames[settings.language] || 'English'}</span>
              </div>
            </div>
          </div>

          <div style={{ background: 'white', borderRadius: 20, padding: 24, marginBottom: 24 }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 20 }}>Driver Status</h3>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 16, background: '#f5f5f5', borderRadius: 12 }}>
              <div>
                <span style={{ fontSize: 14, fontWeight: 600 }}>Online Status</span>
                <p style={{ fontSize: 12, color: '#888', marginTop: 4 }}>
                  {driverStatus === 'online' ? "You're currently accepting rides" : 'You are offline'}
                </p>
              </div>
              <button onClick={handleToggleDriverStatus} style={{ width: 50, height: 26, background: driverStatus === 'online' ? '#10b981' : '#e0e0e0', borderRadius: 13, border: 'none', position: 'relative', cursor: 'pointer' }}>
                <span style={{ position: 'absolute', top: 3, left: driverStatus === 'online' ? 26 : 3, width: 20, height: 20, background: 'white', borderRadius: '50%' }}></span>
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
            <button onClick={handleLogout} style={{ flex: 1, padding: 14, background: '#f5f5f5', border: '1px solid #e0e0e0', borderRadius: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, color: '#666' }}>
              <i className="fas fa-sign-out-alt"></i> Log Out
            </button>
            <button style={{ flex: 1, padding: 14, background: '#fee2e2', border: '1px solid #dc2626', borderRadius: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, color: '#dc2626' }}>
              <i className="fas fa-trash-alt"></i> Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
