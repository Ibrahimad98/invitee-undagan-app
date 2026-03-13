'use client';

import { useState } from 'react';
import { useTestimonials, useApproveTestimonial, useDeleteTestimonial } from '@/hooks/queries/use-testimonials';
import { useUIStore } from '@/stores/ui-store';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs } from '@/components/ui/tabs';
import { Avatar } from '@/components/ui/avatar';
import {
  Star,
  CheckCircle,
  Clock,
  Trash2,
  Shield,
  MessageCircle,
  ThumbsUp,
  ThumbsDown,
} from 'lucide-react';

type FilterTab = 'all' | 'approved' | 'pending';

export default function TestimonialsPage() {
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const { addToast } = useUIStore();

  const { data: allData, isLoading: loadingAll } = useTestimonials();
  const approveTestimonial = useApproveTestimonial();
  const deleteTestimonial = useDeleteTestimonial();

  const allTestimonials = allData || [];

  const filteredTestimonials = allTestimonials.filter((t: any) => {
    if (activeTab === 'approved') return t.isApproved;
    if (activeTab === 'pending') return !t.isApproved;
    return true;
  });

  const approvedCount = allTestimonials.filter((t: any) => t.isApproved).length;
  const pendingCount = allTestimonials.filter((t: any) => !t.isApproved).length;
  const avgRating =
    allTestimonials.length > 0
      ? allTestimonials.reduce((sum: number, t: any) => sum + t.rating, 0) / allTestimonials.length
      : 0;

  const handleApprove = async (id: string, isApproved: boolean) => {
    try {
      await approveTestimonial.mutateAsync({ id, isApproved });
      addToast(isApproved ? 'Testimoni disetujui' : 'Testimoni ditolak', 'success');
    } catch {
      addToast('Gagal memperbarui testimoni', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus testimoni ini?')) return;
    try {
      await deleteTestimonial.mutateAsync(id);
      addToast('Testimoni berhasil dihapus', 'success');
    } catch {
      addToast('Gagal menghapus testimoni', 'error');
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`}
      />
    ));
  };

  const tabs = [
    { id: 'all', label: `Semua (${allTestimonials.length})` },
    { id: 'approved', label: `Disetujui (${approvedCount})` },
    { id: 'pending', label: `Menunggu (${pendingCount})` },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Testimoni</h1>
        <p className="text-gray-500 mt-1">Kelola testimoni dari pengguna</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <MessageCircle className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{allTestimonials.length}</p>
              <p className="text-xs text-gray-500">Total</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{approvedCount}</p>
              <p className="text-xs text-gray-500">Disetujui</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{pendingCount}</p>
              <p className="text-xs text-gray-500">Menunggu</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Star className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{avgRating.toFixed(1)}</p>
              <p className="text-xs text-gray-500">Rating Rata-rata</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b pb-3">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as FilterTab)}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
              activeTab === tab.id
                ? 'bg-primary-50 text-primary-700 border-b-2 border-primary-600'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Testimonial List */}
      {loadingAll ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      ) : filteredTestimonials.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <MessageCircle className="w-12 h-12 text-gray-300 mx-auto" />
            <p className="mt-4 text-gray-500 font-medium">Belum ada testimoni</p>
            <p className="text-sm text-gray-400 mt-1">
              {activeTab === 'pending'
                ? 'Tidak ada testimoni yang menunggu persetujuan'
                : 'Testimoni akan muncul setelah pengguna memberikan ulasan'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredTestimonials.map((testimonial: any) => (
            <Card key={testimonial.id} className={!testimonial.isApproved ? 'border-yellow-200 bg-yellow-50/30' : ''}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <Avatar fallback={testimonial.name.charAt(0)} />
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-sm">{testimonial.name}</h3>
                        {testimonial.isApproved ? (
                          <Badge variant="success">
                            <Shield className="w-3 h-3 mr-1" />
                            Disetujui
                          </Badge>
                        ) : (
                          <Badge variant="warning">
                            <Clock className="w-3 h-3 mr-1" />
                            Menunggu
                          </Badge>
                        )}
                      </div>
                      {testimonial.eventType && (
                        <p className="text-xs text-gray-400">{testimonial.eventType}</p>
                      )}
                      <div className="flex items-center gap-0.5">
                        {renderStars(testimonial.rating)}
                      </div>
                      <p className="text-sm text-gray-700 mt-2 leading-relaxed">
                        &ldquo;{testimonial.message}&rdquo;
                      </p>
                      <p className="text-xs text-gray-400 mt-2">
                        {new Date(testimonial.createdAt).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 ml-4 shrink-0">
                    {!testimonial.isApproved && (
                      <button
                        onClick={() => handleApprove(testimonial.id, true)}
                        className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="Setujui"
                      >
                        <ThumbsUp className="w-4 h-4" />
                      </button>
                    )}
                    {testimonial.isApproved && (
                      <button
                        onClick={() => handleApprove(testimonial.id, false)}
                        className="p-2 text-gray-400 hover:text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                        title="Batalkan Persetujuan"
                      >
                        <ThumbsDown className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(testimonial.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Hapus"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
