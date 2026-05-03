import React from 'react';
import { Link } from '@inertiajs/react';
import { usePage } from '@inertiajs/react';
import '../../../css/NavBar.css';

interface DriverNavMobileProps {
}

const DriverNavMobile: React.FC<DriverNavMobileProps> = () => {
  const { url } = usePage();
  const currentPath = url;

  const isActive = (path: string, alternativePaths: string[] = []) => {
    if (currentPath === path) return true;
    return alternativePaths.some(altPath => currentPath === altPath);
  };

  const navItems = [
    { path: '/driver-dashboard', name: 'Home', icon: 'fas fa-home', matchPaths: ['/driver-dashboard'] },
    { path: '/book-history', name: 'Rides', icon: 'fas fa-car', matchPaths: ['/book-history', '/book-ride'] },
    { path: '/driver-wallet', name: 'Wallet', icon: 'fas fa-wallet', matchPaths: ['/driver-wallet'] },
    { path: '/driver-location', name: 'Map', icon: 'fas fa-map-marker-alt', matchPaths: ['/driver-location'] },
    { path: '/driver-ai-assistant', name: 'AI', icon: 'fas fa-robot', matchPaths: ['/driver-ai-assistant'] },
    { path: '/driver-settings', name: 'Profile', icon: 'fas fa-user', matchPaths: ['/driver-settings', '/driver-profile', '/kyc'] },
  ];

  return (
    <div className="bottom-nav">
      {navItems.map((item) => (
        <Link
          key={item.path}
          to={item.path}
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