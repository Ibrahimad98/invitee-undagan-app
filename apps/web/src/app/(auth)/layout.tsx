export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-2">
            <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold">IN</span>
            </div>
            <span className="text-2xl font-bold text-gray-900">Invitee</span>
          </div>
          <p className="text-gray-500">Platform Undangan Digital Indonesia</p>
        </div>
        {children}
      </div>
    </div>
  );
}
