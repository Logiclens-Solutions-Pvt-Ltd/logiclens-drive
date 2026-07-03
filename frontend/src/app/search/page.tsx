'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useRequireAuth } from '@/lib/use-auth';
import { Navbar } from '@/components/navbar';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Download } from 'lucide-react';

interface Category { id: string; name: string; }
interface Tag { id: string; name: string; }
interface FileResult {
  id: string;
  name: string;
  title: string | null;
  mimeType: string;
  category: Category | null;
  fileTags: { tag: Tag }[];
  product: { id: string; name: string };
}

export default function SearchPage() {
  const checked = useRequireAuth();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const [tag, setTag] = useState('');

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => (await api.get<Category[]>('/categories')).data,
    enabled: checked,
  });

  const { data: tags } = useQuery({
    queryKey: ['tags'],
    queryFn: async () => (await api.get<Tag[]>('/tags')).data,
    enabled: checked,
  });

  const { data: results, isLoading } = useQuery({
    queryKey: ['file-search', query, category, tag],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (query) params.set('query', query);
      if (category) params.set('category', category);
      if (tag) params.set('tag', tag);
      return (await api.get<FileResult[]>(`/files/search?${params.toString()}`)).data;
    },
    enabled: checked,
  });

  if (!checked) return null;

  return (
    <div>
      <Navbar />
      <main className="p-6 max-w-5xl mx-auto">
        <h1 className="text-xl font-semibold mb-4">Search Files</h1>

        <div className="flex flex-wrap gap-3 mb-6">
          <Input
            placeholder="Search by file name..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="max-w-xs"
          />

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="border rounded-md px-3 py-2 text-sm"
          >
            <option value="">All categories</option>
            {categories?.map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}
          </select>

          <select
            value={tag}
            onChange={(e) => setTag(e.target.value)}
            className="border rounded-md px-3 py-2 text-sm"
          >
            <option value="">All tags</option>
            {tags?.map((t) => <option key={t.id} value={t.name}>{t.name}</option>)}
          </select>
        </div>

        {isLoading && <p className="text-neutral-500">Searching...</p>}
        {results && results.length === 0 && <p className="text-neutral-500">No files match your search.</p>}

        <div className="space-y-2">
          {results?.map((file) => (
            <Card key={file.id}>
              <CardHeader className="flex-row items-center justify-between space-y-0">
                <div>
                  <CardTitle className="text-base">{file.title || file.name}</CardTitle>
                  <div className="flex gap-1 mt-1 flex-wrap">
                    <Badge variant="secondary">{file.product.name}</Badge>
                    {file.category && <Badge variant="outline">{file.category.name}</Badge>}
                    {file.fileTags.map((ft) => (
                      <Badge key={ft.tag.id} variant="outline">#{ft.tag.name}</Badge>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="icon" variant="ghost" onClick={() => window.open(`${process.env.NEXT_PUBLIC_API_URL}/files/${file.id}/preview`, '_blank')}>
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="ghost" onClick={() => window.open(`${process.env.NEXT_PUBLIC_API_URL}/files/${file.id}/download`, '_blank')}>
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}