import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/app/lib/auth';
import { markNotificationAsRead, getNotificationsByUserId } from '@/app/lib/db';

interface NotificationData {
  id: number;
  user_id: number;
  type: string;
  message: string;
  data?: string;
  is_read: number;
  created_at: string;
}

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const notificationId = parseInt(id);

    // Verify the notification belongs to the user
    const notifications = getNotificationsByUserId.all(user.userId) as NotificationData[];
    const notification = notifications.find(n => n.id === notificationId);
    
    if (!notification) {
      return NextResponse.json(
        { error: 'Notification not found' },
        { status: 404 }
      );
    }

    // Mark as read/acknowledged
    markNotificationAsRead.run(notificationId);

    return NextResponse.json({
      message: 'Notification acknowledged',
      success: true
    });
  } catch (error) {
    console.error('Acknowledge notification error:', error);
    return NextResponse.json(
      { error: 'Failed to acknowledge notification' },
      { status: 500 }
    );
  }
}