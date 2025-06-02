'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface DeleteProductButtonProps {
  productId: number;
}

export default function DeleteProductButton({ productId }: DeleteProductButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete product');
      }

      router.push('/');
      router.refresh();
    } catch (error) {
      console.error('Error deleting product:', error);
      alert(error instanceof Error ? error.message : 'Failed to delete product');
    } finally {
      setLoading(false);
      setShowConfirm(false);
    }
  };

  if (showConfirm) {
    return (
      <div className="flex gap-2">
        <button
          onClick={handleDelete}
          disabled={loading}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
        >
          {loading ? 'Deleting...' : 'Confirm Delete'}
        </button>
        <button
          onClick={() => setShowConfirm(false)}
          disabled={loading}
          className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setShowConfirm(true)}
      className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
    >
      Delete Product
    </button>
  );
}