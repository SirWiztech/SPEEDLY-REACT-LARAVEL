import { router } from '@inertiajs/react';
import { useEffect } from 'react';

export default function Dashboard() {
    useEffect(() => { router.visit('/home'); }, []);
    return null;
}
