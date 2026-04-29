import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DriverSidebar from '../components/DriverSidebar';
import DriverMobileNav from '../components/DriverMobileNav';
import { userAPI, withdrawalAPI, rideAPI } from '../services/api';
import MobilePreloader from '../components/Preloader';

export default function DriverWallet() {
  const [loading, setLoading] = useState(true);
  const [walletBalance, setWalletBalance] = useState(0);
  const [todayEarnings, setTodayEarnings] = useState(0);
  const [weekEarnings, setWeekEarnings] = useState(0);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [totalWithdrawn, setTotalWithdrawn] = useState(0);
  const [withdrawals, setWithdrawals] = useState([]);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [notificationCount, setNotificationCount] = useState(0);
  const [userData, setUserData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchWalletData();
  }, []);

  const fetchWalletData = async () => {
    try {
      const [profileRes, walletRes, ridesRes] = await Promise.all([
        userAPI.getProfile(),
        userAPI.getWallet(),
        rideAPI.getHistory(100)
      ]);
      const profile = profileRes.data?.user || profileRes.data?.profile || profileRes.data;
      const wallet = walletRes.data;
      const rides = ridesRes.data?.rides || ridesRes.data || [];
      setUserData(profile);
      setWalletBalance(wallet?.balance || 0);
      setWithdrawals(wallet?.withdrawals || wallet?.transactions || []);
      setNotificationCount(profileRes.data?.notifications?.filter(n => !n.is_read).length || 0);
      const completedRides = rides.filter(r => r.status === 'completed');
      const today = new Date().toDateString();
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const todayRides = completedRides.filter(r => new Date(r.completed_at || r.created_at).toDateString() === today);
      const weekRides = completedRides.filter(r => new Date(r.completed_at || r.created_at) >= weekAgo);
      setTodayEarnings(todayRides.reduce((sum, r) => sum + (parseFloat(r.total_fare) || 0),0));
      setWeekEarnings(weekRides.reduce((sum, r) => sum + (parseFloat(r.total_fare) || 0),0));
      setTotalEarnings(completedRides.reduce((sum, r) => sum + (parseFloat(r.total_fare) || 0),0));
      setTotalWithdrawn(wallet?.total_withdrawn || 0);
    } catch (err) {
      console.error('Error fetching wallet data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async () => {
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) return;
    if (parseFloat(withdrawAmount) > walletBalance) {
      alert('Insufficient balance');
      return;
    }
    try {
      await withdrawalAPI.request(parseFloat(withdrawAmount), '', '', '');
      setShowWithdrawModal(false);
      setWithdrawAmount('');
      fetchWalletData();
      alert('Withdrawal request submitted successfully');
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const numberStyle = { fontFamily: 'Outfit, sans-serif' };

  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes float {
        0%, 100% { transform: translateY(0px); }
        50% { transform: translateY(-20px); }
      }
      @keyframes fadeInUp {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  if (loading) return <MobilePreloader />;

  const userName = userData?.full_name?.split(' ')[0] || 'Driver';

  return (
    <div className="dashboard-container">
      {/* MOBILE VIEW - FULL WIDTH FINTECH DESIGN */}
      <div className="mobile-view" style={{paddingBottom: '80px', background: '#f5f5f5', minHeight: '100vh'}}>
        {/* Hero Balance Card - Full Width */}
        <div style={{
          background: 'linear-gradient(135deg, #ff5e00 0%, #ff7a1a 40%, #ff8c3a 70%, #ffaa5c 100%)',
          padding: '60px 24px 40px',
          position: 'relative',
          overflow: 'hidden',
          marginBottom: '-20px'
        }}>
          {/* Animated Background Circles */}
          <div style={{
            position: 'absolute',
            top: '-30%',
            right: '-15%',
            width: '300px',
            height: '300px',
            background: 'radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 70%)',
            borderRadius: '50%',
            animation: 'float 6s ease-in-out infinite'
          }}></div>
          <div style={{
            position: 'absolute',
            bottom: '-20%',
            left: '-10%',
            width: '200px',
            height: '200px',
            background: 'radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%)',
            borderRadius: '50%',
            animation: 'float 8s ease-in-out infinite reverse'
          }}></div>

          <div style={{position: 'relative', zIndex: 2}}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px'}}>
              <div>
                <div style={{color: 'rgba(255,255,255,0.7)', fontSize: '12px', fontWeight: 500, letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '4px'}}>
                  Available Balance
                </div>
                <h1 style={{fontSize: '48px', fontWeight: 800, color: 'white', margin: 0, ...numberStyle, letterSpacing: '-1px'}}>
                  ₦{walletBalance.toLocaleString()}
                </h1>
              </div>
              <div onClick={() => setShowWithdrawModal(true)} style={{
                width: '56px',
                height: '56px',
                borderRadius: '16px',
                background: 'rgba(255,255,255,0.25)',
                backdropFilter: 'blur(10px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                border: '2px solid rgba(255,255,255,0.4)',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
              onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
              >
                <i className="fas fa-arrow-up" style={{color: 'white', fontSize: '20px'}}></i>
              </div>
            </div>

            {/* Quick Stats Pills */}
            <div style={{display: 'flex', gap: '8px', flexWrap: 'wrap'}}>
              {[
                { label: 'Today', value: todayEarnings, color: '#22c55e' },
                { label: 'This Week', value: weekEarnings, color: '#3b82f6' },
                { label: 'Total', value: totalEarnings, color: '#ff5e00' }
              ].map((stat, idx) => (
                <div key={idx} style={{
                  padding: '8px 14px',
                  background: 'rgba(255,255,255,0.15)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: '20px',
                  border: '1px solid rgba(255,255,255,0.2)'
                }}>
                  <span style={{fontSize: '11px', color: 'rgba(255,255,255,0.7)', marginRight: '6px'}}>{stat.label}</span>
                  <span style={{fontSize: '13px', fontWeight: 700, color: 'white', ...numberStyle}}>₦{stat.value.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{padding: '24px 16px', position: 'relative', zIndex: 3}}>
          {/* Action Buttons */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '12px',
            marginBottom: '24px'
          }}>
            {[
              { icon: 'fa-arrow-up', label: 'Withdraw', action: () => setShowWithdrawModal(true) },
              { icon: 'fa-history', label: 'History', action: () => {} },
              { icon: 'fa-wallet', label: 'Add Money', action: () => {} },
              { icon: 'fa-chart-line', label: 'Analytics', action: () => {} }
            ].map((action, idx) => (
              <div key={idx} onClick={action.action} style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px',
                padding: '16px 8px',
                background: 'white',
                borderRadius: '16px',
                boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                border: '1px solid rgba(255,94,0,0.1)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 20px rgba(255,94,0,0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.06)';
              }}
              >
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #ff5e00 0%, #ff8c3a 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <i className={`fas ${action.icon}`} style={{color: 'white', fontSize: '16px'}}></i>
                </div>
                <span style={{fontSize: '11px', fontWeight: 600, color: '#666', textTransform: 'uppercase', letterSpacing: '0.3px'}}>{action.label}</span>
              </div>
            ))}
          </div>

          {/* Earnings Overview Card */}
          <div style={{
            background: 'white',
            borderRadius: '20px',
            padding: '20px',
            marginBottom: '20px',
            boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
            border: '1px solid rgba(255,94,0,0.08)'
          }}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px'}}>
              <h3 style={{fontSize: '16px', fontWeight: 700, color: '#111', margin: 0}}>
                <i className="fas fa-chart-pie" style={{color: '#ff5e00', marginRight: '8px'}}></i>
                Earnings Overview
              </h3>
              <span style={{fontSize: '12px', color: '#888', fontWeight: 500}}>This Week</span>
            </div>

            <div style={{display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px'}}>
              {[
                { label: 'Today', value: todayEarnings, icon: 'fa-sun', color: '#22c55e', bg: '#dcfce7' },
                { label: 'This Week', value: weekEarnings, icon: 'fa-calendar-week', color: '#3b82f6', bg: '#dbeafe' },
                { label: 'Total Earned', value: totalEarnings, icon: 'fa-coins', color: '#ff5e00', bg: '#fff5f0' },
                { label: 'Withdrawn', value: totalWithdrawn, icon: 'fa-arrow-up', color: '#8b5cf6', bg: '#f3e8ff' }
              ].map((stat, idx) => (
                <div key={idx} style={{
                  padding: '14px',
                  background: stat.bg,
                  borderRadius: '14px',
                  border: `1px solid ${stat.color}20`
                }}>
                  <div style={{display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px'}}>
                    <i className={`fas ${stat.icon}`} style={{color: stat.color, fontSize: '12px'}}></i>
                  </div>
                  <div style={{fontSize: '18px', fontWeight: 700, color: '#111', marginBottom: '2px', ...numberStyle}}>
                    ₦{stat.value.toLocaleString()}
                  </div>
                  <div style={{fontSize: '10px', color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px'}}>
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Transactions */}
          <div style={{
            background: 'white',
            borderRadius: '20px',
            padding: '20px',
            boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
            border: '1px solid rgba(255,94,0,0.08)'
          }}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px'}}>
              <h3 style={{fontSize: '16px', fontWeight: 700, color: '#111', margin: 0}}>
                <i className="fas fa-exchange-alt" style={{color: '#ff5e00', marginRight: '8px'}}></i>
                Recent Transactions
              </h3>
              {withdrawals.length > 0 && (
                <span style={{fontSize: '12px', color: '#ff5e00', fontWeight: 600, cursor: 'pointer'}}>See All</span>
              )}
            </div>

            {withdrawals.length === 0 ? (
              <div style={{textAlign: 'center', padding: '40px 20px'}}>
                <div style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: '#f5f5f5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 12px'
                }}>
                  <i className="fas fa-inbox" style={{fontSize: '24px', color: '#ccc'}}></i>
                </div>
                <p style={{fontSize: '14px', color: '#888', margin: 0}}>No transactions yet</p>
              </div>
            ) : (
              <div style={{display: 'flex', flexDirection: 'column', gap: '2px'}}>
                {withdrawals.slice(0, 5).map((w, idx) => (
                  <div key={idx} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '14px 12px',
                    background: idx % 2 === 0 ? '#fafafa' : 'white',
                    borderRadius: '12px',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#fff5f0'}
                  onMouseLeave={(e) => e.currentTarget.style.background = idx % 2 === 0 ? '#fafafa' : 'white'}
                  >
                    <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
                      <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '10px',
                        background: w.status === 'completed' ? '#dcfce7' : '#fef3c7',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <i className={`fas ${w.status === 'completed' ? 'fa-check' : 'fa-clock'}`} style={{
                          color: w.status === 'completed' ? '#16a34a' : '#d97706',
                          fontSize: '14px'
                        }}></i>
                      </div>
                      <div>
                        <div style={{fontSize: '14px', fontWeight: 600, color: '#111'}}>Withdrawal</div>
                        <div style={{fontSize: '11px', color: '#888'}}>{new Date(w.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                      </div>
                    </div>
                    <div style={{textAlign: 'right'}}>
                      <div style={{fontSize: '15px', fontWeight: 700, color: '#111', ...numberStyle}}>₦{w.amount?.toLocaleString()}</div>
                      <span style={{
                        padding: '2px 8px',
                        borderRadius: '10px',
                        fontSize: '10px',
                        fontWeight: 600,
                        background: w.status === 'completed' ? '#dcfce7' : '#fef3c7',
                        color: w.status === 'completed' ? '#16a34a' : '#d97706'
                      }}>
                        {w.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <DriverMobileNav />
      </div>

      {/* DESKTOP VIEW */}
      <div className="desktop-view">
        <DriverSidebar userName={userName} />
        <div className="desktop-main">
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px'}}>
            <div>
              <h1 style={{fontSize: '32px', fontWeight: 800, letterSpacing: '-1px', color: '#111', marginBottom: '4px'}}>
                <i className="fas fa-wallet" style={{color: '#ff5e00', marginRight: '12px'}}></i>
                My Wallet
              </h1>
              <p style={{fontSize: '14px', color: '#9ca3af'}}>Manage your earnings and withdrawals</p>
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

          {/* Balance Card */}
          <div style={{
            background: 'linear-gradient(135deg, #ff5e00 0%, #ff8c3a 50%, #ffaa5c 100%)',
            borderRadius: '24px',
            padding: '40px',
            marginBottom: '32px',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 20px 60px rgba(255,94,0,0.3)'
          }}>
            <div style={{
              position: 'absolute',
              top: '-30%',
              right: '-10%',
              width: '300px',
              height: '300px',
              background: 'radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 70%)',
              borderRadius: '50%'
            }}></div>
            <div style={{position: 'relative', zIndex: 1}}>
              <div style={{display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px'}}>
                <i className="fas fa-wallet" style={{color: 'white', fontSize: '20px'}}></i>
                <span style={{color: 'rgba(255,255,255,0.9)', fontSize: '14px', fontWeight: 500}}>Available Balance</span>
              </div>
              <div style={{fontSize: '56px', fontWeight: 800, color: 'white', marginBottom: '16px', ...numberStyle}}>
                ₦{walletBalance.toLocaleString()}
              </div>
              <button
                onClick={() => setShowWithdrawModal(true)}
                style={{
                  padding: '14px 32px',
                  background: 'rgba(255,255,255,0.2)',
                  border: '2px solid rgba(255,255,255,0.3)',
                  borderRadius: '12px',
                  color: 'white',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontSize: '15px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  backdropFilter: 'blur(10px)'
                }}
              >
                <i className="fas fa-arrow-up"></i>
                Withdraw Earnings
              </button>
            </div>
          </div>

          {/* Stats Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '20px',
            marginBottom: '32px'
          }}>
            {[
              { label: 'Today', value: todayEarnings, icon: 'fa-sun' },
              { label: 'This Week', value: weekEarnings, icon: 'fa-calendar-week' },
              { label: 'Total Earned', value: totalEarnings, icon: 'fa-coins' },
              { label: 'Withdrawn', value: totalWithdrawn, icon: 'fa-arrow-up' }
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
                  background: 'rgba(255,94,0,0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '16px'
                }}>
                  <i className={`fas ${stat.icon}`} style={{color: '#ff5e00', fontSize: '18px'}}></i>
                </div>
                <div style={{fontSize: '28px', fontWeight: 700, color: '#111', marginBottom: '4px', ...numberStyle}}>
                  ₦{stat.value.toLocaleString()}
                </div>
                <div style={{fontSize: '12px', color: '#888', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600}}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Withdraw Modal */}
      {showWithdrawModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '20px'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '24px',
            padding: '32px',
            maxWidth: '400px',
            width: '100%',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
          }}>
            <h2 style={{fontSize: '24px', fontWeight: 700, color: '#111', marginBottom: '8px'}}>Withdraw Earnings</h2>
            <p style={{fontSize: '14px', color: '#888', marginBottom: '24px'}}>Enter amount to withdraw (Min: ₦1,000)</p>
            <input
              type="number"
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
              placeholder="Enter amount"
              style={{
                width: '100%',
                padding: '16px 20px',
                border: '2px solid rgba(255,94,0,0.2)',
                borderRadius: '14px',
                fontSize: '16px',
                outline: 'none',
                marginBottom: '20px',
                fontFamily: 'inherit',
                transition: 'border-color 0.3s ease'
              }}
              onFocus={(e) => e.target.style.borderColor = '#ff5e00'}
              onBlur={(e) => e.target.style.borderColor = 'rgba(255,94,0,0.2)'}
            />
            <div style={{display: 'flex', gap: '12px'}}>
              <button
                onClick={() => { setShowWithdrawModal(false); setWithdrawAmount(''); }}
                style={{
                  flex: 1,
                  padding: '14px',
                  background: '#f8f8f8',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '15px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  color: '#666'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleWithdraw}
                style={{
                  flex: 1,
                  padding: '14px',
                  background: 'linear-gradient(135deg, #ff5e00 0%, #ff8c3a 100%)',
                  border: 'none',
                  borderRadius: '12px',
                  color: 'white',
                  fontSize: '15px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Withdraw
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
