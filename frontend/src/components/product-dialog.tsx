'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { productSchema, ProductFormValues } from '@/lib/schemas/product';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2, Link2, FolderLock } from 'lucide-react';

interface ProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  existing?: { id: string; name: string; description: string | null; driveFolderLink?: string; driveFolderId?: string };
}

export function ProductDialog({ open, onOpenChange, existing }: ProductDialogProps) {
  const queryClient = useQueryClient();
  const isEditing = !!existing;

  // Construct the visual value for the input (shows link if editing)
  const displayLink = isEditing 
    ? (existing?.driveFolderLink || `https://drive.google.com/drive/folders/${existing?.driveFolderId}` || '') 
    : '';

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    values: existing
      ? { 
          name: existing.name, 
          description: existing.description || '', 
          driveFolderLink: displayLink
        }
      : { name: '', description: '', driveFolderLink: '' },
  });

  const mutation = useMutation({
    mutationFn: (values: ProductFormValues) =>
      isEditing ? api.patch(`/products/${existing.id}`, values) : api.post('/products', values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      reset();
      onOpenChange(false);
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* Drive Style Dialog: No thick border, rounded bottom corners */}
      <DialogContent className="sm:max-w-[500px] p-0 gap-0 bg-white rounded-2xl shadow-2xl border-[#dadce0] overflow-hidden">
        
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle className="text-[#202124] text-xl font-normal">
            {isEditing ? 'Edit folder details' : 'New folder'}
          </DialogTitle>
          <DialogDescription className="text-[#5f6368] text-sm">
            {isEditing ? 'Update the name or description.' : 'Add a Google Drive folder to start syncing assets.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit((values) => mutation.mutate(values))} className="px-6 pb-6 space-y-5">
          
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm text-[#202124] font-medium">Folder Name</Label>
            <Input 
              id="name"
              placeholder="e.g., Marketing Assets Q4"
              {...register('name')} 
              className="h-12 border-[#dadce0] focus-visible:ring-0 focus-visible:border-[#1a73e8] text-[#202124] rounded-lg"
              disabled={mutation.isPending}
            />
            {errors.name && <p className="text-sm text-[#d93025]">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="desc" className="text-sm text-[#202124] font-medium">Description <span className="text-[#5f6368] font-normal">(optional)</span></Label>
            <Textarea 
              id="desc"
              placeholder="What kind of files does this folder hold?"
              {...register('description')} 
              className="border-[#dadce0] focus-visible:ring-0 focus-visible:border-[#1a73e8] text-[#202124] rounded-lg min-h-[80px]"
              disabled={mutation.isPending}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="link" className="text-sm text-[#202124] font-medium">Google Drive Link</Label>
            <div className="relative">
              <Input 
                id="link"
                placeholder="Paste folder URL or ID here..."
                {...register('driveFolderLink')} 
                disabled={isEditing || mutation.isPending}
                className="h-12 border-[#dadce0] focus-visible:ring-0 focus-visible:border-[#1a73e8] text-[#202124] rounded-lg pr-10 disabled:opacity-70"
              />
              {isEditing && (
                <FolderLock className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#5f6368]" />
              )}
            </div>
            {errors.driveFolderLink && <p className="text-sm text-[#d93025]">{errors.driveFolderLink.message}</p>}
            
            {isEditing && (
              <div className="flex items-start gap-2 p-3 bg-[#f1f3f4] rounded-lg mt-2">
                <Link2 className="h-4 w-4 text-[#5f6368] mt-0.5 flex-shrink-0" />
                <p className="text-xs text-[#5f6368]">
                  The source folder link cannot be changed to prevent breaking active file syncs.
                </p>
              </div>
            )}
          </div>

          {mutation.isError && (
            <div className="bg-[#fce8e6] border border-[#f28b82] text-[#d93025] text-sm rounded-lg p-3">
              {(mutation.error as any)?.response?.data?.message || 'Something went wrong. Please check the Drive link.'}
            </div>
          )}

          <DialogFooter className="pt-2 gap-2 sm:gap-0">
            <Button 
              type="button" 
              variant="ghost" 
              onClick={() => onOpenChange(false)}
              className="text-[#1a73e8] hover:bg-[#e8f0fe]"
              disabled={mutation.isPending}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={mutation.isPending}
              className="bg-[#1a73e8] hover:bg-[#1765cc] text-white rounded-lg px-6"
            >
              {mutation.isPending ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </span>
              ) : isEditing ? (
                'Save'
              ) : (
                'Create'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}