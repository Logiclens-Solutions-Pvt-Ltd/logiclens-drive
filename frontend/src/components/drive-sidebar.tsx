'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useIsAuthenticated } from '@/lib/use-is-authenticated';
import { Home, Search, Settings, Trash2 } from 'lucide-react';
import { SidebarFolderTree } from '@/components/sidebar-folder-tree';

export function DriveSidebar() {
  const loggedIn = useIsAuthenticated();
  const pathname = usePathname();

  const linkClass = (path: string) => 
    `flex items-center gap-4 px-8 py-2.5 text-sm rounded-r-lg mx-2 transition-colors ${
      pathname === path 
        ? 'bg-[#e8f0fe] dark:bg-[#394457] text-[#1a73e8] dark:text-[#8ab4f8] font-medium' 
        : 'text-[#5f6368] dark:text-[#9aa0a6] hover:bg-[#e8eaed] dark:hover:bg-[#3c4043]'
    }`;

  return (
    // Added dark mode background and border colors
    <aside className="w-64 bg-white dark:bg-[#2d2e30] border-r border-[#dadce0] dark:border-[#5f6368] flex-shrink-0 pt-2 hidden md:block overflow-y-auto">
      <Link href="/" className={linkClass('/')}>
        <Home className="h-5 w-5" /> Home
      </Link>
      <Link href="/search" className={linkClass('/search')}>
        <Search className="h-5 w-5" /> Search
      </Link>

      <div className="h-px bg-[#dadce0] dark:bg-[#5f6368] mx-4 my-3"></div>
      <p className="px-8 text-xs font-medium text-[#5f6368] dark:text-[#9aa0a6] uppercase tracking-wider mb-1">Folders</p>
      <SidebarFolderTree />
      
      {loggedIn && (
        <>
          <div className="h-px bg-[#dadce0] dark:bg-[#5f6368] mx-4 my-3"></div>
          <p className="px-8 text-xs font-medium text-[#5f6368] dark:text-[#9aa0a6] uppercase tracking-wider mb-2">Management</p>
          
          <Link href="/admin" className={linkClass('/admin')}>
            <Settings className="h-5 w-5" /> Admin
          </Link>
          <Link href="/trash" className={linkClass('/trash')}>
            <Trash2 className="h-5 w-5" /> Trash
          </Link>
        </>
      )}
    </aside>
  );
}