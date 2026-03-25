'use client';

import { useState } from 'react';
import { useTemplates } from '@/hooks/queries/use-templates';
import { useAuthStore } from '@/stores/auth-store';
import { useUIStore } from '@/stores/ui-store';
import { api } from '@/lib/api';
import { useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Pagination } from '@/components/ui/pagination';
import { TEMPLATE_CATEGORIES, TEMPLATE_CATEGORY_LABELS } from '@invitee/shared';
import { CATEGORY_COLORS } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { Search, Star, Eye, Users, ToggleLeft, ToggleRight, Shield } from 'lucide-react';
import Link from 'next/link';

const PAGE_LIMIT = 10;

export default function TemplatesPage() {
  const { user } = useAuthStore();
  const { addToast } = useUIStore();
  const queryClient = useQueryClient();
  const isAdmin = user?.role === 'ADMIN';

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string | undefined>();
  const [page, setPage] = useState(1);
  const [adminMode, setAdminMode] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  // Use admin endpoint when in admin mode
  const { data, isLoading } = useTemplates({
    search: search || undefined,
    category,
    page,
    limit: PAGE_LIMIT,
    ...(isAdmin && adminMode ? { admin: true } : {}),
  } as any);

  const templates = data?.data || [];
  const meta = data?.meta;
  const totalPages = meta?.totalPages || 1;

  // Reset to page 1 when filters change
  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };
  const handleCategoryChange = (cat: string | undefined) => {
    setCategory(cat);
    setPage(1);
  };

  const handleToggleActive = async (templateId: string) => {
    setTogglingId(templateId);
    try {
      const { data: res } = await api.patch(`/templates/${templateId}/toggle-active`);
      const updated = (res as any)?.data || res;
      addToast(
        updated.isActive ? 'Template dipublish' : 'Template di-unpublish',
        updated.isActive ? 'success' : 'info',
      );
      queryClient.invalidateQueries({ queryKey: ['templates'] });
    } catch {
      addToast('Gagal mengubah status template', 'error');
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Template Undangan</h1>
          <p className="text-gray-500 mt-1">
            {adminMode ? 'Kelola template — publish/unpublish' : 'Pilih template untuk undangan digital Anda'}
          </p>
        </div>
        {isAdmin && (
          <Button
            variant={adminMode ? 'default' : 'outline'}
            size="sm"
            onClick={() => { setAdminMode(!adminMode); setPage(1); }}
            className="gap-1.5"
          >
            <Shield className="w-4 h-4" />
            {adminMode ? 'Mode Admin' : 'Kelola'}
          </Button>
        )}
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Cari template..."
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
      </div>

      {/* Category Filters */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => handleCategoryChange(undefined)}
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
            onClick={() => handleCategoryChange(category === cat ? undefined : cat)}
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
                className={cn(
                  'overflow-hidden hover:shadow-lg transition-shadow group',
                  adminMode && !template.isActive && 'opacity-60 border-dashed border-gray-300',
                )}
              >
                {/* Thumbnail */}
                <div className="h-48 bg-gradient-to-br from-primary-50 to-secondary-50 relative overflow-hidden flex items-center justify-center">
                  {/* Typography fallback behind the image */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center pointer-events-none">
                    <div className="text-3xl mb-1">💌</div>
                    <p className="text-sm font-semibold text-gray-400 capitalize">{template.name}</p>
                    <p className="text-xs text-gray-300 mt-1">{template.category || 'Template'}</p>
                  </div>
                  <img
                    src={`/images/templates/${template.slug}.svg`}
                    alt={template.name}
                    className="w-full h-full object-cover relative z-[1]"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                  {template.isPremium && (
                    <Badge className="absolute top-2 right-2 z-[2] bg-yellow-500">
                      Premium
                    </Badge>
                  )}
                  {/* Admin mode: show active status badge */}
                  {adminMode && (
                    <Badge
                      className={cn(
                        'absolute top-2 left-2 z-[2]',
                        template.isActive ? 'bg-green-500' : 'bg-red-500',
                      )}
                    >
                      {template.isActive ? 'Published' : 'Unpublished'}
                    </Badge>
                  )}
                  <div className="absolute inset-0 z-[2] bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <Link
                      href={`/preview/${template.slug}`}
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
                      {template.ratingAvg?.toFixed(1) ?? '0.0'}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" />
                      {template.usageCount?.toLocaleString() ?? 0} digunakan
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-3">
                    {template.tags?.slice(0, 3).map((tag: string) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  {/* Admin mode: toggle publish/unpublish */}
                  {adminMode ? (
                    <Button
                      className={cn(
                        'w-full mt-4 gap-1.5',
                        template.isActive
                          ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200'
                          : 'bg-green-50 text-green-600 hover:bg-green-100 border border-green-200',
                      )}
                      variant="outline"
                      size="sm"
                      disabled={togglingId === template.id}
                      onClick={() => handleToggleActive(template.id)}
                    >
                      {template.isActive ? (
                        <><ToggleRight className="w-4 h-4" /> Unpublish</>
                      ) : (
                        <><ToggleLeft className="w-4 h-4" /> Publish</>
                      )}
                    </Button>
                  ) : (
                    <Button
                      className="w-full mt-4"
                      size="sm"
                      onClick={() => {
                        window.location.href = `/dashboard/invitations/new?templateId=${template.id}`;
                      }}
                    >
                      Gunakan Template
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
      </div>

      {!isLoading && templates.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">Tidak ada template ditemukan</p>
        </div>
      )}

      {/* Pagination */}
      {!isLoading && meta && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <p className="text-sm text-gray-500">
            Menampilkan {templates.length} dari {meta.total} template
          </p>
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </div>
      )}
    </div>
  );
}
