'use client';

import { useState, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Settings,
  Plus,
  Pencil,
  Trash2,
  Save,
  X,
  GripVertical,
  Loader2,
  AlertCircle,
  Phone,
  Mail,
  Instagram,
  MapPin,
  Clock,
  MessageCircle,
  Globe,
  Send,
} from 'lucide-react';
import { api } from '@/lib/api';
import { useSettingsAdmin, type SiteSetting } from '@/hooks/queries/use-settings';

/* ── Icon mapping ─── */
const ICON_MAP: Record<string, React.ElementType> = {
  whatsapp: Phone,
  telepon: Phone,
  phone: Phone,
  email: Mail,
  instagram: Instagram,
  alamat: MapPin,
  address: MapPin,
  'jam operasional': Clock,
  operasional: Clock,
  website: Globe,
  telegram: Send,
};
function getIcon(item: string) {
  const key = item.toLowerCase();
  for (const [k, Icon] of Object.entries(ICON_MAP)) {
    if (key.includes(k)) return Icon;
  }
  return MessageCircle;
}

/* ── Blank form state ─── */
const BLANK: Omit<SiteSetting, 'id' | 'createdAt' | 'updatedAt'> = {
  category: 'contact',
  item: '',
  value: '',
  description: '',
  sortOrder: 0,
  isActive: true,
};

