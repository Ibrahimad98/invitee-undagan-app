import { Footer } from '@/components/layout/footer';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 mb-2">
              <img src="/favicon.svg" alt="Invitee" className="w-10 h-10" />
              <span className="text-2xl font-bold text-orange-500">Invitee</span>
            </div>
            <p className="text-gray-500">Platform Undangan Digital Indonesia</p>
          </div>
          {children}
        </div>
      </div>
      <Footer />
    </div>
  );
}
