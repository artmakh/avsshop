'use client';

import { useRouter, useSearchParams } from 'next/navigation';

const categories = [
  { value: '', label: 'All Categories' },
  { value: 'electronics', label: 'Electronics' },
  { value: 'clothing', label: 'Clothing' },
  { value: 'books', label: 'Books' },
  { value: 'home', label: 'Home & Garden' },
  { value: 'toys', label: 'Toys & Games' },
  { value: 'sports', label: 'Sports & Outdoors' },
  { value: 'other', label: 'Other' }
];

export default function CategoryFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentCategory = searchParams.get('category') || '';

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const category = e.target.value;
    const params = new URLSearchParams(searchParams);
    
    if (category) {
      params.set('category', category);
    } else {
      params.delete('category');
    }
    
    router.push(`/?${params.toString()}`);
  };

  return (
    <div className="bg-white rounded-xl p-6 mb-8">
      <label htmlFor="category" className="block text-sm font-medium mb-3" style={{ color: 'var(--text-secondary)' }}>
        Filter by Category
      </label>
      <select
        id="category"
        value={currentCategory}
        onChange={handleCategoryChange}
        className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all"
        style={{ 
          borderColor: 'var(--border-color)'
        } as React.CSSProperties}
      >
        {categories.map((cat) => (
          <option key={cat.value} value={cat.value}>
            {cat.label}
          </option>
        ))}
      </select>
    </div>
  );
}