export default function SettingsPage() {
  const qc = useQueryClient();
  const { data: settings, isLoading, error } = useSettingsAdmin();

  /* ── Modal state ─── */
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(BLANK);

  /* ── Delete confirm ─── */
  const [deleteId, setDeleteId] = useState<string | null>(null);

  /* ── Mutations ─── */
  const createMut = useMutation({
    mutationFn: (dto: typeof BLANK) => api.post('/settings', dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['settings-admin'] });
      qc.invalidateQueries({ queryKey: ['settings-public'] });
      closeModal();
    },
  });

  const updateMut = useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: Partial<typeof BLANK> }) =>
      api.patch(`/settings/${id}`, dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['settings-admin'] });
      qc.invalidateQueries({ queryKey: ['settings-public'] });
      closeModal();
    },
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => api.delete(`/settings/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['settings-admin'] });
      qc.invalidateQueries({ queryKey: ['settings-public'] });
      setDeleteId(null);
    },
  });

  const toggleMut = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      api.patch(`/settings/${id}`, { isActive }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['settings-admin'] });
      qc.invalidateQueries({ queryKey: ['settings-public'] });
    },
  });

  /* ── Handlers ─── */
  const openCreate = () => {
    setEditId(null);
    setForm({ ...BLANK, sortOrder: (settings?.length ?? 0) + 1 });
    setModalOpen(true);
  };
  const openEdit = (s: SiteSetting) => {
    setEditId(s.id);
    setForm({
      category: s.category,
      item: s.item,
      value: s.value,
      description: s.description || '',
      sortOrder: s.sortOrder,
      isActive: s.isActive ?? true,
    });
    setModalOpen(true);
  };
  const closeModal = () => {
    setModalOpen(false);
    setEditId(null);
    setForm(BLANK);
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editId) {
      updateMut.mutate({ id: editId, dto: form });
    } else {
      createMut.mutate(form);
    }
  };

  const isSaving = createMut.isPending || updateMut.isPending;

  /* ── Group settings by category ─── */
  const grouped = (settings ?? []).reduce<Record<string, SiteSetting[]>>((acc, s) => {
    const cat = s.category || 'other';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(s);
    return acc;
  }, {});

  const CATEGORY_LABELS: Record<string, string> = {
    contact: 'Kontak',
    social: 'Media Sosial',
    general: 'Umum',
    other: 'Lainnya',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Settings className="w-6 h-6 text-primary-600" />
            Pengaturan Situs
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Kelola informasi kontak dan pengaturan lainnya yang tampil di halaman publik.
          </p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Tambah Item
        </button>
      </div>

      {/* Loading / Error */}
      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-primary-600" />
        </div>
      )}
      {error && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          Gagal memuat pengaturan. Silakan coba lagi.
        </div>
      )}

      {/* Settings list grouped */}
      {!isLoading &&
        !error &&
        Object.entries(grouped).map(([category, items]) => (
          <div key={category} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-5 py-3 bg-gray-50 border-b border-gray-200">
              <h2 className="text-sm font-semibold text-gray-700">
                {CATEGORY_LABELS[category] ?? category}
              </h2>
            </div>
            <div className="divide-y divide-gray-100">
              {items
                .sort((a, b) => a.sortOrder - b.sortOrder)
                .map((s) => {
                  const Icon = getIcon(s.item);
                  return (
                    <div
                      key={s.id}
                      className={`flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors ${
                        !s.isActive ? 'opacity-50' : ''
                      }`}
                    >
                      <GripVertical className="w-4 h-4 text-gray-300 shrink-0 hidden sm:block" />
                      <div className="w-9 h-9 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center shrink-0">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900 text-sm">{s.item}</span>
                          {!s.isActive && (
                            <span className="text-[10px] bg-gray-200 text-gray-500 px-1.5 py-0.5 rounded-full">
                              Nonaktif
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-primary-600 truncate">{s.value}</p>
                        {s.description && (
                          <p className="text-xs text-gray-400 mt-0.5 truncate">{s.description}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        {/* Toggle active */}
                        <button
                          onClick={() =>
                            toggleMut.mutate({ id: s.id, isActive: !s.isActive })
                          }
                          className={`relative w-9 h-5 rounded-full transition-colors ${
                            s.isActive ? 'bg-primary-600' : 'bg-gray-300'
                          }`}
                          title={s.isActive ? 'Nonaktifkan' : 'Aktifkan'}
                        >
                          <span
                            className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform shadow-sm ${
                              s.isActive ? 'translate-x-4' : ''
                            }`}
                          />
                        </button>
                        <button
                          onClick={() => openEdit(s)}
                          className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteId(s.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Hapus"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        ))}

      {/* Empty state */}
      {!isLoading && !error && (!settings || settings.length === 0) && (
        <div className="text-center py-20 bg-white rounded-xl border border-gray-200">
          <Settings className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-gray-600 font-medium mb-1">Belum ada pengaturan</h3>
          <p className="text-sm text-gray-400 mb-6">Tambahkan item pengaturan pertama Anda.</p>
          <button
            onClick={openCreate}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors"
          >
            <Plus className="w-4 h-4" /> Tambah Item
          </button>
        </div>
      )}

      {/* ══════ Create / Edit Modal ══════ */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40" onClick={closeModal} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6 z-10">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-gray-900">
                {editId ? 'Edit Item' : 'Tambah Item Baru'}
              </h2>
              <button
                onClick={closeModal}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                >
                  <option value="contact">Kontak</option>
                  <option value="social">Media Sosial</option>
                  <option value="general">Umum</option>
                  <option value="other">Lainnya</option>
                </select>
              </div>

              {/* Item */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nama Item <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.item}
                  onChange={(e) => setForm((p) => ({ ...p, item: e.target.value }))}
                  placeholder="contoh: WhatsApp, Email, Instagram"
                  required
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                />
              </div>

              {/* Value */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nilai <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.value}
                  onChange={(e) => setForm((p) => ({ ...p, value: e.target.value }))}
                  placeholder="contoh: 081234567890"
                  required
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Deskripsi <span className="text-gray-400">(opsional)</span>
                </label>
                <input
                  type="text"
                  value={form.description}
                  onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                  placeholder="Keterangan singkat"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                />
              </div>

              {/* Sort order */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Urutan</label>
                <input
                  type="number"
                  value={form.sortOrder}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, sortOrder: parseInt(e.target.value) || 0 }))
                  }
                  min={0}
                  className="w-24 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                />
              </div>

              {/* Active toggle */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Aktif</span>
                <button
                  type="button"
                  onClick={() => setForm((p) => ({ ...p, isActive: !p.isActive }))}
                  className={`relative w-11 h-6 rounded-full transition-colors ${
                    form.isActive ? 'bg-primary-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform shadow-sm ${
                      form.isActive ? 'translate-x-5' : ''
                    }`}
                  />
                </button>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex items-center gap-2 px-5 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors disabled:opacity-50"
                >
                  {isSaving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  {editId ? 'Simpan' : 'Tambah'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══════ Delete Confirmation Modal ══════ */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40" onClick={() => setDeleteId(null)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 z-10 text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Hapus Item?</h3>
            <p className="text-sm text-gray-500 mb-6">
              Item ini akan dihapus permanen dan tidak bisa dikembalikan.
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={() => deleteId && deleteMut.mutate(deleteId)}
                disabled={deleteMut.isPending}
                className="inline-flex items-center gap-2 px-5 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {deleteMut.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
