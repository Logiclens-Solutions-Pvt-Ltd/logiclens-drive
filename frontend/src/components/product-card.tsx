'use client';

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Product } from "@/lib/types";
import { Pencil, Trash2, Folder } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

// Removed 'index' from props as Drive doesn't use staggered animations
interface ProductCardProps {
  product: Product;
  loggedIn: boolean;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
}

interface ThumbnailData {
  id: string;
  driveFileId: string;
}

export function ProductCard({ product, loggedIn, onEdit, onDelete }: ProductCardProps) {
  // STATE MACHINE LOGIC KEPT EXACTLY THE SAME
  const [imageState, setImageState] = useState<'loading' | 'google' | 'fallback' | 'error'>('loading');

  const { data: thumbnail } = useQuery({
    queryKey: ['product-thumbnail', product.id],
    queryFn: async () => (await api.get<ThumbnailData>(`/products/${product.id}/thumbnail`)).data,
    staleTime: 5 * 60 * 1000,
    enabled: !!product.id,
  });

  if (thumbnail && imageState === 'loading') {
    setImageState('google');
  }

  const googleCdnUrl = thumbnail?.driveFileId 
    ? `https://drive.google.com/thumbnail?id=${thumbnail.driveFileId}&sz=w400` // sz=400 is perfect for square cards
    : null;
    
  const backendProxyUrl = thumbnail?.id 
    ? `${process.env.NEXT_PUBLIC_API_URL}/files/${thumbnail.id}/preview` 
    : null;

  let activeSrc: string | null = null;
  if (imageState === 'google' && googleCdnUrl) activeSrc = googleCdnUrl;
  if (imageState === 'fallback' && backendProxyUrl) activeSrc = backendProxyUrl;

  const handleImageError = () => {
    if (imageState === 'google' && backendProxyUrl) {
      setImageState('fallback');
    } else {
      setImageState('error');
    }
  };

  // NEW DRIVE UI STARTS HERE
  return (
    <div className="group relative rounded-lg p-3 cursor-pointer transition-colors hover:bg-[#e8eaed]">
      {/* Actions - Top Right on Hover */}
      {loggedIn && (
        <div className="absolute top-2 right-2 z-10 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button 
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onEdit(product); }} 
            className="p-1.5 bg-white rounded-full shadow-sm border border-[#dadce0] hover:bg-[#f1f3f4]"
          >
            <Pencil className="h-3.5 w-3.5 text-[#5f6368]" />
          </button>
          <button 
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDelete(product); }} 
            className="p-1.5 bg-white rounded-full shadow-sm border border-[#dadce0] hover:bg-[#f1f3f4] text-[#d93025]"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      <Link href={`/products/${product.id}`} className="block">
        {/* Thumbnail Container - Changed to aspect-square */}
        <div className="aspect-square rounded-md bg-[#f1f3f4] mb-3 overflow-hidden flex items-center justify-center">
          {activeSrc && imageState !== 'error' ? (
            <img 
              src={activeSrc} 
              alt={product.name} 
              onError={handleImageError}
              draggable={false} 
              className="block w-full h-full object-cover" 
            />
          ) : (
            <Folder className="h-16 w-16 text-[#dadce0]" />
          )}
        </div>
        
        {/* Text Area - Drive uses simple, tight text */}
        <p className="text-sm text-[#202124] truncate leading-tight">{product.name}</p>
        <p className="text-xs text-[#5f6368] truncate mt-0.5">{product.description || 'Folder'}</p>
      </Link>
    </div>
  );
}