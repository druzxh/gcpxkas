'use client';

import Navbar from './Navbar';
import { useAuth } from '@/contexts/AuthContext';
import AuthForm from './auth/AuthForm';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <AuthForm />;
  }

  return (
    <>
      <Navbar />
      {children}
    </>
  );
}
