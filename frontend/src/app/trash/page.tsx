'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useRequireAuth } from '@/lib/use-auth';
import { Navbar } from '@/components/navbar';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RotateCcw } from 'lucide-react';

interface TrashedFile{
    id: string;
    name: string;
    title: string | null;
    deletedAt: string;
    product: { id: string, name: string };
}

export default function TrashPage() {
  const checked = useRequireAuth();
  const queryClient = useQueryClient();

  const { data: files, isLoading } = useQuery({
    queryKey: ['trash'],
    queryFn: async () => (await api.get<TrashedFile[]>('/files/trash')).data,
    enabled: checked,
  });

  const restoreMutation = useMutation({
    mutationFn: (fileId: string) => api.post(`/files/${fileId}/restore`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['trash'] }),
  });

  if (!checked) return null;

  return (
    <div>
      <Navbar />
      <main className="p-6 max-w-3xl mx-auto">
        <h1 className="text-xl font-semibold mb-4">Recycle Bin</h1>

        {isLoading && <p className="text-neutral-500">Loading...</p>}
        {files && files.length === 0 && <p className="text-neutral-500">Trash is empty.</p>}

        <div className="space-y-2">
          {files?.map((file) => (
            <Card key={file.id}>
              <CardHeader className="flex-row items-center justify-between space-y-0">
                <div>
                  <CardTitle className="text-base">{file.title || file.name}</CardTitle>
                  <div className="flex gap-2 mt-1 items-center">
                    <Badge variant="secondary">{file.product.name}</Badge>
                    <span className="text-xs text-neutral-500">
                      Deleted {new Date(file.deletedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <Button size="sm" variant="outline" onClick={() => restoreMutation.mutate(file.id)}>
                  <RotateCcw className="h-4 w-4 mr-1" /> Restore
                </Button>
              </CardHeader>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}