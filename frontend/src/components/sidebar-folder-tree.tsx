'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import { Product, FileItem } from '@/lib/types';
import { ChevronRight, Folder, FolderOpen, Loader2, HardDrive } from 'lucide-react';

export interface BreadcrumbEntry {
  id: string | null;
  name: string;
}

// Persist the exact path the user clicked in the sidebar so the product
// detail page can restore the full breadcrumb trail, even on a fresh
// navigation from a different page (e.g. Home -> a nested folder).
export function saveSidebarBreadcrumbPath(productId: string, path: BreadcrumbEntry[]) {
  try {
    sessionStorage.setItem(`breadcrumb-path:${productId}`, JSON.stringify(path));
  } catch {
    // sessionStorage can fail (e.g. private browsing); navigation still works fine without it.
  }
}

interface FolderNodeProps {
  productId: string;
  folderId: string | null; // null = the product's root
  name: string;
  depth: number;
  path: BreadcrumbEntry[]; // full breadcrumb trail up to and including this node
  isProductRoot?: boolean;
}

function FolderNode({ productId, folderId, name, depth, path, isProductRoot }: FolderNodeProps) {
  const [expanded, setExpanded] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const isActive =
    pathname === `/products/${productId}` && (searchParams.get('folder') || null) === folderId;

  const { data: children, isLoading, isError } = useQuery({
    queryKey: ['sidebar-folders', productId, folderId],
    queryFn: async () =>
      (
        await api.get<FileItem[]>(`/products/${productId}/files?parentId=${folderId || ''}`)
      ).data.filter((f) => f.isFolder),
    enabled: expanded,
    staleTime: 60 * 1000,
  });

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setExpanded((prev) => !prev);
  };

  const handleNavigate = () => {
    saveSidebarBreadcrumbPath(productId, path);
    const url = folderId ? `/products/${productId}?folder=${folderId}` : `/products/${productId}`;

    if(pathname === `/products/${productId}`){
      window.history.pushState({}, '', url);
      window.dispatchEvent(new CustomEvent('folder-navigate', { detail: folderId }));
    } else{
      router.push(url);
    }
    
    setExpanded(true);
  };

  return (
    <div>
      <div
        onClick={handleNavigate}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
        className={`group flex items-center gap-1 py-1.5 pr-3 text-sm rounded-r-lg mx-2 cursor-pointer transition-colors ${
          isActive
            ? 'bg-[#e8f0fe] dark:bg-[#394457] text-[#1a73e8] dark:text-[#8ab4f8] font-medium'
            : 'text-[#5f6368] dark:text-[#9aa0a6] hover:bg-[#e8eaed] dark:hover:bg-[#3c4043]'
        }`}
      >
        <button
          onClick={handleToggle}
          className="p-0.5 rounded flex-shrink-0 hover:bg-black/10 dark:hover:bg-white/10"
          aria-label={expanded ? 'Collapse folder' : 'Expand folder'}
        >
          {isLoading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <ChevronRight
              className={`h-3.5 w-3.5 transition-transform ${expanded ? 'rotate-90' : ''}`}
            />
          )}
        </button>

        {isProductRoot ? (
          <HardDrive className="h-4 w-4 flex-shrink-0" />
        ) : isActive || expanded ? (
          <FolderOpen className="h-4 w-4 flex-shrink-0" />
        ) : (
          <Folder className="h-4 w-4 flex-shrink-0" />
        )}

        <span className="truncate">{name}</span>
      </div>

      {expanded && (
        <div>
          {isError && (
            <p
              style={{ paddingLeft: `${(depth + 1) * 16 + 8}px` }}
              className="text-xs text-[#d93025] py-1"
            >
              Couldn&apos;t load subfolders
            </p>
          )}

          {children && children.length === 0 && !isError && (
            <p
              style={{ paddingLeft: `${(depth + 1) * 16 + 8}px` }}
              className="text-xs text-[#9aa0a6] dark:text-[#5f6368] py-1"
            >
              No subfolders
            </p>
          )}

          {children?.map((child) => {
            const childName = child.title || child.name;
            return (
              <FolderNode
                key={child.id}
                productId={productId}
                folderId={child.id}
                name={childName}
                depth={depth + 1}
                path={[...path, { id: child.id, name: childName }]}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

export function SidebarFolderTree() {
  const { data: products, isLoading } = useQuery({
    queryKey: ['sidebar-products'],
    queryFn: async () => (await api.get<Product[]>('/products')).data,
    staleTime: 60 * 1000,
  });

  if (isLoading) {
    return <p className="px-8 text-xs text-[#9aa0a6] dark:text-[#5f6368] py-2">Loading folders...</p>;
  }

  if (!products || products.length === 0) {
    return <p className="px-8 text-xs text-[#9aa0a6] dark:text-[#5f6368] py-2">No folders yet</p>;
  }

  return (
    <div className="mt-1 mb-2">
      {products.map((product) => (
        <FolderNode
          key={product.id}
          productId={product.id}
          folderId={null}
          name={product.name}
          depth={0}
          path={[{ id: null, name: 'Root' }]}
          isProductRoot
        />
      ))}
    </div>
  );
}
