'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api';
import { useRequireAuth } from '@/lib/use-auth';
import { Navbar } from '@/components/navbar';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Eye, Download, ExternalLink } from 'lucide-react';
import { useState } from 'react';
import { EditFileDialog } from '@/components/edit-file-dialog';
import { Pencil, Trash2 } from 'lucide-react';

interface FileItem {
    id: string;
    name: string;
    title: string | null;
    description: string | null;
    remarks: string | null;
    visibility: 'PUBLIC' | 'PRIVATE';
    mimeType: string;
    category: {id: string; name: string} | null;
    fileTags: {tag : {id: string; name: string}}[];
}

export default function ProductDetailPage(){
    const checked = useRequireAuth();
    const params = useParams<{id: string }>();
    const [editingFile, setEditingFile] = useState<FileItem | null>(null);

    
    const { data: product } = useQuery({
        queryKey: ['product', params.id],
        queryFn: async () => (await api.get(`/products/${params.id}`)).data,
        enabled: checked,
    });

    const {data: files, isLoading } = useQuery({
        queryKey: ['product-files', params.id],
        queryFn: async () => (await api.get<FileItem[]>(`products/${params.id}/files`)).data,
        enabled: checked,
    })

    const queryClient = useQueryClient();
    const deleteMutation = useMutation({
        mutationFn: (fileId: string) => api.delete(`/files/${fileId}`),
        onSuccess: () => queryClient.invalidateQueries({queryKey : ['product-files', params.id]}),
    });


    if(!checked) return null;

    return (
        <div>
            <Navbar />
            <main className="p-6 max-w-5xl mx-auto">
                <h1 className="text-xl font-semibold mb-1">{product?.name}</h1>
                <p className="text-neutral-500 mb-6">{product?.description}</p>

                {isLoading && (
                <div className="space-y-2">
                    {[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 rounded-lg" />)}
                </div>
                )}

                {files && files.length === 0 && (
                <p className="text-neutral-500">No files found in this product&apos;s Drive folder yet.</p>
                )}

                <div className="space-y-2">
                {files?.map((file) => (
                    <Card key={file.id}>
                     <CardHeader className="flex-row items-center justify-between space-y-0">
                        <div>
                        <CardTitle className="text-base">{file.title || file.name}</CardTitle>
                        <Badge variant="secondary" className="mt-1">{file.mimeType}</Badge>
                        </div>
                        <div className="flex gap-2">
                        <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => window.open(`${process.env.NEXT_PUBLIC_API_URL}/files/${file.id}/preview`, '_blank')}
                            title="Preview"
                        >
                            <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => window.open(`${process.env.NEXT_PUBLIC_API_URL}/files/${file.id}/download`, '_blank')}
                            title="Download"
                        >
                            <Download className="h-4 w-4" />
                        </Button>
                                <Button size="icon" variant="ghost" onClick={() => setEditingFile(file)}>
                            <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => deleteMutation.mutate(file.id)}
                            title="Move to trash"
                        >
                            <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                        </div>
                    </CardHeader>
                    </Card>
                ))}
                </div>
            </main>
            {editingFile && (
                <EditFileDialog
                    fileId={editingFile.id}
                    open={!!editingFile}
                    onOpenChange={(open) => !open && setEditingFile(null)}
                    initial={{
                        title: editingFile.title,
                        description: editingFile.description,
                        remarks: editingFile.remarks,
                        visibility: 'PUBLIC',
                        categoryId: editingFile.category?.id || null,
                        tagIds: editingFile.fileTags.map((ft) => ft.tag.id),
                    }}
                />
            )}
        </div>
    );
}
