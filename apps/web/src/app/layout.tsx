import type { Metadata } from 'next';
import { Providers } from './providers';
import { Toaster } from '@/components/ui/toast';
import './globals.css';

export const metadata: Metadata = {
  title: 'Invitee - Platform Undangan Digital',
  description: 'Buat undangan digital elegan untuk pernikahan, khitanan, ulang tahun, dan acara lainnya.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body>
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
