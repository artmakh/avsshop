'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface AcknowledgeButtonProps {
  notificationId: number;
  isRead: boolean;
}

export default function AcknowledgeButton({ notificationId, isRead }: AcknowledgeButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  if (isRead) {
    return (
      <span className="text-sm text-green-600 font-medium">
        ✓ Acknowledged
      </span>
    );
  }

  const handleAcknowledge = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/notifications/${notificationId}/acknowledge`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to acknowledge');
      }

      router.refresh();
    } catch (error) {
      console.error('Error acknowledging notification:', error);
      alert('Failed to acknowledge notification');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleAcknowledge}
      disabled={loading}
      className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
    >
      {loading ? 'Processing...' : 'Acknowledge'}
    </button>
  );
}