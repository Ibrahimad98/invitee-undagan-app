'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuthStore } from '@/stores/auth-store';
import { useUIStore } from '@/stores/ui-store';
import { useSettingsPublic } from '@/hooks/queries/use-settings';
import { api } from '@/lib/api';
import { loginSchema, type LoginFormData } from '@/lib/validations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Mail, Lock, RefreshCw } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login, setUser } = useAuthStore();
  const { addToast } = useUIStore();
  const [isLoading, setIsLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null);
  const [resending, setResending] = useState(false);

  // Fetch registration settings to check if Google login is enabled
  const { data: regSettings } = useSettingsPublic('registration');
  const googleLoginEnabled = regSettings?.some(
    (s) => s.item.toLowerCase().includes('google') && s.value.toLowerCase() === 'true'
  ) ?? false;

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setUnverifiedEmail(null);
    try {
      await login(data);
      addToast('Login berhasil! Selamat datang.', 'success');
      router.push('/dashboard');
    } catch (error: any) {
      const status = error.response?.status;
      const message = error.response?.data?.message || '';
      // 403 = email not verified
      if (status === 403 && message.toLowerCase().includes('verifikasi')) {
        setUnverifiedEmail(data.email);
        addToast(message, 'warning');
      } else {
        addToast(message || 'Login gagal. Periksa email dan password.', 'error');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendVerification = async () => {
    const email = unverifiedEmail || getValues('email');
    if (!email || resending) return;
    setResending(true);
    try {
      await api.post('/auth/resend-verification', {
        email,
        baseUrl: window.location.origin,
      });
      addToast('Email verifikasi telah dikirim! Cek inbox Anda.', 'success');
    } catch (err: any) {
      addToast(err.response?.data?.message || 'Gagal mengirim ulang email', 'error');
    } finally {
      setResending(false);
    }
  };

  const handleGoogleLogin = useCallback(async () => {
    setGoogleLoading(true);
    try {
      // Use Google's OAuth 2.0 popup flow
      const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
      if (!clientId) {
        addToast('Google Client ID belum dikonfigurasi', 'error');
        setGoogleLoading(false);
        return;
      }

      const redirectUri = `${window.location.origin}/auth/google/callback`;
      const scope = 'openid email profile';
      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=token&scope=${encodeURIComponent(scope)}&prompt=select_account`;

      // Open popup
      const popup = window.open(authUrl, 'google-login', 'width=500,height=600,scrollbars=yes');
      if (!popup) {
        addToast('Popup diblokir browser. Izinkan popup untuk login dengan Google.', 'error');
        setGoogleLoading(false);
        return;
      }

      // Listen for the callback
      const handleMessage = async (event: MessageEvent) => {
        if (event.origin !== window.location.origin) return;
        if (event.data?.type === 'GOOGLE_AUTH_SUCCESS' && event.data.token) {
          window.removeEventListener('message', handleMessage);
          try {
            const { data } = await api.post('/auth/google', { token: event.data.token });
            const result = data.data || data;
            // Set auth state
            useAuthStore.getState().setUser(result.user);
            useAuthStore.setState({ token: result.accessToken, isAuthenticated: true });
            addToast('Login berhasil! Selamat datang.', 'success');
            router.push('/dashboard');
          } catch (error: any) {
            addToast(error.response?.data?.message || 'Login Google gagal', 'error');
          } finally {
            setGoogleLoading(false);
          }
        }
      };

      window.addEventListener('message', handleMessage);

      // Cleanup if popup is closed without completing
      const checkClosed = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkClosed);
          window.removeEventListener('message', handleMessage);
          setGoogleLoading(false);
        }
      }, 500);
    } catch {
      addToast('Gagal memulai login Google', 'error');
      setGoogleLoading(false);
    }
  }, [addToast, router]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Masuk</CardTitle>
        <CardDescription>Masuk ke akun Invitee Anda</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          {/* Unverified email banner */}
          {unverifiedEmail && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm">
              <p className="text-amber-800 font-medium mb-1">📧 Email belum diverifikasi</p>
              <p className="text-amber-700 text-xs mb-2">
                Silakan cek inbox <strong>{unverifiedEmail}</strong> untuk link verifikasi.
              </p>
              <button
                type="button"
                onClick={handleResendVerification}
                disabled={resending}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-primary-600 hover:text-primary-700 disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${resending ? 'animate-spin' : ''}`} />
                {resending ? 'Mengirim...' : 'Kirim Ulang Email Verifikasi'}
              </button>
            </div>
          )}
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
            placeholder="Masukkan password"
            icon={Lock}
            error={errors.password?.message}
            {...register('password')}
          />
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button type="submit" className="w-full" loading={isLoading}>
            Masuk
          </Button>
          {googleLoginEnabled && (
            <>
              <div className="flex items-center gap-3 w-full">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-xs text-gray-400">atau</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>
              <Button
                type="button"
                variant="outline"
                className="w-full gap-2"
                onClick={handleGoogleLogin}
                loading={googleLoading}
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Masuk dengan Google
              </Button>
            </>
          )}
          <p className="text-sm text-center text-gray-500">
            Belum punya akun?{' '}
            <Link href="/register" className="text-primary-600 hover:underline font-medium">
              Daftar
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
