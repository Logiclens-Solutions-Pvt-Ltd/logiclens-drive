'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { logout } from '@/lib/auth';
import { useIsAuthenticated } from '@/lib/use-is-authenticated';
import { Search, LogOut, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes'; // Import added
import { useEffect, useState } from 'react';

export function Navbar() {
    const router = useRouter();
    const loggedIn = useIsAuthenticated();
    const { theme, setTheme } = useTheme(); // Hook added

    const handleLogout = () => {
        logout();
        router.push('/');
    };

    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    return (
        
        <header className="flex-shrink-0 h-16 bg-white dark:bg-[#2d2e30] border-b border-[#dadce0] dark:border-[#5f6368] flex items-center px-4 gap-4 z-50">
            {/* Left Section: Logo */}
            <div className="flex items-center gap-2 w-60 flex-shrink-0">
                <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                    <img 
                        src="/logo.png" 
                        alt="LogicLens Logo" 
                        className="h-8 w-8 object-contain"
                    />
                    <span className="font-display text-xl font-semibold text-[#202124] dark:text-[#e8eaed] hidden md:block">
                        LogicLens
                    </span>
                </Link>
            </div>

            {/* Center Section: Search Bar */}
            <div className="flex-1 max-w-[720px] mx-auto">
                <div 
                    className="flex items-center h-12 px-4 rounded-lg cursor-pointer bg-[#f1f3f4] dark:bg-[#3c4043] hover:bg-[#e8eaed] dark:hover:bg-[#4a4d51] hover:shadow-sm transition-colors transition-shadow"
                    onClick={() => router.push('/search')}
                >
                    <Search className="h-5 w-5 text-[#5f6368] dark:text-[#9aa0a6] mr-3 flex-shrink-0" />
                    <span className="text-sm text-[#5f6368] dark:text-[#9aa0a6] select-none">Search in LogicLens</span>
                </div>
            </div>

            {/* Right Section: Actions */}
            <div className="flex items-center gap-1 w-60 justify-end flex-shrink-0">
                {/* Dark Mode Toggle */}
                <button 
                    onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} 
                    className="p-2 rounded-full hover:bg-[#f1f3f4] dark:hover:bg-[#3c4043] transition-colors text-[#5f6368] dark:text-[#9aa0a6]"
                    title="Toggle theme"
                >
                    {mounted && (
                        theme === 'dark'
                            ? <Sun className="h-5 w-5" />
                            : <Moon className="h-5 w-5" />
                    )}
                </button>

                {loggedIn ? (
                    <button 
                        onClick={handleLogout} 
                        className="p-2 rounded-full hover:bg-[#f1f3f4] dark:hover:bg-[#3c4043] transition-colors text-[#5f6368] dark:text-[#9aa0a6]"
                        title="Log out"
                    >
                        <LogOut className="h-5 w-5" />
                    </button>
                ) : (
                    <Link 
                        href="/login" 
                        className="text-sm font-medium text-[#1a73e8] dark:text-[#8ab4f8] hover:bg-[#e8f0fe] dark:hover:bg-[#3c4043] px-4 py-2 rounded-lg transition-colors"
                    >
                        Log in
                    </Link>
                )}
            </div>
        </header>
    );
}