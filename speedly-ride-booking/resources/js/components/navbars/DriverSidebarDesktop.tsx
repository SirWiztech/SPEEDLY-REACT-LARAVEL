import { Link, usePage } from '@inertiajs/react';
import { Home, History, Wallet, MapPin, IdCard, Bot, Settings, LucideIcon } from 'lucide-react';
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

interface DriverSidebarDesktopProps {
    userName?: string;
}

export default function DriverSidebarDesktop({ userName = 'Driver' }: DriverSidebarDesktopProps) {
    return (
        <div className="desktop-sidebar">
            <div className="sidebar-header">
                <img src="/main-assets/logo.png" alt="Speedly" className="logo-image" />
                <h2>Speedly</h2>
            </div>

            <nav className="sidebar-nav">
                <div className="nav-section">
                    <div className="nav-section-title">Main</div>
                    <DesktopNavItem href="/driver/dashboard" icon={Home} label="Dashboard" activePaths={['/driver/dashboard']} />
                    <DesktopNavItem href="/driver/book-history" icon={History} label="Book History" activePaths={['/driver/book-history']} />
                    <DesktopNavItem href="/driver/wallet" icon={Wallet} label="Wallet" activePaths={['/driver/wallet']} />
                </div>

                <div className="nav-section">
                    <div className="nav-section-title">Account</div>
                    <DesktopNavItem href="/driver/location" icon={MapPin} label="Locations" activePaths={['/driver/location']} />
                    <DesktopNavItem href="/driver/kyc" icon={IdCard} label="KYC" activePaths={['/driver/kyc']} />
                    <DesktopNavItem href="/driver/ai-assistant" icon={Bot} label="AI Assistant" activePaths={['/driver/ai-assistant']} />
                    <DesktopNavItem href="/driver/settings" icon={Settings} label="Settings" activePaths={['/driver/settings', '/driver/profile']} />
                </div>
            </nav>

            <div className="user-profile">
                <div className="profile-avatar">
                    {userName.charAt(0).toUpperCase()}
                </div>
                <div className="profile-info">
                    <h3>{userName}</h3>
                    <p>Driver Member</p>
                </div>
            </div>
        </div>
    );
}
