'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ProductForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [listingType, setListingType] = useState<'fixed' | 'auction'>('fixed');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    
    // Add all selected images to formData
    images.forEach((image) => {
      formData.append('images', image);
    });

    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create product');
      }

      router.push('/');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImages(Array.from(e.target.files));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 text-red-500 p-3 rounded">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Product Name
        </label>
        <input
          type="text"
          name="name"
          id="name"
          required
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div>
        <label htmlFor="short_description" className="block text-sm font-medium text-gray-700">
          Short Description
        </label>
        <input
          type="text"
          name="short_description"
          id="short_description"
          required
          maxLength={200}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div>
        <label htmlFor="long_description" className="block text-sm font-medium text-gray-700">
          Long Description
        </label>
        <textarea
          name="long_description"
          id="long_description"
          required
          rows={4}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div>
        <label htmlFor="listing_type" className="block text-sm font-medium text-gray-700">
          Listing Type
        </label>
        <select
          name="listing_type"
          id="listing_type"
          value={listingType}
          onChange={(e) => setListingType(e.target.value as 'fixed' | 'auction')}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="fixed">Fixed Price</option>
          <option value="auction">Auction</option>
        </select>
      </div>

      {listingType === 'fixed' ? (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="price" className="block text-sm font-medium text-gray-700">
              Price (฿)
            </label>
            <input
              type="number"
              name="price"
              id="price"
              required
              min="0"
              step="0.01"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label htmlFor="stock" className="block text-sm font-medium text-gray-700">
              Stock Quantity
            </label>
            <input
              type="number"
              name="stock"
              id="stock"
              required
              min="0"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <label htmlFor="starting_price" className="block text-sm font-medium text-gray-700">
              Starting Price (฿)
            </label>
            <input
              type="number"
              name="starting_price"
              id="starting_price"
              required
              min="0"
              step="0.01"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label htmlFor="auction_end" className="block text-sm font-medium text-gray-700">
              Auction End Time
            </label>
            <input
              type="datetime-local"
              name="auction_end"
              id="auction_end"
              required
              min={new Date(Date.now() + 60 * 60 * 1000).toISOString().slice(0, 16)} // Minimum 1 hour from now
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label htmlFor="min_bid_step" className="block text-sm font-medium text-gray-700">
              Minimum Bid Step (฿)
            </label>
            <input
              type="number"
              name="min_bid_step"
              id="min_bid_step"
              min="0.01"
              step="0.01"
              defaultValue="0.01"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              The minimum amount by which each new bid must exceed the current highest bid
            </p>
          </div>

          <input type="hidden" name="price" value="0" />
          <input type="hidden" name="stock" value="1" />
        </div>
      )}

      <div>
        <label htmlFor="category" className="block text-sm font-medium text-gray-700">
          Category
        </label>
        <select
          name="category"
          id="category"
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">Select a category</option>
          <option value="electronics">Electronics</option>
          <option value="clothing">Clothing</option>
          <option value="books">Books</option>
          <option value="home">Home & Garden</option>
          <option value="toys">Toys & Games</option>
          <option value="sports">Sports & Outdoors</option>
          <option value="other">Other</option>
        </select>
      </div>

      <div>
        <label htmlFor="images" className="block text-sm font-medium text-gray-700">
          Product Images
        </label>
        <input
          type="file"
          id="images"
          multiple
          accept="image/*"
          onChange={handleImageChange}
          className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
        {images.length > 0 && (
          <p className="mt-2 text-sm text-gray-500">
            {images.length} image(s) selected
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
      >
        {loading ? 'Creating...' : `Create ${listingType === 'auction' ? 'Auction' : 'Product'}`}
      </button>
    </form>
  );
}