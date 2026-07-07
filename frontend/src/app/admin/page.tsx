'use client';

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useRequireAuth } from "@/lib/use-auth";
import { Navbar } from "@/components/navbar";
import { DriveSidebar } from "@/components/drive-sidebar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Settings, FolderKanban, LayoutGrid, Tags, Plus, Trash2, Loader2 
} from "lucide-react";
import { Footer } from "@/components/footer";

interface Item { id: string; name: string; }

export default function AdminPage() {
  const checked = useRequireAuth();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<'categories' | 'tags'>('categories');
  const [newCategory, setNewCategory] = useState('');
  const [newTag, setNewTag] = useState('');

  // --- REAL API QUERIES ---
  const { data: products } = useQuery({
    queryKey: ['products'],
    queryFn: async () => (await api.get<Item[]>('/products')).data,
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => (await api.get<Item[]>('/categories')).data,
  });

  const { data: tags } = useQuery({
    queryKey: ['tags'],
    queryFn: async () => (await api.get<Item[]>('/tags')).data,
  });

  // --- REAL API MUTATIONS (Categories) ---
  const createCatMutation = useMutation({
    mutationFn: (name: string) => api.post('/categories', { name }),
    onSuccess: () => {
      setNewCategory('');
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });

  const deleteCatMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/categories/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['categories'] }),
  });

  // --- REAL API MUTATIONS (Tags) ---
  const createTagMutation = useMutation({
    mutationFn: (name: string) => api.post('/tags', { name }),
    onSuccess: () => {
      setNewTag('');
      queryClient.invalidateQueries({ queryKey: ['tags'] });
    },
  });

  const deleteTagMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/tags/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tags'] }),
  });

  // --- DYNAMIC STATS (Drive Colors) ---
  const STATS = [
    { label: 'Total Products', value: products?.length.toString() || '0', icon: FolderKanban, color: 'text-[#1a73e8]', bg: 'bg-[#e8f0fe]' },
    { label: 'Categories', value: categories?.length.toString() || '0', icon: LayoutGrid, color: 'text-[#1a73e8]', bg: 'bg-[#e8f0fe]' },
    { label: 'Tags', value: tags?.length.toString() || '0', icon: Tags, color: 'text-[#5f6368]', bg: 'bg-[#f1f3f4]' },
  ];

  if (!checked) return null;

  return (
    // GOOGLE DRIVE LAYOUT WRAPPER
    <div className="flex flex-col h-full">
      <Navbar />
      
      <div className="flex flex-1 overflow-hidden">
        {/* SIDEBAR */}
        <DriveSidebar />

        {/* SCROLLABLE MAIN CONTENT */}
        <main className="flex-1 overflow-y-auto px-6 md:px-8 py-6">
          <div className="max-w-5xl mx-auto flex flex-col min-h-full space-y-6">
            
            {/* Header */}
            <div>
              <div className="flex items-center gap-3 mb-1">
                <Settings className="h-6 w-6 text-[#5f6368]" />
                <h1 className="text-2xl font-normal text-[#202124]">
                  Manage Workspace
                </h1>
              </div>
              <p className="text-[#5f6368] text-sm ml-9">
                Manage system structure, categories, and tags for your assets.
              </p>
            </div>

            {/* Stats Grid - Drive Style (No heavy shadows) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {STATS.map((stat) => (
                <div key={stat.label} className="flex items-center justify-between bg-white border border-[#dadce0] rounded-lg p-5 transition-shadow hover:shadow-sm">
                  <div>
                    <p className="text-sm text-[#5f6368]">{stat.label}</p>
                    <p className="text-2xl font-medium text-[#202124] mt-1">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-lg ${stat.bg}`}>
                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                </div>
              ))}
            </div>

            {/* Management Tabs & Lists */}
            <div className="bg-white border border-[#dadce0] rounded-lg overflow-hidden flex-1">
              
              {/* Custom Tab Header */}
              <div className="flex border-b border-[#dadce0]">
                <button
                  onClick={() => setActiveTab('categories')}
                  className={`flex-1 px-6 py-3.5 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
                    activeTab === 'categories' 
                      ? 'text-[#1a73e8] border-b-2 border-[#1a73e8] bg-[#e8f0fe]' 
                      : 'text-[#5f6368] hover:text-[#202124] hover:bg-[#f1f3f4]'
                  }`}
                >
                  <LayoutGrid className="h-4 w-4" /> Categories
                </button>
                <button
                  onClick={() => setActiveTab('tags')}
                  className={`flex-1 px-6 py-3.5 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
                    activeTab === 'tags' 
                      ? 'text-[#1a73e8] border-b-2 border-[#1a73e8] bg-[#e8f0fe]' 
                      : 'text-[#5f6368] hover:text-[#202124] hover:bg-[#f1f3f4]'
                  }`}
                >
                  <Tags className="h-4 w-4" /> Tags
                </button>
              </div>

              {/* Tab Content */}
              <div className="p-6">
                
                {/* --- CATEGORIES TAB --- */}
                {activeTab === 'categories' && (
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add new category..."
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && newCategory.trim() && createCatMutation.mutate(newCategory)}
                        className="h-10 border-[#dadce0] focus-visible:ring-0 focus-visible:border-[#1a73e8] text-[#202124]"
                      />
                      <Button 
                        onClick={() => createCatMutation.mutate(newCategory)} 
                        disabled={!newCategory.trim() || createCatMutation.isPending}
                        size="sm"
                        className="h-10 bg-[#1a73e8] hover:bg-[#1765cc] text-white"
                      >
                        {createCatMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                      </Button>
                    </div>

                    <div className="divide-y divide-[#dadce0]">
                      {categories?.map((cat) => (
                        <div key={cat.id} className="flex items-center justify-between py-3 px-2 group hover:bg-[#f1f3f4] rounded-md transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-[#1a73e8]" />
                            <span className="font-medium text-[#202124] text-sm">{cat.name}</span>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => deleteCatMutation.mutate(cat.id)}
                            disabled={deleteCatMutation.isPending}
                            className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-[#5f6368] hover:text-[#d93025]"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                    {categories?.length === 0 && (
                      <p className="text-sm text-[#5f6368] text-center py-8">No categories created yet.</p>
                    )}
                  </div>
                )}

                {/* --- TAGS TAB --- */}
                {activeTab === 'tags' && (
                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add new tag (e.g., campaign-2024)..."
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && newTag.trim() && createTagMutation.mutate(newTag)}
                        className="h-10 border-[#dadce0] focus-visible:ring-0 focus-visible:border-[#1a73e8] text-[#202124]"
                      />
                      <Button 
                        onClick={() => createTagMutation.mutate(newTag)} 
                        disabled={!newTag.trim() || createTagMutation.isPending}
                        size="sm"
                        className="h-10 bg-[#1a73e8] hover:bg-[#1765cc] text-white"
                      >
                        {createTagMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                      </Button>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-2">
                      {tags?.map((tag) => (
                        <div 
                          key={tag.id} 
                          className="group flex items-center gap-2 px-3 py-1.5 bg-[#f1f3f4] text-[#202124] border border-[#dadce0] rounded-full text-sm font-medium hover:border-[#5f6368] transition-colors"
                        >
                          <span>#{tag.name}</span>
                          <button 
                            onClick={() => deleteTagMutation.mutate(tag.id)}
                            disabled={deleteTagMutation.isPending}
                            className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity hover:text-[#d93025]"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                    {tags?.length === 0 && (
                      <p className="text-sm text-[#5f6368] text-center py-8">No tags created yet.</p>
                    )}
                  </div>
                )}

              </div>
            </div>

            <Footer />
          </div>
        </main>
      </div>
    </div>
  );
}