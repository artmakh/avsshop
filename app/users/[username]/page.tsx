import { notFound } from 'next/navigation';
import { getUserByUsername, getProductsForUser, getProductsByUserId } from '@/app/lib/db';
import { getUser } from '@/app/lib/auth';
import ProductCard from '@/app/components/products/ProductCard';
import { Product } from '@/app/types';

interface UserData {
  id: number;
  username: string;
  password: string;
  is_admin: number;
  created_at: string;
  updated_at: string;
}

export default async function UserPage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const user = getUserByUsername.get(username) as UserData;
  
  if (!user) {
    notFound();
  }

  // Get current user to check if viewing own profile
  const currentUser = await getUser();
  const isOwnProfile = currentUser?.userId === user.id;

  // Use different query based on whether viewing own profile
  const products = isOwnProfile 
    ? getProductsForUser.all(user.id, user.id) as Product[] // Show all products including sold ones
    : (getProductsByUserId.all(user.id) as Product[]).filter(p => p.status === 'available'); // Show only available products

  return (
    <div className="min-h-screen py-8" style={{ backgroundColor: 'var(--background)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {isOwnProfile ? 'Your Items' : `${user.username}'s Listings`}
          </h1>
          <p className="text-gray-600">
            Joined: {new Date(user.created_at).toLocaleDateString()}
          </p>
        </div>

        {products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-500 mb-4">No products listed yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}