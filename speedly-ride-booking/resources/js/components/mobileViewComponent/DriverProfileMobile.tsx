import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DriverSidebar from '../components/DriverSidebar';
import DriverMobileNav from '../components/DriverMobileNav';
import MobilePreloader from '../components/Preloader';
import { userAPI } from '../services/api';
import alert from '../utils/alert';

export default function DriverProfile() {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('personal');
  const [userData, setUserData] = useState(null);
  const [profileForm, setProfileForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: ''
  });
  const [vehicleForm, setVehicleForm] = useState({
    vehicle_type: 'car',
    vehicle_model: '',
    vehicle_year: '',
    license_plate: ''
  });
  const [bankForm, setBankForm] = useState({
    bank_name: '',
    account_number: '',
    account_name: ''
  });
  const [notificationCount, setNotificationCount] = useState(0);
  const [kycStatus, setKycStatus] = useState('pending');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      const profileRes = await userAPI.getProfile();
      const profile = profileRes.data?.user || profileRes.data?.profile || profileRes.data;
      
      if (profile) {
        setUserData(profile);
        setProfileForm({
          full_name: profile.full_name || profile.name || '',
          email: profile.email || '',
          phone: profile.phone || '',
          address: profile.address || '',
          city: profile.city || '',
          state: profile.state || ''
        });
        
        if (profile.driver) {
          setVehicleForm({
            vehicle_type: profile.driver.vehicle_type || 'car',
            vehicle_model: profile.driver.vehicle_model || '',
            vehicle_year: profile.driver.vehicle_year || '',
            license_plate: profile.driver.license_plate || profile.driver.vehicle_plate || ''
          });
        }
        
        if (profile.bank) {
          setBankForm({
            bank_name: profile.bank.bank_name || '',
            account_number: profile.bank.account_number || '',
            account_name: profile.bank.account_name || ''
          });
        }
        
        setKycStatus(profile.is_verified ? 'verified' : profile.kyc_status || 'pending');
      }
      
      setNotificationCount(profileRes.data?.notifications?.filter(n => !n.is_read).length || 0);
    } catch (err) {
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePersonal = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await userAPI.updateProfile(profileForm);
      alert.toast('Profile updated successfully', 'success');
      fetchProfileData();
    } catch (err) {
      console.error('Error updating profile:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateVehicle = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await userAPI.updateDriverProfile(vehicleForm);
      alert.toast('Vehicle info updated successfully', 'success');
      fetchProfileData();
    } catch (err) {
      console.error('Error updating vehicle:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateBank = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await userAPI.updateBank(bankForm);
      alert.toast('Bank details updated successfully', 'success');
      fetchProfileData();
    } catch (err) {
      console.error('Error updating bank:', err);
    } finally {
      setSaving(false);
    }
  };

  const numberStyle = { fontFamily: '"Outfit", sans-serif' };

  if (loading) {
    return <MobilePreloader />;
  }

  const userName = userData?.full_name?.split(' ')[0] || userData?.name?.split(' ')[0] || 'Driver';
  const userInitial = (profileForm.full_name || userName).charAt(0).toUpperCase();
  const kycStatusColor = kycStatus === 'verified' ? '#16a34a' : kycStatus === 'rejected' ? '#dc2626' : '#d97706';
  const kycStatusBg = kycStatus === 'verified' ? '#dcfce7' : kycStatus === 'rejected' ? '#fee2e2' : '#fef3c7';

  return (
    <div className="dashboard-container">
      {/* MOBILE VIEW */}
      <div className="mobile-view" style={{
        background: '#f5f5f7',
        minHeight: '100vh',
        paddingBottom: '90px'
      }}>
        {/* Profile Hero */}
        <div style={{
          background: 'linear-gradient(135deg, #ff5e00 0%, #ff8c3a 100%)',
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
            background: 'radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%)',
            borderRadius: '50%'
          }}></div>
          
          <div style={{position: 'relative', zIndex: 1, textAlign: 'center'}}>
            <div style={{
              width: '72px', height: '72px',
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 12px',
              fontSize: '28px', fontWeight: 700,
              color: 'white',
              border: '3px solid rgba(255,255,255,0.4)'
            }}>
              {userInitial}
            </div>
            <h1 style={{fontSize: '22px', fontWeight: 800, color: 'white', margin: '0 0 4px 0'}}>
              {profileForm.full_name || userName}
            </h1>
            <p style={{fontSize: '13px', color: 'rgba(255,255,255,0.8)', margin: '0 0 12px 0'}}>
              {userData?.email || ''}
            </p>
            <span style={{
              display: 'inline-block',
              padding: '6px 16px',
              background: kycStatusBg,
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: 600,
              color: kycStatusColor,
              textTransform: 'capitalize'
            }}>
              KYC: {kycStatus}
            </span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div style={{
          margin: '16px',
          display: 'flex',
          gap: '8px',
          background: 'white',
          padding: '6px',
          borderRadius: '16px',
          boxShadow: '0 4px 16px rgba(0,0,0,0.06)'
        }}>
          {[
            { key: 'personal', icon: 'fa-user', label: 'Personal' },
            { key: 'vehicle', icon: 'fa-car', label: 'Vehicle' },
            { key: 'bank', icon: 'fa-university', label: 'Bank' },
            { key: 'kyc', icon: 'fa-shield-alt', label: 'KYC' }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                flex: 1,
                padding: '10px 8px',
                background: activeTab === tab.key ? '#ff5e00' : 'transparent',
                border: 'none',
                borderRadius: '12px',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer',
                color: activeTab === tab.key ? 'white' : '#888',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4px',
                transition: 'all 0.3s ease'
              }}
            >
              <i className={`fas ${tab.icon}`} style={{fontSize: '14px'}}></i>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div style={{padding: '0 16px'}}>
          {/* Personal Tab */}
          {activeTab === 'personal' && (
            <div style={{
              background: 'white',
              borderRadius: '24px',
              padding: '20px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.06)',
              border: '1px solid rgba(0,0,0,0.04)'
            }}>
              <h3 style={{fontSize: '16px', fontWeight: 700, color: '#111', margin: '0 0 20px 0'}}>
                <i className="fas fa-user" style={{color: '#ff5e00', marginRight: '8px'}}></i>
                Personal Information
              </h3>
              <form onSubmit={handleUpdatePersonal}>
                <div style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
                  <div>
                    <label style={{fontSize: '12px', fontWeight: 600, color: '#666', marginBottom: '8px', display: 'block'}}>Full Name</label>
                    <input
                      type="text"
                      value={profileForm.full_name}
                      onChange={(e) => setProfileForm({...profileForm, full_name: e.target.value})}
                      style={{
                        width: '100%', padding: '14px 16px',
                        border: '1px solid #e8e8e8', borderRadius: '14px',
                        fontSize: '14px', outline: 'none',
                        background: '#fafafa'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{fontSize: '12px', fontWeight: 600, color: '#666', marginBottom: '8px', display: 'block'}}>Email</label>
                    <input
                      type="email"
                      value={profileForm.email}
                      disabled
                      style={{
                        width: '100%', padding: '14px 16px',
                        border: '1px solid #e8e8e8', borderRadius: '14px',
                        fontSize: '14px', outline: 'none',
                        background: '#f0f0f0', color: '#999'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{fontSize: '12px', fontWeight: 600, color: '#666', marginBottom: '8px', display: 'block'}}>Phone</label>
                    <input
                      type="tel"
                      value={profileForm.phone}
                      onChange={(e) => setProfileForm({...profileForm, phone: e.target.value})}
                      style={{
                        width: '100%', padding: '14px 16px',
                        border: '1px solid #e8e8e8', borderRadius: '14px',
                        fontSize: '14px', outline: 'none',
                        background: '#fafafa'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{fontSize: '12px', fontWeight: 600, color: '#666', marginBottom: '8px', display: 'block'}}>Address</label>
                    <input
                      type="text"
                      value={profileForm.address}
                      onChange={(e) => setProfileForm({...profileForm, address: e.target.value})}
                      style={{
                        width: '100%', padding: '14px 16px',
                        border: '1px solid #e8e8e8', borderRadius: '14px',
                        fontSize: '14px', outline: 'none',
                        background: '#fafafa'
                      }}
                    />
                  </div>
                  <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px'}}>
                    <div>
                      <label style={{fontSize: '12px', fontWeight: 600, color: '#666', marginBottom: '8px', display: 'block'}}>City</label>
                      <input
                        type="text"
                        value={profileForm.city}
                        onChange={(e) => setProfileForm({...profileForm, city: e.target.value})}
                        style={{
                          width: '100%', padding: '14px 16px',
                          border: '1px solid #e8e8e8', borderRadius: '14px',
                          fontSize: '14px', outline: 'none',
                          background: '#fafafa'
                        }}
                      />
                    </div>
                    <div>
                      <label style={{fontSize: '12px', fontWeight: 600, color: '#666', marginBottom: '8px', display: 'block'}}>State</label>
                      <input
                        type="text"
                        value={profileForm.state}
                        onChange={(e) => setProfileForm({...profileForm, state: e.target.value})}
                        style={{
                          width: '100%', padding: '14px 16px',
                          border: '1px solid #e8e8e8', borderRadius: '14px',
                          fontSize: '14px', outline: 'none',
                          background: '#fafafa'
                        }}
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={saving}
                    style={{
                      width: '100%',
                      padding: '16px',
                      background: 'linear-gradient(135deg, #ff5e00 0%, #ff8c3a 100%)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '14px',
                      fontSize: '15px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      marginTop: '8px'
                    }}
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Vehicle Tab */}
          {activeTab === 'vehicle' && (
            <div style={{
              background: 'white',
              borderRadius: '24px',
              padding: '20px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.06)',
              border: '1px solid rgba(0,0,0,0.04)'
            }}>
              <h3 style={{fontSize: '16px', fontWeight: 700, color: '#111', margin: '0 0 20px 0'}}>
                <i className="fas fa-car" style={{color: '#ff5e00', marginRight: '8px'}}></i>
                Vehicle Information
              </h3>
              <form onSubmit={handleUpdateVehicle}>
                <div style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
                  <div>
                    <label style={{fontSize: '12px', fontWeight: 600, color: '#666', marginBottom: '8px', display: 'block'}}>Vehicle Type</label>
                    <select
                      value={vehicleForm.vehicle_type}
                      onChange={(e) => setVehicleForm({...vehicleForm, vehicle_type: e.target.value})}
                      style={{
                        width: '100%', padding: '14px 16px',
                        border: '1px solid #e8e8e8', borderRadius: '14px',
                        fontSize: '14px', outline: 'none',
                        background: '#fafafa'
                      }}
                    >
                      <option value="car">Car</option>
                      <option value="motorcycle">Motorcycle</option>
                      <option value="truck">Truck</option>
                    </select>
                  </div>
                  <div>
                    <label style={{fontSize: '12px', fontWeight: 600, color: '#666', marginBottom: '8px', display: 'block'}}>Vehicle Model</label>
                    <input
                      type="text"
                      value={vehicleForm.vehicle_model}
                      onChange={(e) => setVehicleForm({...vehicleForm, vehicle_model: e.target.value})}
                      style={{
                        width: '100%', padding: '14px 16px',
                        border: '1px solid #e8e8e8', borderRadius: '14px',
                        fontSize: '14px', outline: 'none',
                        background: '#fafafa'
                      }}
                    />
                  </div>
                  <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px'}}>
                    <div>
                      <label style={{fontSize: '12px', fontWeight: 600, color: '#666', marginBottom: '8px', display: 'block'}}>Year</label>
                      <input
                        type="text"
                        value={vehicleForm.vehicle_year}
                        onChange={(e) => setVehicleForm({...vehicleForm, vehicle_year: e.target.value})}
                        style={{
                          width: '100%', padding: '14px 16px',
                          border: '1px solid #e8e8e8', borderRadius: '14px',
                          fontSize: '14px', outline: 'none',
                          background: '#fafafa'
                        }}
                      />
                    </div>
                    <div>
                      <label style={{fontSize: '12px', fontWeight: 600, color: '#666', marginBottom: '8px', display: 'block'}}>License Plate</label>
                      <input
                        type="text"
                        value={vehicleForm.license_plate}
                        onChange={(e) => setVehicleForm({...vehicleForm, license_plate: e.target.value})}
                        style={{
                          width: '100%', padding: '14px 16px',
                          border: '1px solid #e8e8e8', borderRadius: '14px',
                          fontSize: '14px', outline: 'none',
                          background: '#fafafa'
                        }}
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={saving}
                    style={{
                      width: '100%',
                      padding: '16px',
                      background: 'linear-gradient(135deg, #ff5e00 0%, #ff8c3a 100%)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '14px',
                      fontSize: '15px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      marginTop: '8px'
                    }}
                  >
                    {saving ? 'Saving...' : 'Save Vehicle'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Bank Tab */}
          {activeTab === 'bank' && (
            <div style={{
              background: 'white',
              borderRadius: '24px',
              padding: '20px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.06)',
              border: '1px solid rgba(0,0,0,0.04)'
            }}>
              <h3 style={{fontSize: '16px', fontWeight: 700, color: '#111', margin: '0 0 20px 0'}}>
                <i className="fas fa-university" style={{color: '#ff5e00', marginRight: '8px'}}></i>
                Bank Details
              </h3>
              <form onSubmit={handleUpdateBank}>
                <div style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
                  <div>
                    <label style={{fontSize: '12px', fontWeight: 600, color: '#666', marginBottom: '8px', display: 'block'}}>Bank Name</label>
                    <input
                      type="text"
                      value={bankForm.bank_name}
                      onChange={(e) => setBankForm({...bankForm, bank_name: e.target.value})}
                      placeholder="Enter bank name"
                      style={{
                        width: '100%', padding: '14px 16px',
                        border: '1px solid #e8e8e8', borderRadius: '14px',
                        fontSize: '14px', outline: 'none',
                        background: '#fafafa'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{fontSize: '12px', fontWeight: 600, color: '#666', marginBottom: '8px', display: 'block'}}>Account Number</label>
                    <input
                      type="text"
                      value={bankForm.account_number}
                      onChange={(e) => setBankForm({...bankForm, account_number: e.target.value})}
                      placeholder="10-digit account number"
                      maxLength="10"
                      style={{
                        width: '100%', padding: '14px 16px',
                        border: '1px solid #e8e8e8', borderRadius: '14px',
                        fontSize: '14px', outline: 'none',
                        background: '#fafafa'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{fontSize: '12px', fontWeight: 600, color: '#666', marginBottom: '8px', display: 'block'}}>Account Name</label>
                    <input
                      type="text"
                      value={bankForm.account_name}
                      onChange={(e) => setBankForm({...bankForm, account_name: e.target.value})}
                      placeholder="Account holder name"
                      style={{
                        width: '100%', padding: '14px 16px',
                        border: '1px solid #e8e8e8', borderRadius: '14px',
                        fontSize: '14px', outline: 'none',
                        background: '#fafafa'
                      }}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={saving}
                    style={{
                      width: '100%',
                      padding: '16px',
                      background: 'linear-gradient(135deg, #ff5e00 0%, #ff8c3a 100%)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '14px',
                      fontSize: '15px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      marginTop: '8px'
                    }}
                  >
                    {saving ? 'Saving...' : 'Save Bank Details'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* KYC Tab */}
          {activeTab === 'kyc' && (
            <div style={{
              background: 'white',
              borderRadius: '24px',
              padding: '20px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.06)',
              border: '1px solid rgba(0,0,0,0.04)'
            }}>
              <h3 style={{fontSize: '16px', fontWeight: 700, color: '#111', margin: '0 0 20px 0'}}>
                <i className="fas fa-shield-alt" style={{color: '#ff5e00', marginRight: '8px'}}></i>
                KYC Verification
              </h3>
              <div style={{
                textAlign: 'center',
                padding: '24px 16px'
              }}>
                <div style={{
                  width: '64px', height: '64px',
                  borderRadius: '50%',
                  background: kycStatusBg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 16px'
                }}>
                  <i className={`fas ${kycStatus === 'verified' ? 'fa-check' : kycStatus === 'rejected' ? 'fa-times' : 'fa-clock'}`} style={{fontSize: '28px', color: kycStatusColor}}></i>
                </div>
                <h4 style={{fontSize: '18px', fontWeight: 700, color: '#111', margin: '0 0 8px 0', textTransform: 'capitalize'}}>
                  {kycStatus === 'verified' ? 'KYC Verified' : kycStatus === 'rejected' ? 'KYC Rejected' : 'KYC Pending'}
                </h4>
                <p style={{fontSize: '14px', color: '#666', margin: 0}}>
                  {kycStatus === 'verified'
                    ? 'Your identity has been verified successfully'
                    : kycStatus === 'rejected'
                      ? 'Please resubmit your documents'
                      : 'Your documents are under review'}
                </p>
              </div>
              <div style={{
                borderTop: '1px solid #f0f0f0',
                paddingTop: '20px',
                marginTop: '20px'
              }}>
                <Link to="/kyc" style={{
                  display: 'block',
                  width: '100%',
                  padding: '14px',
                  background: 'linear-gradient(135deg, #ff5e00 0%, #ff8c3a 100%)',
                  color: 'white',
                  textAlign: 'center',
                  borderRadius: '14px',
                  fontSize: '14px',
                  fontWeight: 600,
                  textDecoration: 'none'
                }}>
                  {kycStatus === 'verified' ? 'View Documents' : 'Submit Documents'}
                </Link>
              </div>
            </div>
          )}
        </div>

        <DriverMobileNav />
      </div>

      {/* DESKTOP VIEW */}
      <div className="desktop-view">
        <DriverSidebar userName={userName} />
        <div className="desktop-main">
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px'}}>
            <div>
              <h1 style={{fontSize: '26px', fontWeight: '800', letterSpacing: '-0.5px', color: '#111', marginBottom: '2px'}}>Driver Profile</h1>
              <p style={{fontSize: '13px', color: '#9ca3af'}}>Manage your personal information</p>
            </div>
          </div>

          <div style={{background: 'linear-gradient(135deg, #ff5e00 0%, #ff8c3a 100%)', borderRadius: '16px', padding: '28px', boxShadow: '0 8px 32px rgba(255,94,0,0.25)', color: 'white', marginBottom: '24px'}}>
            <div style={{display: 'flex', alignItems: 'center', gap: '20px'}}>
              <div style={{width: '72px', height: '72px', background: 'rgba(255,255,255,0.2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', fontWeight: '700'}}>
                {userInitial}
              </div>
              <div>
                <h2 style={{fontSize: '22px', fontWeight: '700', margin: 0}}>{profileForm.full_name}</h2>
                <p style={{fontSize: '14px', opacity: 0.9, margin: '4px 0 0 0'}}>Driver</p>
                <span style={{display: 'inline-block', marginTop: '10px', padding: '6px 14px', background: kycStatusBg, borderRadius: '999px', fontSize: '13px', textTransform: 'capitalize', color: kycStatusColor}}>
                  KYC: {kycStatus}
                </span>
              </div>
            </div>
          </div>

          <div style={{display: 'flex', gap: '4px', background: '#e8e8e8', padding: '4px', borderRadius: '12px', marginBottom: '24px', width: 'fit-content'}}>
            {['personal', 'vehicle', 'bank', 'kyc'].map(tab => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{ 
                  padding: '12px 24px', 
                  fontWeight: '600', 
                  border: 'none', 
                  background: activeTab === tab ? 'white' : 'transparent', 
                  cursor: 'pointer', 
                  color: activeTab === tab ? '#ff5e00' : '#666',
                  borderRadius: '10px',
                  fontSize: '14px'
                }}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {activeTab === 'personal' && (
            <div style={{background: 'white', borderRadius: '16px', padding: '28px', border: '1.5px solid #f0f0f0', boxShadow: '0 4px 20px rgba(0,0,0,0.06)'}}>
              <form onSubmit={handleUpdatePersonal}>
                <div style={{display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px', marginBottom: '20px'}}>
                  <div>
                    <label style={{display: 'block', fontSize: '12px', fontWeight: '600', color: '#666', marginBottom: '8px'}}>Full Name</label>
                    <input 
                      type="text" 
                      value={profileForm.full_name} 
                      onChange={(e) => setProfileForm({...profileForm, full_name: e.target.value})}
                      style={{width: '100%', padding: '14px 16px', border: '1px solid #e8e8e8', borderRadius: '10px', fontSize: '14px', outline: 'none'}} 
                    />
                  </div>
                  <div>
                    <label style={{display: 'block', fontSize: '12px', fontWeight: '600', color: '#666', marginBottom: '8px'}}>Phone</label>
                    <input 
                      type="tel" 
                      value={profileForm.phone} 
                      onChange={(e) => setProfileForm({...profileForm, phone: e.target.value})}
                      style={{width: '100%', padding: '14px 16px', border: '1px solid #e8e8e8', borderRadius: '10px', fontSize: '14px', outline: 'none'}} 
                    />
                  </div>
                </div>
                <div style={{marginBottom: '20px'}}>
                  <label style={{display: 'block', fontSize: '12px', fontWeight: '600', color: '#666', marginBottom: '8px'}}>Email</label>
                  <input 
                    type="email" 
                    value={profileForm.email} 
                    disabled
                    style={{width: '100%', padding: '14px 16px', border: '1px solid #e8e8e8', borderRadius: '10px', fontSize: '14px', background: '#f5f5f5', color: '#999'}} 
                  />
                </div>
                <div style={{marginBottom: '20px'}}>
                  <label style={{display: 'block', fontSize: '12px', fontWeight: '600', color: '#666', marginBottom: '8px'}}>Address</label>
                  <input 
                    type="text" 
                    value={profileForm.address} 
                    onChange={(e) => setProfileForm({...profileForm, address: e.target.value})}
                    style={{width: '100%', padding: '14px 16px', border: '1px solid #e8e8e8', borderRadius: '10px', fontSize: '14px', outline: 'none'}} 
                  />
                </div>
                <div style={{display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px', marginBottom: '24px'}}>
                  <div>
                    <label style={{display: 'block', fontSize: '12px', fontWeight: '600', color: '#666', marginBottom: '8px'}}>City</label>
                    <input 
                      type="text" 
                      value={profileForm.city} 
                      onChange={(e) => setProfileForm({...profileForm, city: e.target.value})}
                      style={{width: '100%', padding: '14px 16px', border: '1px solid #e8e8e8', borderRadius: '10px', fontSize: '14px', outline: 'none'}} 
                    />
                  </div>
                  <div>
                    <label style={{display: 'block', fontSize: '12px', fontWeight: '600', color: '#666', marginBottom: '8px'}}>State</label>
                    <input 
                      type="text" 
                      value={profileForm.state} 
                      onChange={(e) => setProfileForm({...profileForm, state: e.target.value})}
                      style={{width: '100%', padding: '14px 16px', border: '1px solid #e8e8e8', borderRadius: '10px', fontSize: '14px', outline: 'none'}} 
                    />
                  </div>
                </div>
                <button 
                  type="submit" 
                  disabled={saving}
                  style={{
                    width: '100%',
                    padding: '16px',
                    background: 'linear-gradient(135deg, #ff5e00 0%, #ff8c3a 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    fontSize: '15px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </form>
            </div>
          )}

          {activeTab === 'vehicle' && (
            <div style={{background: 'white', borderRadius: '16px', padding: '28px', border: '1.5px solid #f0f0f0', boxShadow: '0 4px 20px rgba(0,0,0,0.06)'}}>
              <form onSubmit={handleUpdateVehicle}>
                <div style={{marginBottom: '20px'}}>
                  <label style={{display: 'block', fontSize: '12px', fontWeight: '600', color: '#666', marginBottom: '8px'}}>Vehicle Type</label>
                  <select 
                    value={vehicleForm.vehicle_type} 
                    onChange={(e) => setVehicleForm({...vehicleForm, vehicle_type: e.target.value})}
                    style={{width: '100%', padding: '14px 16px', border: '1px solid #e8e8e8', borderRadius: '10px', fontSize: '14px', background: '#fafafa', cursor: 'pointer', outline: 'none'}}
                  >
                    <option value="car">Car</option>
                    <option value="motorcycle">Motorcycle</option>
                    <option value="truck">Truck</option>
                  </select>
                </div>
                <div style={{marginBottom: '20px'}}>
                  <label style={{display: 'block', fontSize: '12px', fontWeight: '600', color: '#666', marginBottom: '8px'}}>Vehicle Model</label>
                  <input 
                    type="text" 
                    value={vehicleForm.vehicle_model} 
                    onChange={(e) => setVehicleForm({...vehicleForm, vehicle_model: e.target.value})}
                    style={{width: '100%', padding: '14px 16px', border: '1px solid #e8e8e8', borderRadius: '10px', fontSize: '14px', outline: 'none'}} 
                  />
                </div>
                <div style={{display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px', marginBottom: '24px'}}>
                  <div>
                    <label style={{display: 'block', fontSize: '12px', fontWeight: '600', color: '#666', marginBottom: '8px'}}>Year</label>
                    <input 
                      type="text" 
                      value={vehicleForm.vehicle_year} 
                      onChange={(e) => setVehicleForm({...vehicleForm, vehicle_year: e.target.value})}
                      style={{width: '100%', padding: '14px 16px', border: '1px solid #e8e8e8', borderRadius: '10px', fontSize: '14px', outline: 'none'}} 
                    />
                  </div>
                  <div>
                    <label style={{display: 'block', fontSize: '12px', fontWeight: '600', color: '#666', marginBottom: '8px'}}>License Plate</label>
                    <input 
                      type="text" 
                      value={vehicleForm.license_plate} 
                      onChange={(e) => setVehicleForm({...vehicleForm, license_plate: e.target.value})}
                      style={{width: '100%', padding: '14px 16px', border: '1px solid #e8e8e8', borderRadius: '10px', fontSize: '14px', outline: 'none'}} 
                    />
                  </div>
                </div>
                <button 
                  type="submit" 
                  disabled={saving}
                  style={{
                    width: '100%',
                    padding: '16px',
                    background: 'linear-gradient(135deg, #ff5e00 0%, #ff8c3a 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    fontSize: '15px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  {saving ? 'Saving...' : 'Save Vehicle'}
                </button>
              </form>
            </div>
          )}

          {activeTab === 'bank' && (
            <div style={{background: 'white', borderRadius: '16px', padding: '28px', border: '1.5px solid #f0f0f0', boxShadow: '0 4px 20px rgba(0,0,0,0.06)'}}>
              <form onSubmit={handleUpdateBank}>
                <div style={{marginBottom: '20px'}}>
                  <label style={{display: 'block', fontSize: '12px', fontWeight: '600', color: '#666', marginBottom: '8px'}}>Bank Name</label>
                  <input 
                    type="text" 
                    value={bankForm.bank_name} 
                    onChange={(e) => setBankForm({...bankForm, bank_name: e.target.value})}
                    placeholder="Enter bank name"
                    style={{width: '100%', padding: '14px 16px', border: '1px solid #e8e8e8', borderRadius: '10px', fontSize: '14px', outline: 'none'}} 
                  />
                </div>
                <div style={{marginBottom: '20px'}}>
                  <label style={{display: 'block', fontSize: '12px', fontWeight: '600', color: '#666', marginBottom: '8px'}}>Account Number</label>
                  <input 
                    type="text" 
                    value={bankForm.account_number} 
                    onChange={(e) => setBankForm({...bankForm, account_number: e.target.value})}
                    placeholder="10-digit account number"
                    maxLength="10"
                    style={{width: '100%', padding: '14px 16px', border: '1px solid #e8e8e8', borderRadius: '10px', fontSize: '14px', outline: 'none'}} 
                  />
                </div>
                <div style={{marginBottom: '24px'}}>
                  <label style={{display: 'block', fontSize: '12px', fontWeight: '600', color: '#666', marginBottom: '8px'}}>Account Name</label>
                  <input 
                    type="text" 
                    value={bankForm.account_name} 
                    onChange={(e) => setBankForm({...bankForm, account_name: e.target.value})}
                    placeholder="Account holder name"
                    style={{width: '100%', padding: '14px 16px', border: '1px solid #e8e8e8', borderRadius: '10px', fontSize: '14px', outline: 'none'}} 
                  />
                </div>
                <button 
                  type="submit" 
                  disabled={saving}
                  style={{
                    width: '100%',
                    padding: '16px',
                    background: 'linear-gradient(135deg, #ff5e00 0%, #ff8c3a 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    fontSize: '15px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  {saving ? 'Saving...' : 'Save Bank Details'}
                </button>
              </form>
            </div>
          )}

          {activeTab === 'kyc' && (
            <div style={{background: 'white', borderRadius: '16px', padding: '28px', border: '1.5px solid #f0f0f0', boxShadow: '0 4px 20px rgba(0,0,0,0.06)'}}>
              <div style={{textAlign: 'center', padding: '20px 0'}}>
                <div style={{width: '64px', height: '64px', background: kycStatusBg, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px'}}>
                  <i className={`fas ${kycStatus === 'verified' ? 'fa-check' : kycStatus === 'rejected' ? 'fa-times' : 'fa-clock'}`} style={{fontSize: '28px', color: kycStatusColor}}></i>
                </div>
                <h3 style={{fontSize: '18px', fontWeight: '700', color: '#111', margin: '0 0 6px 0', textTransform: 'capitalize'}}>
                  {kycStatus === 'verified' ? 'KYC Verified' : kycStatus === 'rejected' ? 'KYC Rejected' : 'KYC Pending'}
                </h3>
                <p style={{fontSize: '14px', color: '#666', margin: 0}}>
                  {kycStatus === 'verified'
                    ? 'Your identity has been verified successfully'
                    : kycStatus === 'rejected'
                      ? 'Please resubmit your documents'
                      : 'Your documents are under review'}
                </p>
              </div>
              <div style={{borderTop: '1px solid #f0f0f0', paddingTop: '20px', marginTop: '20px'}}>
                <Link to="/kyc" style={{
                  display: 'block',
                  width: '100%',
                  padding: '14px',
                  background: 'linear-gradient(135deg, #ff5e00 0%, #ff8c3a 100%)',
                  color: 'white',
                  textAlign: 'center',
                  borderRadius: '12px',
                  fontSize: '14px',
                  fontWeight: '600',
                  textDecoration: 'none'
                }}>
                  {kycStatus === 'verified' ? 'View Documents' : 'Submit Documents'}
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
