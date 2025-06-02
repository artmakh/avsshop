import Link from 'next/link';
import Image from 'next/image';
import { getUser } from '@/app/lib/auth';
import { getUserById, getUnreadNotificationCount } from '@/app/lib/db';
import LogoutButton from './auth/LogoutButton';
import PrimaryButton from './ui/PrimaryButton';

interface UserData {
  id: number;
  username: string;
  password: string;
  is_admin: number;
  created_at: string;
  updated_at: string;
}

export default async function Header() {
  const tokenData = await getUser();
  let user = null;
  let unreadCount = 0;
  let totalNotifications = 0;
  
  if (tokenData) {
    const dbUser = getUserById.get(tokenData.userId) as UserData;
    if (dbUser) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password: _, ...userWithoutPassword } = dbUser;
      user = userWithoutPassword;
      
      // Get unread notification count
      const countResult = getUnreadNotificationCount.get(tokenData.userId) as { count: number };
      unreadCount = countResult?.count || 0;
      
      // Get total notifications
      const { getNotificationsByUserId } = await import('@/app/lib/db');
      totalNotifications = getNotificationsByUserId.all(tokenData.userId).length;
    }
  }

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="text-2xl font-bold" style={{ color: 'var(--primary)' }}>
            salo.market
          </Link>
          
          <nav className="flex gap-6 items-center">
            <Link href="/" className="text-gray-600 hover:text-gray-900 font-medium">
              Products
            </Link>
            
            {user ? (
              <>
                <Link href="/products/new" className="text-gray-600 hover:text-gray-900 font-medium">
                  Add Product
                </Link>
                <Link href="/notifications" className="relative text-gray-600 hover:text-gray-900 font-medium flex items-center gap-1">
                  {totalNotifications > 0 && (
                    <>
                      <Image 
                        src="https://em-content.zobj.net/source/microsoft/407/bell_1f514.png" 
                        alt="Notifications" 
                        width={20}
                        height={20}
                        className="w-5 h-5"
                      />
                      {unreadCount > 0 && (
                        <span className="absolute -top-2 left-3 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                          {unreadCount}
                        </span>
                      )}
                    </>
                  )}
                  Notifications
                </Link>
                <Link href={`/users/${user.username}`} className="text-gray-600 hover:text-gray-900 font-medium">
                  {user.username}
                </Link>
                <LogoutButton />
              </>
            ) : (
              <>
                <Link href="/login" className="text-gray-600 hover:text-gray-900 font-medium">
                  Login
                </Link>
                <PrimaryButton href="/register">
                  Register
                </PrimaryButton>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}