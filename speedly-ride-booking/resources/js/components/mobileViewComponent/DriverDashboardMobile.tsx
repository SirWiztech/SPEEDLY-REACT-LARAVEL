import { useState, useEffect } from 'react';
import { router, usePage, Link } from '@inertiajs/react';
import DriverSidebarDesktop from '@/components/navbars/DriverSidebarDesktop';
import DriverNavMobile from '@/components/navbars/DriverNavMobile';
import MobilePreloader from '@/components/preloader/MobilePreloader';

interface Ride {
  id?: number;
  status?: string;
  total_fare?: string;
  estimated_fare?: string;
  pickup_address?: string;
  destination_address?: string;
  distance?: number;
  created_at?: string;
  completed_at?: string;
}

interface UserData {
  id?: number;
  full_name?: string;
  fullname?: string;
  name?: string;
  email?: string;
  phone?: string;
  avatar?: string;
  profile_picture?: string;
  driver_status?: string;
  is_verified?: boolean;
  avg_rating?: number;
  total_reviews?: number;
  balance?: number;
  notifications?: Array<{ is_read: boolean }>;
}

interface PageProps extends Record<string, unknown> {
    auth: {
        user?: UserData;
    };
}

export default function DriverDashboard() {
  const { props } = usePage<PageProps>();
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [availableBalance, setAvailableBalance] = useState(0);
  const [todayEarnings, setTodayEarnings] = useState(0);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [completedRides, setCompletedRides] = useState(0);
  const [todayRides, setTodayRides] = useState(0);
  const [driverStatus, setDriverStatus] = useState('offline');
  const [verificationStatus, setVerificationStatus] = useState('pending');
  const [activeRide, setActiveRide] = useState<Ride | null>(null);
  const [pendingRides, setPendingRides] = useState<Ride[]>([]);
  const [avgRating, setAvgRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [notificationCount, setNotificationCount] = useState(0);

  useEffect(() => {
    fetchDriverData();
  }, []);

  const fetchDriverData = async () => {
    try {
      const authUser = (props as unknown as { auth?: { user?: UserData } }).auth?.user;
      
      if (authUser) {
        setUserData(authUser);
        setAvailableBalance(authUser.balance || 0);
        setDriverStatus(authUser.driver_status || 'offline');
        setVerificationStatus(authUser.is_verified ? 'verified' : 'pending');
        setAvgRating(authUser.avg_rating || 0);
        setTotalReviews(authUser.total_reviews || 0);
        
        const unreadNotifications = authUser.notifications?.filter(n => !n.is_read) || [];
        setNotificationCount(unreadNotifications.length);
      }

      const mockRides: Ride[] = [
        { id: 1, status: 'completed', total_fare: '5000', created_at: new Date().toISOString() },
        { id: 2, status: 'completed', total_fare: '3500', created_at: new Date().toISOString() },
        { id: 3, status: 'pending', total_fare: '7000', pickup_address: '123 Main St', destination_address: '456 Oak Ave', distance: 5 },
      ];

      const today = new Date().toDateString();
      const todayRidesList = mockRides.filter(r => {
        const rideDate = new Date(r.created_at || r.completed_at || '').toDateString();
        return rideDate === today && r.status === 'completed';
      });
      
      setTodayEarnings(todayRidesList.reduce((sum, r) => sum + (parseFloat(r.total_fare || '0') || 0), 0));
      setTotalEarnings(mockRides.filter(r => r.status === 'completed').reduce((sum, r) => sum + (parseFloat(r.total_fare || '0') || 0), 0));
      setCompletedRides(mockRides.filter(r => r.status === 'completed').length);
      setTodayRides(todayRidesList.length);
      setActiveRide(mockRides.find(r => r.status === 'accepted') || null);
      setPendingRides(mockRides.filter(r => r.status === 'pending').slice(0, 10));
    } catch (err) {
      console.error('Error fetching driver data:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleDriverStatus = async () => {
    const newStatus = driverStatus === 'online' ? 'offline' : 'online';
    setDriverStatus(newStatus);
  };

  const numberStyle = { fontFamily: "'Outfit', sans-serif" };

  if (loading) {
    return <MobilePreloader />;
  }

  const userName = userData?.full_name?.split(' ')[0] || userData?.fullname?.split(' ')[0] || 'Driver';
  const userAvatar = userData?.avatar || userData?.profile_picture || null;

  return (
    <div className="dashboard-container">
      {/* MOBILE VIEW */}
      <div className="mobile-view" style={{paddingBottom: '80px'}}>
        {/* Hero Header with Premium Orange Gradient */}
        <div style={{
          background: 'linear-gradient(135deg, #ff5e00 0%, #ff7a1a 40%, #ff8c3a 70%, #ffaa5c 100%)',
          padding: '48px 20px 36px',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Decorative Elements */}
          <div style={{
            position: 'absolute',
            top: '-30%',
            right: '-15%',
            width: '250px',
            height: '250px',
            background: 'radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%)',
            borderRadius: '50%'
          }}></div>
          <div style={{
            position: 'absolute',
            bottom: '-20%',
            left: '-10%',
            width: '150px',
            height: '150px',
            background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
            borderRadius: '50%'
          }}></div>
          
          <div style={{position: 'relative', zIndex: 1}}>
            {/* Top Row: Greeting + Avatar */}
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px'}}>
              <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  background: 'rgba(255,255,255,0.2)',
                  backdropFilter: 'blur(10px)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '24px',
                  border: '1px solid rgba(255,255,255,0.3)'
                }}>
                  👋
                </div>
                <div>
                  <div style={{color: 'rgba(255,255,255,0.85)', fontSize: '13px', fontWeight: 500, letterSpacing: '0.5px'}}>WELCOME BACK,</div>
                  <h1 style={{fontSize: '26px', fontWeight: 800, color: 'white', margin: 0, letterSpacing: '-0.5px', lineHeight: 1.2}}>{userName}!</h1>
                </div>
              </div>
              <div 
                onClick={() => router.visit('/driver_settings')}
                style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '16px',
                  background: 'rgba(255,255,255,0.2)',
                  backdropFilter: 'blur(10px)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '22px',
                  border: '2px solid rgba(255,255,255,0.3)',
                  cursor: 'pointer',
                  overflow: 'hidden'
                }}
              >
                {userAvatar ? (
                  <img src={userAvatar} alt={userName} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
                ) : (
                  <span style={{fontWeight: 700, fontSize: '20px'}}>{userName.charAt(0).toUpperCase()}</span>
                )}
              </div>
            </div>

            {/* Driver Status Badge */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 18px',
              background: driverStatus === 'online' 
                ? 'rgba(34,197,94,0.25)' 
                : 'rgba(255,255,255,0.2)',
              borderRadius: '24px',
              marginBottom: '24px',
              border: `1px solid ${
                driverStatus === 'online' 
                  ? 'rgba(34,197,94,0.4)' 
                  : 'rgba(255,255,255,0.3)'
              }`
            }}>
              <div style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                background: driverStatus === 'online' ? '#22c55e' : '#fbbf24',
                boxShadow: driverStatus === 'online' ? '0 0 12px rgba(34,197,94,0.6)' : 'none',
                animation: driverStatus === 'online' ? 'pulse 2s infinite' : 'none'
              }}></div>
              <span style={{color: 'white', fontSize: '13px', fontWeight: 600, letterSpacing: '0.3px'}}>
                {driverStatus === 'online' ? 'Online • Accepting Rides' : 'Offline • Tap to Go Online'}
              </span>
            </div>

            {/* Available Balance Card - Premium Glass Effect */}
            <div style={{
              background: 'rgba(255,255,255,0.18)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              borderRadius: '24px',
              padding: '28px',
              border: '1px solid rgba(255,255,255,0.25)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
            }}>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px'}}>
                <div>
                  <div style={{
                    color: 'rgba(255,255,255,0.75)', 
                    fontSize: '11px', 
                    fontWeight: 600, 
                    letterSpacing: '1.5px',
                    textTransform: 'uppercase',
                    marginBottom: '8px'
                  }}>
                    Available Balance
                  </div>
                  <div style={{
                    fontSize: '36px', 
                    fontWeight: 800, 
                    color: 'white', 
                    ...numberStyle,
                    letterSpacing: '-1px',
                    lineHeight: 1.1
                  }}>
                    ₦{availableBalance.toLocaleString()}
                  </div>
                </div>
                <button
                  onClick={() => router.visit('/driver_wallet')}
                  style={{
                    padding: '12px 20px',
                    background: 'rgba(255,255,255,0.25)',
                    border: '1px solid rgba(255,255,255,0.35)',
                    borderRadius: '14px',
                    color: 'white',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    letterSpacing: '0.3px',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.35)';
                    (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.25)';
                    (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)';
                  }}
                >
                  <i className="fas fa-arrow-up" style={{fontSize: '11px'}}></i>
                  Withdraw
                </button>
              </div>
              
              <div style={{
                fontSize: '14px', 
                color: 'rgba(255,255,255,0.8)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <i className="fas fa-chart-line" style={{fontSize: '12px'}}></i>
                <span style={{fontWeight: 500}}>₦{todayEarnings.toLocaleString()} earned today</span>
              </div>
            </div>
          </div>
        </div>

        <div style={{padding: '20px', marginTop: '-10px', position: 'relative', zIndex: 2}}>
          {/* Stats Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '12px',
            marginBottom: '20px'
          }}>
            {[
              { label: "Today's Earnings", value: todayEarnings, icon: 'fa-naira-sign', color: '#16a34a' },
              { label: "Today's Rides", value: todayRides, icon: 'fa-car', color: '#0284c7' },
              { label: 'Rating', value: `${avgRating.toFixed(1)} (${totalReviews})`, icon: 'fa-star', color: '#d97706' },
              { label: 'Total Rides', value: completedRides, icon: 'fa-check-circle', color: '#9333ea' }
            ].map((stat, idx) => (
              <div key={idx} style={{
                background: 'white',
                borderRadius: '16px',
                padding: '18px 16px',
                boxShadow: '0 4px 20px rgba(255,94,0,0.15)',
                border: '1px solid rgba(255,94,0,0.1)'
              }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: `${stat.color}15`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '12px'
                }}>
                  <i className={`fas ${stat.icon}`} style={{color: stat.color, fontSize: '14px'}}></i>
                </div>
                <div style={{fontSize: '18px', fontWeight: 700, color: '#111', marginBottom: '4px', ...numberStyle}}>
                  {typeof stat.value === 'string' ? stat.value : `₦${stat.value.toLocaleString()}`}
                </div>
                <div style={{fontSize: '11px', color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px'}}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>

          {/* Status Toggle */}
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '20px',
            boxShadow: '0 4px 20px rgba(255,94,0,0.15)',
            border: '1px solid rgba(255,94,0,0.1)',
            marginBottom: '20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <div style={{fontSize: '14px', fontWeight: 600, color: '#111', marginBottom: '4px'}}>Driver Status</div>
              <div style={{fontSize: '12px', color: '#888'}}>
                {driverStatus === 'online' ? 'You are accepting ride requests' : 'Go online to start earning'}
              </div>
            </div>
            <button
              onClick={toggleDriverStatus}
              style={{
                padding: '10px 24px',
                background: driverStatus === 'online' 
                  ? 'linear-gradient(135deg, #ff5e00 0%, #ff8c3a 100%)' 
                  : 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
                border: 'none',
                borderRadius: '12px',
                color: 'white',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <i className={`fas fa-${driverStatus === 'online' ? 'pause' : 'play'}`}></i>
              {driverStatus === 'online' ? 'Go Offline' : 'Go Online'}
            </button>
          </div>

          {/* Pending Ride Requests */}
          {pendingRides.length > 0 && (
            <div style={{
              background: 'white',
              borderRadius: '16px',
              padding: '20px',
              boxShadow: '0 4px 20px rgba(255,94,0,0.15)',
              border: '1px solid rgba(255,94,0,0.1)',
              marginBottom: '20px'
            }}>
              <h3 style={{fontSize: '16px', fontWeight: 600, color: '#111', margin: '0 0 16px 0'}}>
                <i className="fas fa-bell" style={{color: '#ff5e00', marginRight: '8px'}}></i>
                Ride Requests ({pendingRides.length})
              </h3>
              {pendingRides.map((ride) => (
                <div key={ride.id} style={{
                  padding: '16px',
                  background: '#f8f8f8',
                  borderRadius: '12px',
                  marginBottom: '12px',
                  border: '1px solid #f0f0f0'
                }}>
                  <div style={{marginBottom: '12px'}}>
                    <div style={{display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px'}}>
                      <i className="fas fa-circle" style={{color: '#22c55e', fontSize: '8px'}}></i>
                      <span style={{fontSize: '13px', color: '#333'}}>{ride.pickup_address}</span>
                    </div>
                    <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                      <i className="fas fa-map-marker-alt" style={{color: '#ff5e00', fontSize: '10px'}}></i>
                      <span style={{fontSize: '13px', color: '#333'}}>{ride.destination_address}</span>
                    </div>
                  </div>
                  <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                    <div style={{fontSize: '16px', fontWeight: 700, color: '#111', ...numberStyle}}>
                      ₦{parseFloat(ride.total_fare || ride.estimated_fare || '0').toLocaleString()}
                    </div>
                    <div style={{display: 'flex', gap: '8px'}}>
                      <button style={{
                        padding: '8px 16px',
                        background: '#f8f8f8',
                        border: '1px solid #e8e8e8',
                        borderRadius: '10px',
                        fontSize: '12px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        color: '#666'
                      }}>
                        Decline
                      </button>
                      <button
                        onClick={() => router.visit(`/ride/${ride.id}`)}
                        style={{
                          padding: '8px 16px',
                          background: 'linear-gradient(135deg, #ff5e00 0%, #ff8c3a 100%)',
                          border: 'none',
                          borderRadius: '10px',
                          fontSize: '12px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          color: 'white'
                        }}
                      >
                        Accept
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              <Link href="/ride_requests" style={{
                display: 'block',
                textAlign: 'center',
                padding: '12px',
                color: '#ff5e00',
                fontSize: '14px',
                fontWeight: 600,
                textDecoration: 'none'
              }}>
                View All Requests →
              </Link>
            </div>
          )}

          {/* Verification Status */}
          {verificationStatus !== 'verified' && (
            <div style={{
              background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
              borderRadius: '16px',
              padding: '20px',
              marginBottom: '20px'
            }}>
              <div style={{display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px'}}>
                <i className="fas fa-shield-alt" style={{color: '#d97706', fontSize: '20px'}}></i>
                <div>
                  <div style={{fontSize: '14px', fontWeight: 600, color: '#111'}}>Verification Pending</div>
                  <div style={{fontSize: '12px', color: '#666'}}>Complete KYC to start earning</div>
                </div>
              </div>
              <Link href="/kyc" style={{
                display: 'inline-block',
                padding: '10px 20px',
                background: '#d97706',
                color: 'white',
                borderRadius: '10px',
                fontSize: '13px',
                fontWeight: 600,
                textDecoration: 'none'
              }}>
                Complete KYC
              </Link>
            </div>
          )}
        </div>

        <DriverNavMobile />
      </div>

      {/* DESKTOP VIEW */}
      <div className="desktop-view">
        <DriverSidebarDesktop userName={userName} />
        <div className="desktop-main">
          {/* Hero Header - Original Orange Gradient */}
          <div className="cd-hero">
            <div className="cd-hero-pattern"></div>
            
            {/* Top Row: Greeting + Notification */}
            <div className="cd-hero-top">
              <div className="cd-user-greeting">
                <span className="cd-wave">👋</span>
                <div className="cd-user-text">
                  <span className="cd-greeting-text">Welcome back,</span>
                  <h1>{userName}!</h1>
                </div>
              </div>
              <div className="cd-header-actions">
                <button className="cd-notification-btn" onClick={() => router.visit('/driver_settings')}>
                  <i className="fas fa-bell"></i>
                  {notificationCount > 0 && (
                    <span className="cd-notification-badge">{notificationCount}</span>
                  )}
                </button>
                <div className="cd-avatar" onClick={() => router.visit('/driver_settings')}>
                  {userAvatar ? (
                    <img src={userAvatar} alt={userName} />
                  ) : (
                    <span>{userName.charAt(0)}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Wallet Card */}
            <div className="cd-wallet-card">
              <div className="cd-wallet-header">
                <div className="cd-wallet-label">Available Balance</div>
                <div className="cd-tier-badge">
                  <span className={`cd-status-indicator ${driverStatus}`}></span> 
                  {driverStatus === 'online' ? 'Online' : 'Offline'}
                </div>
              </div>
              <div className="cd-wallet-amount">₦{availableBalance.toLocaleString()}</div>
              <div className="cd-wallet-change-wrap">
                <span className="cd-wallet-change"><i className="fas fa-arrow-up"></i> ₦{todayEarnings.toLocaleString()} today</span>
              </div>
              <div className="cd-wallet-actions">
                <button className="cd-wallet-btn" onClick={() => router.visit('/driver_wallet')}>
                  <i className="fas fa-plus"></i> Withdraw
                </button>
                <button className="cd-wallet-btn-outline" onClick={toggleDriverStatus}>
                  <i className={`fas fa-${driverStatus === 'online' ? 'pause' : 'play'}`}></i> 
                  {driverStatus === 'online' ? 'Go Offline' : 'Go Online'}
                </button>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="cd-stats-grid">
            <div className="cd-stat-card cd-stat-active">
              <div className="cd-stat-icon">
                <i className="fas fa-naira-sign"></i>
              </div>
              <div className="cd-stat-info">
                <span className="cd-stat-value">₦{todayEarnings.toLocaleString()}</span>
                <span className="cd-stat-label">Today's Earnings</span>
              </div>
              <div className="cd-stat-trend">
                <i className="fas fa-arrow-up"></i> +{todayRides} rides
              </div>
            </div>

            <div className="cd-stat-card">
              <div className="cd-stat-icon">
                <i className="fas fa-chart-line"></i>
              </div>
              <div className="cd-stat-info">
                <span className="cd-stat-value">₦{totalEarnings.toLocaleString()}</span>
                <span className="cd-stat-label">Total Earnings</span>
              </div>
              <div className="cd-stat-meta">
                Since joining
              </div>
            </div>

            <div className="cd-stat-card">
              <div className="cd-stat-icon">
                <i className="fas fa-car"></i>
              </div>
              <div className="cd-stat-info">
                <span className="cd-stat-value">{todayRides}</span>
                <span className="cd-stat-label">Today's Rides</span>
              </div>
              <div className="cd-stat-meta">
                Completed today
              </div>
            </div>

            <div className="cd-stat-card">
              <div className="cd-stat-icon">
                <i className="fas fa-star"></i>
              </div>
              <div className="cd-stat-info">
                <span className="cd-stat-value">{avgRating.toFixed(1)}</span>
                <span className="cd-stat-label">Rating ({totalReviews} reviews)</span>
              </div>
              <div className="cd-stat-meta">
                Driver Score
              </div>
            </div>
          </div>

          {/* Dashboard Grid */}
          <div className="dashboard-grid">
            <div className="dashboard-card pending-rides">
              <h3><i className="fas fa-bell"></i> Pending Ride Requests</h3>
              {pendingRides.length === 0 ? (
                <div className="empty-state">
                  <i className="fas fa-inbox"></i>
                  <p>No pending ride requests</p>
                </div>
              ) : (
                <div className="ride-list">
                  {pendingRides.slice(0, 5).map((ride) => (
                    <div key={ride.id} className="ride-item">
                      <div className="ride-details">
                        <div className="ride-route">
                          <span><i className="fas fa-circle text-green"></i> {ride.pickup_address}</span>
                          <span><i className="fas fa-arrow-down"></i></span>
                          <span><i className="fas fa-map-marker text-orange"></i> {ride.destination_address}</span>
                        </div>
                        <div className="ride-meta">
                          <span className="ride-fare">₦{parseFloat(ride.total_fare || ride.estimated_fare || '0').toLocaleString()}</span>
                          <span className="ride-distance">{ride.distance || 0} km</span>
                        </div>
                      </div>
                      <button className="accept-btn" onClick={() => router.visit(`/ride/${ride.id}`)}>
                        Accept
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <Link href="/driver/book-history" className="view-all">View All Requests</Link>
            </div>

            <div className="dashboard-card quick-actions">
              <h3><i className="fas fa-bolt"></i> Quick Actions</h3>
              <div className="action-grid">
                <Link href="/driver/location" className="action-item">
                  <i className="fas fa-map-marker-alt"></i>
                  <span>Update Location</span>
                </Link>
                <Link href="/driver-wallet" className="action-item">
                  <i className="fas fa-wallet"></i>
                  <span>Withdraw</span>
                </Link>
                <Link href="/driver/profile" className="action-item">
                  <i className="fas fa-user"></i>
                  <span>Profile</span>
                </Link>
                <Link href="/driver/settings" className="action-item">
                  <i className="fas fa-cog"></i>
                  <span>Settings</span>
                </Link>
              </div>
            </div>

            <div className="dashboard-card verification-status">
              <h3><i className="fas fa-shield-alt"></i> Verification Status</h3>
              <div className="status-item">
                <span className={`status-badge ${verificationStatus}`}>
                  {verificationStatus === 'verified' ? 'Verified' : 'Pending Verification'}
                </span>
              </div>
              {verificationStatus !== 'verified' && (
                <Link href="/kyc" className="complete-kyc-btn">
                  Complete KYC Verification
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
