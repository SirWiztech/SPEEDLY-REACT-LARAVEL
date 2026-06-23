import React from 'react';
import { Link } from '@inertiajs/react';
import { usePage } from '@inertiajs/react';
import '../../../css/NavBar.css';

interface DriverNavMobileProps {
}

const DriverNavMobile: React.FC<DriverNavMobileProps> = () => {
  const { url } = usePage();
  const cleanPath = url.split('?')[0].replace(/\/$/, '');

  const isActive = (path: string): boolean => {
    const exact = path.split('?')[0].replace(/\/$/, '');
    if (cleanPath === exact) return true;
    if (cleanPath.startsWith(exact)) return true;
    return false;
  };

  const navItems = [
    { path: '/driverdashboard', name: 'Home', icon: 'fas fa-home' },
    { path: '/driverbookhistory', name: 'Rides', icon: 'fas fa-car' },
    { path: '/driverwallet', name: 'Wallet', icon: 'fas fa-wallet' },
    { path: '/driverlocation', name: 'Map', icon: 'fas fa-map-marker-alt' },
    { path: '/driveraiassistant', name: 'AI', icon: 'fas fa-robot' },
    { path: '/driversupport', name: 'Support', icon: 'fas fa-headset' },
    { path: '/driversettings', name: 'Profile', icon: 'fas fa-user' },
  ];

  return (
    <div className="bottom-nav">
      {navItems.map((item) => (
        <Link
          key={item.path}
          href={item.path}
          className={`nav-item ${isActive(item.path, item.matchPaths) ? 'active' : ''}`}
        >
          <div className="nav-icon-wrapper">
            <i className={item.icon}></i>
          </div>
          <span>{item.name}</span>
        </Link>
      ))}
    </div>
  );
};

export default DriverNavMobile;