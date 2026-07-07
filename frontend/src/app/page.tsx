'use client';

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useIsAuthenticated } from "@/lib/use-is-authenticated";
import { Navbar } from "@/components/navbar";
import { DriveSidebar } from "@/components/drive-sidebar"; // Import Sidebar
import { ProductDialog } from "@/components/product-dialog";
import { ProductCard } from "@/components/product-card";
import { Product } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Plus, FolderOpen } from "lucide-react";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Footer } from '@/components/footer';
import { useRequireAuth } from "@/lib/use-auth";

export default function Home() {
  const loggedIn = useRequireAuth();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);

  const { data: products, isLoading, error } = useQuery({
    queryKey: ['products'],
    queryFn: async () => (await api.get<Product[]>('/products')).data,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/products/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setDeletingProduct(null);
    },
  });

  return (
    // Removed min-h-screen here
    <div className="flex flex-col h-full">
      <Navbar />
      
      {/* NEW: Container for Sidebar + Content */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* THE SIDEBAR */}
        <DriveSidebar />

        {/* NEW: Scrollable Main Content Area */}
        <main className="flex-1 overflow-y-auto px-6 md:px-8 py-6">
          <div className="max-w-7xl mx-auto flex flex-col min-h-full">
            {/* Drive Style Header */}
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-normal text-[#202124]">My Drive</h1>
            </div>

            {/* Loading State - Dense Grid */}
            {isLoading && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-1">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <div key={i} className="space-y-2 p-3">
                    <Skeleton className="aspect-square w-full rounded-md bg-[#e8eaed]" />
                    <Skeleton className="h-4 w-3/4 rounded bg-[#e8eaed]" />
                    <Skeleton className="h-3 w-1/2 rounded bg-[#e8eaed]" />
                  </div>
                ))}
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="text-center py-12 border border-[#dadce0] rounded-lg bg-white">
                <p className="text-[#d93025] font-medium">Failed to load products.</p>
                <p className="text-sm text-[#5f6368] mt-1">Please check your connection or try again later.</p>
              </div>
            )}

            {/* Empty State */}
            {products && products.length === 0 && !isLoading && (
              <div className="flex flex-col items-center justify-center pt-32 text-[#5f6368]">
                <FolderOpen className="w-24 h-24 mb-4 text-[#dadce0]" />
                <p className="text-lg">No folders here yet</p>
              </div>
            )}

            {/* Drive Dense Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-1">
              {products?.map((product) => (
                <ProductCard 
                  key={product.id} 
                  product={product} 
                  loggedIn={loggedIn}
                  onEdit={(p) => { setEditingProduct(p); setDialogOpen(true); }}
                  onDelete={(p) => setDeletingProduct(p)}
                />
              ))}
            </div>
            
            {/* Footer inside scrollable area */}
            <Footer />
          </div>
        </main>
      </div>

      {/* Google Drive Floating Action Button (FAB) */}
      {loggedIn && (
        <Button 
          onClick={() => { setEditingProduct(null); setDialogOpen(true); }}
          className="fixed bottom-8 right-8 h-14 w-14 rounded-full shadow-lg bg-[#1a73e8] hover:bg-[#1765cc] text-white z-40"
          size="icon"
        >
          <Plus className="h-6 w-6" />
        </Button>
      )}

      {dialogOpen && (
        <ProductDialog open={dialogOpen} onOpenChange={setDialogOpen} existing={editingProduct || undefined} />
      )}

      <AlertDialog open={!!deletingProduct} onOpenChange={(open) => !open && setDeletingProduct(null)}>
        <AlertDialogContent className="bg-white border-[#dadce0]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[#202124]">Delete &quot;{deletingProduct?.name}&quot;?</AlertDialogTitle>
            <AlertDialogDescription className="text-[#5f6368]">
              This permanently deletes the product and all its synced file records. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-white border-[#dadce0] text-[#202124] hover:bg-[#f1f3f4]">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deletingProduct && deleteMutation.mutate(deletingProduct.id)} className="bg-[#d93025] text-white hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}