'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { PreviewDialog } from '@/components/preview-dialog';
import { Search, FolderOpen, FileText, Video, File, LogIn, ArrowLeft } from 'lucide-react';
import { Footer } from '@/components/footer';
import Link from 'next/link';

interface FileItem {
  id: string; name: string; title: string | null; mimeType: string; 
  isFolder: boolean; previewUrl?: string; driveRole?: string;
  category: { id: string; name: string } | null; 
  fileTags: { tag: { id: string; name: string } }[];
}

interface ProductData {
  product: any;
  id: string; name: string; description: string | null;
}

export default function SharedFolderPage() {
  const params = useParams<{ productId: string }>();
  const [query, setQuery] = useState('');
  const [previewFile, setPreviewFile] = useState<FileItem | null>(null);

  // Fetch Product Info
  const { data: productData, isLoading: isLoadingProduct } = useQuery({
    queryKey: ['guest-product', params.productId],
    queryFn: async () => (await api.get<ProductData>(`/guest/${params.productId}/files`)).data?.product,
    enabled: !!params.productId,
  });

  // Fetch Files (or Search if query exists)
  const { data: fetchedFiles, isLoading: isLoadingFiles } = useQuery({
    queryKey: ['guest-files', params.productId, query],
    queryFn: async () => {
      const endpoint = query 
        ? `/guest/${params.productId}/search?query=${query}` 
        : `/guest/${params.productId}/files`;
      const res = await api.get<{ files: FileItem[] }>(endpoint);
      return res.data.files;
    },
    enabled: !!params.productId,
  });

  const isLoading = isLoadingProduct || isLoadingFiles;

  // Sort logic: Folders first, then files (Alphabetical, just like Drive)
  const sortedFiles = fetchedFiles?.sort((a, b) => {
    if (a.isFolder && !b.isFolder) return -1;
    if (!a.isFolder && b.isFolder) return 1;
    return (a.title || a.name).localeCompare(b.title || b.name);
  });

  const getIcon = (file: FileItem) => {
    if (file.isFolder) return <FolderOpen className="h-5 w-5 text-[#5f6368] dark:text-[#9aa0a6]" />;
    if (file.mimeType.startsWith('image/')) return <FileText className="h-5 w-5 text-green-600 dark:text-green-400" />;
    if (file.mimeType.includes('pdf')) return <FileText className="h-5 w-5 text-red-500 dark:text-red-400" />;
    if (file.mimeType.startsWith('video/')) return <Video className="h-5 w-5 text-blue-500 dark:text-blue-400" />;
    return <File className="h-5 w-5 text-[#5f6368] dark:text-[#9aa0a6]" />;
  };

  const handlePreview = (file: FileItem) => {
    setPreviewFile(file);
  };

  return (
    <div className="flex flex-col h-full bg-[#f1f3f4] dark:bg-[#202124]">
      
      {/* Minimal Shared Folder Header */}
      <header className="flex-shrink-0 h-16 bg-white dark:bg-[#2d2e30] border-b border-[#dadce0] dark:border-[#5f6368] flex items-center justify-between px-6 z-50">
        <div className="flex items-center gap-4">
          <Link href="/" className="p-2 rounded-full hover:bg-[#f1f3f4] dark:hover:bg-[#3c4043] transition-colors">
            <ArrowLeft className="h-5 w-5 text-[#5f6368] dark:text-[#9aa0a6]" />
          </Link>
          <div>
            <h1 className="text-base font-medium text-[#202124] dark:text-[#e8eaed] truncate max-w-md">
              {isLoadingProduct ? 'Loading...' : productData?.name || 'Shared Folder'}
            </h1>
            <p className="text-xs text-[#5f6368] dark:text-[#9aa0a6]">Shared with you via LogicLens</p>
          </div>
        </div>
        
        <Link href="/login">
          <Button variant="outline" size="sm" className="text-[#1a73e8] dark:text-[#8ab4f8] border-[#dadce0] dark:border-[#5f6368] hover:bg-[#e8f0fe] dark:hover:bg-[#394457]">
            <LogIn className="h-4 w-4 mr-2" /> Log in for more
          </Button>
        </Link>
      </header>

      {/* Scrollable Content */}
      <main className="flex-1 overflow-y-auto px-6 md:px-8 py-6">
        <div className="max-w-4xl mx-auto flex flex-col min-h-full">
          
          {/* Local Search Bar (Searches ONLY inside this folder) */}
          <div className="max-w-xl mb-6">
            <div className="flex items-center bg-white dark:bg-[#2d2e30] border border-[#dadce0] dark:border-[#5f6368] rounded-lg px-4 h-12 focus-within:border-[#1a73e8] dark:focus-within:border-[#8ab4f8] focus-within:shadow-sm transition-all">
              <Search className="h-5 w-5 text-[#5f6368] dark:text-[#9aa0a6] mr-3" />
              <input 
                value={query} 
                onChange={(e) => setQuery(e.target.value)} 
                placeholder="Search inside this folder..." 
                className="bg-transparent w-full outline-none text-sm text-[#202124] dark:text-[#e8eaed]" 
                autoFocus 
              />
            </div>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="flex items-center gap-4 p-4 bg-white dark:bg-[#2d2e30] rounded-lg border border-[#dadce0] dark:border-[#5f6368]">
                  <Skeleton className="h-5 w-5 rounded bg-[#e8eaed] dark:bg-[#3c4043]" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-3/4 rounded bg-[#e8eaed] dark:bg-[#3c4043]" />
                    <Skeleton className="h-3 w-1/4 rounded bg-[#e8eaed] dark:bg-[#3c4043]" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty State for Search */}
          {sortedFiles && sortedFiles.length === 0 && query && (
            <div className="text-center py-16 bg-white dark:bg-[#2d2e30] rounded-lg border border-[#dadce0] dark:border-[#5f6368]">
              <p className="text-[#5f6368] dark:text-[#9aa0a6]">No results found for &quot;{query}&quot;</p>
            </div>
          )}

          {/* File/Folder List */}
          <div className="bg-white dark:bg-[#2d2e30] rounded-lg border border-[#dadce0] dark:border-[#5f6368] divide-y divide-[#dadce0] dark:divide-[#5f6368] overflow-hidden flex-1">
            {sortedFiles?.map((file) => (
              <div 
                key={file.id} 
                className="flex items-center justify-between px-4 py-3 hover:bg-[#f1f3f4] dark:hover:bg-[#3c4043] transition-colors cursor-pointer"
                onClick={() => !file.isFolder && handlePreview(file)}
              >
                <div className="flex items-center gap-4 min-w-0 flex-1">
                  <div className="flex-shrink-0">{getIcon(file)}</div>
                  <div className="min-w-0">
                    <p className="text-sm text-[#202124] dark:text-[#e8eaed] truncate">{file.title || file.name}</p>
                    {file.fileTags.length > 0 && (
                      <div className="flex gap-1 mt-1">
                        {file.fileTags.map(ft => (
                          <span key={ft.tag.id} className="text-[10px] px-1.5 py-0.5 bg-[#f1f3f4] dark:bg-[#3c4043] text-[#5f6368] dark:text-[#9aa0a6] rounded">
                            #{ft.tag.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Only show preview icon for actual files, not folders (in this read-only view) */}
                {!file.isFolder && (
                  <Button variant="ghost" size="sm" className="text-[#1a73e8] dark:text-[#8ab4f8] hover:bg-[#e8f0fe] dark:hover:bg-[#394457] opacity-0 group-hover:opacity-100">
                    Preview
                  </Button>
                )}
              </div>
            ))}
            
            {sortedFiles?.length === 0 && !isLoading && !query && (
              <p className="text-sm text-[#5f6368] dark:text-[#9aa0a6] text-center py-16">
                This folder is currently empty.
              </p>
            )}
          </div>

          <Footer />
        </div>
      </main>

      {/* Native Google Drive Preview Modal */}
      {previewFile && (
        <PreviewDialog 
          file={{ 
            id: previewFile.id, 
            name: previewFile.name, 
            mimeType: previewFile.mimeType, 
            previewUrl: previewFile.previewUrl || `${process.env.NEXT_PUBLIC_API_URL}/files/${previewFile.id}/preview`,
            role: 'reader' // Force reader badge for guests
          }} 
          open={!!previewFile} 
          onOpenChange={(open) => !open && setPreviewFile(null)} 
        />
      )}
    </div>
  );
}