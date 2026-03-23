'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuthStore } from '@/stores/auth-store';
import { useUIStore } from '@/stores/ui-store';
import { registerSchema, type RegisterFormData } from '@/lib/validations';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Mail, Lock, User, Phone, FlaskConical, X, CheckCircle, RefreshCw } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const { register: registerUser } = useAuthStore();
  const { addToast } = useUIStore();
  const [isLoading, setIsLoading] = useState(false);
  const [showBetaPopup, setShowBetaPopup] = useState(true);
  const [verificationSent, setVerificationSent] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState('');
  const [resending, setResending] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    try {
      const result = await registerUser(data);
      if (result?.needsVerification) {
        // Email verification required — show verification screen
        setVerificationSent(true);
        setVerificationEmail(result.email || data.email);
        addToast('Silakan cek email Anda untuk verifikasi 📧', 'success');
      } else {
        // No verification needed — go to dashboard
        addToast('Registrasi berhasil! Selamat datang di Invitee 🎉', 'success');
        router.push('/dashboard');
      }
    } catch (error: any) {
      addToast(
        error.response?.data?.message || 'Registrasi gagal. Coba lagi.',
        'error',
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!verificationEmail || resending) return;
    setResending(true);
    try {
      await api.post('/auth/resend-verification', {
        email: verificationEmail,
        baseUrl: window.location.origin,
      });
      addToast('Email verifikasi telah dikirim ulang!', 'success');
    } catch (error: any) {
      addToast(error.response?.data?.message || 'Gagal mengirim ulang email', 'error');
    } finally {
      setResending(false);
    }
  };

  // Verification sent screen
  if (verificationSent) {
    return (
      <Card>
        <CardContent className="py-10 px-6">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <Mail className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Cek Email Anda! 📧</h2>
            <p className="text-gray-600 text-sm leading-relaxed max-w-sm mx-auto">
              Kami telah mengirim link verifikasi ke{' '}
              <strong className="text-primary-600">{verificationEmail}</strong>.
              Klik link di email tersebut untuk mengaktifkan akun Anda.
            </p>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-left text-sm">
              <p className="text-amber-800 font-medium mb-1">💡 Tips:</p>
              <ul className="text-amber-700 space-y-0.5 text-xs">
                <li>• Cek folder <strong>Spam/Junk</strong> jika tidak ditemukan di inbox</li>
                <li>• Link berlaku selama <strong>24 jam</strong></li>
              </ul>
            </div>
            <div className="pt-2 space-y-2">
              <Button
                variant="outline"
                className="w-full gap-2"
                onClick={handleResendVerification}
                loading={resending}
              >
                <RefreshCw className="w-4 h-4" />
                Kirim Ulang Email Verifikasi
              </Button>
              <Link
                href="/login"
                className="block text-sm text-center text-primary-600 hover:underline font-medium pt-1"
              >
                Kembali ke Halaman Login
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      {/* Beta Welcome Popup */}
      {showBetaPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative">
            <button
              onClick={() => setShowBetaPopup(false)}
              className="absolute top-3 right-3 p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="text-center">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FlaskConical className="w-8 h-8 text-amber-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                Selamat Datang di Invitee Beta! 🎉
              </h2>
              <p className="text-gray-600 text-sm leading-relaxed mb-4">
                Daftar sekarang dan langsung gunakan <strong className="text-primary-600">Invitee</strong> untuk membuat undangan digital Anda.
              </p>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-left text-sm space-y-1.5 mb-4">
                <p className="font-medium text-amber-800">🧪 Yang Anda dapatkan sebagai pengguna Beta:</p>
                <ul className="text-amber-700 space-y-1 ml-1">
                  <li>• Membuat undangan digital tanpa batas</li>
                  <li>• Hingga <strong>100 tamu</strong> per akun</li>
                  <li>• Template dasar gratis</li>
                  <li>• Kelola daftar tamu & RSVP</li>
                  <li>• Link undangan yang bisa dibagikan</li>
                </ul>
              </div>
              <p className="text-xs text-gray-400 mb-4">
                Butuh lebih dari 100 tamu? Anda bisa mengajukan permintaan penambahan kuota melalui dashboard.
              </p>
              <Button onClick={() => setShowBetaPopup(false)} className="w-full">
                Mengerti, Lanjutkan Daftar
              </Button>
            </div>
          </div>
        </div>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2 mb-1">
            <CardTitle>Daftar</CardTitle>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-[10px] font-bold uppercase">
              <FlaskConical className="w-3 h-3" /> Beta
            </span>
          </div>
          <CardDescription>Buat akun Invitee baru</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <Input
              label="Nama Lengkap"
              placeholder="John Doe"
              icon={User}
              error={errors.fullName?.message}
              {...register('fullName')}
            />
            <Input
              label="Email"
              type="email"
              placeholder="email@contoh.com"
              icon={Mail}
              error={errors.email?.message}
              {...register('email')}
            />
            <Input
              label="Password"
              type="password"
              placeholder="Minimal 6 karakter"
              icon={Lock}
              error={errors.password?.message}
              {...register('password')}
            />
            <Input
              label="Nomor Telepon (opsional)"
              placeholder="081234567890"
              icon={Phone}
              {...register('phone')}
            />
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" loading={isLoading}>
              Daftar
            </Button>
            <p className="text-sm text-center text-gray-500">
              Sudah punya akun?{' '}
              <Link href="/login" className="text-primary-600 hover:underline font-medium">
                Masuk
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </>
  );
}
