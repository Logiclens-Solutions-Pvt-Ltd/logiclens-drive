'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useRequireAuth } from '@/lib/use-auth';
import { Navbar } from '@/components/navbar';
import { DriveSidebar } from '@/components/drive-sidebar';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { RotateCcw, Trash2 } from 'lucide-react';
import { Footer } from '@/components/footer';

interface TrashedFile { id: string; name: string; title: string | null; deletedAt: string; product: { id: string, name: string }; }

export default function TrashPage() {
  const checked = useRequireAuth();
  const queryClient = useQueryClient();
  const { data: files, isLoading } = useQuery({
    queryKey: ['trash'], queryFn: async () => (await api.get<TrashedFile[]>('/files/trash')).data, enabled: checked,
  });
  const restoreMutation = useMutation({
    mutationFn: (fileId: string) => api.post(`/files/${fileId}/restore`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['trash'] }),
  });

  if (!checked) return null;

  return (
    <div className="flex flex-col h-full">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        <DriveSidebar />
        <main className="flex-1 overflow-y-auto px-6 md:px-8 py-6">
          <div className="max-w-5xl mx-auto flex flex-col min-h-full">
            <h1 className="text-2xl text-[#202124] dark:text-[#e8eaed] mb-6">Trash</h1>
            
            {isLoading && <div className="space-y-2">{[1,2,3].map(i=><Skeleton key={i} className="h-16 w-full rounded-lg bg-[#e8eaed] dark:bg-[#3c4043]" />)}</div>}

            <div className="bg-white dark:bg-[#2d2e30] rounded-lg border border-[#dadce0] dark:border-[#5f6368] divide-y divide-[#dadce0] dark:divide-[#5f6368] overflow-hidden flex-1">
              {files?.map((file) => (
                <div key={file.id} className="flex items-center justify-between p-4 hover:bg-[#f1f3f4] dark:hover:bg-[#3c4043] transition-colors">
                  <div className="min-w-0">
                    <p className="text-sm text-[#202124] dark:text-[#e8eaed] truncate">{file.title || file.name}</p>
                    <p className="text-xs text-[#5f6368] dark:text-[#9aa0a6]">Deleted {new Date(file.deletedAt).toLocaleDateString()}</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => restoreMutation.mutate(file.id)} className="text-[#1a73e8] dark:text-[#8ab4f8] border-[#1a73e8] dark:border-[#8ab4f8] hover:bg-[#e8f0fe] dark:hover:bg-[#394457]">
                    <RotateCcw className="h-4 w-4 mr-2" /> Restore
                  </Button>
                </div>
              ))}
              {files?.length === 0 && <p className="text-sm text-[#5f6368] dark:text-[#9aa0a6] text-center py-16">Trash is empty.</p>}
            </div>
            <Footer />
          </div>
        </main>
      </div>
    </div>
  );
}