import React from 'react';
import { Link } from '@inertiajs/react';
import { usePage } from '@inertiajs/react';
import '../../../css/NavBar.css';

interface ClientNavMobileProps {}

const ClientNavMobile: React.FC<ClientNavMobileProps> = () => {
  const { url } = usePage();
  const currentPath = url;

  const getPath = (url: string) => {
    // Strip query string and trailing slash for clean comparison
    return url.split('?')[0].replace(/\/$/, '');
  };

  const cleanPath = getPath(currentPath);

  const isActive = (path: string, matchPaths?: string[]): boolean => {
    const exact = getPath(path);
    if (cleanPath === exact) return true;
    if (matchPaths && matchPaths.some(p => cleanPath === getPath(p))) return true;
    // For nested/parameterized routes, check if cleanPath starts with the nav path
    if (cleanPath.startsWith(exact)) return true;
    return false;
  };

  const navItems = [
    { path: '/clientdashboard', name: 'Home', icon: 'fas fa-home' },
    { path: '/clientbookride', name: 'Rides', icon: 'fas fa-car' },
    { path: '/clientwallet', name: 'Wallet', icon: 'fas fa-wallet' },
    { path: '/clientlocation', name: 'Map', icon: 'fas fa-map-marker-alt' },
    { path: '/clientaiassistant', name: 'AI', icon: 'fas fa-robot' },
    { path: '/clientsupport', name: 'Support', icon: 'fas fa-headset' },
    { path: '/clientsettings', name: 'Profile', icon: 'fas fa-user' },
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

export default ClientNavMobile;