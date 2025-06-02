'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Product } from '@/app/types';

interface BidButtonProps {
  product: Product;
}

export default function BidButton({ product }: BidButtonProps) {
  const router = useRouter();
  const [showBidForm, setShowBidForm] = useState(false);
  const [bidAmount, setBidAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleBidSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const amount = parseFloat(bidAmount);
    const bidStep = product.min_bid_step || 0.01;
    const minBid = (product.current_bid || product.starting_price || 0) + bidStep;

    if (amount < minBid) {
      setError(`Bid must be at least ฿${minBid.toFixed(2)}`);
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`/api/products/${product.id}/bid`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to place bid');
      }

      // Refresh the page to show updated bid
      router.refresh();
      setShowBidForm(false);
      setBidAmount('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const bidStep = product.min_bid_step || 0.01;
  const minBidAmount = (product.current_bid || product.starting_price || 0) + bidStep;

  if (!showBidForm) {
    return (
      <button
        onClick={() => setShowBidForm(true)}
        className="w-full bg-orange-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-orange-700 transition-colors"
      >
        Place Bid
      </button>
    );
  }

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
      <h3 className="font-semibold text-gray-900">Place Your Bid</h3>
      
      {error && (
        <div className="bg-red-50 text-red-500 p-3 rounded text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleBidSubmit} className="space-y-4">
        <div>
          <label htmlFor="bidAmount" className="block text-sm font-medium text-gray-700 mb-1">
            Bid Amount (฿)
          </label>
          <input
            type="number"
            id="bidAmount"
            value={bidAmount}
            onChange={(e) => setBidAmount(e.target.value)}
            min={minBidAmount}
            step="0.01"
            required
            placeholder={`Minimum: ฿${minBidAmount.toFixed(2)}`}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
          />
          <p className="text-xs text-gray-500 mt-1">
            Minimum bid: ฿{minBidAmount.toFixed(2)}
          </p>
        </div>

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-orange-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-orange-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Placing Bid...' : 'Submit Bid'}
          </button>
          <button
            type="button"
            onClick={() => {
              setShowBidForm(false);
              setError('');
              setBidAmount('');
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}