import React from 'react';
import { Link } from '@inertiajs/react';
import { usePage } from '@inertiajs/react';
import '../../../css/NavBar.css';

interface ClientNavMobileProps {}

const ClientNavMobile: React.FC<ClientNavMobileProps> = () => {
  const { url } = usePage();
  const currentPath = url;

  const isActive = (path: string, matchPaths?: string[]): boolean => {
    if (currentPath === path) return true;
    if (matchPaths && matchPaths.some(p => currentPath === p)) return true;
    // For nested routes like /settings/*, check if path is a prefix
    if (path !== '/client-dashboard' && currentPath.startsWith(path)) {
      return true;
    }
    return false;
  };

  const navItems = [
    { path: '/client-dashboard', name: 'Home', icon: 'fas fa-home', matchPaths: ['/client-dashboard'] },
    { path: '/book-ride', name: 'Rides', icon: 'fas fa-car', matchPaths: ['/book-ride'] },
    { path: '/wallet', name: 'Wallet', icon: 'fas fa-wallet', matchPaths: ['/wallet'] },
    { path: '/location', name: 'Map', icon: 'fas fa-map-marker-alt', matchPaths: ['/location'] },
    { path: '/ai-assistant', name: 'AI', icon: 'fas fa-robot', matchPaths: ['/ai-assistant'] },
    { path: '/settings', name: 'Profile', icon: 'fas fa-user', matchPaths: ['/client-profile', '/settings'] },
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