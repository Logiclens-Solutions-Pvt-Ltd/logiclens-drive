'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Navbar } from '@/components/navbar';
import { DriveSidebar } from '@/components/drive-sidebar';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from "@/components/ui/button";
import { Search, Eye, Download, FileText, Video, File } from 'lucide-react';
import { Footer } from '@/components/footer';

interface FileResult { id: string; name: string; title: string | null; mimeType: string; category: { id: string; name: string } | null; fileTags: { tag: { id: string; name: string } }[]; product: { id: string; name: string }; }

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const { data: results, isLoading } = useQuery({
    queryKey: ['file-search', query],
    queryFn: async () => (await api.get<FileResult[]>(`/files/search?query=${query}`)).data,
    enabled: query.length > 2,
  });

  const getFileIcon = (mimeType: string) => {
     if (mimeType.startsWith('image/')) return <FileText className="h-5 w-5 text-green-600 dark:text-green-400" />;
     if (mimeType.includes('pdf')) return <FileText className="h-5 w-5 text-red-500 dark:text-red-400" />;
     if (mimeType.startsWith('video/')) return <Video className="h-5 w-5 text-blue-500 dark:text-blue-400" />;
     return <File className="h-5 w-5 text-[#5f6368] dark:text-[#9aa0a6]" />;
  };

  return (
    <div className="flex flex-col h-full">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        <DriveSidebar />
        <main className="flex-1 overflow-y-auto px-6 md:px-8 py-6">
          <div className="max-w-4xl mx-auto flex flex-col min-h-full">
            <h1 className="text-2xl text-[#202124] dark:text-[#e8eaed] mb-6">Search</h1>
            <div className="max-w-2xl mb-8">
              <div className="flex items-center bg-white dark:bg-[#2d2e30] border border-[#dadce0] dark:border-[#5f6368] rounded-lg px-4 h-12 focus-within:border-[#1a73e8] dark:focus-within:border-[#8ab4f8] focus-within:shadow-sm transition-all">
                <Search className="h-5 w-5 text-[#5f6368] dark:text-[#9aa0a6] mr-3" />
                <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Type at least 3 characters..." className="bg-transparent w-full outline-none text-sm text-[#202124] dark:text-[#e8eaed]" autoFocus />
              </div>
            </div>

            {isLoading && <div className="space-y-2">{[1,2,3].map(i=><Skeleton key={i} className="h-16 w-full rounded-lg bg-[#e8eaed] dark:bg-[#3c4043]" />)}</div>}
            {results && results.length === 0 && <p className="text-[#5f6368] dark:text-[#9aa0a6]">No results found.</p>}

            <div className="bg-white dark:bg-[#2d2e30] rounded-lg border border-[#dadce0] dark:border-[#5f6368] divide-y divide-[#dadce0] dark:divide-[#5f6368] overflow-hidden flex-1">
              {results?.map((file) => {
                const previewUrl = `${process.env.NEXT_PUBLIC_API_URL}/files/${file.id}/preview-url`;
                return (
                  <div key={file.id} className="flex items-center justify-between p-4 hover:bg-[#f1f3f4] dark:hover:bg-[#3c4043] transition-colors">
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="flex-shrink-0">{getFileIcon(file.mimeType)}</div>
                      <div className="min-w-0">
                        <p className="text-sm text-[#202124] dark:text-[#e8eaed] truncate">{file.title || file.name}</p>
                        <p className="text-xs text-[#5f6368] dark:text-[#9aa0a6]">in {file.product.name}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Button variant="ghost" size="icon" onClick={() => window.open(`${process.env.NEXT_PUBLIC_API_URL}/files/${file.id}/preview`, '_blank')}><Eye className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => window.open(`${process.env.NEXT_PUBLIC_API_URL}/files/${file.id}/download`, '_blank')}><Download className="h-4 w-4" /></Button>
                    </div>
                  </div>
                );
              })}
            </div>
            <Footer />
          </div>
        </main>
      </div>
    </div>
  );
}