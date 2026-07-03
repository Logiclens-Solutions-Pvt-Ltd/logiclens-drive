'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { logout } from '@/lib/auth';

export function Navbar(){
    const router = useRouter();

    const handleLogout = () => {
        logout();
        router.push('/login');
    };

    return (
        <nav className="flex items-center justify-between border-b px-6 py-3">
            <Link href="/" className = "font-semibold">DAM System</Link>
            <Link href="/search" className="text-sm text-neutral-600 hover:text-neutral-900">Search</Link>
            <Link href="/admin" className="text-sm text-neutral-600 hover:text-neutral-900">Admin</Link>
            <Link href="/trash" className="text-sm text-neutral-600 hover:text-neutral-900">Trash</Link>
            <button onClick={handleLogout} className="text-sm text-neutral-600 hover:text-neutral-900">
            Log out
            </button>
        </nav>
    );
}