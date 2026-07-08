'use client';

import { useState, useEffect } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

interface Category { id: string, name: string }
interface Tag { id: string, name: string }

interface EditFileDialaogProps {
    fileId: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    initial: {
        title: string | null;
        description: string | null;
        remarks: string | null;
        visibility: 'PUBLIC' | 'PRIVATE';
        categoryId: string | null;
        tagIds: string[];
    };
}

export function EditFileDialog({fileId, open, onOpenChange, initial}: EditFileDialaogProps){
    const queryClient = useQueryClient();

    const [ title, setTitle ]  = useState(initial.title || '');
    const [ description, setDescription ] = useState(initial.description || '');
    const [ remarks, setRemarks] = useState(initial.remarks || '');
    const [ visibility, setVisibility] = useState(initial.visibility);
    const [ categoryId, setCategoryId ] = useState(initial.categoryId || '');
    const [ tagIds, setTagIds ] = useState<string[]>(initial.tagIds);

    useEffect( () => {
        setTitle(initial.title || '');
        setDescription(initial.description || '');
        setRemarks(initial.remarks || '');
        setVisibility(initial.visibility);
        setCategoryId(initial.categoryId || '');
        setTagIds(initial.tagIds);
    }, [initial]);

    const {data: categories} = useQuery({
        queryKey: ['categories'],
        queryFn: async () => (await api.get<Category[]>('/categories')).data,
    });

    const {data: tags} = useQuery({
        queryKey: ['tags'],
        queryFn: async () => (await api.get<Tag[]>('/tags')).data,
    });

    const mutation = useMutation({
        mutationFn: async () =>
            api.patch(`/files/${fileId}`, {
                title: title || undefined,
                description: description || undefined,
                remarks: remarks || undefined,
                visibility,
                categoryId: categoryId || undefined,
                tagIds, 
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['product-files']});
            queryClient.invalidateQueries({queryKey: ['file-search']});
            onOpenChange(false);
        },
    });

    const toggleTag = (id: string) => {
        setTagIds((prev) => (prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]));
    };

    return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl w-[50vw]">
        <DialogHeader>
          <DialogTitle>Edit File Metadata</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <div>
            <Label>Title</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>

          <div>
            <Label>Description</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>

          <div>
            <Label>Remarks</Label>
            <Textarea value={remarks} onChange={(e) => setRemarks(e.target.value)} />
          </div>

          <div>
            <Label>Category</Label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full border rounded-md px-3 py-2 text-sm"
            >
              <option value="">None</option>
              {categories?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          <div>
            <Label>Tags</Label>
            <div className="flex flex-wrap gap-3 mt-1">
              {tags?.map((t) => (
                <label key={t.id} className="flex items-center gap-1 text-sm">
                  <Checkbox checked={tagIds.includes(t.id)} onCheckedChange={() => toggleTag(t.id)} />
                  {t.name}
                </label>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              checked={visibility === 'PRIVATE'}
              onCheckedChange={(checked) => setVisibility(checked ? 'PRIVATE' : 'PUBLIC')}
            />
            <Label>Private (hidden from guests)</Label>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={() => mutation.mutate()} disabled={mutation.isPending}>
            {mutation.isPending ? 'Saving...' : 'Save changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

}