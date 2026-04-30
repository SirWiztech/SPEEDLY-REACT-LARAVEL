import { Link, usePage } from '@inertiajs/react';
import { Home, Car, Wallet, MapPin, Bot, User, LucideIcon } from 'lucide-react';
import { Icon } from '@/components/ui/icon';

interface NavItemProps {
    href: string;
    icon: LucideIcon;
    label: string;
    activePaths: string[];
}

function NavItem({ href, icon: IconComponent, label, activePaths }: NavItemProps) {
    const { url } = usePage();
    const isActive = activePaths.some(path => url.includes(path));

    return (
        <Link href={href} className={`nav-item ${isActive ? 'active' : ''}`}>
            <div className="nav-icon-wrapper">
                <Icon iconNode={IconComponent} className="nav-icon" />
            </div>
            <span>{label}</span>
        </Link>
    );
}

export default function DriverNavMobile() {
    return (
        <div className="bottom-nav">
            <NavItem href="/driver/dashboard" icon={Home} label="Home" activePaths={['/driver/dashboard']} />
            <NavItem href="/driver/book-history" icon={Car} label="Rides" activePaths={['/driver/book-history', '/driver/book-ride']} />
            <NavItem href="/driver/wallet" icon={Wallet} label="Wallet" activePaths={['/driver/wallet']} />
            <NavItem href="/driver/location" icon={MapPin} label="Map" activePaths={['/driver/location']} />
            <NavItem href="/driver/ai-assistant" icon={Bot} label="AI" activePaths={['/driver/ai-assistant']} />
            <NavItem href="/driver/settings" icon={User} label="Profile" activePaths={['/driver/settings', '/driver/profile', '/driver/kyc']} />
        </div>
    );
}
