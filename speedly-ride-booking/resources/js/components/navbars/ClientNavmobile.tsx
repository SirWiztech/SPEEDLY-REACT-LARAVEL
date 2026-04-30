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

export default function ClientNavmobile() {
    return (
        <div className="bottom-nav">
            <NavItem href="/client/dashboard" icon={Home} label="Home" activePaths={['/client/dashboard']} />
            <NavItem href="/client/book-ride" icon={Car} label="Rides" activePaths={['/client/book-ride']} />
            <NavItem href="/client/wallet" icon={Wallet} label="Wallet" activePaths={['/client/wallet']} />
            <NavItem href="/client/location" icon={MapPin} label="Map" activePaths={['/client/location']} />
            <NavItem href="/client/ai-assistant" icon={Bot} label="AI" activePaths={['/client/ai-assistant']} />
            <NavItem href="/client/settings" icon={User} label="Profile" activePaths={['/client/settings', '/client/profile', '/client/kyc']} />
        </div>
    );
}
