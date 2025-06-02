import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@/app/types';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <div className="bg-white rounded-xl hover:shadow-lg transition-all duration-200 relative overflow-hidden">
      {product.status === 'sold' && (
        <div className="absolute top-3 right-3 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium z-10">
          SOLD
        </div>
      )}
      <Link href={`/products/${product.id}`}>
        <div className="cursor-pointer">
          <div className="h-48 relative bg-gray-100 overflow-hidden">
            {product.primary_image ? (
              <Image
                src={product.primary_image}
                alt={product.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                No image
              </div>
            )}
          </div>
          <div className="p-4">
            <h4 className="font-semibold mb-1 truncate" style={{ color: 'var(--foreground)' }}>
              {product.name}
            </h4>
            <p className="text-sm mb-3 line-clamp-2" style={{ color: 'var(--text-secondary)' }}>
              {product.short_description}
            </p>
            {product.listing_type === 'auction' ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-orange-600 bg-orange-100 px-2 py-1 rounded">
                    AUCTION
                  </span>
                  {product.auction_end && new Date(product.auction_end) > new Date() ? (
                    <span className="text-xs text-green-600 font-medium">
                      ACTIVE
                    </span>
                  ) : (
                    <span className="text-xs text-red-600 font-medium">
                      ENDED
                    </span>
                  )}
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold" style={{ color: 'var(--primary)' }}>
                      ฿{(product.current_bid || product.starting_price || 0).toFixed(2)}
                    </span>
                    <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                      {product.current_bid && product.current_bid > (product.starting_price || 0) ? 'Current bid' : 'Current bid'}
                    </span>
                  </div>
                  {product.starting_price && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">
                        Starting: ฿{product.starting_price.toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>
                {product.auction_end && (
                  <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                    Ends: {new Date(product.auction_end).toLocaleString()}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex justify-between items-center">
                <span className="text-xl font-bold" style={{ color: 'var(--primary)' }}>
                  ฿{product.price.toFixed(2)}
                </span>
                <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  Stock: {product.stock}
                </span>
              </div>
            )}
          </div>
        </div>
      </Link>
      <div className="px-4 pb-4">
        <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
          By <Link 
            href={`/users/${product.seller_name}`} 
            className="hover:underline transition-colors"
            style={{ color: 'var(--primary)' }}
          >
            {product.seller_name}
          </Link>
        </div>
      </div>
    </div>
  );
}