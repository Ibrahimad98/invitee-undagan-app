'use client';

import { useState } from 'react';
import { useTemplates } from '@/hooks/queries/use-templates';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TEMPLATE_CATEGORIES, TEMPLATE_CATEGORY_LABELS } from '@invitee/shared';
import { CATEGORY_COLORS } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { Search, Star, Eye, Users } from 'lucide-react';
import Link from 'next/link';

export default function TemplatesPage() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string | undefined>();
  const { data, isLoading } = useTemplates({ search: search || undefined, category });

  const templates = data?.data || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Template Undangan</h1>
        <p className="text-gray-500 mt-1">Pilih template untuk undangan digital Anda</p>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Cari template..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
      </div>

      {/* Category Filters */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setCategory(undefined)}
          className={cn(
            'px-3 py-1.5 rounded-full text-sm font-medium transition-colors',
            !category
              ? 'bg-primary-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
          )}
        >
          Semua
        </button>
        {TEMPLATE_CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(category === cat ? undefined : cat)}
            className={cn(
              'px-3 py-1.5 rounded-full text-sm font-medium transition-colors',
              category === cat
                ? 'bg-primary-600 text-white'
                : CATEGORY_COLORS[cat] || 'bg-gray-100 text-gray-600',
              category !== cat && 'hover:opacity-80',
            )}
          >
            {TEMPLATE_CATEGORY_LABELS[cat] || cat}
          </button>
        ))}
      </div>

      {/* Template Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {isLoading
          ? Array.from({ length: 8 }).map((_, i) => (
              <Card key={i}>
                <Skeleton className="h-48 w-full rounded-t-lg" />
                <CardContent className="p-4 space-y-2">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-4 w-24" />
                </CardContent>
              </Card>
            ))
          : templates.map((template: any) => (
              <Card
                key={template.id}
                className="overflow-hidden hover:shadow-lg transition-shadow group"
              >
                {/* Thumbnail */}
                <div className="h-48 bg-gradient-to-br from-primary-50 to-secondary-50 relative overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-4xl font-serif text-primary-300">
                      {template.name.charAt(0)}
                    </span>
                  </div>
                  {template.isPremium && (
                    <Badge className="absolute top-2 right-2 bg-yellow-500">
                      Premium
                    </Badge>
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <Link
                      href={`/khitanan-muhammad-zidan-febriansyah/${template.id}`}
                      target="_blank"
                      className="px-4 py-2 bg-white rounded-lg text-sm font-medium text-gray-900 hover:bg-gray-50"
                    >
                      <Eye className="w-4 h-4 inline mr-1" />
                      Preview
                    </Link>
                  </div>
                </div>

                {/* Info */}
                <CardContent className="p-4">
                  <h3 className="font-semibold text-gray-900">{template.name}</h3>
                  <div className="flex items-center gap-3 mt-2 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                      {template.ratingAvg.toFixed(1)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" />
                      {template.usageCount.toLocaleString()} digunakan
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-3">
                    {template.tags?.slice(0, 3).map((tag: string) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <Button
                    className="w-full mt-4"
                    size="sm"
                    onClick={() => {
                      // Store template selection and navigate to create
                      window.location.href = `/dashboard/invitations/new?templateId=${template.id}`;
                    }}
                  >
                    Gunakan Template
                  </Button>
                </CardContent>
              </Card>
            ))}
      </div>

      {!isLoading && templates.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">Tidak ada template ditemukan</p>
        </div>
      )}
    </div>
  );
}
