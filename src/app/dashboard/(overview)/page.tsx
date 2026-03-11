'use client';

import { logout } from '@/server/user';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <div className='flex min-h-screen flex-col items-center justify-center gap-4'>
      <h1 className='text-3xl font-bold'>Hi! You&apos;re authenticated</h1>
      <button
        onClick={handleLogout}
        className='text-primary hover:text-primary/80 underline underline-offset-4'
      >
        Logout
      </button>
    </div>
  );
}
