'use client';

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useRequireAuth } from "@/lib/use-auth";
import { Navbar } from "@/components/navbar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

interface Item {id: string; name: string;}

function AdminSection({title, endpoint}: { title: string, endpoint: 'categories' | 'tags'}){
    const queryClient = useQueryClient();
    const [name, setName ] = useState('');

    const {data: items } = useQuery({
        queryKey: [endpoint],
        queryFn: async () => (await api.get<Item[]>(`/${endpoint}`)).data,
    });

    const createMutation = useMutation({
        mutationFn: () => api.post(`/${endpoint}`, {name}),
        onSuccess: () => {
            setName('');
            queryClient.invalidateQueries({queryKey: [endpoint]});
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => api.delete(`/${endpoint}/${id}`),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: [endpoint]}),
    });

    return (
    <div className="mb-8">
      <h2 className="text-lg font-medium mb-3">{title}</h2>

      <div className="flex gap-2 mb-4 max-w-sm">
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={`New ${title.toLowerCase().slice(0, -1)} name`}
        />
        <Button onClick={() => name && createMutation.mutate()} disabled={createMutation.isPending}>
          Add
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        {items?.map((item) => (
          <Badge key={item.id} variant="secondary" className="flex items-center gap-1 pr-1">
            {item.name}
            <button onClick={() => deleteMutation.mutate(item.id)} className="hover:text-red-600">
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
      </div>
    </div>
  );
}


export default function AdminPage(){
    const checked = useRequireAuth();
    if(!checked) return null;

    return (
        <div>
            <Navbar />
            <main className="p-6 max-w-3x1 mx-auto">
                <h1 className="text-x1 font-semibold mb-6">Admin</h1>
                <AdminSection title="Categories" endpoint="categories" />
                <AdminSection title="Tags" endpoint="tags" />
            </main>
        </div>
    )
}