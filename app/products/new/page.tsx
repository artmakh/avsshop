import { redirect } from 'next/navigation';
import { getUser } from '@/app/lib/auth';
import ProductForm from '@/app/components/products/ProductForm';

export default async function NewProductPage() {
  const user = await getUser();
  
  if (!user) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen py-8" style={{ backgroundColor: 'var(--background)' }}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Create New Product</h1>
        <div className="bg-white shadow rounded-lg p-6">
          <ProductForm />
        </div>
      </div>
    </div>
  );
}