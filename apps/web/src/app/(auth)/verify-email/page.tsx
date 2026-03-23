'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/stores/auth-store';
import { api } from '@/lib/api';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'already'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Token verifikasi tidak ditemukan');
      return;
    }

    const verify = async () => {
      try {
        const { data } = await api.get(`/auth/verify-email?token=${token}`);
        const result = data.data || data;

        if (result.alreadyVerified) {
          setStatus('already');
          setMessage(result.message || 'Email sudah diverifikasi sebelumnya');
        } else {
          setStatus('success');
          setMessage(result.message || 'Email berhasil diverifikasi!');

          // If the response includes auth tokens, log the user in
          if (result.accessToken && result.user) {
            useAuthStore.getState().setUser(result.user);
            useAuthStore.setState({
              token: result.accessToken,
              isAuthenticated: true,
            });
          }
        }
      } catch (error: any) {
        setStatus('error');
        setMessage(
          error.response?.data?.message || 'Verifikasi gagal. Token mungkin tidak valid atau sudah kadaluarsa.',
        );
      }
    };

    verify();
  }, [token]);

  return (
    <Card>
      <CardContent className="py-10 px-6">
        <div className="text-center space-y-4">
          {status === 'loading' && (
            <>
              <div className="w-16 h-16 bg-primary-50 rounded-full flex items-center justify-center mx-auto">
                <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Memverifikasi Email...</h2>
              <p className="text-gray-500 text-sm">Mohon tunggu sebentar</p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Email Terverifikasi! 🎉</h2>
              <p className="text-gray-600 text-sm leading-relaxed">{message}</p>
              <div className="pt-2">
                <Button onClick={() => router.push('/dashboard')} className="w-full">
                  Masuk ke Dashboard
                </Button>
              </div>
            </>
          )}

          {status === 'already' && (
            <>
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8 text-blue-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Sudah Terverifikasi</h2>
              <p className="text-gray-600 text-sm leading-relaxed">{message}</p>
              <div className="pt-2">
                <Link href="/login">
                  <Button className="w-full">Masuk ke Akun</Button>
                </Link>
              </div>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                <XCircle className="w-8 h-8 text-red-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Verifikasi Gagal</h2>
              <p className="text-gray-600 text-sm leading-relaxed">{message}</p>
              <div className="pt-2 space-y-2">
                <Link href="/register">
                  <Button variant="outline" className="w-full">Daftar Ulang</Button>
                </Link>
                <Link href="/login">
                  <Button variant="ghost" className="w-full">Kembali ke Login</Button>
                </Link>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
