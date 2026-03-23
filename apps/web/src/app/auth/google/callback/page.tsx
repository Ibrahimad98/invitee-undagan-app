'use client';

import { useEffect } from 'react';

export default function GoogleCallbackPage() {
  useEffect(() => {
    // Extract access_token from URL hash fragment
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);
    const accessToken = params.get('access_token');

    if (accessToken && window.opener) {
      // Send token back to parent window
      window.opener.postMessage(
        { type: 'GOOGLE_AUTH_SUCCESS', token: accessToken },
        window.location.origin,
      );
      window.close();
    } else {
      // If no token or no opener, redirect to login
      window.location.href = '/login';
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto" />
        <p className="text-gray-500 text-sm">Memproses login Google...</p>
      </div>
    </div>
  );
}
