'use client';

import { useSession } from 'next-auth/react';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { isAdminRole } from '@/lib/permissions';

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return;

    if (session) {
      // Redirect based on role - admin and polizas go to admin panel
      if (isAdminRole(session.user.role)) {
        router.push('/admin/vacaciones');
      } else {
        router.push('/mis-vacaciones');
      }
    } else {
      router.push('/login');
    }
  }, [session, status, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-xl">Redirecting...</div>
    </div>
  );
}
