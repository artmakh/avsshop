'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Product } from '@/app/types';

interface BuyModalProps {
  product: Product;
  onClose: () => void;
}

export default function BuyModal({ product, onClose }: BuyModalProps) {
  const router = useRouter();
  const [contactType, setContactType] = useState<'telegram' | 'slack'>('telegram');
  const [contactInfo, setContactInfo] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`/api/products/${product.id}/buy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contactType,
          contactInfo: contactInfo.trim()
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to complete purchase');
      }

      router.push('/');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <h2 className="text-2xl font-bold mb-4">Complete Purchase</h2>
        
        <div className="mb-4">
          <p className="text-gray-600 mb-2">Product: <span className="font-semibold">{product.name}</span></p>
          <p className="text-gray-600">Price: <span className="font-semibold">฿{product.price.toFixed(2)}</span></p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 text-red-500 p-3 rounded">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-2">
              How should the seller contact you?
            </label>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="telegram"
                  checked={contactType === 'telegram'}
                  onChange={(e) => setContactType(e.target.value as 'telegram')}
                  className="mr-2"
                />
                Telegram
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="slack"
                  checked={contactType === 'slack'}
                  onChange={(e) => setContactType(e.target.value as 'slack')}
                  className="mr-2"
                />
                Slack
              </label>
            </div>
          </div>

          <div>
            <label htmlFor="contactInfo" className="block text-sm font-medium mb-1">
              {contactType === 'telegram' ? 'Telegram Username' : 'Slack Username'}
            </label>
            <input
              type="text"
              id="contactInfo"
              value={contactInfo}
              onChange={(e) => setContactInfo(e.target.value)}
              placeholder={contactType === 'telegram' ? '@username' : 'username'}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Confirm Purchase'}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 py-2 px-4 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}