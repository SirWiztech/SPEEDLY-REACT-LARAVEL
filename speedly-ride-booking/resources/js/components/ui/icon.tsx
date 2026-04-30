import type { LucideIcon as LucideIconType } from 'lucide-react';
import type { LucideProps } from 'lucide-react';

export interface IconProps extends LucideProps {
    iconNode: LucideIconType;
}

export function Icon({ iconNode: LucideIconComponent, ...props }: IconProps) {
    return <LucideIconComponent {...props} />;
}
