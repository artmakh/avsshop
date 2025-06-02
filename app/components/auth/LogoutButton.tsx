'use client';

import { useRouter } from 'next/navigation';

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
    router.refresh();
  };

  return (
    <button
      onClick={handleLogout}
      className="text-gray-700 hover:text-gray-900"
    >
      Logout
    </button>
  );
}