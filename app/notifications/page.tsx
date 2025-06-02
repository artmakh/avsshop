import { redirect } from 'next/navigation';
import { getUser } from '@/app/lib/auth';
import { getNotificationsByUserId } from '@/app/lib/db';
import AcknowledgeButton from '@/app/components/notifications/AcknowledgeButton';
import { Notification } from '@/app/types';

export default async function NotificationsPage() {
  const user = await getUser();
  
  if (!user) {
    redirect('/login');
  }

  const notifications = getNotificationsByUserId.all(user.userId) as Notification[];

  return (
    <div className="min-h-screen py-8" style={{ backgroundColor: 'var(--background)' }}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Notifications</h1>
        
        {notifications.length > 0 ? (
          <div className="space-y-4">
            {notifications.map((notification) => {
              const data = notification.data ? JSON.parse(notification.data) : null;
              
              return (
                <div
                  key={notification.id}
                  className={`bg-white p-6 rounded-lg shadow ${
                    notification.is_read ? 'opacity-75' : ''
                  }`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <p className="text-gray-900">{notification.message}</p>
                      {data && data.contactType && (
                        <div className="mt-2 p-3 bg-blue-50 rounded">
                          <p className="text-sm font-semibold text-blue-900">
                            Contact the buyer via {data.contactType}:
                          </p>
                          <p className="text-lg font-mono text-blue-800 mt-1">
                            {data.buyerContact}
                          </p>
                        </div>
                      )}
                    </div>
                    {!notification.is_read && (
                      <span className="inline-block w-2 h-2 bg-blue-600 rounded-full"></span>
                    )}
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-xs text-gray-500">
                      {new Date(notification.created_at).toLocaleString()}
                    </p>
                    <AcknowledgeButton 
                      notificationId={notification.id} 
                      isRead={notification.is_read === 1}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-500">No notifications yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}