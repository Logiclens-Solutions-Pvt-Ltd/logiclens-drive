'use client';
import Link from 'next/link';
import Image from 'next/image';
import { Search, Settings, LogOut, LogIn } from 'lucide-react';
import { useIsAuthenticated } from '@/lib/use-is-authenticated';
import { logout } from '@/lib/auth';
import { useRouter } from 'next/navigation';

export function DriveTopBar() {
  const loggedIn = useIsAuthenticated();
  const router = useRouter();

  return (
    <header className="h-16 bg-[var(--drive-surface)] border-b border-[var(--drive-border)] flex items-center px-4 gap-4 flex-shrink-0 z-50">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2 w-64 flex-shrink-0 pl-2">
        <Image src="/logo.png" alt="Logo" width="32" height="32" className="object-contain" />
        <span className="font-semibold text-[#202124] hidden md:block">LogicLens DAM</span>
      </Link>

      {/* Centered Search Bar */}
      <div className="flex-1 max-w-2xl mx-auto">
        <div className="flex items-center bg-[var(--drive-bg)] hover:bg-[var(--drive-hover)] hover:shadow-sm rounded-lg px-4 h-12 border border-transparent focus-within:border-[var(--drive-border)] focus-within:bg-white focus-within:shadow-md transition-all">
          <Search className="h-5 w-5 text-[var(--drive-text-secondary)] mr-3" />
          <input 
            type="text" 
            placeholder="Search in LogicLens" 
            className="bg-transparent w-full outline-none text-sm text-[var(--drive-text)] placeholder:text-[var(--drive-text-secondary)]"
            onFocus={(e) => router.push('/search')} // Navigate to search page on click
          />
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2 w-64 justify-end">
        {loggedIn ? (
          <button 
            onClick={() => { logout(); router.push('/'); }}
            className="p-2 rounded-full hover:bg-[var(--drive-bg)] transition-colors text-[var(--drive-text-secondary)]"
            title="Log out"
          >
            <LogOut className="h-5 w-5" />
          </button>
        ) : (
          <Link href="/login" className="text-sm font-medium text-[var(--drive-blue)] hover:bg-[var(--accent)] px-4 py-2 rounded-lg transition-colors">
            Log in
          </Link>
        )}
      </div>
    </header>
  );
}