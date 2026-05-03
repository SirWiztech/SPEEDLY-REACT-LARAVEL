import React from 'react';
import { Link } from '@inertiajs/react';
import { usePage } from '@inertiajs/react';
import '../../../css/NavBar.css';

interface ClientSidebarDesktopProps {
  userName: string;
  userRole?: string;
  profilePictureUrl?: string | null;
}

const ClientSidebarDesktop: React.FC<ClientSidebarDesktopProps> = ({
  userName = 'User',
  userRole = 'client',
  profilePictureUrl = null,
}) => {
  const { url } = usePage();
  const currentPath = url;

  const isActive = (path: string) => {
    return currentPath === path;
  };

  const navItems = [
    { path: '/client-dashboard', name: 'Dashboard', icon: 'fas fa-home' },
    { path: '/book-ride', name: 'Book Ride', icon: 'fas fa-car' },
    { path: '/ride-history', name: 'Ride History', icon: 'fas fa-history' },
    { path: '/wallet', name: 'Wallet', icon: 'fas fa-wallet' },
    { path: '/location', name: 'Locations', icon: 'fas fa-map-marker-alt' },
    { path: '/ai-assistant', name: 'AI Assistant', icon: 'fas fa-robot' },
    { path: '/settings', name: 'Settings', icon: 'fas fa-cog' },
  ];

  const getInitial = (name: string) => {
    return name.charAt(0).toUpperCase();
  };

  return (
    <div className="desktop-sidebar">
      <div className="logo">
        <img 
          src="/main-assets/logo-no-background.png" 
          alt="Speedly Logo" 
          className="logo-image"
        />
      </div>

      <div className="desktop-nav">
        {navItems.map((item) => (
          <Link
            key={item.path}
            href={item.path}
            className={`desktop-nav-item ${isActive(item.path) ? 'active' : ''}`}
          >
            <i className={`${item.icon} desktop-nav-icon`}></i>
            <span>{item.name}</span>
          </Link>
        ))}
      </div>

      <Link href="/client-profile" className="user-profile">
        <div className="profile-avatar">
          {profilePictureUrl ? (
            <img 
              src={profilePictureUrl} 
              alt={userName} 
            />
          ) : (
            getInitial(userName)
          )}
        </div>
        <div className="profile-info">
          <h3>{userName}</h3>
          <p>Client Member</p>
        </div>
      </Link>
    </div>
  );
};

export default ClientSidebarDesktop;