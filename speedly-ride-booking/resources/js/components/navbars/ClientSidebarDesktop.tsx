import { Link, usePage } from '@inertiajs/react';
import { Home, Car, History, Wallet, MapPin, Bot, Settings, LucideIcon } from 'lucide-react';
import { Icon } from '@/components/ui/icon';

interface DesktopNavItemProps {
    href: string;
    icon: LucideIcon;
    label: string;
    activePaths: string[];
}

function DesktopNavItem({ href, icon: IconComponent, label, activePaths }: DesktopNavItemProps) {
    const { url } = usePage();
    const isActive = activePaths.some(path => url.includes(path));

    return (
        <Link href={href} className={`desktop-nav-item ${isActive ? 'active' : ''}`}>
            <Icon iconNode={IconComponent} className="desktop-nav-icon" />
            <span>{label}</span>
        </Link>
    );
}

interface ClientSidebarDesktopProps {
    userName?: string;
}

export default function ClientSidebarDesktop({ userName = 'User' }: ClientSidebarDesktopProps) {
    return (
        <div className="desktop-sidebar">
            <div className="sidebar-header">
                <img src="/main-assets/logo.png" alt="Speedly" className="logo-image" />
                <h2>Speedly</h2>
            </div>

            <nav className="sidebar-nav">
                <div className="nav-section">
                    <div className="nav-section-title">Main</div>
                    <DesktopNavItem href="/client/dashboard" icon={Home} label="Dashboard" activePaths={['/client/dashboard']} />
                    <DesktopNavItem href="/client/book-ride" icon={Car} label="Book Ride" activePaths={['/client/book-ride']} />
                    <DesktopNavItem href="/client/ride-history" icon={History} label="Ride History" activePaths={['/client/ride-history']} />
                </div>

                <div className="nav-section">
                    <div className="nav-section-title">Account</div>
                    <DesktopNavItem href="/client/wallet" icon={Wallet} label="Wallet" activePaths={['/client/wallet']} />
                    <DesktopNavItem href="/client/location" icon={MapPin} label="Locations" activePaths={['/client/location']} />
                    <DesktopNavItem href="/client/ai-assistant" icon={Bot} label="AI Assistant" activePaths={['/client/ai-assistant']} />
                    <DesktopNavItem href="/client/settings" icon={Settings} label="Settings" activePaths={['/client/settings', '/client/profile', '/client/kyc']} />
                </div>
            </nav>

            <div className="user-profile">
                <div className="profile-avatar">
                    {userName.charAt(0).toUpperCase()}
                </div>
                <div className="profile-info">
                    <h3>{userName}</h3>
                    <p>Client Member</p>
                </div>
            </div>
        </div>
    );
}
