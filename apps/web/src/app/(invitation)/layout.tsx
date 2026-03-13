import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Undangan Digital',
  description: 'Undangan digital oleh Invitee',
};

export default function InvitationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className="min-h-screen bg-white">
        {children}
      </body>
    </html>
  );
}
