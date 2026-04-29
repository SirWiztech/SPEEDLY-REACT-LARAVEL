import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DriverSidebar from '../components/DriverSidebar';
import DriverMobileNav from '../components/DriverMobileNav';
import MobilePreloader from '../components/Preloader';
import { rideAPI, userAPI } from '../services/api';

export default function DriverBookHistory() {
  const [loading, setLoading] = useState(true);
  const [rides, setRides] = useState([]);
  const [stats, setStats] = useState({
    total_rides: 0,
    total_earnings: 0,
    avg_rating: 0,
    completed_rides: 0,
    pending_rides: 0
  });
  const [userData, setUserData] = useState(null);
  const [notificationCount, setNotificationCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [profileRes, ridesRes] = await Promise.all([
        userAPI.getProfile(),
        rideAPI.getHistory(100)
      ]);
      
      const profile = profileRes.data?.user || profileRes.data?.profile || profileRes.data;
      const rideList = ridesRes.data?.rides || ridesRes.data || [];
      
      setUserData(profile);
      setNotificationCount(profileRes.data?.notifications?.filter(n => !n.is_read).length || 0);
      
      const completed = rideList.filter(r => r.status === 'completed');
      const pending = rideList.filter(r => ['pending', 'accepted'].includes(r.status));
      
      setRides(rideList);
      setStats({
        total_rides: rideList.length,
        total_earnings: completed.reduce((sum, r) => sum + (parseFloat(r.total_fare) || 0), 0),
        avg_rating: profile?.avg_rating || 0,
        completed_rides: completed.length,
        pending_rides: pending.length
      });
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const viewRideDetails = (rideId) => {
    navigate(`/ride/${rideId}`);
  };

  if (loading) return <MobilePreloader />;

  const userName = userData?.full_name?.split(' ')[0] || userData?.name?.split(' ')[0] || 'Driver';
  const totalRides = stats.total_rides.toLocaleString();
  const totalEarnings = stats.total_earnings;
  const avgRating = stats.avg_rating.toFixed(1);
  const lastRide = rides[0];

  const numberStyle = { fontFamily: "'Outfit', sans-serif" };

  return (
    <div className="dashboard-container">
      {/* MOBILE VIEW */}
      <div className="mobile-view" style={{
        paddingBottom: '80px',
        background: 'white',
        minHeight: '100vh'
      }}>
        {/* Header with Orange Gradient */}
        <div style={{
          background: 'linear-gradient(135deg, #ff5e00 0%, #ff8c3a 100%)',
          padding: '48px 20px 32px',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute',
            top: '-30%',
            right: '-15%',
            width: '200px',
            height: '200px',
            background: 'radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 70%)',
            borderRadius: '50%'
          }}></div>

          <div style={{position: 'relative', zIndex: 1}}>
            <div style={{color: 'rgba(255,255,255,0.85)', fontSize: '11px', fontWeight: 600, letterSpacing: '1.5px', marginBottom: '4px', textTransform: 'uppercase'}}>
              RIDE HISTORY
            </div>
            <h1 style={{
              fontSize: '28px',
              fontWeight: 800,
              color: 'white',
              margin: '0 0 8px 0',
              letterSpacing: '-0.5px',
              lineHeight: 1.2
            }}>
              {userName}'s Rides
            </h1>
            <p style={{fontSize: '14px', color: 'rgba(255,255,255,0.8)', margin: 0}}>
              Track all your past and upcoming rides
            </p>
          </div>
        </div>

        <div style={{padding: '20px 16px', marginTop: '-16px', position: 'relative', zIndex: 2}}>
          {/* Stats Cards - White with Orange Accents */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '12px',
            marginBottom: '24px'
          }}>
            {[
              { label: 'Total Rides', value: stats.total_rides, icon: 'fa-car', color: '#ff5e00' },
              { label: 'Earnings', value: `₦${totalEarnings.toLocaleString()}`, icon: 'fa-wallet', color: '#16a34a' }
            ].map((stat, idx) => (
              <div key={idx} style={{
                background: 'white',
                borderRadius: '16px',
                padding: '18px 16px',
                boxShadow: '0 4px 20px rgba(255,94,0,0.12)',
                border: '1px solid rgba(255,94,0,0.1)'
              }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '12px',
                  background: `${stat.color}15`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '12px'
                }}>
                  <i className={`fas ${stat.icon}`} style={{color: stat.color, fontSize: '16px'}}></i>
                </div>
                <div style={{
                  fontSize: '22px',
                  fontWeight: 700,
                  color: '#111',
                  marginBottom: '4px',
                  ...numberStyle
                }}>
                  {typeof stat.value === 'string' ? stat.value : stat.value.toLocaleString()}
                </div>
                <div style={{
                  fontSize: '11px',
                  color: '#888',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>


        <div style={{padding: '20px', marginTop: '-10px', position: 'relative', zIndex: 2}}>
          {/* Section Header */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '16px'
          }}>
            <h2 style={{
              fontSize: '18px',
              fontWeight: 700,
              color: '#111',
              margin: 0,
              letterSpacing: '-0.3px'
            }}>
              <i className="fas fa-history" style={{color: '#ff5e00', marginRight: '8px', fontSize: '16px'}}></i>
              Recent Rides
            </h2>
            {rides.length > 0 && (
              <span style={{
                fontSize: '12px',
                color: '#888',
                fontWeight: 500
              }}>
                {rides.length} total
              </span>
            )}
          </div>

          {/* Ride List */}
          {rides.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '60px 20px',
              background: 'white',
              borderRadius: '20px',
              boxShadow: '0 4px 20px rgba(255,94,0,0.1)',
              border: '1px solid rgba(255,94,0,0.1)'
            }}>
              <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #fff5f0 0%, #ffe0d0 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px'
              }}>
                <i className="fas fa-inbox" style={{fontSize: '32px', color: '#ff5e00'}}></i>
              </div>
              <h3 style={{fontSize: '18px', fontWeight: 600, color: '#111', margin: '0 0 8px 0'}}>
                No rides yet
              </h3>
              <p style={{fontSize: '14px', color: '#888', margin: 0}}>
                Your completed rides will appear here
              </p>
            </div>
          ) : (
            <div style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
              {rides.slice(0, 20).map((ride, idx) => {
                const isCompleted = ride.status === 'completed';
                const statusColor = isCompleted ? '#16a34a' : '#d97706';
                const statusBg = isCompleted ? '#dcfce7' : '#fef3c7';
                
                return (
                  <div
                    key={ride.id}
                    onClick={() => viewRideDetails(ride.id)}
                    style={{
                      background: 'white',
                      borderRadius: '16px',
                      padding: '16px',
                      boxShadow: '0 4px 20px rgba(255,94,0,0.08)',
                      border: '1px solid rgba(255,94,0,0.1)',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 8px 30px rgba(255,94,0,0.15)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 4px 20px rgba(255,94,0,0.08)';
                    }}
                  >
                    {/* Status Badge */}
                    <div style={{
                      position: 'absolute',
                      top: '12px',
                      right: '12px'
                    }}>
                      <span style={{
                        padding: '4px 10px',
                        borderRadius: '20px',
                        fontSize: '10px',
                        fontWeight: 600,
                        background: statusBg,
                        color: statusColor,
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}>
                        {ride.status}
                      </span>
                    </div>

                    {/* Ride Info */}
                    <div style={{marginBottom: '12px', paddingRight: '80px'}}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        marginBottom: '6px'
                      }}>
                        <div style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          background: '#22c55e',
                          flexShrink: 0
                        }}></div>
                        <span style={{
                          fontSize: '14px',
                          fontWeight: 600,
                          color: '#333',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}>
                          {ride.pickup_address}
                        </span>
                      </div>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}>
                        <div style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          background: '#ff5e00',
                          flexShrink: 0
                        }}></div>
                        <span style={{
                          fontSize: '14px',
                          fontWeight: 600,
                          color: '#333',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}>
                          {ride.destination_address}
                        </span>
                      </div>
                    </div>

                    {/* Meta Info */}
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      paddingTop: '12px',
                      borderTop: '1px solid #f0f0f0'
                    }}>
                      <div style={{display: 'flex', alignItems: 'center', gap: '6px'}}>
                        <i className="fas fa-calendar-alt" style={{fontSize: '11px', color: '#aaa'}}></i>
                        <span style={{fontSize: '12px', color: '#888'}}>
                          {new Date(ride.created_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                      <div style={{
                        fontSize: '18px',
                        fontWeight: 700,
                        color: '#111',
                        ...numberStyle
                      }}>
                        ₦{parseFloat(ride.total_fare || ride.estimated_fare).toLocaleString()}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* View All Button */}
          {rides.length > 20 && (
            <button
              onClick={() => navigate('/ride_history')}
              style={{
                width: '100%',
                padding: '14px',
                marginTop: '16px',
                background: 'white',
                border: '2px solid rgba(255,94,0,0.3)',
                borderRadius: '14px',
                color: '#ff5e00',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'rgba(255,94,0,0.05)';
                e.target.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'white';
                e.target.style.transform = 'translateY(0)';
              }}
            >
              View All Rides ({rides.length}) →
            </button>
          )}
        </div>

        <DriverMobileNav />
      </div>

      {/* DESKTOP VIEW */}
      <div className="desktop-view">
        <DriverSidebar userName={userName} />
        <div className="desktop-main">
          {/* Header */}
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px'}}>
            <div>
              <h1 style={{fontSize: '32px', fontWeight: 800, letterSpacing: '-1px', color: '#111', marginBottom: '4px'}}>
                <i className="fas fa-history" style={{color: '#ff5e00', marginRight: '12px'}}></i>
                Book History
              </h1>
              <p style={{fontSize: '14px', color: '#9ca3af'}}>Track all your past and upcoming rides</p>
            </div>
            <button
              onClick={() => navigate('/driver_settings')}
              style={{
                width: '48px',
                height: '48px',
                background: 'white',
                borderRadius: '14px',
                border: '1px solid rgba(255,94,0,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 12px rgba(255,94,0,0.15)',
                color: '#ff5e00',
                fontSize: '18px',
                cursor: 'pointer',
                position: 'relative'
              }}
            >
              <i className="fas fa-bell"></i>
              {notificationCount > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '-6px',
                  right: '-6px',
                  width: '20px',
                  height: '20px',
                  background: '#ff5e00',
                  color: 'white',
                  borderRadius: '50%',
                  fontSize: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700
                }}>
                  {notificationCount}
                </span>
              )}
            </button>
          </div>

          {/* Stats Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '20px',
            marginBottom: '32px'
          }}>
            {[
              { label: 'Total Rides', value: stats.total_rides, icon: 'fa-car', color: '#ff5e00', bg: '#fff5f0' },
              { label: 'Total Earnings', value: `₦${totalEarnings.toLocaleString()}`, icon: 'fa-wallet', color: '#16a34a', bg: '#dcfce7' },
              { label: 'Completed', value: stats.completed_rides, icon: 'fa-check-circle', color: '#0284c7', bg: '#e0f2fe' },
              { label: 'Rating', value: `${avgRating}/5`, icon: 'fa-star', color: '#d97706', bg: '#fef3c7' }
            ].map((stat, idx) => (
              <div key={idx} style={{
                background: 'white',
                borderRadius: '20px',
                padding: '24px',
                boxShadow: '0 4px 24px rgba(255,94,0,0.12)',
                border: '1px solid rgba(255,94,0,0.1)'
              }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '14px',
                  background: stat.bg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '16px'
                }}>
                  <i className={`fas ${stat.icon}`} style={{color: stat.color, fontSize: '18px'}}></i>
                </div>
                <div style={{
                  fontSize: '24px',
                  fontWeight: 700,
                  color: '#111',
                  marginBottom: '4px',
                  ...numberStyle
                }}>
                  {stat.value}
                </div>
                <div style={{
                  fontSize: '12px',
                  color: '#888',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  fontWeight: 600
                }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>

          {/* Ride History List */}
          <div style={{
            background: 'white',
            borderRadius: '20px',
            padding: '32px',
            boxShadow: '0 4px 24px rgba(255,94,0,0.12)',
            border: '1px solid rgba(255,94,0,0.1)'
          }}>
            <h3 style={{fontSize: '20px', fontWeight: 600, color: '#111', margin: '0 0 24px 0'}}>
              <i className="fas fa-list" style={{color: '#ff5e00', marginRight: '10px'}}></i>
              All Rides
            </h3>
            {rides.length === 0 ? (
              <div style={{textAlign: 'center', padding: '60px 20px', color: '#888'}}>
                <i className="fas fa-inbox" style={{fontSize: '48px', marginBottom: '16px', display: 'block', color: '#ccc'}}></i>
                <p style={{fontSize: '16px', margin: 0}}>No rides found</p>
              </div>
            ) : (
              <div>
                {rides.map((ride) => {
                  const isCompleted = ride.status === 'completed';
                  const statusColor = isCompleted ? '#16a34a' : '#d97706';
                  const statusBg = isCompleted ? '#dcfce7' : '#fef3c7';
  
                  
                  return (
                    <div key={ride.id} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '20px',
                      background: '#f8f8f8',
                      borderRadius: '12px',
                      marginBottom: '12px',
                      border: '1px solid #f0f0f0',
                      cursor: 'pointer'
                    }}
                    onClick={() => viewRideDetails(ride.id)}
                    >
                      <div style={{flex: 1}}>
                        <div style={{display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px'}}>
                          <i className="fas fa-circle" style={{color: '#22c55e', fontSize: '8px'}}></i>
                          <span style={{fontSize: '14px', fontWeight: 600, color: '#333'}}>
                            {ride.pickup_address?.length > 30 ? ride.pickup_address.substring(0, 30) + '...' : ride.pickup_address}
                          </span>
                        </div>
                        <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                          <i className="fas fa-map-marker-alt" style={{color: '#ff5e00', fontSize: '10px'}}></i>
                          <span style={{fontSize: '14px', fontWeight: 600, color: '#333'}}>
                            {ride.destination_address?.length > 30 ? ride.destination_address.substring(0, 30) + '...' : ride.destination_address}
                          </span>
                        </div>
                        <div style={{display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px'}}>
                          <i className="fas fa-calendar-alt" style={{fontSize: '11px', color: '#aaa'}}></i>
                          <span style={{fontSize: '12px', color: '#888'}}>
                            {new Date(ride.created_at).toLocaleString()}
                          </span>
                        </div>
                      </div>
                      <div style={{textAlign: 'right', marginLeft: '20px'}}>
                        <div style={{
                          padding: '4px 10px',
                          borderRadius: '20px',
                          fontSize: '10px',
                          fontWeight: 600,
                          background: statusBg,
                          color: statusColor,
                          marginBottom: '8px'
                        }}>
                          {ride.status}
                        </div>
                        <div style={{
                          fontSize: '18px',
                          fontWeight: 700,
                          color: '#111',
                          ...numberStyle
                        }}>
                          ₦{parseFloat(ride.total_fare || ride.estimated_fare).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
