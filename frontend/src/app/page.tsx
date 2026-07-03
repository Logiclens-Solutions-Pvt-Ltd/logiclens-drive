'use client';

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { api } from "@/lib/api";
import { useRequireAuth } from "@/lib/use-auth";
import { Navbar } from "@/components/navbar";
import { Product } from "@/lib/types";
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from "@/components/ui/skeleton";

export default function Home(){

  const checked = useRequireAuth();

  const { data : products, isLoading, error } = useQuery({
    queryKey: ['products'],
    queryFn: async () => (await api.get<Product[]>('/products')).data,
    enabled: checked,
  });

  if(!checked) return null;

  return (
    <div>
      <Navbar />
      <main className="p-6 max-w-5x1 mx-auto">
        <h1 className="text-x1 font-semibold mb-4">Products</h1>
        {isLoading && (
           <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-28 rounded-lg" />)}
          </div>
        )}
        {error && <p className="text-red-600">Failed to load products.</p>}

        {products && products.length === 0 && (
          <p className="text-neutral-500">No products yet.</p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {products?.map((product) => (
            <Link key={product.id} href={`/products/${product.id}`}>
              <Card className="hover:border-neutral-400 transition-colors cursor-pointer h-full">
                <CardHeader>
                  <CardTitle>{product.name}</CardTitle>
                  <CardDescription>{product.description || 'No description'}</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      </main>
    </div>
    
  );
}