import { getAllProducts } from '@/app/lib/db';
import { getUser } from '@/app/lib/auth';
import ProductCard from '@/app/components/products/ProductCard';
import CategoryFilter from '@/app/components/CategoryFilter';
import PrimaryButton from '@/app/components/ui/PrimaryButton';
import { processEndedAuctions } from '@/app/lib/auction-processor';
import { Product } from '@/app/types';

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const params = await searchParams;
  const category = params.category || '';
  
  // Process any ended auctions before displaying products
  try {
    await processEndedAuctions();
  } catch (error) {
    console.error('Error processing ended auctions:', error);
  }
  
  let products = getAllProducts.all() as Product[];
  
  // Filter by category if specified
  if (category) {
    products = products.filter(p => p.category === category);
  }
  
  const user = await getUser();

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--background)' }}>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <section className="mb-12">
          <h1 className="text-4xl font-bold mb-4" style={{ color: 'var(--foreground)' }}>
            Welcome to salo.market
          </h1>
          <p className="text-lg mb-8" style={{ color: 'var(--text-secondary)' }}>
            PLACEHOLDER TEXT HUEHUEHUE.
          </p>
          
          <CategoryFilter />
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-6" style={{ color: 'var(--foreground)' }}>
            {products.length > 0 ? 'Available Products' : 'No products yet'}
          </h2>
          
          {products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-lg">
              <p className="mb-4" style={{ color: 'var(--text-secondary)' }}>No products available yet.</p>
              {!user && (
                <PrimaryButton href="/register" className="px-6 py-3">
                  Register
                </PrimaryButton>
              )}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
